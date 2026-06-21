const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

// ── PATHS ─────────────────────────────────────────────────────────────────────
const USER_DATA = app.getPath('userData');   // ~/Library/Application Support/Nexara
const DB_PATH   = path.join(USER_DATA, 'nexara.db');
const AI_DIR    = path.join(USER_DATA, 'ai');
const MODELS_DIR = path.join(AI_DIR, 'models');

// Ollama binary — bundled inside the app package
// During dev: looks in ./ollama-bin/; in production: looks in resources/
const isDev = !app.isPackaged;
const OLLAMA_BIN = isDev
  ? path.join(__dirname, 'ollama-bin', process.platform === 'win32' ? 'ollama.exe' : 'ollama')
  : path.join(process.resourcesPath, 'ollama-bin', process.platform === 'win32' ? 'ollama.exe' : 'ollama');

// ── DATABASE SETUP ────────────────────────────────────────────────────────────
let db;
function initDB() {
  try {
    const Database = require('better-sqlite3');
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');  // faster writes, safe crashes
    db.pragma('synchronous = NORMAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS kv (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s','now'))
      );
      CREATE INDEX IF NOT EXISTS idx_kv_key ON kv(key);
    `);
    console.log('[DB] SQLite ready at', DB_PATH);
  } catch (err) {
    console.error('[DB] Failed to init SQLite:', err.message);
    db = null;
  }
}

// IPC handlers for renderer → SQLite
ipcMain.handle('db-get', (_, key) => {
  if (!db) return null;
  const row = db.prepare('SELECT value FROM kv WHERE key = ?').get(key);
  return row ? JSON.parse(row.value) : null;
});

ipcMain.handle('db-set', (_, key, value) => {
  if (!db) return false;
  db.prepare('INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, strftime(\'%s\',\'now\'))').run(key, JSON.stringify(value));
  return true;
});

ipcMain.handle('db-delete', (_, key) => {
  if (!db) return false;
  db.prepare('DELETE FROM kv WHERE key = ?').run(key);
  return true;
});

ipcMain.handle('db-list', (_, prefix) => {
  if (!db) return [];
  const rows = db.prepare('SELECT key FROM kv WHERE key LIKE ?').all((prefix || '') + '%');
  return rows.map(r => r.key);
});

ipcMain.handle('db-export', (_) => {
  if (!db) return null;
  const rows = db.prepare('SELECT key, value FROM kv').all();
  const obj = {};
  rows.forEach(r => { obj[r.key] = JSON.parse(r.value); });
  return obj;
});

ipcMain.handle('db-import', (_, data) => {
  if (!db) return false;
  const insert = db.prepare('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)');
  const importAll = db.transaction((entries) => {
    for (const [key, val] of entries) insert.run(key, JSON.stringify(val));
  });
  importAll(Object.entries(data));
  return true;
});

// ── OLLAMA MANAGEMENT ─────────────────────────────────────────────────────────
let ollamaProcess = null;
const OLLAMA_PORT = 11434;
const MODEL_NAME  = 'phi3.5';

function ollamaExists() {
  return fs.existsSync(OLLAMA_BIN);
}

async function isOllamaRunning() {
  try {
    const r = await fetch(`http://127.0.0.1:${OLLAMA_PORT}/api/tags`, { signal: AbortSignal.timeout(1000) });
    return r.ok;
  } catch { return false; }
}

function startOllama() {
  if (!ollamaExists()) {
    console.log('[AI] Ollama binary not found at', OLLAMA_BIN);
    console.log('[AI] AI features will be unavailable. Run setup to download Ollama.');
    return;
  }

  // Make binary executable (Mac/Linux)
  if (process.platform !== 'win32') {
    try { fs.chmodSync(OLLAMA_BIN, '755'); } catch {}
  }

  const env = {
    ...process.env,
    OLLAMA_MODELS: MODELS_DIR,
    OLLAMA_HOST: `127.0.0.1:${OLLAMA_PORT}`,
    OLLAMA_KEEP_ALIVE: '24h',
  };

  // Ensure models directory exists
  fs.mkdirSync(MODELS_DIR, { recursive: true });

  ollamaProcess = spawn(OLLAMA_BIN, ['serve'], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  ollamaProcess.stdout.on('data', d => console.log('[Ollama]', d.toString().trim()));
  ollamaProcess.stderr.on('data', d => console.log('[Ollama]', d.toString().trim()));
  ollamaProcess.on('error', err => console.error('[AI] Ollama start error:', err.message));
  ollamaProcess.on('exit', code => console.log('[AI] Ollama exited with code', code));

  console.log('[AI] Ollama started (pid', ollamaProcess.pid + ')');
}

function stopOllama() {
  if (ollamaProcess) {
    ollamaProcess.kill();
    ollamaProcess = null;
  }
}

// IPC for AI status checks from renderer
ipcMain.handle('ai-status', async () => {
  const running = await isOllamaRunning();
  if (!running) return { status: 'unavailable', message: ollamaExists() ? 'Starting up…' : 'AI not installed' };
  try {
    const r = await fetch(`http://127.0.0.1:${OLLAMA_PORT}/api/tags`);
    const data = await r.json();
    const hasModel = data.models?.some(m => m.name.includes('phi3'));
    return {
      status: hasModel ? 'ready' : 'no-model',
      models: data.models?.map(m => m.name) || [],
      message: hasModel ? 'Offline AI ready' : 'Model not found',
    };
  } catch { return { status: 'unavailable', message: 'Cannot connect to AI' }; }
});

ipcMain.handle('ai-pull-model', async (event) => {
  if (!ollamaExists()) return { ok: false, error: 'Ollama not installed' };
  return new Promise((resolve) => {
    const proc = spawn(OLLAMA_BIN, ['pull', MODEL_NAME], {
      env: { ...process.env, OLLAMA_MODELS: MODELS_DIR },
    });
    proc.stdout.on('data', d => event.sender.send('ai-pull-progress', d.toString()));
    proc.stderr.on('data', d => event.sender.send('ai-pull-progress', d.toString()));
    proc.on('exit', code => resolve({ ok: code === 0 }));
    proc.on('error', err => resolve({ ok: false, error: err.message }));
  });
});

// ── WINDOW SETUP ──────────────────────────────────────────────────────────────
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 900,
    minWidth: 1100, minHeight: 700,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#F5F3EF',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });

  const menu = Menu.buildFromTemplate([
    {
      label: 'Nexara',
      submenu: [
        { label: 'About Nexara', role: 'about' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Cmd+Q', click: () => app.quit() },
      ],
    },
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] },
  ]);
  Menu.setApplicationMenu(menu);
}

// ── APP LIFECYCLE ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  initDB();
  startOllama();
  createWindow();
});

app.on('window-all-closed', () => {
  stopOllama();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => stopOllama());
process.on('exit', () => stopOllama());
