// ── DATABASE BRIDGE ────────────────────────────────────────────────────────────
// In Electron: talks to main process via IPC → SQLite on disk
// In browser fallback: uses localStorage (dev only)

const isElectron = typeof window !== 'undefined' && window.electronAPI;

// ── IPC bridge (Electron) ──────────────────────────────────────────────────────
const ipc = {
  get:    (key)      => window.electronAPI.dbGet(key),
  set:    (key, val) => window.electronAPI.dbSet(key, val),
  delete: (key)      => window.electronAPI.dbDelete(key),
  list:   (prefix)   => window.electronAPI.dbList(prefix),
};

// ── localStorage fallback (browser dev) ───────────────────────────────────────
const lsFallback = {
  get: async (key) => {
    try { const v = localStorage.getItem('nx_' + key); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  set: async (key, val) => {
    try { localStorage.setItem('nx_' + key, JSON.stringify(val)); return true; } catch { return false; }
  },
  delete: async (key) => {
    localStorage.removeItem('nx_' + key); return true;
  },
  list: async (prefix) => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('nx_' + prefix)) keys.push(k.replace('nx_', ''));
    }
    return keys;
  },
};

const bridge = isElectron ? ipc : lsFallback;

// ── PUBLIC API ─────────────────────────────────────────────────────────────────
export const db = {
  get:    (key)      => bridge.get(key),
  set:    (key, val) => bridge.set(key, JSON.parse(JSON.stringify(val))),
  delete: (key)      => bridge.delete(key),
  list:   (prefix)   => bridge.list(prefix || ''),
};

// ── SYNC HELPERS (for React state — load on mount, save on change) ─────────────
export async function dbLoad(key, defaultVal) {
  try {
    const val = await db.get(key);
    return val !== null && val !== undefined ? val : defaultVal;
  } catch { return defaultVal; }
}

export async function dbSave(key, val) {
  try { await db.set(key, val); return true; }
  catch { return false; }
}
