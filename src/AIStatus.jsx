// ── AI Status Bar & Offline AI Panel ─────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { T, f, mo, BtnP, BtnG, Card, CardHdr, InfoBox } from './components';

const OLLAMA = 'http://127.0.0.1:11434';
const MODEL  = 'phi3.5';

// ── Low-level generate (no Anthropic, pure Ollama) ────────────────────────────
export async function generate(prompt, system = '', onChunk = null) {
  const body = {
    model: MODEL,
    prompt: system
      ? `<|system|>\n${system}\n<|end|>\n<|user|>\n${prompt}\n<|end|>\n<|assistant|>\n`
      : prompt,
    stream: !!onChunk,
    options: { temperature: 0.7, num_predict: 900, top_p: 0.9 },
  };

  const resp = await fetch(`${OLLAMA}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180000),
  });

  if (!resp.ok) throw new Error('AI error ' + resp.status);

  if (!onChunk) {
    const d = await resp.json();
    return d.response || '';
  }

  // Streaming response
  const reader = resp.body.getReader();
  const dec    = new TextDecoder();
  let full     = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of dec.decode(value).split('\n').filter(Boolean)) {
      try {
        const j = JSON.parse(line);
        if (j.response) { full += j.response; onChunk(full); }
        if (j.done) return full;
      } catch {}
    }
  }
  return full;
}

// ── Check AI status ───────────────────────────────────────────────────────────
export async function checkStatus() {
  try {
    const r = await fetch(`${OLLAMA}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (!r.ok) return 'unavailable';
    const d = await r.json();
    const hasModel = d.models?.some(m => m.name.startsWith('phi3'));
    return hasModel ? 'ready' : 'no-model';
  } catch { return 'unavailable'; }
}

// ── AI Status Pill (shown in topbar) ─────────────────────────────────────────
export function AIStatusPill({ status }) {
  const cfg = {
    ready:       { label: 'AI Ready',    bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
    loading:     { label: 'AI Loading…', bg: '#FEF3E9', color: '#92400E', border: '#FED7AA' },
    unavailable: { label: 'AI Offline',  bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
    'no-model':  { label: 'No Model',    bg: '#FFF1F1', color: '#B91C1C', border: '#FECACA' },
  }[status] || { label: '…', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };

  return (
    <div style={{
      padding: '3px 10px', borderRadius: 4, fontSize: 10,
      fontFamily: mo, letterSpacing: 0.8, fontWeight: 600,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label.toUpperCase()}
    </div>
  );
}

// ── Full AI Panel (floating button bottom-right) ──────────────────────────────
export function AIPanel({ co, txns, emps, inv, leads, sales, expenses, profit, gstNet, fmt }) {
  const [open,    setOpen]    = useState(false);
  const [status,  setStatus]  = useState('loading');
  const [chat,    setChat]    = useState([]);
  const [msg,     setMsg]     = useState('');
  const [busy,    setBusy]    = useState(false);
  const [stream,  setStream]  = useState('');
  const endRef = useRef(null);

  // Poll AI status
  useEffect(() => {
    checkStatus().then(setStatus);
    const t = setInterval(() => checkStatus().then(setStatus), 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat, stream]);

  const ask = async () => {
    if (!msg.trim() || busy || status !== 'ready') return;
    const q = msg.trim(); setMsg('');
    const userMsg = { role: 'user', content: q };
    setChat(c => [...c, userMsg]);
    setBusy(true); setStream('');

    const ctx = `Company: ${co.name} (${co.industry}, ${co.city}). Revenue: ${fmt(sales)}. Expenses: ${fmt(expenses)}. Net Profit: ${fmt(profit)}. GST Payable: ${fmt(gstNet)}. Employees: ${emps.length}. Inventory SKUs: ${inv.length}. Active leads: ${leads.filter(l => !['Won','Lost'].includes(l.stage)).length}.`;
    const sys = `You are a private business advisor for ${co.name}. Context: ${ctx}. Be concise, practical, and specific to their actual numbers. Never mention internet or online resources.`;

    try {
      const full = await generate(q, sys, (chunk) => setStream(chunk));
      setChat(c => [...c, { role: 'assistant', content: full }]);
    } catch (e) {
      setChat(c => [...c, { role: 'assistant', content: status === 'ready' ? 'Error: ' + e.message : 'AI is not ready yet. Please wait for the model to load.' }]);
    }
    setBusy(false); setStream('');
  };

  const QUICK = [
    'What is my current profit margin?',
    'Which expense category is highest?',
    'How many days of cash runway do I have?',
    'Summarise my business health in 3 points.',
  ];

  return (
    <>
      {/* Toggle button */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'fixed', bottom: 24, right: 24, width: 50, height: 50,
        borderRadius: '50%', background: status === 'ready' ? T.am : '#94A3B8',
        border: 'none', color: '#FFF', fontSize: 22, cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
        transition: 'background 0.2s',
      }}>
        {open ? '×' : '✦'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 86, right: 24, width: 360, height: 520,
          background: T.sf, border: `1px solid ${T.bd}`, borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', zIndex: 300, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', background: T.sb, borderBottom: `1px solid #2A231D`, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#FFF', fontFamily: f }}>Nexara AI Advisor</div>
                <div style={{ fontSize: 10, color: '#6B5E4E', fontFamily: mo, marginTop: 1 }}>100% offline · {co.name}</div>
              </div>
              <AIStatusPill status={status} />
            </div>
          </div>

          {/* Status banners */}
          {status === 'unavailable' && (
            <div style={{ padding: '10px 14px', background: '#FFF1F1', borderBottom: `1px solid #FECACA`, fontSize: 11, color: '#B91C1C', fontFamily: mo }}>
              AI engine starting up. Please wait 10–30 seconds after app launch.
            </div>
          )}
          {status === 'no-model' && (
            <div style={{ padding: '10px 14px', background: '#FEF3E9', borderBottom: `1px solid #FED7AA`, fontSize: 11, color: '#92400E', fontFamily: mo }}>
              AI model not downloaded yet. Go to Settings → AI Setup to download.
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chat.length === 0 && status === 'ready' && (
              <div style={{ color: T.t4, fontSize: 11, textAlign: 'center', padding: '10px 0' }}>
                <div style={{ marginBottom: 12, fontFamily: mo }}>Ask anything about your business</div>
                {QUICK.map(q => (
                  <button key={q} onClick={() => setMsg(q)} style={{
                    display: 'block', width: '100%', marginBottom: 6, padding: '7px 10px',
                    background: T.sf2, border: `1px solid ${T.bd}`, borderRadius: 5,
                    cursor: 'pointer', fontSize: 11, color: T.t2, textAlign: 'left', fontFamily: f,
                  }}>{q}</button>
                ))}
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} style={{
                padding: '9px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.7,
                background: m.role === 'user' ? T.aml : T.sf2,
                color: m.role === 'user' ? '#92400E' : T.t2,
                border: `1px solid ${m.role === 'user' ? '#FED7AA' : T.bd}`,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%', whiteSpace: 'pre-wrap',
              }}>{m.content}</div>
            ))}
            {stream && (
              <div style={{
                padding: '9px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.7,
                background: T.sf2, color: T.t2, border: `1px solid ${T.bd}`,
                alignSelf: 'flex-start', maxWidth: '90%', whiteSpace: 'pre-wrap',
              }}>
                {stream}<span style={{ animation: 'blink 1s infinite', opacity: 0.5 }}>▌</span>
              </div>
            )}
            {busy && !stream && (
              <div style={{ fontSize: 11, color: T.t4, fontFamily: mo }}>Thinking…</div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${T.bd}`, display: 'flex', gap: 8, flexShrink: 0 }}>
            <input value={msg} onChange={e => setMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }}
              placeholder={status === 'ready' ? 'Ask about your business…' : 'AI warming up…'}
              disabled={status !== 'ready' || busy}
              style={{
                flex: 1, padding: '7px 10px', background: T.sf2,
                border: `1px solid ${T.bd}`, borderRadius: 6,
                color: T.tx, fontSize: 12, fontFamily: f, outline: 'none',
              }} />
            <button onClick={ask} disabled={status !== 'ready' || busy || !msg.trim()}
              style={{
                padding: '7px 12px', background: status === 'ready' ? T.am : '#94A3B8',
                border: 'none', borderRadius: 6, color: '#FFF',
                cursor: status === 'ready' ? 'pointer' : 'not-allowed', fontSize: 14,
              }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}

// ── AI Setup Panel (used in Settings module) ──────────────────────────────────
export function AISetupPanel() {
  const [status,   setStatus]   = useState('loading');
  const [progress, setProgress] = useState('');
  const [pulling,  setPulling]  = useState(false);

  useEffect(() => { checkStatus().then(setStatus); }, []);

  const pullModel = async () => {
    if (!window.electronAPI) { setProgress('Only available in the desktop app.'); return; }
    setPulling(true); setProgress('Starting download…');
    window.electronAPI.onAIProgress(data => setProgress(data));
    const result = await window.electronAPI.aiPullModel();
    setPulling(false);
    if (result.ok) { setProgress('Model downloaded successfully!'); checkStatus().then(setStatus); }
    else setProgress('Download failed: ' + (result.error || 'Unknown error'));
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AIStatusPill status={status} />
        <span style={{ fontSize: 12, color: T.t2 }}>
          {status === 'ready' && 'Phi-3.5 model is loaded and ready. All AI features work offline.'}
          {status === 'no-model' && 'Ollama is running but the AI model is not downloaded yet.'}
          {status === 'unavailable' && 'AI engine not running. It starts automatically when the app launches.'}
          {status === 'loading' && 'Checking AI status…'}
        </span>
      </div>

      {status === 'no-model' && (
        <div>
          <InfoBox type="warning">The Phi-3.5 AI model needs to be downloaded once (~2.2GB). This happens on your machine — nothing goes to any server.</InfoBox>
          <div style={{ marginTop: 12 }}>
            <BtnP onClick={pullModel} disabled={pulling}>{pulling ? 'Downloading…' : 'Download AI Model (~2.2GB)'}</BtnP>
          </div>
          {progress && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: T.sf2, borderRadius: 5, fontSize: 11, fontFamily: mo, color: T.t2, whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto' }}>
              {progress}
            </div>
          )}
        </div>
      )}

      {status === 'ready' && (
        <InfoBox type="success">
          100% offline AI is active. Your data never leaves this machine. No internet needed for any AI feature.
        </InfoBox>
      )}

      <div style={{ padding: 14, background: T.sf2, borderRadius: 6, border: `1px solid ${T.bd}` }}>
        <div style={{ fontSize: 11, color: T.t3, fontFamily: mo, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>HOW IT WORKS</div>
        {[
          ['Model', 'Microsoft Phi-3.5 Mini (3.8B parameters)'],
          ['Runs on', 'Your CPU/GPU — no internet ever'],
          ['Data shared', 'Nothing — zero external calls'],
          ['Storage', '~2.2GB in your app data folder'],
          ['RAM needed', '4GB minimum, 8GB recommended'],
          ['Speed', '5–30 seconds per response (depends on Mac)'],
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${T.sf}` }}>
            <span style={{ fontSize: 11, color: T.t3 }}>{l}</span>
            <span style={{ fontSize: 11, color: T.t2, fontFamily: mo }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
