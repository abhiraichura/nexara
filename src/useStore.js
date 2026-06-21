// ── useStore — persistent state hook backed by SQLite (or localStorage in dev) ─
import { useState, useEffect, useCallback } from 'react';

const isElectron = typeof window !== 'undefined' && window.electronAPI;

// Low-level read/write
async function read(key) {
  if (isElectron) return window.electronAPI.dbGet(key);
  try { const v = localStorage.getItem('nx_' + key); return v ? JSON.parse(v) : null; } catch { return null; }
}

async function write(key, val) {
  if (isElectron) return window.electronAPI.dbSet(key, val);
  try { localStorage.setItem('nx_' + key, JSON.stringify(val)); return true; } catch { return false; }
}

async function erase(key) {
  if (isElectron) return window.electronAPI.dbDelete(key);
  localStorage.removeItem('nx_' + key); return true;
}

// ── useStore hook ─────────────────────────────────────────────────────────────
// Usage: const [value, setValue, loading] = useStore('myKey', defaultValue)
export function useStore(key, defaultValue) {
  const [value, setValue_] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  // Load from DB on mount
  useEffect(() => {
    let cancelled = false;
    read(key).then(v => {
      if (!cancelled) {
        setValue_(v !== null && v !== undefined ? v : defaultValue);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [key]);

  // Save to DB whenever value changes (after first load)
  const setValue = useCallback(async (newVal) => {
    const resolved = typeof newVal === 'function' ? newVal(value) : newVal;
    setValue_(resolved);
    await write(key, resolved);
  }, [key, value]);

  return [value, setValue, loading];
}

// ── Bulk export (for backup) ──────────────────────────────────────────────────
export async function exportAllData() {
  if (isElectron) return window.electronAPI.dbExport();
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('nx_')) {
      try { data[k.replace('nx_', '')] = JSON.parse(localStorage.getItem(k)); } catch {}
    }
  }
  return data;
}

// ── Bulk import (for restore) ─────────────────────────────────────────────────
export async function importAllData(data) {
  if (isElectron) return window.electronAPI.dbImport(data);
  Object.entries(data).forEach(([k, v]) => {
    try { localStorage.setItem('nx_' + k, JSON.stringify(v)); } catch {}
  });
  return true;
}
