// ── PRELOAD — exposes safe IPC bridge to renderer ─────────────────────────────
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Database
  dbGet:    (key)        => ipcRenderer.invoke('db-get', key),
  dbSet:    (key, val)   => ipcRenderer.invoke('db-set', key, val),
  dbDelete: (key)        => ipcRenderer.invoke('db-delete', key),
  dbList:   (prefix)     => ipcRenderer.invoke('db-list', prefix),
  dbExport: ()           => ipcRenderer.invoke('db-export'),
  dbImport: (data)       => ipcRenderer.invoke('db-import', data),

  // AI
  aiStatus:    ()        => ipcRenderer.invoke('ai-status'),
  aiPullModel: ()        => ipcRenderer.invoke('ai-pull-model'),
  onAIProgress: (cb)     => ipcRenderer.on('ai-pull-progress', (_, data) => cb(data)),
});
