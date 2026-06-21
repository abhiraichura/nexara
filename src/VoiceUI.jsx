import React, { useState, useEffect, useRef, useCallback } from 'react';
import { T, f, mo, BtnP, BtnG, BtnDanger, InfoBox, Card, CardHdr, StatRow, fmtN as fmtNComp } from './components';
import { parseCommand, speak, createRecognizer, isVoiceSupported, answerQuery, parseAmount, parseDate } from './voice';
import { generate } from './AIStatus';
import { uid, today, fmt, fmtN } from './data';

// ── VOICE COMMAND RESULT CARD ──────────────────────────────────────────────────
function ConfirmCard({ parsed, onConfirm, onCancel, onEdit }) {
  const { intent, entities } = parsed;

  const intentLabels = {
    create_invoice:  '📋 Create Invoice',
    add_expense:     '↓ Add Expense',
    add_income:      '↑ Add Income',
    create_task:     '✓ Create Task',
    add_lead:        '◁ Add Lead',
    add_inventory:   '▦ Add Inventory Item',
    add_employee:    '◍ Add Employee',
    navigate:        '→ Navigate',
    query:           '? Query',
  };

  return (
    <div style={{ background: T.sf, border: `2px solid ${T.am}`, borderRadius: 10, padding: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <div style={{ fontSize: 11, color: T.am, fontFamily: mo, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
        {intentLabels[intent] || intent.toUpperCase()}
      </div>

      {intent === 'create_invoice' && (
        <div style={{ display: 'grid', gap: 6 }}>
          <StatRow label="Bill To" value={entities.party || '(not detected)'} />
          <StatRow label="Amount" value={entities.amount > 0 ? fmtN(entities.amount) : '(not detected)'} highlight />
          <StatRow label="Date" value={entities.date || today()} />
        </div>
      )}
      {(intent === 'add_expense' || intent === 'add_income') && (
        <div style={{ display: 'grid', gap: 6 }}>
          <StatRow label="Type" value={intent === 'add_expense' ? 'Expense' : 'Income'} />
          <StatRow label="Party" value={entities.party || '(not detected)'} />
          <StatRow label="Amount" value={entities.amount > 0 ? fmtN(entities.amount) : '(not detected)'} highlight />
          <StatRow label="Note" value={entities.note || '—'} />
          <StatRow label="Date" value={entities.date || today()} />
        </div>
      )}
      {intent === 'create_task' && (
        <div style={{ display: 'grid', gap: 6 }}>
          <StatRow label="Task" value={entities.title || '(not detected)'} />
          <StatRow label="Due Date" value={entities.dueDate || today()} />
          <StatRow label="Priority" value={entities.priority || 'Medium'} />
        </div>
      )}
      {intent === 'add_lead' && (
        <div style={{ display: 'grid', gap: 6 }}>
          <StatRow label="Company" value={entities.company || '(not detected)'} />
          <StatRow label="Deal Value" value={entities.value > 0 ? fmtN(entities.value) : 'TBD'} highlight />
          <StatRow label="Stage" value={entities.stage || 'Prospect'} />
        </div>
      )}
      {intent === 'add_inventory' && (
        <div style={{ display: 'grid', gap: 6 }}>
          <StatRow label="Item" value={entities.name || '(not detected)'} />
          <StatRow label="Quantity" value={`${entities.qty || '?'} ${entities.unit || 'pcs'}`} />
          <StatRow label="Rate" value={entities.rate > 0 ? fmtN(entities.rate) : '—'} />
        </div>
      )}
      {intent === 'add_employee' && (
        <div style={{ display: 'grid', gap: 6 }}>
          <StatRow label="Name" value={entities.name || '(not detected)'} />
          <StatRow label="Role" value={entities.role || '—'} />
          <StatRow label="Annual CTC" value={entities.ctc > 0 ? fmtN(entities.ctc) : '—'} highlight />
        </div>
      )}
      {intent === 'navigate' && (
        <div style={{ padding: '8px 0', fontSize: 14, color: T.tx }}>Navigate to <strong>{entities.label}</strong></div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <BtnP onClick={onConfirm}>✓ Confirm & Execute</BtnP>
        <BtnG onClick={onCancel}>Cancel</BtnG>
      </div>
    </div>
  );
}

// ── MAIN VOICE PANEL ───────────────────────────────────────────────────────────
export function VoicePanel({
  co, txns, saveTxns, emps, saveEmps, inv, saveInv,
  leads, saveLeads, setMod,
  sales, expenses, profit, gstNet,
}) {
  const [open, setOpen]           = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim]     = useState('');
  const [parsed, setParsed]       = useState(null);
  const [result, setResult]       = useState('');
  const [history, setHistory]     = useState([]);
  const [processing, setProcessing] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef(null);

  useEffect(() => { setSupported(isVoiceSupported()); }, []);

  const tasks = JSON.parse(localStorage.getItem('nx_tasks') || '[]');

  const processText = useCallback(async (text) => {
    if (!text.trim()) return;
    setProcessing(true);
    setTranscript(text);
    setParsed(null);
    setResult('');

    let cmd = parseCommand(text);

    // If low confidence, try Ollama
    if (cmd.intent === 'unknown' || cmd.confidence === 'low') {
      try {
        const aiResult = await generate(
          `Extract the user's intent from this voice command for a business management app. 
Command: "${text}"
Respond with ONLY a JSON object (no other text):
{
  "intent": "create_invoice|add_expense|add_income|create_task|add_lead|add_inventory|add_employee|navigate|query|unknown",
  "party": "company or person name or empty",
  "amount": amount_as_number_or_0,
  "date": "YYYY-MM-DD or today",
  "note": "description or empty",
  "module": "module name for navigate intent",
  "metric": "profit|gst|sales|expenses|employees|inventory|tasks|pipeline for query intent",
  "title": "task title for create_task",
  "name": "name for add_employee or add_inventory"
}`,
          'You are a voice command parser for an Indian business software. Extract structured data from natural language commands. Return valid JSON only.'
        );
        try {
          const clean = aiResult.replace(/```json|```/g, '').trim();
          const ai = JSON.parse(clean);
          cmd = {
            intent: ai.intent || 'unknown',
            entities: {
              party: ai.party || '', amount: ai.amount || 0, date: ai.date || today(),
              note: ai.note || '', module: ai.module || '', metric: ai.metric || '',
              title: ai.title || '', name: ai.name || '', company: ai.party || '',
              value: ai.amount || 0, stage: 'Prospect', ctc: ai.amount || 0,
              qty: '', unit: 'pcs', rate: 0, dueDate: ai.date || today(),
              priority: 'Medium',
            },
            confidence: 'medium',
            rawText: text,
          };
        } catch {}
      } catch {}
    }

    // Handle query immediately (no confirmation needed)
    if (cmd.intent === 'query') {
      const answer = answerQuery(cmd.entities.metric, { txns, emps, inv, leads, tasks, fmt, fmtN });
      setResult(answer);
      speak(answer);
      setHistory(h => [{ text, result: answer, ts: new Date().toLocaleTimeString() }, ...h].slice(0, 20));
      setProcessing(false);
      return;
    }

    // Handle navigation immediately
    if (cmd.intent === 'navigate' && cmd.entities.module) {
      setMod(cmd.entities.module);
      const msg = `Opening ${cmd.entities.label}`;
      setResult(msg);
      speak(msg);
      setHistory(h => [{ text, result: msg, ts: new Date().toLocaleTimeString() }, ...h].slice(0, 20));
      setProcessing(false);
      return;
    }

    // Everything else needs confirmation
    if (cmd.intent !== 'unknown') {
      setParsed(cmd);
    } else {
      const msg = `I didn't understand that. Try saying something like "Create invoice for Mehta Industries worth 5 lakh" or "Add task to follow up by Friday".`;
      setResult(msg);
      speak(msg);
    }
    setProcessing(false);
  }, [txns, emps, inv, leads, tasks, setMod]);

  const executeCommand = useCallback((cmd) => {
    const { intent, entities } = cmd;
    let msg = '';

    if (intent === 'create_invoice') {
      // Navigate to invoices module — invoice will be pre-filled via URL param (not implemented here — just navigate)
      setMod('invoices');
      msg = `Navigating to invoices. Invoice for ${entities.party || 'client'} worth ${fmtN(entities.amount)} is ready to save.`;
      // Store pending invoice for InvoiceGenerator to pick up
      localStorage.setItem('nx_voice_invoice', JSON.stringify({
        number: 'INV-' + Date.now().toString().slice(-6),
        billTo: entities.party,
        date: entities.date || today(),
        items: [{ desc: 'As per order', hsn: '', qty: '1', rate: String(entities.amount), gst: '18' }],
        notes: 'Generated via voice command',
        bank: '', account: '', ifsc: '',
      }));
    }
    else if (intent === 'add_expense' || intent === 'add_income') {
      const txn = {
        id: uid(), type: entities.type || (intent === 'add_income' ? 'income' : 'expense'),
        date: entities.date || today(), party: entities.party, note: entities.note || 'Voice entry',
        amount: String(entities.amount), gst: '18', cat: intent === 'add_income' ? 'Sales' : 'Other Expense',
        status: 'cleared', hsn: '', rcm: false,
      };
      saveTxns([txn, ...txns]);
      msg = `Added ${intent === 'add_income' ? 'income' : 'expense'} of ${fmtN(entities.amount)}${entities.party ? ' for ' + entities.party : ''}.`;
    }
    else if (intent === 'create_task') {
      const task = {
        id: uid(), title: entities.title, desc: '', assignee: '', priority: entities.priority || 'Medium',
        dueDate: entities.dueDate || today(), module: 'General', repeat: 'none', status: 'Open', createdAt: today(),
      };
      const existing = JSON.parse(localStorage.getItem('nx_tasks') || '[]');
      const updated = [task, ...existing];
      localStorage.setItem('nx_tasks', JSON.stringify(updated));
      setMod('tasks');
      msg = `Task created: "${entities.title}". Due ${entities.dueDate || 'today'}.`;
    }
    else if (intent === 'add_lead') {
      const lead = {
        id: uid(), co: entities.company, contact: '', phone: '', email: '',
        val: String(entities.value || ''), stage: 'Prospect', source: 'Voice',
        notes: 'Added via voice command', date: today(),
      };
      saveLeads([lead, ...leads]);
      msg = `Lead added: ${entities.company}${entities.value > 0 ? ' worth ' + fmtN(entities.value) : ''}.`;
    }
    else if (intent === 'add_inventory') {
      const item = {
        id: uid(), name: entities.name, sku: '', cat: '', qty: entities.qty || '0',
        unit: entities.unit || 'pcs', rate: String(entities.rate || 0), reorder: '10', vendor: '',
      };
      saveInv([item, ...inv]);
      msg = `Inventory item added: ${entities.name}, ${entities.qty} ${entities.unit}.`;
    }
    else if (intent === 'add_employee') {
      const emp = {
        id: uid(), name: entities.name, role: entities.role || '', dept: '', ctc: String(entities.ctc || 0),
        doj: today(), email: '', phone: '', status: 'Active',
      };
      saveEmps([emp, ...emps]);
      msg = `Employee added: ${entities.name}${entities.role ? ', ' + entities.role : ''}.`;
    }

    setParsed(null);
    setResult(msg);
    speak(msg);
    setHistory(h => [{ text: cmd.rawText, result: msg, ts: new Date().toLocaleTimeString() }, ...h].slice(0, 20));
  }, [txns, saveTxns, emps, saveEmps, inv, saveInv, leads, saveLeads, setMod]);

  const startListening = () => {
    if (!supported) return;
    const rec = createRecognizer();
    if (!rec) return;
    recRef.current = rec;

    rec.onstart = () => { setListening(true); setTranscript(''); setInterim(''); setParsed(null); setResult(''); };
    rec.onresult = (e) => {
      let final = '', inter = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else inter += t;
      }
      setInterim(inter);
      if (final) { setTranscript(final); processText(final); }
    };
    rec.onerror = (e) => { setListening(false); if (e.error !== 'no-speech') setResult('Mic error: ' + e.error + '. Please check microphone permissions.'); };
    rec.onend = () => { setListening(false); setInterim(''); };
    rec.start();
  };

  const stopListening = () => { recRef.current?.stop(); setListening(false); };

  const EXAMPLES = [
    'Create invoice for Abhi Industries worth 5 crore with today\'s date',
    'Add expense of 50000 for rent',
    'Create task to follow up with Mehta by Friday',
    'Add lead Sharma Industries worth 10 lakh',
    'What is my profit?',
    'How much GST do I owe?',
    'Go to inventory',
    'Add income of 2 lakh from Kapoor Trading',
  ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Voice Command (click to open)"
        style={{
          position: 'fixed', bottom: 86, right: 24,
          width: 48, height: 48, borderRadius: '50%',
          background: listening ? T.rd : '#1D4ED8',
          border: 'none', color: '#FFF', fontSize: 20,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,78,216,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 299, transition: 'background 0.2s',
          animation: listening ? 'pulse 1s infinite' : 'none',
        }}>
        🎙
      </button>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes ripple { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2);opacity:0} }
      `}</style>

      {/* Floating mic button */}
      <button
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', bottom: 86, right: 24,
          width: 48, height: 48, borderRadius: '50%',
          background: '#1D4ED8', border: `2px solid #93C5FD`,
          color: '#FFF', fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 299,
        }}>
        ×
      </button>

      {/* Voice Panel */}
      <div style={{
        position: 'fixed', bottom: 148, right: 24,
        width: 380, background: T.sf, border: `1px solid ${T.bd}`,
        borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        zIndex: 299, overflow: 'hidden', maxHeight: '75vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', background: '#1E3A5F', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FFF', fontFamily: f }}>🎙 Voice Commands</div>
              <div style={{ fontSize: 10, color: '#93C5FD', fontFamily: mo, marginTop: 1 }}>
                {supported ? '100% offline · macOS speech engine' : 'Not supported in this browser'}
              </div>
            </div>
            {listening && (
              <div style={{ display: 'flex', gap: 3 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ width: 4, background: T.rd, borderRadius: 2, height: 12 + Math.random() * 12, animation: `pulse 0.${5+i}s infinite alternate` }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {!supported && (
            <InfoBox type="warning">Voice commands require Chrome or Edge browser. Safari has limited support. Make sure microphone permission is granted.</InfoBox>
          )}

          {/* Big mic button */}
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {listening && (
                <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${T.rd}`, animation: 'ripple 1s infinite' }} />
              )}
              <button
                onClick={listening ? stopListening : startListening}
                disabled={!supported || processing}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: listening ? T.rd : '#1D4ED8',
                  border: 'none', cursor: supported ? 'pointer' : 'not-allowed',
                  fontSize: 28, color: '#FFF',
                  boxShadow: listening ? `0 0 0 6px ${T.rd}33` : '0 4px 14px rgba(29,78,216,0.3)',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {processing ? '⟳' : listening ? '⏹' : '🎙'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: T.t3, fontFamily: mo, marginTop: 10 }}>
              {!supported ? 'Voice not available' : processing ? 'Processing…' : listening ? 'Listening… speak now' : 'Tap to speak'}
            </div>
          </div>

          {/* Live transcript */}
          {(transcript || interim) && (
            <div style={{ padding: '10px 12px', background: T.sf2, borderRadius: 6, border: `1px solid ${T.bd}`, marginBottom: 12, fontSize: 13, color: T.tx, lineHeight: 1.5 }}>
              {transcript || <span style={{ color: T.t3 }}>{interim}</span>}
            </div>
          )}

          {/* Confirmation card */}
          {parsed && (
            <div style={{ marginBottom: 12 }}>
              <ConfirmCard
                parsed={parsed}
                onConfirm={() => executeCommand(parsed)}
                onCancel={() => { setParsed(null); setTranscript(''); }}
              />
            </div>
          )}

          {/* Result */}
          {result && !parsed && (
            <div style={{ padding: '10px 12px', background: T.gl, border: `1px solid #BBF7D0`, borderRadius: 6, fontSize: 12, color: T.gn, lineHeight: 1.6, marginBottom: 12 }}>
              {result}
            </div>
          )}

          {/* Example commands */}
          {!transcript && !parsed && !result && (
            <div>
              <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>TRY SAYING</div>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => processText(ex)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '7px 10px', background: T.sf2,
                    border: `1px solid ${T.bd}`, borderRadius: 4,
                    cursor: 'pointer', fontSize: 11, color: T.t2,
                    fontFamily: f, marginBottom: 4, lineHeight: 1.4,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.am}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.bd}>
                  "{ex}"
                </button>
              ))}
            </div>
          )}

          {/* History */}
          {history.length > 0 && !transcript && !parsed && !result && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>RECENT COMMANDS</div>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: `1px solid ${T.sf2}` }}>
                  <div style={{ fontSize: 11, color: T.t2 }}>"{h.text}"</div>
                  <div style={{ fontSize: 10, color: T.t3, marginTop: 2 }}>{h.result} · {h.ts}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
