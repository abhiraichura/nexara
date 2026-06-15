import React, { useState, useEffect } from 'react';
import { DB, fmt, fmtK, calcPay, SD_TXN, SD_EMP, SD_INV, SD_VENDORS, SD_LEADS, COMPLIANCE, STATES, MODS, CATS } from './data.js';
import { T, f, mo, Badge, KPI, Inp, Sel, BtnP, BtnG, SHdr, Tabs, Modal } from './components.jsx';

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [firm, setFirm] = useState({});
  const [cat, setCat] = useState(null);
  const [size, setSize] = useState(null);
  const [pains, setPains] = useState([]);
  const canGo = () => {
    if (step === 0) return true;
    if (step === 1) return firm.companyName?.length > 1;
    if (step === 2) return !!cat;
    if (step === 3) return !!size;
    return pains.length > 0;
  };
  const sel = (a) => ({ padding: '12px 14px', border: `1px solid ${a ? T.tx : T.bd}`, borderRadius: 5, cursor: 'pointer', background: a ? T.tx : T.sf });
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', fontFamily: f }}>
      <div style={{ width: 260, background: T.tx, padding: '36px 28px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 44 }}>
          <div style={{ width: 26, height: 26, background: T.am, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>N</div>
          <span style={{ color: '#F4F1EC', fontSize: 12, letterSpacing: 4 }}>NEXARA</span>
        </div>
        <div style={{ flex: 1 }}>
          {['Welcome', 'Company', 'Industry', 'Team', 'Pain Points'].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, opacity: i > step ? 0.25 : 1 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < step ? T.am : i === step ? '#F4F1EC' : 'transparent', border: `1px solid ${i < step ? T.am : i === step ? '#F4F1EC' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {i < step ? <span style={{ color: '#fff', fontSize: 9 }}>✓</span> : <span style={{ fontSize: 10, color: i === step ? T.tx : 'rgba(255,255,255,0.3)', fontFamily: mo }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 12, color: i === step ? '#F4F1EC' : 'rgba(255,255,255,0.35)' }}>{l}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, fontFamily: mo }}>Your data stays on your machine. Never transmitted.</p>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ maxWidth: 500, width: '100%' }}>
          {step === 0 && (
            <div>
              <h1 style={{ fontSize: 34, fontWeight: 400, color: T.tx, letterSpacing: -1, lineHeight: 1.1, marginBottom: 12 }}>Your private<br />business OS</h1>
              <p style={{ color: T.t2, fontSize: 14, lineHeight: 1.7, marginBottom: 26 }}>22 modules. One install. Accounting, HR, Inventory, Legal, CRM — all local.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 26 }}>
                {['GST & Taxation', 'HR & Payroll', 'Inventory tracking', 'Legal compliance', 'CRM & Pipeline', 'AI assistant'].map((x, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: T.sf, border: `1px solid ${T.bd}`, borderRadius: 5 }}>
                    <span style={{ color: T.am }}>✓</span><span style={{ fontSize: 12, color: T.t2 }}>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 400, color: T.tx, marginBottom: 20 }}>Tell us about your business</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Inp label="COMPANY NAME" value={firm.companyName || ''} onChange={e => setFirm(p => ({ ...p, companyName: e.target.value }))} placeholder="e.g. Sharma Industries Pvt Ltd" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <Inp label="GSTIN" value={firm.gstin || ''} onChange={e => setFirm(p => ({ ...p, gstin: e.target.value }))} placeholder="22AAAAA0000A1Z5" />
                  <Inp label="PAN" value={firm.pan || ''} onChange={e => setFirm(p => ({ ...p, pan: e.target.value }))} placeholder="AAAAA0000A" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <Inp label="CITY" value={firm.city || ''} onChange={e => setFirm(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" />
                  <Sel label="STATE" value={firm.state || 'Select...'} onChange={e => setFirm(p => ({ ...p, state: e.target.value }))} options={['Select...', ...STATES]} />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 400, color: T.tx, marginBottom: 16 }}>What kind of business?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[{ id: 'manufacturing', label: 'Manufacturing', icon: '⚙' }, { id: 'trading', label: 'Trading', icon: '⊞' }, { id: 'retail', label: 'Retail', icon: '▦' }, { id: 'services', label: 'Services', icon: '◈' }, { id: 'restaurant', label: 'Food & Hospitality', icon: '◎' }, { id: 'construction', label: 'Construction', icon: '⊟' }].map(o => (
                  <div key={o.id} onClick={() => setCat(o.id)} style={{ ...sel(cat === o.id), textAlign: 'center', padding: '14px 8px' }}>
                    <div style={{ fontSize: 18, marginBottom: 6, color: cat === o.id ? '#F4F1EC' : T.t3 }}>{o.icon}</div>
                    <div style={{ fontSize: 12, color: cat === o.id ? '#F4F1EC' : T.tx }}>{o.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 400, color: T.tx, marginBottom: 16 }}>Team size?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[{ id: 'solo', l: 'Solo / Founder' }, { id: 'small', l: '2–10 people' }, { id: 'medium', l: '11–50 people' }, { id: 'large', l: '51–200 people' }, { id: 'enterprise', l: '200+ people' }].map(o => (
                  <div key={o.id} onClick={() => setSize(o.id)} style={{ ...sel(size === o.id), padding: '11px 14px' }}>
                    <span style={{ fontSize: 13, color: size === o.id ? '#F4F1EC' : T.tx }}>{o.l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 400, color: T.tx, marginBottom: 16 }}>What hurts most?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[{ id: 'gst', l: 'GST & Tax', icon: '§' }, { id: 'payroll', l: 'Payroll', icon: '◉' }, { id: 'inventory', l: 'Inventory', icon: '▦' }, { id: 'cashflow', l: 'Cash Flow', icon: '↻' }, { id: 'compliance', l: 'Legal', icon: '⚖' }, { id: 'reporting', l: 'Reports', icon: '≡' }].map(o => {
                  const on = pains.includes(o.id);
                  return (
                    <div key={o.id} onClick={() => setPains(p => on ? p.filter(x => x !== o.id) : [...p, o.id])} style={{ ...sel(on), textAlign: 'center', padding: '14px 8px' }}>
                      <div style={{ fontSize: 18, marginBottom: 5, color: on ? '#F4F1EC' : T.t3 }}>{o.icon}</div>
                      <div style={{ fontSize: 11, color: on ? '#F4F1EC' : T.tx }}>{o.l}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <BtnP onClick={() => { if (step < 4) setStep(s => s + 1); else onComplete({ ...firm, category: cat, size, pains }); }} disabled={!canGo()}>
              {step === 4 ? 'Enter Nexara →' : 'Continue →'}
            </BtnP>
            {step > 0 && <BtnG onClick={() => setStep(s => s - 1)}>← Back</BtnG>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [scr, setScr] = useState(() => DB.get('scr', 'onboarding'));
  const [firm, setFirm] = useState(() => DB.get('firm', {}));
  const [firmEdit, setFirmEdit] = useState(() => DB.get('firm', {}));
  const [mod, setMod] = useState('dashboard');
  const [sb, setSb] = useState(true);
  const [modal, setModal] = useState(null);
  const [dark, setDark] = useState(() => DB.get('dark', false));
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMsgs, setAiMsgs] = useState([{ r: 'a', t: "Hello. I'm Nexara AI. Ask anything about your financials, payroll, or inventory." }]);
  const [aiIn, setAiIn] = useState('');
  const [aiLoad, setAiLoad] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [stab, setStab] = useState('firm');
  const [htab, setHtab] = useState('employees');
  const [ftab, setFtab] = useState('ledger');
  const [itab, setItab] = useState('stock');
  const [ctab, setCtab] = useState('pipeline');
  const [srch, setSrch] = useState('');
  const [srchOpen, setSrchOpen] = useState(false);
  const [srchRes, setSrchRes] = useState([]);
  const [invModal, setInvModal] = useState(false);
  const [invData, setInvData] = useState({ party: '', gstin: '', address: '', date: new Date().toISOString().slice(0, 10), invoiceNo: 'INV-2601', items: [{ desc: '', qty: 1, rate: '', gst: 18 }] });
  const [vPayMod, setVPayMod] = useState(null);
  const [vPayAmt, setVPayAmt] = useState('');
  const [adjMod, setAdjMod] = useState(null);
  const [adjQty, setAdjQty] = useState('');
  const [adjNote, setAdjNote] = useState('');
  const [editMod, setEditMod] = useState(null);
  const [currency, setCurrency] = useState(() => DB.get('currency', 'INR'));
  const [ollamaUrl, setOllamaUrl] = useState(() => DB.get('ollamaUrl', 'http://localhost:11434'));
  const [ollamaStatus, setOllamaStatus] = useState('untested');
  const [backupStatus, setBackupStatus] = useState('');
  const [hsnQ, setHsnQ] = useState('');
  const [hsnRes, setHsnRes] = useState([]);
  const [commsDrafts, setCommsDrafts] = useState(Array(6).fill(''));
  const [commsLoading, setCommsLoading] = useState(Array(6).fill(false));
  const [commsGen, setCommsGen] = useState(Array(6).fill(false));
  const [stockLog, setStockLog] = useState(() => DB.get('slog', []));
  const [docQ, setDocQ] = useState('');
  const [docAns, setDocAns] = useState('');
  const [docLoad, setDocLoad] = useState(false);
  const [docTab, setDocTab] = useState('library');
  const [leadStage, setLeadStage] = useState(null);
  const [notifs, setNotifs] = useState(() => DB.get('notifs', [
    { id: 1, type: 'warning', title: 'GSTR-3B due in 20 days', desc: 'Verify with CA', time: 'Now', read: false, action: 'taxation' },
    { id: 2, type: 'alert', title: 'Low stock: 2 items', desc: 'Aluminum Sheets, Conveyor Frame', time: '2h ago', read: false, action: 'inventory' },
    { id: 3, type: 'info', title: 'Payroll ready for May', desc: '5 employees', time: 'Today', read: true, action: 'hr' },
  ]));
  const [txnF, setTxnF] = useState({ party: '', type: 'Sale', amount: '', gst: '', category: 'Finished Goods', date: '', hsn: '', status: 'pending' });
  const [empF, setEmpF] = useState({ name: '', designation: '', dept: 'Operations', basic: '', hra: '', special: '', doj: '', pan: '', pf: true, esic: false, pt: 200 });
  const [invF, setInvF] = useState({ sku: '', name: '', category: 'Raw Material', qty: '', unit: 'pcs', costPrice: '', reorderAt: '', supplier: '' });
  const [leadF, setLeadF] = useState({ company: '', contact: '', value: '', stage: 'Discovery', source: 'Referral', notes: '' });
  const [txns, setTxns] = useState(() => DB.get('txns', SD_TXN));
  const [emps, setEmps] = useState(() => DB.get('emps', SD_EMP));
  const [inv, setInv] = useState(() => DB.get('inv', SD_INV));
  const [vendors, setVendors] = useState(() => DB.get('vendors', SD_VENDORS));
  const [leads, setLeads] = useState(() => DB.get('leads', SD_LEADS));
  const [docs, setDocs] = useState(() => DB.get('docs', [
    { id: 1, name: 'Supply Agreement — Ramesh Steel.pdf', type: 'Contract', size: '245 KB', uploaded: '2026-05-10', summary: 'Annual supply. 30-day credit, 2% discount above Rs2L.' },
    { id: 2, name: 'Office Lease Agreement.pdf', type: 'Lease', size: '512 KB', uploaded: '2024-04-01', summary: '3-year lease Rs45,000/month. Lock-in 1 year. 10% escalation.' },
    { id: 3, name: 'Employee Handbook v3.pdf', type: 'HR', size: '890 KB', uploaded: '2026-01-15', summary: 'Leave, conduct, payroll, grievance. Maternity 26 weeks.' },
  ]));
  const [auditLog, setAuditLog] = useState(() => DB.get('audit', []));

  useEffect(() => { DB.set('txns', txns); }, [txns]);
  useEffect(() => { DB.set('emps', emps); }, [emps]);
  useEffect(() => { DB.set('inv', inv); }, [inv]);
  useEffect(() => { DB.set('vendors', vendors); }, [vendors]);
  useEffect(() => { DB.set('leads', leads); }, [leads]);
  useEffect(() => { DB.set('docs', docs); }, [docs]);
  useEffect(() => { DB.set('audit', auditLog); }, [auditLog]);
  useEffect(() => { DB.set('firm', firm); }, [firm]);
  useEffect(() => { DB.set('notifs', notifs); }, [notifs]);
  useEffect(() => { DB.set('slog', stockLog); }, [stockLog]);

  const log = (action, module, detail) => setAuditLog(p => [{ id: Date.now(), ts: new Date().toISOString(), action, module, detail }, ...p].slice(0, 200));
  const sales = txns.filter(t => t.type === 'Sale');
  const purch = txns.filter(t => t.type === 'Purchase');
  const exps = txns.filter(t => t.type === 'Expense');
  const totRev = sales.reduce((a, t) => a + t.amount, 0);
  const totPur = purch.reduce((a, t) => a + t.amount, 0);
  const totExp = exps.reduce((a, t) => a + t.amount, 0);
  const netPft = totRev - totPur - totExp;
  const outGST = sales.reduce((a, t) => a + t.gst, 0);
  const inGST = [...purch, ...exps].reduce((a, t) => a + t.gst, 0);
  const netGST = outGST - inGST;
  const overdue = txns.filter(t => t.status === 'overdue').reduce((a, t) => a + t.amount, 0);
  const lowStock = inv.filter(i => i.qty <= i.reorderAt);
  const payData = emps.map(e => ({ ...e, c: calcPay(e) }));
  const totNet = payData.reduce((a, e) => a + e.c.net, 0);
  const totCTC = payData.reduce((a, e) => a + e.c.ctc, 0);
  const totPF = payData.reduce((a, e) => a + e.c.pE + e.c.pR, 0);
  const totESIC = payData.reduce((a, e) => a + e.c.eE + e.c.eR, 0);
  const pipeVal = leads.filter(l => l.stage !== 'Closed Won' && l.stage !== 'Closed Lost').reduce((a, l) => a + l.value, 0);
  const wonVal = leads.filter(l => l.stage === 'Closed Won').reduce((a, l) => a + l.value, 0);
  const unread = notifs.filter(n => !n.read).length;
  const fmtC = n => currency === 'USD' ? `$${(Math.abs(n) / 83.5).toFixed(0)}` : currency === 'AED' ? `AED ${(Math.abs(n) / 22.7).toFixed(0)}` : fmt(n);
  const invTotal = invData.items.reduce((a, it) => { const b = (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0); return a + b + b * (parseFloat(it.gst) || 0) / 100; }, 0);
  const stageCol = s => ({ 'Closed Won': 'green', 'Closed Lost': 'red', 'Negotiation': 'amber', 'Proposal Sent': 'blue' }[s] || 'neutral');
  const HSN_DATA = [
    { code: '7208', desc: 'Flat-rolled iron/non-alloy steel', gst: 18 },
    { code: '7326', desc: 'Other articles of iron or steel', gst: 18 },
    { code: '8431', desc: 'Parts for machinery', gst: 18 },
    { code: '8501', desc: 'Electric motors and generators', gst: 18 },
    { code: '9965', desc: 'Goods transport services', gst: 5 },
    { code: '2716', desc: 'Electrical energy', gst: 0 },
    { code: '8483', desc: 'Transmission shafts and gears', gst: 18 },
    { code: '3926', desc: 'Other articles of plastics', gst: 18 },
    { code: '4819', desc: 'Cartons and boxes of paper', gst: 12 },
    { code: '8413', desc: 'Pumps for liquids', gst: 12 },
    { code: '8471', desc: 'Computers and data processing machines', gst: 18 },
    { code: '8517', desc: 'Telephone sets and smartphones', gst: 18 },
  ];

  const askAI = async () => {
    if (!aiIn.trim()) return;
    const q = aiIn.trim(); setAiIn(''); setAiMsgs(p => [...p, { r: 'u', t: q }]); setAiLoad(true);
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500,
          system: `Nexara AI for ${firm.companyName || 'this company'}. Revenue:${fmt(totRev)},Profit:${fmt(netPft)},GST:${fmt(netGST)},Employees:${emps.length},Payroll:${fmt(totNet)},Pipeline:${fmt(pipeVal)}. Be concise.`,
          messages: [{ role: 'user', content: q }] })
      });
      const d = await r.json();
      setAiMsgs(p => [...p, { r: 'a', t: d.content?.[0]?.text || 'Try again.' }]);
    } catch { setAiMsgs(p => [...p, { r: 'a', t: 'Offline — connect internet to use AI.' }]); }
    setAiLoad(false);
  };

  const runSearch = q => {
    if (!q) { setSrchRes([]); return; }
    const r = [];
    txns.forEach(t => { if (t.party.toLowerCase().includes(q.toLowerCase())) r.push({ type: 'Transaction', title: t.party, sub: `${t.type} · ${fmt(t.amount)}`, go: 'accounting' }); });
    emps.forEach(e => { if (e.name.toLowerCase().includes(q.toLowerCase())) r.push({ type: 'Employee', title: e.name, sub: e.designation, go: 'hr' }); });
    inv.forEach(i => { if (i.name.toLowerCase().includes(q.toLowerCase())) r.push({ type: 'Inventory', title: i.name, sub: `${i.qty} ${i.unit}`, go: 'inventory' }); });
    MODS.forEach(m => { if (m.label.toLowerCase().includes(q.toLowerCase())) r.push({ type: 'Module', title: m.label, sub: 'Navigate', go: m.id }); });
    setSrchRes(r.slice(0, 7));
  };

  const backupData = () => {
    const bk = {};
    ['txns', 'emps', 'inv', 'vendors', 'leads', 'docs', 'audit', 'firm'].forEach(k => {
      try { const v = localStorage.getItem('nx_' + k); if (v) bk[k] = JSON.parse(v); } catch {}
    });
    bk._meta = { date: new Date().toISOString(), company: firm.companyName };
    const blob = new Blob([JSON.stringify(bk, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `nexara_backup_${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    setBackupStatus('Backup downloaded'); setTimeout(() => setBackupStatus(''), 3000);
  };

  const downloadPayslip = e => {
    const c = calcPay(e);
    const lines = [
      `PAYSLIP MAY 2026`, `${firm.companyName || 'Company'}`, '─'.repeat(46),
      `${e.name} · ${e.designation} · ${e.dept}`, '─'.repeat(46),
      `Basic: ${fmt(e.basic)}  HRA: ${fmt(e.hra)}  Special: ${fmt(e.special)}`,
      `Gross: ${fmt(c.g)}`, '─'.repeat(46),
      `PF Emp: ${fmt(c.pE)}  ESIC: ${fmt(c.eE)}  PT: ${fmt(c.pt)}  TDS: ${fmt(c.tds)}`,
      `Deductions: ${fmt(c.ded)}`, '─'.repeat(46),
      `NET PAY: ${fmt(c.net)}  CTC: ${fmt(c.ctc)}`
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `Payslip_${e.name.replace(/ /g, '_')}_May2026.txt`; a.click();
    URL.revokeObjectURL(url); log('EXPORT', 'HR', 'Payslip: ' + e.name);
  };

  const recVendorPay = (vendor, amt) => {
    const a = parseFloat(amt); if (!a || a <= 0) return;
    setVendors(p => p.map(v => v.id === vendor.id ? { ...v, outstanding: Math.max(0, v.outstanding - a) } : v));
    setTxns(p => [{ id: Date.now(), date: new Date().toISOString().slice(0, 10), party: vendor.name, type: 'Expense', amount: a, gst: 0, status: 'paid', category: 'Vendor Payment', hsn: '' }, ...p]);
    log('PAYMENT', 'Vendors', `Paid ${fmt(a)} to ${vendor.name}`);
    setVPayMod(null); setVPayAmt('');
  };

  const adjustStock = (item, qty, note) => {
    const q = parseInt(qty); if (isNaN(q)) return;
    setInv(p => p.map(i => i.id === item.id ? { ...i, qty: Math.max(0, i.qty + q) } : i));
    setStockLog(p => [{ id: Date.now(), date: new Date().toISOString().slice(0, 10), sku: item.sku, name: item.name, adj: q, note: note || 'Manual', before: item.qty, after: Math.max(0, item.qty + q) }, ...p].slice(0, 100));
    log('ADJUST', 'Inventory', `${item.name}: ${q > 0 ? '+' : ''}${q}`);
    setAdjMod(null); setAdjQty(''); setAdjNote('');
  };

  const downloadReport = (title, key) => {
    const sep = '─'.repeat(42); const co = firm.companyName || 'Company';
    const map = {
      pl: `P&L MAY 2026\n${co}\n${sep}\nRevenue: ${fmt(totRev)}\nPurchases: -${fmt(totPur)}\nExpenses: -${fmt(totExp)}\n${sep}\nNet Profit: ${fmt(netPft)} (${Math.round(totRev>0?(netPft/totRev*100):0)}%)`,
      gst: `GST MAY 2026\n${co}\n${sep}\nOutput: ${fmt(outGST)}\nITC: -${fmt(inGST)}\n${sep}\nPayable: ${fmt(netGST)}`,
      payroll: `PAYROLL MAY 2026\n${co}\n${sep}\n${payData.map(e => `${e.name.padEnd(18)} Net: ${fmt(e.c.net).padStart(10)}`).join('\n')}\n${sep}\nTotal: ${fmt(totNet)}`,
      inv_val: `INVENTORY\n${co}\n${sep}\n${inv.map(i => `${i.sku.padEnd(8)} ${i.name.padEnd(20)} ${i.qty} ${i.unit}`).join('\n')}\n${sep}\nTotal: ${fmt(inv.reduce((a, i) => a + i.qty * i.costPrice, 0))}`,
      compliance: `COMPLIANCE\n${co}\n${sep}\n${COMPLIANCE.map(c => `${c.due.padEnd(14)} ${c.title.padEnd(24)} ${c.status}`).join('\n')}`,
      pipeline: `PIPELINE\n${co}\n${sep}\n${leads.map(l => `${l.company.padEnd(20)} ${l.stage.padEnd(16)} ${fmt(l.value)}`).join('\n')}`,
      cf: `CASH FLOW\n${co}\n${sep}\nOpening: Rs8,20,000\n+Sales: ${fmt(totRev)}\n-Purchases: -${fmt(totPur)}\n-Expenses: -${fmt(totExp)}`,
      vendor: `VENDOR OUTSTANDING\n${co}\n${sep}\n${vendors.map(v => `${v.name.padEnd(28)} ${v.outstanding > 0 ? fmt(v.outstanding) : 'NIL'}`).join('\n')}`,
    };
    const text = map[key] || ''; if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${title.replace(/ /g, '_')}_May2026.txt`; a.click();
    URL.revokeObjectURL(url); log('EXPORT', 'Reports', title);
  };

  const genComm = async (i, ctx) => {
    setCommsLoading(p => { const n = [...p]; n[i] = true; return n; });
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 400,
          system: `Professional business communication for ${firm.companyName || 'a company'} in India. 150-200 words.`,
          messages: [{ role: 'user', content: ctx }] })
      });
      const d = await r.json();
      setCommsDrafts(p => { const n = [...p]; n[i] = d.content?.[0]?.text || 'Try again.'; return n; });
      setCommsGen(p => { const n = [...p]; n[i] = true; return n; });
    } catch {
      setCommsDrafts(p => { const n = [...p]; n[i] = 'Offline.'; return n; });
      setCommsGen(p => { const n = [...p]; n[i] = true; return n; });
    }
    setCommsLoading(p => { const n = [...p]; n[i] = false; return n; });
  };

  const queryDocs = async q => {
    if (!q) return; setDocLoad(true); setDocAns('');
    try {
      const ctx = docs.map(d => `${d.name}: ${d.summary}`).join('\n\n');
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 400,
          system: `Document assistant. Answer ONLY from:\n${ctx}`,
          messages: [{ role: 'user', content: q }] })
      });
      const d = await r.json(); setDocAns(d.content?.[0]?.text || 'Try again.');
    } catch { setDocAns('Offline.'); }
    setDocLoad(false);
  };

  useEffect(() => {
    const h = e => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'k') { e.preventDefault(); setSrchOpen(true); }
        if (e.key === 'n') { e.preventDefault(); setInvModal(true); }
        if (e.key === 'd') { e.preventDefault(); const d = !dark; setDark(d); DB.set('dark', d); }
        if (e.key === 'b') { e.preventDefault(); backupData(); }
      }
      if (e.key === 'Escape') { setSrchOpen(false); setNotifOpen(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [dark]);

  const LIVE = ['dashboard', 'accounting', 'taxation', 'cashflow', 'banking', 'hr', 'attendance', 'recruitment', 'inventory', 'vendors', 'production', 'crm', 'leads', 'proposals', 'legal', 'contracts', 'audit', 'analytics', 'reports', 'comms', 'documents', 'settings'];
  const grp = Object.keys(CATS).map(k => ({ ...CATS[k], id: k, mods: MODS.filter(m => m.cat === k) }));

  if (scr === 'onboarding') return <Onboarding onComplete={fi => { setFirm(fi); setFirmEdit(fi); DB.set('firm', fi); DB.set('scr', 'app'); setScr('app'); log('SETUP', 'System', `${fi.companyName} onboarded`); }} />;

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, fontFamily: f, color: T.tx, overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width: sb ? 210 : 50, background: T.sb, display: 'flex', flexDirection: 'column', transition: 'width 0.25s', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ padding: '13px 11px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: T.am, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>N</div>
          {sb && <span style={{ fontSize: 11, letterSpacing: 4, color: '#F4F1EC', whiteSpace: 'nowrap' }}>NEXARA</span>}
        </div>
        {sb && <div style={{ padding: '7px 11px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, fontFamily: mo, marginBottom: 2 }}>FIRM</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{firm.companyName || '—'}</div></div>}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {grp.map(g => (
            <div key={g.id}>
              {sb && <div style={{ padding: '7px 11px 2px', fontSize: 8, letterSpacing: 3, color: 'rgba(255,255,255,0.18)', fontFamily: mo }}>{g.l.toUpperCase()}</div>}
              {g.mods.map(m => (
                <div key={m.id} onClick={() => setMod(m.id)} style={{ padding: sb ? '6px 11px' : '8px', display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', background: mod === m.id ? 'rgba(255,255,255,0.07)' : 'transparent', borderLeft: mod === m.id ? `2px solid ${T.am}` : '2px solid transparent', opacity: LIVE.includes(m.id) ? 1 : 0.25, transition: 'all 0.12s' }}>
                  <span style={{ fontSize: 12, color: mod === m.id ? '#F4F1EC' : 'rgba(255,255,255,0.28)', width: 14, textAlign: 'center', flexShrink: 0 }}>{m.icon}</span>
                  {sb && <span style={{ fontSize: 11, color: mod === m.id ? '#F4F1EC' : 'rgba(255,255,255,0.33)', whiteSpace: 'nowrap' }}>{m.label}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div onClick={() => setAiOpen(o => !o)} style={{ padding: sb ? '9px 11px' : '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, background: aiOpen ? 'rgba(217,119,6,0.1)' : 'transparent' }}>
            <span style={{ fontSize: 12, color: aiOpen ? T.am : 'rgba(255,255,255,0.28)' }}>✦</span>
            {sb && <span style={{ fontSize: 11, color: aiOpen ? T.am : 'rgba(255,255,255,0.33)' }}>AI Assistant</span>}
          </div>
          <div onClick={() => setSb(o => !o)} style={{ padding: sb ? '7px 11px' : '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{sb ? '←' : '→'}</span>
            {sb && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Collapse</span>}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <div style={{ height: 48, padding: '0 20px', background: T.sf, borderBottom: `1px solid ${T.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ color: T.t3, fontSize: 11, fontFamily: mo }}>{firm.companyName || 'Nexara'}</span>
            <span style={{ color: T.bd2 }}>›</span>
            <span style={{ color: T.t2, fontSize: 11, fontFamily: mo }}>{MODS.find(m => m.id === mod)?.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ position: 'relative' }}>
              <input value={srch} onChange={e => { setSrch(e.target.value); runSearch(e.target.value); setSrchOpen(true); }} onFocus={() => setSrchOpen(true)} placeholder="Search... (Cmd+K)" style={{ width: 170, padding: '5px 9px', background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 4, color: T.tx, fontSize: 11, outline: 'none', fontFamily: f }} />
              {srchOpen && srch && srchRes.length > 0 && (
                <div style={{ position: 'absolute', top: 30, right: 0, width: 280, background: T.sf, border: `1px solid ${T.bd}`, borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 500, maxHeight: 220, overflowY: 'auto' }}>
                  {srchRes.map((r, i) => (
                    <div key={i} onClick={() => { setMod(r.go); setSrchOpen(false); setSrch(''); }} style={{ padding: '8px 12px', borderBottom: `1px solid ${T.bg}`, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 9, padding: '2px 5px', background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 2, color: T.t3, fontFamily: mo, whiteSpace: 'nowrap' }}>{r.type}</span>
                      <div><div style={{ fontSize: 12, color: T.t2 }}>{r.title}</div><div style={{ fontSize: 10, color: T.t3, fontFamily: mo }}>{r.sub}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setNotifOpen(o => !o)} style={{ width: 28, height: 28, borderRadius: 4, border: `1px solid ${T.bd}`, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                <span style={{ fontSize: 13 }}>🔔</span>
                {unread > 0 && <div style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: '50%', background: T.rd, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>{unread}</div>}
              </div>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 32, right: 0, width: 300, background: T.sf, border: `1px solid ${T.bd}`, borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 500 }}>
                  <div style={{ padding: '10px 13px', borderBottom: `1px solid ${T.bd}`, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: T.t2 }}>Notifications</span>
                    <button onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))} style={{ fontSize: 11, background: 'none', border: 'none', color: T.t3, cursor: 'pointer', fontFamily: mo }}>Mark all read</button>
                  </div>
                  {notifs.map(n => (
                    <div key={n.id} onClick={() => { setMod(n.action); setNotifOpen(false); setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x)); }} style={{ padding: '9px 13px', borderBottom: `1px solid ${T.bg}`, cursor: 'pointer', background: n.read ? 'transparent' : T.al, display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 12, flexShrink: 0 }}>{n.type === 'warning' ? '⚠' : n.type === 'alert' ? '🔴' : 'ℹ'}</span>
                      <div><div style={{ fontSize: 12, color: T.tx }}>{n.title}</div><div style={{ fontSize: 11, color: T.t3, fontFamily: mo }}>{n.desc}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div onClick={() => setInvModal(true)} style={{ padding: '4px 9px', background: T.bg, border: `1px solid ${T.bd}`, borderRadius: 4, cursor: 'pointer', fontSize: 11, color: T.t2, fontFamily: mo }}>+ Invoice</div>
            <div onClick={() => { const d = !dark; setDark(d); DB.set('dark', d); }} style={{ width: 26, height: 26, borderRadius: 4, border: `1px solid ${T.bd}`, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 12 }}>{dark ? '☀' : '🌙'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: T.gl, border: `1px solid ${T.gn}44`, borderRadius: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.gn }} />
              <span style={{ fontSize: 10, color: T.gn, fontFamily: mo }}>OFFLINE</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 22 }}>
            {mod==="dashboard"&&(
              <div>
                <div style={{marginBottom:18}}><h2 style={{fontSize:19,fontWeight:400,letterSpacing:-0.3,marginBottom:2}}>Good morning, {(firm.companyName||"").split(" ")[0]||"there"}</h2><p style={{color:T.t3,fontSize:11,fontFamily:mo}}>{firm.category||"Manufacturing"} · {firm.state||"India"} · May 2026</p></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:16}}>
                  <KPI label="Revenue (May)" value={fmtK(totRev)} sub="+12% vs April" ac={T.bl}/>
                  <KPI label="Net Profit" value={fmtK(netPft)} sub={`${Math.round(totRev>0?(netPft/totRev*100):0)}% margin`} ac={T.gn}/>
                  <KPI label="GST Payable" value={fmtK(netGST)} sub="Due 20 Jun 2026" ac={T.am}/>
                  <KPI label="Overdue" value={fmtK(overdue)} sub="Action needed" ac={T.rd}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:16}}>
                  {[{l:"Revenue Trend",vals:[42,51,48,61,58,84,92,100],c:T.bl},{l:"Expenses",vals:[18,21,19,24,22,26,31,30],c:T.rd},{l:"GST Liability",vals:[9,10,10,12,12,13,17,20],c:T.am},{l:"Deals Won",vals:[1,2,1,3,2,2,3,4],c:T.gn}].map((ch,ci)=>{const max=Math.max(...ch.vals),min=Math.min(...ch.vals),h=38,pts=ch.vals.map((v,i)=>`${(i/(ch.vals.length-1))*100},${h-((v-min)/(max-min||1))*h}`).join(" ");return(
                    <div key={ci} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"11px 13px"}}>
                      <div style={{fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:5}}>{ch.l.toUpperCase()}</div>
                      <svg viewBox={`0 0 100 ${h}`} style={{width:"100%",height:h,display:"block"}}>
                        <polyline points={pts} fill="none" stroke={ch.c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points={`0,${h} ${pts} 100,${h}`} fill={ch.c} fillOpacity="0.08" stroke="none"/>
                      </svg>
                    </div>
                  );})}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:13}}>
                  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6}}>
                    <div style={{padding:"11px 16px",borderBottom:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.t2,fontFamily:mo}}>Recent Transactions</span><button onClick={()=>setMod("accounting")} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:11,fontFamily:mo}}>All →</button></div>
                    {txns.slice(0,5).map(t=>(
                      <div key={t.id} style={{padding:"9px 16px",borderBottom:`1px solid ${T.bg}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:t.type==="Sale"?T.gn:T.rd,flexShrink:0}}/>
                          <div><div style={{fontSize:12,color:T.t2}}>{t.party}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>{t.date.slice(5)} · {t.category}</div></div>
                        </div>
                        <div style={{textAlign:"right"}}><div style={{fontSize:12,color:t.type==="Sale"?T.gn:T.rd}}>{t.type==="Sale"?"+":"-"}{fmt(t.amount)}</div><Bdg l={t.status.toUpperCase()} col={t.status==="paid"?"green":t.status==="overdue"?"red":"amber"}/></div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:11}}>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"14px 16px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:10}}>COMPLIANCE ALERTS</div>
                      {COMPLIANCE.slice(0,4).map(c=>(
                        <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div><div style={{fontSize:12,color:T.t2}}>{c.title}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>{c.due}</div></div>
                          <Bdg l={c.status} col={c.status==="Due Soon"?"red":c.status==="Pending"?"amber":"neutral"}/>
                        </div>
                      ))}
                    </div>
                    {lowStock.length>0&&(
                      <div style={{background:T.rl,border:`1px solid ${T.rd}44`,borderRadius:6,padding:"12px 14px"}}>
                        <div style={{fontSize:11,color:T.rd,marginBottom:5}}>⚠ {lowStock.length} items below reorder</div>
                        {lowStock.map(i=><div key={i.id} style={{fontSize:11,color:T.t3,fontFamily:mo}}>{i.name}: {i.qty} left</div>)}
                        <button onClick={()=>setMod("inventory")} style={{marginTop:7,fontSize:11,padding:"3px 9px",background:"transparent",border:`1px solid ${T.rd}`,borderRadius:3,color:T.rd,cursor:"pointer",fontFamily:mo}}>View →</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {mod==="accounting"&&(
              <div>
                <SHdr title="Accounting Ledger" sub={`${txns.length} entries · May 2026`} action={<BtnP onClick={()=>setModal("txn")}>+ New Entry</BtnP>}/>
                <Tabs tabs={[{id:"ledger",label:"Ledger"},{id:"summary",label:"P&L Summary"},{id:"gst",label:"GST Draft"},{id:"hsn",label:"HSN Lookup"}]} active={ftab} onChange={setFtab}/>
                {ftab==="ledger"&&(
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:13}}>
                      <KPI label="Total Sales" value={fmt(totRev)} sub={`${sales.length} invoices`} ac={T.gn}/><KPI label="Total Outgoings" value={fmt(totPur+totExp)} sub="" ac={T.rd}/><KPI label="Net" value={fmt(netPft)} sub={`${Math.round(totRev>0?(netPft/totRev*100):0)}% margin`} ac={T.bl}/>
                    </div>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                      <div style={{display:"grid",gridTemplateColumns:"90px 1fr 85px 110px 90px 70px 80px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>DATE</span><span>PARTY</span><span>TYPE</span><span>AMOUNT</span><span>GST</span><span>STATUS</span><span>ACTIONS</span></div>
                      {txns.map(t=>(
                        <div key={t.id} style={{display:"grid",gridTemplateColumns:"90px 1fr 85px 110px 90px 70px 80px",padding:"10px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}>
                          <span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{t.date.slice(5)}</span>
                          <div><div style={{fontSize:12,color:T.t2}}>{t.party}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>{t.category}</div></div>
                          <Bdg l={t.type} col={t.type==="Sale"?"green":"neutral"}/>
                          <span style={{fontSize:12,color:t.type==="Sale"?T.gn:T.rd}}>{t.type==="Sale"?"+":"-"}{fmt(t.amount)}</span>
                          <span style={{fontSize:12,color:T.t2}}>{t.gst>0?fmt(t.gst):"—"}</span>
                          <Bdg l={t.status.toUpperCase()} col={t.status==="paid"?"green":t.status==="overdue"?"red":"amber"}/>
                          <div style={{display:"flex",gap:3}}>
                            <button onClick={()=>setEditMod({type:"txn",data:{...t}})} style={{fontSize:9,padding:"2px 5px",background:"transparent",border:`1px solid ${T.bd}`,borderRadius:2,color:T.t3,cursor:"pointer",fontFamily:mo}}>Edit</button>
                            <button onClick={()=>{if(window.confirm("Delete?")){setTxns(p=>p.filter(x=>x.id!==t.id));log("DELETE","Accounting",t.party);}}} style={{fontSize:9,padding:"2px 5px",background:"transparent",border:`1px solid ${T.rd}44`,borderRadius:2,color:T.rd,cursor:"pointer",fontFamily:mo}}>Del</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {ftab==="summary"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
                    {[{title:"P&L · May 2026",rows:[{l:"Revenue",v:fmt(totRev),c:T.gn},{l:"Purchases",v:"-"+fmt(totPur),c:T.rd},{l:"Expenses",v:"-"+fmt(totExp),c:T.rd},{l:"Net Profit",v:fmt(netPft),c:T.bl,hi:true},{l:"Margin",v:`${Math.round(totRev>0?(netPft/totRev*100):0)}%`,c:T.t2}]},{title:"GST · May 2026",rows:[{l:"Output GST",v:fmt(outGST),c:T.gn},{l:"Input Tax Credit",v:"-"+fmt(inGST),c:T.rd},{l:"Net Payable",v:fmt(netGST),c:T.bl,hi:true},{l:"GSTR-3B Due",v:"20 Jun 2026",c:T.t3}]}].map((s,i)=>(
                      <div key={i} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                        <div style={{padding:"10px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:11,color:T.t2,fontFamily:mo}}>{s.title}</div>
                        {s.rows.map((r,j)=><div key={j} style={{padding:"10px 16px",borderBottom:`1px solid ${T.bg}`,display:"flex",justifyContent:"space-between",background:r.hi?T.bll:"transparent"}}><span style={{fontSize:12,color:T.t2}}>{r.l}</span><span style={{fontSize:13,color:r.c,fontWeight:r.hi?600:400}}>{r.v}</span></div>)}
                      </div>
                    ))}
                    <div style={{gridColumn:"span 2",padding:"10px 14px",background:T.al,border:`1px solid #FCD34D`,borderRadius:6,fontSize:12,color:T.ac,fontFamily:mo}}>§ Advisory only. Verify with your CA before filing.</div>
                  </div>
                )}
                {ftab==="gst"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:11}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                      <KPI label="Output GST" value={fmt(outGST)} sub="From sales" ac={T.gn}/><KPI label="Input Credit" value={fmt(inGST)} sub="From purchases" ac={T.bl}/><KPI label="Net Payable" value={fmt(netGST)} sub="Due 20 Jun" ac={T.am}/>
                    </div>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                      <div style={{padding:"10px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:11,color:T.t2,fontFamily:mo}}>GSTR-3B Draft · May 2026</div>
                      {[{l:"3.1 Taxable outward supplies",v:fmt(totRev)},{l:"3.1(a) CGST Output",v:fmt(outGST/2)},{l:"3.1(a) SGST Output",v:fmt(outGST/2)},{l:"4 Eligible ITC — CGST",v:fmt(inGST/2)},{l:"4 Eligible ITC — SGST",v:fmt(inGST/2)},{l:"6.1 Net CGST Payable",v:fmt((outGST-inGST)/2),hi:true},{l:"6.1 Net SGST Payable",v:fmt((outGST-inGST)/2),hi:true}].map((r,i)=>(
                        <div key={i} style={{padding:"9px 16px",borderBottom:`1px solid ${T.bg}`,display:"flex",justifyContent:"space-between",background:r.hi?T.al:"transparent"}}><span style={{fontSize:12,color:T.t2}}>{r.l}</span><span style={{fontSize:12,color:r.hi?T.ac:T.t2,fontWeight:r.hi?600:400}}>{r.v}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                {ftab==="hsn"&&(
                  <div>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:9}}>HSN CODE LOOKUP — INDIA GST</div>
                      <input value={hsnQ} onChange={e=>{setHsnQ(e.target.value);const q=e.target.value.toLowerCase();setHsnRes(HSN_DATA.filter(h=>h.code.includes(q)||h.desc.toLowerCase().includes(q)).slice(0,6));}} placeholder="Search by code or description e.g. 7208 or steel" style={{width:"100%",padding:"8px 11px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:4,color:T.tx,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:f,marginBottom:11}}/>
                      {hsnRes.length>0&&(
                        <div style={{background:T.bg,border:`1px solid ${T.bd}`,borderRadius:5,overflow:"hidden"}}>
                          <div style={{display:"grid",gridTemplateColumns:"80px 1fr 80px",padding:"7px 13px",fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo,borderBottom:`1px solid ${T.bd}`}}><span>HSN</span><span>DESCRIPTION</span><span>GST%</span></div>
                          {hsnRes.map((h,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"80px 1fr 80px",padding:"9px 13px",borderBottom:`1px solid ${T.sf}`,alignItems:"center"}}><span style={{fontSize:13,color:T.bl,fontFamily:mo,fontWeight:600}}>{h.code}</span><span style={{fontSize:12,color:T.t2}}>{h.desc}</span><Bdg l={h.gst+"%"} col={h.gst===0?"green":h.gst<=5?"blue":"amber"}/></div>)}
                        </div>
                      )}
                      {hsnQ&&hsnRes.length===0&&<div style={{color:T.t3,fontSize:12,fontFamily:mo}}>No results for "{hsnQ}"</div>}
                    </div>
                  </div>
                )}
              </div>
            )}
            {mod==="taxation"&&(
              <div>
                <SHdr title="Taxation & GST" sub="India · Manufacturing · Advisory only — verify with CA"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
                  {[{title:"GSTR-3B",period:"May 2026",due:"20 Jun 2026",status:"Pending",v:fmt(netGST),col:"amber"},{title:"GSTR-1",period:"May 2026",due:"11 Jun 2026",status:"Pending",v:"Outward supplies",col:"amber"},{title:"TDS Return",period:"Q4 FY26",due:"31 May 2026",status:"Due Soon",v:fmt(23400),col:"red"},{title:"Advance Tax Q1",period:"Q1 FY27",due:"15 Jun 2026",status:"Upcoming",v:"₹45,000 est.",col:"neutral"},{title:"PF Challan",period:"May 2026",due:"15 Jun 2026",status:"Upcoming",v:fmt(totPF),col:"neutral"},{title:"ESIC Challan",period:"May 2026",due:"15 Jun 2026",status:"Upcoming",v:fmt(totESIC),col:"neutral"}].map((x,i)=>(
                    <div key={i} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"14px 16px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:13,color:T.tx}}>{x.title}</span><Bdg l={x.status} col={x.col}/></div>
                      <div style={{fontSize:11,color:T.t3,fontFamily:mo,marginBottom:1}}>Period: {x.period} · Due: {x.due}</div>
                      <div style={{fontSize:17,color:T.tx,marginTop:9,fontFamily:f}}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mod==="cashflow"&&(
              <div>
                <SHdr title="Cash Flow" sub="Real-time from your ledger · May 2026"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11,marginBottom:16}}>
                  <KPI label="Inflows" value={fmt(totRev)} sub="From sales" ac={T.gn}/><KPI label="Outflows" value={fmt(totPur+totExp)} sub="Purchases + expenses" ac={T.rd}/><KPI label="Net Cash" value={fmt(netPft)} sub="This month" ac={T.bl}/>
                </div>
                <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                  <div style={{padding:"10px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:11,color:T.t2,fontFamily:mo}}>Cash Flow Statement · May 2026</div>
                  {[{l:"Opening Balance",v:"₹8,20,000",c:T.t2},{l:"+ Sales Collections",v:fmt(totRev),c:T.gn},{l:"− Supplier Payments",v:"-"+fmt(totPur),c:T.rd},{l:"− Operating Expenses",v:"-"+fmt(totExp),c:T.rd},{l:"− GST Payable (est.)",v:"-"+fmt(netGST),c:T.rd},{l:"= Closing Balance",v:fmt(820000+netPft-netGST),c:T.bl,hi:true}].map((r,i)=>(
                    <div key={i} style={{padding:"11px 16px",borderBottom:`1px solid ${T.bg}`,display:"flex",justifyContent:"space-between",background:r.hi?T.bll:"transparent"}}><span style={{fontSize:12,color:T.t2}}>{r.l}</span><span style={{fontSize:13,color:r.c,fontWeight:r.hi?600:400}}>{r.v}</span></div>
                  ))}
                </div>
              </div>
            )}
            {mod==="banking"&&(
              <div>
                <SHdr title="Banking & Reconciliation" sub="Track accounts · Import CSV · Reconcile"/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11,marginBottom:14}}>
                  <KPI label="HDFC Current" value="₹12,84,320" sub="31 May 2026" ac={T.bl}/><KPI label="SBI OD Account" value="₹3,20,000" sub="6.4% of limit used" ac={T.gn}/><KPI label="Unreconciled" value="3 entries" sub="Need matching" ac={T.rd}/>
                </div>
                <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden",marginBottom:13}}>
                  <div style={{padding:"10px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:11,color:T.t2,fontFamily:mo}}>HDFC Current · May 2026</div>
                  <div style={{display:"grid",gridTemplateColumns:"70px 1fr 100px 100px 90px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>DATE</span><span>DESCRIPTION</span><span>CREDIT</span><span>DEBIT</span><span>STATUS</span></div>
                  {[{d:"28 May",desc:"NEFT — Anand Exports",cr:580000,db:0,st:"Matched"},{d:"27 May",desc:"RTGS — Ramesh Steel",cr:0,db:245000,st:"Matched"},{d:"25 May",desc:"NEFT — Kumar Logistics",cr:0,db:32000,st:"Matched"},{d:"24 May",desc:"ATM WDL — Petty Cash",cr:0,db:15000,st:"Unmatched"},{d:"22 May",desc:"NEFT — Global Trade",cr:920000,db:0,st:"Matched"}].map((r,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr 100px 100px 90px",padding:"9px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}>
                      <span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{r.d}</span><span style={{fontSize:12,color:T.t2}}>{r.desc}</span>
                      <span style={{fontSize:12,color:r.cr>0?T.gn:T.t3}}>{r.cr>0?fmt(r.cr):"—"}</span><span style={{fontSize:12,color:r.db>0?T.rd:T.t3}}>{r.db>0?fmt(r.db):"—"}</span>
                      <Bdg l={r.st} col={r.st==="Matched"?"green":"red"}/>
                    </div>
                  ))}
                </div>
                <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"14px 16px"}}>
                  <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:8}}>IMPORT BANK CSV</div>
                  <p style={{fontSize:12,color:T.t3,fontFamily:mo,marginBottom:8,lineHeight:1.6}}>Format: Date, Description, Credit, Debit, Balance</p>
                  <textarea placeholder={"Date,Description,Credit,Debit,Balance\n28/05/2026,NEFT-Anand Exports,580000,,1284320"} style={{width:"100%",height:70,padding:"8px 10px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:4,color:T.tx,fontSize:11,outline:"none",fontFamily:mo,boxSizing:"border-box",resize:"vertical",marginBottom:8}}/>
                  <BtnP onClick={()=>{}}>Parse & Import</BtnP>
                </div>
              </div>
            )}
            {mod==="hr"&&(
              <div>
                <SHdr title="HR & Payroll" sub={`${emps.length} employees · PF · ESIC · PT · TDS`} action={<BtnP onClick={()=>setModal("emp")}>+ Add Employee</BtnP>}/>
                <Tabs tabs={[{id:"employees",label:"Employees"},{id:"payroll",label:"Payroll"},{id:"compliance",label:"Statutory"}]} active={htab} onChange={setHtab}/>
                {htab==="employees"&&(
                  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 130px 100px 100px 90px 140px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>EMPLOYEE</span><span>DESIGNATION</span><span>GROSS</span><span>NET PAY</span><span>CTC</span><span>ACTIONS</span></div>
                    {payData.map(e=>(
                      <div key={e.id} style={{display:"grid",gridTemplateColumns:"1fr 130px 100px 100px 90px 140px",padding:"11px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}>
                        <div><div style={{fontSize:12,color:T.t2}}>{e.name}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>{e.dept} · {e.doj}</div></div>
                        <span style={{fontSize:11,color:T.t2}}>{e.designation}</span>
                        <span style={{fontSize:12,color:T.bl}}>{fmt(e.c.g)}</span>
                        <span style={{fontSize:12,color:T.gn}}>{fmt(e.c.net)}</span>
                        <span style={{fontSize:12,color:T.t2}}>{fmt(e.c.ctc)}</span>
                        <div style={{display:"flex",gap:3}}>
                          <button onClick={()=>downloadPayslip(e)} style={{fontSize:9,padding:"2px 5px",background:"transparent",border:`1px solid ${T.bd}`,borderRadius:2,color:T.t3,cursor:"pointer",fontFamily:mo}}>Payslip</button>
                          <button onClick={()=>setEditMod({type:"emp",data:{...e}})} style={{fontSize:9,padding:"2px 5px",background:"transparent",border:`1px solid ${T.bd}`,borderRadius:2,color:T.t3,cursor:"pointer",fontFamily:mo}}>Edit</button>
                          <button onClick={()=>{if(window.confirm("Remove?"))setEmps(p=>p.filter(x=>x.id!==e.id));}} style={{fontSize:9,padding:"2px 5px",background:"transparent",border:`1px solid ${T.rd}44`,borderRadius:2,color:T.rd,cursor:"pointer",fontFamily:mo}}>Del</button>
                        </div>
                      </div>
                    ))}
                    <div style={{padding:"9px 16px",background:T.bg,display:"grid",gridTemplateColumns:"1fr 130px 100px 100px 90px 140px",borderTop:`1px solid ${T.bd}`}}>
                      <span style={{fontSize:11,color:T.t3,fontFamily:mo}}>TOTALS</span><span/><span style={{fontSize:12,color:T.bl,fontWeight:600}}>{fmt(payData.reduce((a,e)=>a+e.c.g,0))}</span><span style={{fontSize:12,color:T.gn,fontWeight:600}}>{fmt(totNet)}</span><span style={{fontSize:12,color:T.t2,fontWeight:600}}>{fmt(totCTC)}</span>
                    </div>
                  </div>
                )}
                {htab==="payroll"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:11}}>
                    {payData.map(e=>(
                      <div key={e.id} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><div><div style={{fontSize:13,color:T.tx}}>{e.name}</div><div style={{fontSize:11,color:T.t3,fontFamily:mo}}>{e.designation} · {e.dept}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:18,color:T.gn}}>{fmt(e.c.net)}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>Take-home</div></div></div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
                          {[{l:"Basic",v:fmt(e.basic)},{l:"HRA",v:fmt(e.hra)},{l:"Special",v:fmt(e.special)},{l:"Gross",v:fmt(e.c.g)},{l:"PF Emp.",v:fmt(e.c.pE)},{l:"PF Empr.",v:fmt(e.c.pR)},{l:"ESIC Emp.",v:fmt(e.c.eE)},{l:"ESIC Empr.",v:fmt(e.c.eR)},{l:"Prof.Tax",v:fmt(e.c.pt)},{l:"TDS",v:fmt(e.c.tds)},{l:"Deductions",v:fmt(e.c.ded)},{l:"CTC/Mo",v:fmt(e.c.ctc)}].map((x,i)=>(
                            <div key={i} style={{padding:"8px 9px",background:T.bg,borderRadius:4}}><div style={{fontSize:9,color:T.t3,letterSpacing:1,fontFamily:mo,marginBottom:3}}>{x.l.toUpperCase()}</div><div style={{fontSize:12,color:T.t2}}>{x.v}</div></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {htab==="compliance"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                    {[{title:"PF Summary",rows:[{l:"Employee (12%)",v:fmt(payData.reduce((a,e)=>a+e.c.pE,0))},{l:"Employer (12%)",v:fmt(payData.reduce((a,e)=>a+e.c.pR,0))},{l:"Total ECR",v:fmt(totPF),hi:true},{l:"Deadline",v:"15 Jun 2026"}]},{title:"ESIC Summary",rows:[{l:"Employee (0.75%)",v:fmt(payData.reduce((a,e)=>a+e.c.eE,0))},{l:"Employer (3.25%)",v:fmt(payData.reduce((a,e)=>a+e.c.eR,0))},{l:"Total ESIC",v:fmt(totESIC),hi:true},{l:"Deadline",v:"15 Jun 2026"}]},{title:"Prof. Tax (MH)",rows:[{l:"PT Collected",v:fmt(payData.reduce((a,e)=>a+e.c.pt,0)),hi:true},{l:"Deadline",v:"Last day of month"}]},{title:"TDS Sec 192",rows:[{l:"TDS Deducted",v:fmt(payData.reduce((a,e)=>a+e.c.tds,0)),hi:true},{l:"Deposit Deadline",v:"7 Jun 2026"},{l:"Form 24Q",v:"Due 31 Jul 2026"}]}].map((s,i)=>(
                      <div key={i} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                        <div style={{padding:"10px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:11,color:T.t2,fontFamily:mo}}>{s.title}</div>
                        {s.rows.map((r,j)=><div key={j} style={{padding:"10px 16px",borderBottom:`1px solid ${T.bg}`,display:"flex",justifyContent:"space-between",background:r.hi?T.al:"transparent"}}><span style={{fontSize:12,color:T.t2}}>{r.l}</span><span style={{fontSize:12,color:r.hi?T.ac:T.t2,fontWeight:r.hi?600:400}}>{r.v}</span></div>)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {mod==="attendance"&&(
              <div>
                <SHdr title="Attendance" sub="May 2026 · 24 working days"/>
                <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px 80px 100px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>EMPLOYEE</span><span>PRESENT</span><span>ABSENT</span><span>LATE</span><span>LEAVES</span><span>ATTENDANCE</span></div>
                  {[{n:"Rajesh Kumar",p:22,a:2,l:1,lv:0},{n:"Priya Sharma",p:23,a:1,l:0,lv:0},{n:"Amit Singh",p:20,a:3,l:2,lv:1},{n:"Sunita Patel",p:21,a:2,l:1,lv:1},{n:"Vikram Mehta",p:24,a:0,l:0,lv:0}].map((a,i)=>{const pct=Math.round((a.p/24)*100);return(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px 80px 80px 100px",padding:"11px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}>
                      <span style={{fontSize:12,color:T.t2}}>{a.n}</span><span style={{fontSize:13,color:T.gn}}>{a.p}</span><span style={{fontSize:13,color:a.a>2?T.rd:T.t2}}>{a.a}</span><span style={{fontSize:13,color:a.l>1?T.am:T.t2}}>{a.l}</span><span style={{fontSize:13,color:T.t2}}>{a.lv}</span>
                      <div><div style={{fontSize:12,color:pct>=90?T.gn:pct>=75?T.am:T.rd,marginBottom:2}}>{pct}%</div><div style={{width:"100%",height:3,background:T.bd,borderRadius:2}}><div style={{width:`${pct}%`,height:"100%",background:pct>=90?T.gn:pct>=75?T.am:T.rd,borderRadius:2}}/></div></div>
                    </div>
                  );})}
                </div>
              </div>
            )}
            {mod==="recruitment"&&(
              <div>
                <SHdr title="Recruitment" sub="Open positions · Candidate pipeline" action={<BtnP onClick={()=>{}}>+ Open Position</BtnP>}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:14}}>
                  <KPI label="Open Positions" value="4" sub="Actively hiring" ac={T.bl}/><KPI label="In Pipeline" value="18" sub="Across all roles" ac={T.am}/><KPI label="Interviews" value="6" sub="This week" ac={T.gn}/><KPI label="Offers Sent" value="2" sub="Awaiting" ac={T.sl}/>
                </div>
                <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 100px 80px 90px 100px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>ROLE</span><span>DEPT</span><span>OPENINGS</span><span>APPLICANTS</span><span>STATUS</span></div>
                  {[{r:"Senior Welder",d:"Operations",o:2,a:8,s:"Interviewing"},{r:"Quality Inspector",d:"Operations",o:1,a:5,s:"Interviewing"},{r:"Accounts Executive",d:"Finance",o:1,a:12,s:"Screening"},{r:"Sales Manager — North",d:"Sales",o:1,a:6,s:"Sourcing"}].map((p,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 100px 80px 90px 100px",padding:"11px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}>
                      <span style={{fontSize:12,color:T.t2}}>{p.r}</span><span style={{fontSize:11,color:T.t3}}>{p.d}</span><span style={{fontSize:12,color:T.bl,textAlign:"center"}}>×{p.o}</span><span style={{fontSize:12,color:T.t2,textAlign:"center"}}>{p.a}</span>
                      <Bdg l={p.s} col={p.s==="Interviewing"?"blue":p.s==="Screening"?"amber":"neutral"}/>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mod==="inventory"&&(
              <div>
                <SHdr title="Inventory" sub={`${inv.length} SKUs · ${lowStock.length} below reorder`} action={<BtnP onClick={()=>setModal("inv")}>+ Add Item</BtnP>}/>
                <Tabs tabs={[{id:"stock",label:"Stock"},{id:"alerts",label:`Alerts (${lowStock.length})`},{id:"valuation",label:"Valuation"},{id:"log",label:"Adj Log"}]} active={itab} onChange={setItab}/>
                {itab==="stock"&&(
                  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                    <div style={{display:"grid",gridTemplateColumns:"70px 1fr 110px 65px 60px 95px 70px 75px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>SKU</span><span>ITEM</span><span>CATEGORY</span><span>QTY</span><span>UNIT</span><span>COST/UNIT</span><span>STATUS</span><span>ACTIONS</span></div>
                    {inv.map(item=>{const low=item.qty<=item.reorderAt;return(
                      <div key={item.id} style={{display:"grid",gridTemplateColumns:"70px 1fr 110px 65px 60px 95px 70px 75px",padding:"10px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center",background:low?T.rl:"transparent"}}>
                        <span style={{fontSize:10,color:T.t3,fontFamily:mo}}>{item.sku}</span>
                        <div><div style={{fontSize:12,color:T.t2}}>{item.name}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>{item.supplier}</div></div>
                        <span style={{fontSize:11,color:T.t2}}>{item.category}</span>
                        <span style={{fontSize:13,color:low?T.rd:T.tx,fontWeight:low?600:400}}>{item.qty}</span>
                        <span style={{fontSize:11,color:T.t3}}>{item.unit}</span>
                        <span style={{fontSize:12,color:T.t2}}>₹{item.costPrice.toLocaleString("en-IN")}</span>
                        <Bdg l={low?"REORDER":"OK"} col={low?"red":"green"}/>
                        <div style={{display:"flex",gap:3}}>
                          <button onClick={()=>{setAdjMod(item);setAdjQty("");setAdjNote("");}} style={{fontSize:9,padding:"2px 5px",background:"transparent",border:`1px solid ${T.bd}`,borderRadius:2,color:T.t3,cursor:"pointer",fontFamily:mo}}>Adj</button>
                          <button onClick={()=>{if(window.confirm("Remove?"))setInv(p=>p.filter(i=>i.id!==item.id));}} style={{fontSize:9,padding:"2px 5px",background:"transparent",border:`1px solid ${T.rd}44`,borderRadius:2,color:T.rd,cursor:"pointer",fontFamily:mo}}>Del</button>
                        </div>
                      </div>
                    );})}
                  </div>
                )}
                {itab==="alerts"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    {lowStock.length===0?<div style={{textAlign:"center",padding:40,color:T.t3,fontFamily:mo}}>✓ All items above reorder level</div>:lowStock.map(item=>(
                      <div key={item.id} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:`3px solid ${T.rd}`}}>
                        <div><div style={{fontSize:13,color:T.rd,marginBottom:3}}>{item.name}</div><div style={{fontSize:11,color:T.t3,fontFamily:mo}}>SKU: {item.sku} · Current: {item.qty} {item.unit} · Reorder at: {item.reorderAt}</div></div>
                        <div style={{textAlign:"right"}}><div style={{fontSize:20,color:T.rd}}>{item.qty}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>left</div></div>
                      </div>
                    ))}
                  </div>
                )}
                {itab==="valuation"&&(
                  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                    <div style={{padding:"11px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.t2,fontFamily:mo}}>Total Value</span><span style={{fontSize:14,color:T.tx,fontWeight:600}}>{fmt(inv.reduce((a,i)=>a+i.qty*i.costPrice,0))}</span></div>
                    {["Raw Material","Finished Goods","Packaging"].map(cat=>{const items=inv.filter(i=>i.category===cat);if(!items.length)return null;return(<div key={cat} style={{padding:"11px 16px",borderBottom:`1px solid ${T.bg}`,display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:12,color:T.t2}}>{cat}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>{items.length} SKUs</div></div><span style={{fontSize:13,color:T.bl}}>{fmt(items.reduce((a,i)=>a+i.qty*i.costPrice,0))}</span></div>);})}
                  </div>
                )}
                {itab==="log"&&(
                  stockLog.length===0?<div style={{textAlign:"center",padding:40,color:T.t3,fontFamily:mo}}>No adjustments yet. Use Adj button on any item.</div>:(
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                      <div style={{display:"grid",gridTemplateColumns:"100px 70px 1fr 60px 65px 1fr",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>DATE</span><span>SKU</span><span>ITEM</span><span>BEFORE</span><span>CHANGE</span><span>NOTE</span></div>
                      {stockLog.map((l,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"100px 70px 1fr 60px 65px 1fr",padding:"9px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}><span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{l.date}</span><span style={{fontSize:10,color:T.t3,fontFamily:mo}}>{l.sku}</span><span style={{fontSize:12,color:T.t2}}>{l.name}</span><span style={{fontSize:12,color:T.t3}}>{l.before}</span><span style={{fontSize:12,color:l.adj>0?T.gn:T.rd,fontWeight:600}}>{l.adj>0?"+":""}{l.adj}</span><span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{l.note}</span></div>)}
                    </div>
                  )
                )}
              </div>
            )}
            {mod==="vendors"&&(
              <div>
                <SHdr title="Vendors" sub={`${vendors.length} active · Outstanding: ${fmt(vendors.reduce((a,v)=>a+v.outstanding,0))}`} action={<BtnP onClick={()=>setModal("vendor")}>+ Add Vendor</BtnP>}/>
                <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 140px 110px 110px 90px 55px 90px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>VENDOR</span><span>GSTIN</span><span>CATEGORY</span><span>OUTSTANDING</span><span>LAST ORDER</span><span>★</span><span>ACTIONS</span></div>
                  {vendors.map(v=>(
                    <div key={v.id} style={{display:"grid",gridTemplateColumns:"1fr 140px 110px 110px 90px 55px 90px",padding:"11px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}>
                      <div><div style={{fontSize:12,color:T.t2}}>{v.name}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>{v.city} · {v.contact}</div></div>
                      <span style={{fontSize:10,color:T.t3,fontFamily:mo}}>{v.gstin}</span>
                      <span style={{fontSize:11,color:T.t2}}>{v.category}</span>
                      <span style={{fontSize:12,color:v.outstanding>0?T.rd:T.gn,fontWeight:v.outstanding>0?600:400}}>{v.outstanding>0?fmt(v.outstanding):"Nil"}</span>
                      <span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{v.lastOrder}</span>
                      <span style={{fontSize:12,color:T.am}}>{"★".repeat(v.rating)}</span>
                      <div style={{display:"flex",gap:3}}>
                        {v.outstanding>0&&<button onClick={()=>{setVPayMod(v);setVPayAmt(String(v.outstanding));}} style={{fontSize:9,padding:"2px 5px",background:T.gl,border:`1px solid ${T.gn}44`,borderRadius:2,color:T.gn,cursor:"pointer",fontFamily:mo}}>Pay</button>}
                        <button onClick={()=>setEditMod({type:"vendor",data:{...v}})} style={{fontSize:9,padding:"2px 5px",background:"transparent",border:`1px solid ${T.bd}`,borderRadius:2,color:T.t3,cursor:"pointer",fontFamily:mo}}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mod==="production"&&(
              <div>
                <SHdr title="Production Planning" sub="Job orders · Material requirements · Output"/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:14}}>
                  <KPI label="Active Orders" value="8" sub="In production" ac={T.bl}/><KPI label="Completed May" value="23" sub="Dispatched" ac={T.gn}/><KPI label="Material Short" value="2 items" sub="Blocking 1 order" ac={T.rd}/><KPI label="Capacity Used" value="78%" sub="Of floor capacity" ac={T.am}/>
                </div>
                <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"80px 1fr 110px 65px 85px 85px 100px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>JOB ID</span><span>PRODUCT</span><span>CUSTOMER</span><span>QTY</span><span>START</span><span>DUE</span><span>STATUS</span></div>
                  {[{id:"JO-2601",p:"Heavy Bracket Assembly",c:"Anand Exports",q:40,s:"2026-05-20",d:"2026-06-05",st:"In Progress",pct:65},{id:"JO-2602",p:"Conveyor Frame Unit",c:"Global Trade",q:8,s:"2026-05-22",d:"2026-06-10",st:"In Progress",pct:40},{id:"JO-2603",p:"Heavy Bracket Assembly",c:"Apex Industries",q:25,s:"2026-05-25",d:"2026-06-08",st:"Material Wait",pct:15},{id:"JO-2604",p:"Custom Steel Frame",c:"Delta Fabricators",q:12,s:"2026-05-28",d:"2026-06-15",st:"Scheduled",pct:0}].map((j,i)=>(
                    <div key={i}>
                      <div style={{display:"grid",gridTemplateColumns:"80px 1fr 110px 65px 85px 85px 100px",padding:"10px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}>
                        <span style={{fontSize:10,color:T.t3,fontFamily:mo}}>{j.id}</span><span style={{fontSize:12,color:T.t2}}>{j.p}</span><span style={{fontSize:11,color:T.t3}}>{j.c}</span><span style={{fontSize:13}}>{j.q}</span>
                        <span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{j.s.slice(5)}</span><span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{j.d.slice(5)}</span>
                        <Bdg l={j.st} col={j.st==="In Progress"?"blue":j.st==="Material Wait"?"red":"neutral"}/>
                      </div>
                      {j.pct>0&&<div style={{height:3,background:T.bd,margin:"0 16px"}}><div style={{width:`${j.pct}%`,height:"100%",background:j.st==="Material Wait"?T.rd:T.bl}}/></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(mod==="crm"||mod==="leads")&&(
              <div>
                <SHdr title="CRM & Sales Pipeline" sub={`${leads.length} deals · Pipeline: ${fmt(pipeVal)} · Won: ${fmt(wonVal)}`} action={<BtnP onClick={()=>setModal("lead")}>+ Add Deal</BtnP>}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:14}}>
                  <KPI label="Pipeline" value={fmtK(pipeVal)} sub={`${leads.filter(l=>l.stage!=="Closed Won"&&l.stage!=="Closed Lost").length} active`} ac={T.bl}/><KPI label="Closed Won" value={fmtK(wonVal)} sub={`${leads.filter(l=>l.stage==="Closed Won").length} deals`} ac={T.gn}/><KPI label="Negotiation" value={fmtK(leads.filter(l=>l.stage==="Negotiation").reduce((a,l)=>a+l.value,0))} sub="" ac={T.am}/><KPI label="Discovery" value={fmtK(leads.filter(l=>l.stage==="Discovery").reduce((a,l)=>a+l.value,0))} sub="" ac={T.sl}/>
                </div>
                <Tabs tabs={[{id:"pipeline",label:"Pipeline"},{id:"kanban",label:"Kanban"}]} active={ctab} onChange={setCtab}/>
                {ctab==="pipeline"&&(
                  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 130px 110px 90px 110px 80px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>COMPANY</span><span>STAGE</span><span>VALUE</span><span>SOURCE</span><span>LAST TOUCH</span><span>MOVE</span></div>
                    {leads.map(l=>(
                      <div key={l.id} style={{display:"grid",gridTemplateColumns:"1fr 130px 110px 90px 110px 80px",padding:"11px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}>
                        <div><div style={{fontSize:12,color:T.t2}}>{l.company}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>{l.contact}</div></div>
                        <Bdg l={l.stage} col={stageCol(l.stage)}/>
                        <span style={{fontSize:13,color:T.bl}}>{fmt(l.value)}</span>
                        <span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{l.source}</span>
                        <span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{l.lastTouch}</span>
                        {leadStage===l.id?(
                          <select value={l.stage} onChange={e=>{setLeads(p=>p.map(x=>x.id===l.id?{...x,stage:e.target.value}:x));setLeadStage(null);}} autoFocus onBlur={()=>setLeadStage(null)} style={{fontSize:10,padding:"2px 5px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:3,color:T.tx,fontFamily:f}}>
                            {["Discovery","Qualified","Proposal Sent","Negotiation","Closed Won","Closed Lost"].map(s=><option key={s}>{s}</option>)}
                          </select>
                        ):(
                          <button onClick={()=>setLeadStage(l.id)} style={{fontSize:10,padding:"2px 7px",background:"transparent",border:`1px solid ${T.bd}`,borderRadius:3,color:T.t3,cursor:"pointer",fontFamily:mo}}>Move</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {ctab==="kanban"&&(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9}}>
                    {["Discovery","Qualified","Proposal Sent","Negotiation","Closed Won"].map(stage=>(
                      <div key={stage}>
                        <div style={{padding:"6px 10px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:4,marginBottom:8,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.t2}}>{stage}</span><span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{leads.filter(l=>l.stage===stage).length}</span></div>
                        {leads.filter(l=>l.stage===stage).map(l=>(
                          <div key={l.id} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:5,padding:"10px 12px",marginBottom:6}}>
                            <div style={{fontSize:12,color:T.tx,marginBottom:3}}>{l.company}</div>
                            <div style={{fontSize:11,color:T.t3,fontFamily:mo,marginBottom:6}}>{l.contact}</div>
                            <div style={{fontSize:13,color:T.bl}}>{fmt(l.value)}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {mod==="proposals"&&(
              <div>
                <SHdr title="Proposals" sub="Generate from active pipeline deals"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {leads.filter(l=>["Proposal Sent","Negotiation","Qualified"].includes(l.stage)).map(l=>(
                    <div key={l.id} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div><div style={{fontSize:13,color:T.tx}}>{l.company}</div><div style={{fontSize:11,color:T.t3,fontFamily:mo}}>{l.contact} · <Bdg l={l.stage} col={stageCol(l.stage)}/></div></div><div style={{fontSize:16,color:T.bl}}>{fmt(l.value)}</div></div>
                      <div style={{padding:"9px 11px",background:T.bg,borderRadius:4,marginBottom:11}}><div style={{fontSize:9,color:T.t3,fontFamily:mo,letterSpacing:2,marginBottom:3}}>NOTES</div><div style={{fontSize:12,color:T.t2}}>{l.notes}</div></div>
                      <BtnP onClick={()=>{}}>Generate Proposal PDF</BtnP>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mod==="legal"&&(
              <div>
                <SHdr title="Legal & Compliance" sub="India · Manufacturing · Regulatory calendar"/>
                <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden",marginBottom:13}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 120px 110px 90px 80px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>COMPLIANCE ITEM</span><span>AUTHORITY</span><span>DUE DATE</span><span>CATEGORY</span><span>STATUS</span></div>
                  {COMPLIANCE.map(c=>(
                    <div key={c.id} style={{display:"grid",gridTemplateColumns:"1fr 120px 110px 90px 80px",padding:"11px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}><span style={{fontSize:12,color:T.t2}}>{c.title}</span><span style={{fontSize:11,color:T.t3}}>{c.authority}</span><span style={{fontSize:11,color:T.t2,fontFamily:mo}}>{c.due}</span><Bdg l={c.category} col="neutral"/><Bdg l={c.status} col={c.status==="Due Soon"?"red":c.status==="Pending"?"amber":"neutral"}/></div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                  {[{title:"GST Law",body:"GSTR-1 due 11th. GSTR-3B due 20th monthly. Annual GSTR-9 due 31 Dec. E-invoicing mandatory above ₹5Cr. ITC within 180 days."},{title:"Companies Act 2013",body:"MGT-7 within 60 days of AGM. AOC-4 within 30 days. DIR-3 KYC due 30 Sep. Statutory audit mandatory."},{title:"Labour Laws",body:"PF: 12% + 12% (capped ₹15K basic). ESIC: 0.75% + 3.25% (gross ≤₹21K). Gratuity: 15 days/year after 5 years."},{title:"Income Tax",body:"TDS Sec 192 on salaries. Advance tax: Jun 15%, Sep 45%, Dec 75%, Mar 100%. ITR: 31 Jul (non-audit), 31 Oct (audit)."}].map((x,i)=>(
                    <div key={i} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"14px 16px"}}><div style={{fontSize:13,color:T.tx,marginBottom:7,fontWeight:500}}>{x.title}</div><p style={{fontSize:12,color:T.t2,lineHeight:1.7,fontFamily:mo,margin:0}}>{x.body}</p></div>
                  ))}
                </div>
              </div>
            )}
            {mod==="contracts"&&(
              <div>
                <SHdr title="Contracts" sub="Business agreements" action={<BtnP onClick={()=>setModal("contract")}>+ Add</BtnP>}/>
                <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 120px 75px 90px 90px 85px 55px",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>CONTRACT</span><span>PARTY</span><span>TYPE</span><span>START</span><span>END</span><span>VALUE</span><span>RISK</span></div>
                  {[{title:"Supply — Ramesh Steel",party:"Ramesh Steel",type:"Vendor",start:"2026-01-01",end:"2026-12-31",value:2000000,status:"Active",risk:"Low"},{title:"Distribution — Anand",party:"Anand Exports",type:"Customer",start:"2026-03-01",end:"2027-02-28",value:5000000,status:"Active",risk:"Medium"},{title:"Freight SLA — Kumar",party:"Kumar Logistics",type:"Vendor",start:"2026-01-01",end:"2026-06-30",value:380000,status:"Expiring",risk:"Low"},{title:"Office Lease",party:"Sharma Properties",type:"Lease",start:"2024-04-01",end:"2027-03-31",value:540000,status:"Active",risk:"Low"}].map((c,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 120px 75px 90px 90px 85px 55px",padding:"11px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}>
                      <div><div style={{fontSize:12,color:T.t2}}>{c.title}</div><div style={{marginTop:2}}><Bdg l={c.status} col={c.status==="Active"?"green":c.status==="Expiring"?"amber":"neutral"}/></div></div>
                      <span style={{fontSize:11,color:T.t2}}>{c.party}</span><Bdg l={c.type} col="neutral"/>
                      <span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{c.start}</span><span style={{fontSize:11,color:T.t3,fontFamily:mo}}>{c.end}</span>
                      <span style={{fontSize:12,color:T.bl}}>{fmt(c.value)}</span>
                      <Bdg l={c.risk} col={c.risk==="High"?"red":c.risk==="Medium"?"amber":"green"}/>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mod==="audit"&&(
              <div>
                <SHdr title="Audit Trail" sub="Every action logged locally" action={<BtnP onClick={()=>{const text=auditLog.map(a=>`${a.ts.slice(0,16)} [${a.module}] ${a.action}: ${a.detail}`).join("\n");const blob=new Blob([text],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="nexara_audit.txt";a.click();URL.revokeObjectURL(url);}}>↓ Export</BtnP>}/>
                {auditLog.length===0?<div style={{textAlign:"center",padding:40,color:T.t3,fontFamily:mo}}>No actions logged yet.</div>:(
                  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,overflow:"hidden"}}>
                    <div style={{display:"grid",gridTemplateColumns:"150px 80px 80px 1fr",padding:"8px 16px",background:T.bg,borderBottom:`1px solid ${T.bd}`,fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo}}><span>TIMESTAMP</span><span>MODULE</span><span>ACTION</span><span>DETAIL</span></div>
                    {auditLog.map(a=>(
                      <div key={a.id} style={{display:"grid",gridTemplateColumns:"150px 80px 80px 1fr",padding:"9px 16px",borderBottom:`1px solid ${T.bg}`,alignItems:"center"}}>
                        <span style={{fontSize:10,color:T.t3,fontFamily:mo}}>{new Date(a.ts).toLocaleString("en-IN").slice(0,16)}</span>
                        <Bdg l={a.module} col="blue"/><Bdg l={a.action} col="neutral"/>
                        <span style={{fontSize:11,color:T.t2}}>{a.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {mod==="analytics"&&(
              <div>
                <SHdr title="Business Analytics" sub="Derived from your live data"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:13}}>
                  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px"}}>
                    <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:12}}>REVENUE BREAKDOWN</div>
                    {[...new Set(txns.filter(t=>t.type==="Sale").map(t=>t.category))].map((cat,i)=>{const rev=txns.filter(t=>t.type==="Sale"&&t.category===cat).reduce((a,t)=>a+t.amount,0);const pct=Math.round(rev/totRev*100);return(<div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:T.t2}}>{cat}</span><span style={{fontSize:12,color:T.t2}}>{fmt(rev)} ({pct}%)</span></div><div style={{height:5,background:T.bd,borderRadius:3}}><div style={{width:`${pct}%`,height:"100%",background:T.bl,borderRadius:3}}/></div></div>);})}
                  </div>
                  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px"}}>
                    <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:12}}>COST BREAKDOWN</div>
                    {[{l:"Raw Material",v:totPur,c:T.rd},{l:"Freight",v:exps.filter(t=>t.category==="Freight").reduce((a,t)=>a+t.amount,0),c:T.am},{l:"Overhead",v:exps.filter(t=>t.category==="Overhead").reduce((a,t)=>a+t.amount,0),c:T.am},{l:"Utilities",v:exps.filter(t=>t.category==="Utilities").reduce((a,t)=>a+t.amount,0),c:T.am}].map((r,i)=>{const pct=Math.round(r.v/(totPur+totExp||1)*100);return(<div key={i} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:T.t2}}>{r.l}</span><span style={{fontSize:12,color:T.t2}}>{fmt(r.v)}</span></div><div style={{height:4,background:T.bd,borderRadius:3}}><div style={{width:`${pct}%`,height:"100%",background:r.c,borderRadius:3}}/></div></div>);})}
                  </div>
                  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px"}}>
                    <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:12}}>WORKFORCE ANALYSIS</div>
                    {[{l:"Total CTC/Month",v:fmt(totCTC)},{l:"Net Payroll",v:fmt(totNet)},{l:"PF Liability",v:fmt(totPF)},{l:"ESIC Liability",v:fmt(totESIC)},{l:"Revenue per Employee",v:fmt(Math.round(totRev/emps.length))}].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<4?`1px solid ${T.bg}`:"none"}}><span style={{fontSize:12,color:T.t2}}>{r.l}</span><span style={{fontSize:12,color:T.tx}}>{r.v}</span></div>
                    ))}
                  </div>
                  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px"}}>
                    <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:12}}>KEY RATIOS</div>
                    {[{l:"Gross Margin",v:`${Math.round(totRev>0?(netPft/totRev*100):0)}%`},{l:"Receivables Pending",v:fmt(txns.filter(t=>t.status==="pending"||t.status==="overdue").reduce((a,t)=>a+t.amount,0))},{l:"Vendor Payables",v:fmt(vendors.reduce((a,v)=>a+v.outstanding,0))},{l:"Inventory Value",v:fmt(inv.reduce((a,i)=>a+i.qty*i.costPrice,0))},{l:"Pipeline Value",v:fmtK(pipeVal)}].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<4?`1px solid ${T.bg}`:"none"}}><span style={{fontSize:12,color:T.t2}}>{r.l}</span><span style={{fontSize:13,color:T.bl,fontWeight:500}}>{r.v}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {mod==="reports"&&(
              <div>
                <SHdr title="Reports" sub="Generated from live data · CA-ready · Downloadable"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
                  {[{title:"P&L Statement",desc:"Income, expenses, profit",key:"pl",ready:true},{title:"GST Summary",desc:"GSTR-3B draft breakdown",key:"gst",ready:true},{title:"Payroll Register",desc:"Salary register + deductions",key:"payroll",ready:true},{title:"Inventory Valuation",desc:"Stock levels by category",key:"inv_val",ready:true},{title:"Compliance Calendar",desc:"All filing deadlines",key:"compliance",ready:true},{title:"Sales Pipeline",desc:"CRM deals and values",key:"pipeline",ready:true},{title:"Cash Flow",desc:"Monthly cash position",key:"cf",ready:true},{title:"Vendor Outstanding",desc:"Pending payments",key:"vendor",ready:true},{title:"Balance Sheet",desc:"Assets and liabilities",key:"bs",ready:false}].map((r,i)=>(
                    <div key={i} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"14px 16px",opacity:r.ready?1:0.45}}>
                      <div style={{fontSize:13,color:T.tx,marginBottom:4,fontWeight:500}}>{r.title}</div>
                      <div style={{fontSize:11,color:T.t3,fontFamily:mo,marginBottom:11,lineHeight:1.55}}>{r.desc}</div>
                      <div style={{display:"flex",gap:6}}>
                        {r.ready&&<BtnP onClick={()=>downloadReport(r.title,r.key)}>↓ Download</BtnP>}
                        {!r.ready&&<BtnP onClick={()=>{}} disabled>Coming Soon</BtnP>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mod==="comms"&&(
              <div>
                <SHdr title="Communications" sub="AI-drafted using your live firm data"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[{title:"Payment Reminder",icon:"₹",to:"Global Trade Co.",ctx:`Draft a firm but professional payment reminder for an overdue invoice of ${fmt(920000)} from Global Trade Co. on behalf of ${firm.companyName||"the company"}.`},{title:"Vendor Negotiation",icon:"⊗",to:"Ramesh Steel",ctx:`Draft a letter from ${firm.companyName||"the company"} to Ramesh Steel requesting 5% price reduction on Steel Rods given 450kg monthly volume.`},{title:"Purchase Order",icon:"▦",to:"Mehta Components",ctx:`Draft a purchase order from ${firm.companyName||"the company"} to Mehta Components for 200 units of Industrial Bolts M10 at ₹4.50 each, delivery 15 June 2026.`},{title:"Client Proposal",icon:"✦",to:"Apex Industries",ctx:`Draft a sales proposal from ${firm.companyName||"the company"} to Apex Industries for Heavy Bracket Assembly at ₹1,200/unit, minimum 40 units, 30-day credit.`},{title:"HR Appointment Letter",icon:"◉",to:"New Joiner",ctx:`Draft an appointment letter from ${firm.companyName||"the company"} for a Senior Welder: basic ₹28,000, HRA ₹11,200, joining 15 June 2026.`},{title:"CA Communication",icon:"§",to:"CA Office",ctx:`Draft an email from ${firm.companyName||"the company"} to our CA for GSTR-3B review for May 2026. Net GST payable ${fmt(netGST)}, due 20 June 2026.`}].map((c,i)=>(
                    <div key={i} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
                        <div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}><span style={{fontSize:14,color:T.am}}>{c.icon}</span><span style={{fontSize:13,color:T.tx}}>{c.title}</span></div><div style={{fontSize:11,color:T.t3,fontFamily:mo}}>To: {c.to}</div></div>
                        {!commsGen[i]&&<BtnP onClick={()=>genComm(i,c.ctx)} disabled={commsLoading[i]}>{commsLoading[i]?"Drafting...":"Draft with AI"}</BtnP>}
                      </div>
                      {commsGen[i]?(
                        <div><div style={{padding:"11px 12px",background:T.bg,borderRadius:4,border:`1px solid ${T.bd}`,fontSize:12,color:T.t2,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:mo,maxHeight:170,overflowY:"auto",marginBottom:8}}>{commsDrafts[i]}</div><div style={{display:"flex",gap:6}}><button onClick={()=>{navigator.clipboard?.writeText(commsDrafts[i]);}} style={{fontSize:11,padding:"5px 12px",background:T.tx,color:T.bg,border:"none",borderRadius:3,cursor:"pointer",fontFamily:mo}}>Copy</button><button onClick={()=>{setCommsDrafts(p=>{const n=[...p];n[i]="";return n;});setCommsGen(p=>{const n=[...p];n[i]=false;return n;});}} style={{fontSize:11,padding:"5px 10px",background:"transparent",border:`1px solid ${T.bd}`,borderRadius:3,color:T.t3,cursor:"pointer",fontFamily:mo}}>Regen</button></div></div>
                      ):(
                        <div style={{padding:"12px",background:T.bg,borderRadius:4,border:`1px dashed ${T.bd}`,fontSize:12,color:T.t3,fontFamily:mo,textAlign:"center"}}>Click "Draft with AI" to generate</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mod==="documents"&&(
              <div>
                <SHdr title="Document Brain" sub={`${docs.length} documents · Query privately`} action={<BtnP onClick={()=>{const fi=document.createElement("input");fi.type="file";fi.accept=".pdf,.doc,.docx,.txt";fi.onchange=e=>{const file=e.target.files[0];if(file){const nd={id:Date.now(),name:file.name,type:"Uploaded",size:`${Math.round(file.size/1024)} KB`,uploaded:new Date().toISOString().slice(0,10),summary:"Uploaded — query it below."};setDocs(p=>[nd,...p]);log("UPLOAD","Documents",file.name);}};fi.click();}}>↑ Upload</BtnP>}/>
                <Tabs tabs={[{id:"library",label:"Library"},{id:"query",label:"Ask Documents"}]} active={docTab} onChange={setDocTab}/>
                {docTab==="library"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    {docs.map(d=>(
                      <div key={d.id} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div style={{width:34,height:42,background:T.bg,border:`1px solid ${T.bd}`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>📄</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,color:T.tx,marginBottom:4}}>{d.name}</div>
                          <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}><Bdg l={d.type} col="neutral"/><span style={{fontSize:10,color:T.t3,fontFamily:mo}}>{d.size} · {d.uploaded}</span></div>
                          <div style={{padding:"8px 11px",background:T.bg,borderRadius:4,border:`1px solid ${T.bd}`}}><div style={{fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:3}}>SUMMARY</div><div style={{fontSize:12,color:T.t2,lineHeight:1.65}}>{d.summary}</div></div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
                          <button onClick={()=>{setDocQ(`Tell me about ${d.name}`);setDocTab("query");}} style={{fontSize:10,padding:"3px 9px",background:"transparent",border:`1px solid ${T.bd}`,borderRadius:3,color:T.t3,cursor:"pointer",fontFamily:mo}}>Query</button>
                          <button onClick={()=>setDocs(p=>p.filter(x=>x.id!==d.id))} style={{fontSize:10,padding:"3px 7px",background:"transparent",border:`1px solid ${T.rd}44`,borderRadius:3,color:T.rd,cursor:"pointer",fontFamily:mo}}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {docTab==="query"&&(
                  <div>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px",marginBottom:11}}>
                      <div style={{display:"flex",gap:8,marginBottom:9}}>
                        <input value={docQ} onChange={e=>setDocQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&queryDocs(docQ)} placeholder="e.g. What are our penalty clauses? When does the lease expire?" style={{flex:1,padding:"8px 11px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:4,color:T.tx,fontSize:13,outline:"none",fontFamily:f}}/>
                        <BtnP onClick={()=>queryDocs(docQ)} disabled={docLoad}>{docLoad?"Searching...":"Ask →"}</BtnP>
                      </div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {["Payment terms with suppliers?","When does lease expire?","Maternity leave policy?"].map(q=>(
                          <button key={q} onClick={()=>{setDocQ(q);queryDocs(q);}} style={{fontSize:10,padding:"3px 8px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:3,color:T.t3,cursor:"pointer",fontFamily:mo}}>{q}</button>
                        ))}
                      </div>
                    </div>
                    {docAns&&<div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px"}}><div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:9}}>ANSWER</div><div style={{fontSize:13,color:T.t2,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{docAns}</div><div style={{marginTop:11,padding:"8px 12px",background:T.al,border:`1px solid #FCD34D`,borderRadius:4,fontSize:11,color:T.ac,fontFamily:mo}}>◈ From your indexed documents only.</div></div>}
                    {docLoad&&<div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"16px",textAlign:"center",color:T.t3,fontFamily:mo}}>Searching...</div>}
                  </div>
                )}
              </div>
            )}
            {mod==="settings"&&(
              <div>
                <SHdr title="Settings" sub="Firm profile · Data management · Offline AI · Currency"/>
                <Tabs tabs={[{id:"firm",label:"Firm"},{id:"backup",label:"Backup"},{id:"ai",label:"Offline AI"},{id:"currency",label:"Currency"},{id:"security",label:"Security"},{id:"about",label:"About"}]} active={stab} onChange={setStab}/>
                {stab==="firm"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"18px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:12}}>FIRM DETAILS</div>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        <Inp label="COMPANY NAME" value={firmEdit.companyName||""} onChange={e=>setFirmEdit(p=>({...p,companyName:e.target.value}))} placeholder="Sharma Industries Pvt Ltd"/>
                        <Inp label="GSTIN" value={firmEdit.gstin||""} onChange={e=>setFirmEdit(p=>({...p,gstin:e.target.value}))} placeholder="22AAAAA0000A1Z5"/>
                        <Inp label="PAN NUMBER" value={firmEdit.pan||""} onChange={e=>setFirmEdit(p=>({...p,pan:e.target.value}))} placeholder="AAAAA0000A"/>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="CITY" value={firmEdit.city||""} onChange={e=>setFirmEdit(p=>({...p,city:e.target.value}))} placeholder="Mumbai"/><Sel label="STATE" value={firmEdit.state||"Maharashtra"} onChange={e=>setFirmEdit(p=>({...p,state:e.target.value}))} options={STATES}/></div>
                      </div>
                      <div style={{marginTop:13,display:"flex",gap:8}}><BtnP onClick={()=>{setFirm(firmEdit);DB.set("firm",firmEdit);}}>Save Changes</BtnP><BtnG onClick={()=>setFirmEdit({...firm})}>Discard</BtnG></div>
                    </div>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"18px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:12}}>DATA SUMMARY</div>
                      {[{l:"Transactions",v:`${txns.length}`},{l:"Employees",v:`${emps.length}`},{l:"Inventory SKUs",v:`${inv.length}`},{l:"Vendors",v:`${vendors.length}`},{l:"Leads",v:`${leads.length}`},{l:"Documents",v:`${docs.length}`},{l:"Audit Entries",v:`${auditLog.length}`}].map((r,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<6?`1px solid ${T.bg}`:"none"}}><span style={{fontSize:12,color:T.t3,fontFamily:mo}}>{r.l}</span><span style={{fontSize:12,color:T.bl,fontFamily:mo}}>{r.v}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                {stab==="backup"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"18px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:11}}>BACKUP YOUR DATA</div>
                      <p style={{fontSize:12,color:T.t2,lineHeight:1.7,marginBottom:13}}>Export all Nexara data as a JSON file. Store it securely. Recommended weekly.</p>
                      <BtnP onClick={backupData}>↓ Download Backup</BtnP>
                      {backupStatus&&<div style={{marginTop:8,fontSize:12,color:T.gn,fontFamily:mo}}>{backupStatus}</div>}
                    </div>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"18px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:11}}>RESTORE FROM BACKUP</div>
                      <div style={{padding:"10px 12px",background:T.rl,border:`1px solid ${T.rd}44`,borderRadius:5,marginBottom:12}}><div style={{fontSize:12,color:T.rd}}>⚠ Download current backup first before restoring.</div></div>
                      <BtnG onClick={()=>{const fi=document.createElement("input");fi.type="file";fi.accept=".json";fi.onchange=e=>{const reader=new FileReader();reader.onload=ev=>{try{const data=JSON.parse(ev.target.result);["txns","emps","inv","vendors","leads","docs","firm"].forEach(k=>{if(data[k])localStorage.setItem("nx_"+k,JSON.stringify(data[k]));});setBackupStatus("✓ Restored.");setTimeout(()=>window.location.reload(),1500);}catch{setBackupStatus("✗ Invalid file.");}};reader.readAsText(e.target.files[0]);};fi.click();}}>↑ Select Backup File</BtnG>
                      {backupStatus&&<div style={{marginTop:8,fontSize:12,color:backupStatus.startsWith("✓")?T.gn:T.rd,fontFamily:mo}}>{backupStatus}</div>}
                    </div>
                  </div>
                )}
                {stab==="ai"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"18px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:11}}>OLLAMA LOCAL AI</div>
                      <p style={{fontSize:12,color:T.t2,lineHeight:1.7,marginBottom:12}}>Connect Ollama for 100% offline AI. No internet, no data leaving your machine.</p>
                      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:11}}>
                        <Inp label="OLLAMA URL" value={ollamaUrl} onChange={e=>setOllamaUrl(e.target.value)} placeholder="http://localhost:11434"/>
                        <Sel label="MODEL" value={"llama3.1"} onChange={()=>{}} options={["llama3.1","llama3.1:8b","mistral","phi4","gemma2"]}/>
                      </div>
                      <BtnP onClick={async()=>{setOllamaStatus("testing");try{const r=await fetch(ollamaUrl+"/api/tags",{signal:AbortSignal.timeout(4000)});if(r.ok){const d=await r.json();setOllamaStatus("connected:"+(d.models?.map(m=>m.name).join(","))||"");}else setOllamaStatus("error");}catch{setOllamaStatus("offline");}}}>Test Connection</BtnP>
                      <div style={{marginTop:11,padding:"10px 12px",borderRadius:5,border:`1px solid ${T.bd}`,background:ollamaStatus.startsWith("connected")?T.gl:ollamaStatus==="offline"?T.rl:T.bg}}>
                        {ollamaStatus==="untested"&&<span style={{fontSize:12,color:T.t3}}>Not tested.</span>}
                        {ollamaStatus==="testing"&&<span style={{fontSize:12,color:T.am}}>Testing...</span>}
                        {ollamaStatus==="offline"&&<span style={{fontSize:12,color:T.rd}}>Cannot reach Ollama. Make sure it is running.</span>}
                        {ollamaStatus.startsWith("connected")&&<div><div style={{fontSize:12,color:T.gn,marginBottom:3}}>✓ Connected</div><div style={{fontSize:11,color:T.t3,fontFamily:mo}}>{ollamaStatus.replace("connected:","")}</div></div>}
                      </div>
                    </div>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"18px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:11}}>SETUP GUIDE</div>
                      {[{n:"1",t:"Install Ollama",d:"ollama.com — free, Windows/Mac/Linux"},{n:"2",t:"Pull model",d:"Terminal: ollama pull llama3.1"},{n:"3",t:"Start",d:"Runs on port 11434 automatically"},{n:"4",t:"Connect",d:"Enter URL above and test"}].map((s,i)=>(
                        <div key={i} style={{display:"flex",gap:10,marginBottom:12,paddingBottom:12,borderBottom:i<3?`1px solid ${T.bd}`:"none"}}>
                          <div style={{width:18,height:18,borderRadius:"50%",background:T.tx,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:T.bg,fontWeight:700,flexShrink:0}}>{s.n}</div>
                          <div><div style={{fontSize:13,color:T.tx,marginBottom:2}}>{s.t}</div><div style={{fontSize:11,color:T.t3,fontFamily:mo}}>{s.d}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {stab==="currency"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"18px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:11}}>DISPLAY CURRENCY</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {[{code:"INR",label:"Indian Rupee (₹)"},{code:"USD",label:"US Dollar ($)"},{code:"AED",label:"UAE Dirham (AED)"},{code:"GBP",label:"British Pound (£)"}].map(c=>(
                          <div key={c.code} onClick={()=>{setCurrency(c.code);DB.set("currency",c.code);}} style={{padding:"10px 12px",border:`1px solid ${currency===c.code?T.bl:T.bd}`,borderRadius:5,cursor:"pointer",background:currency===c.code?T.bll:"transparent",display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:13,color:currency===c.code?T.bl:T.t2}}>{c.label}</span>
                            {currency===c.code&&<Bdg l="ACTIVE" col="blue"/>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"18px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:11}}>PREVIEW</div>
                      {[{l:"Revenue",v:totRev},{l:"Net Profit",v:netPft},{l:"GST Payable",v:netGST},{l:"Payroll",v:totNet},{l:"Pipeline",v:pipeVal}].map((r,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<4?`1px solid ${T.bg}`:"none"}}><span style={{fontSize:12,color:T.t2}}>{r.l}</span><div style={{textAlign:"right"}}><div style={{fontSize:13,color:T.bl}}>{fmtC(r.v)}</div>{currency!=="INR"&&<div style={{fontSize:10,color:T.t3,fontFamily:mo}}>{fmt(r.v)}</div>}</div></div>
                      ))}
                    </div>
                  </div>
                )}
                {stab==="security"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"18px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:11}}>TEAM MEMBERS</div>
                      {[{n:"Admin",role:"Owner",access:"Full Access",av:"A"},{n:"Priya Sharma",role:"Accountant",access:"Finance only",av:"P"},{n:"Vikram Mehta",role:"Sales",access:"CRM + Reports",av:"V"},{n:"Sunita Patel",role:"HR Manager",access:"People only",av:"S"}].map((u,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.bg}`}}>
                          <div style={{width:26,height:26,borderRadius:"50%",background:i===0?T.tx:T.bd,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:i===0?T.bg:T.t2,fontWeight:600,flexShrink:0}}>{u.av}</div>
                          <div style={{flex:1}}><div style={{fontSize:12,color:T.t2}}>{u.n}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>{u.access}</div></div>
                          <Bdg l={u.role} col={u.role==="Owner"?"amber":"neutral"}/>
                        </div>
                      ))}
                    </div>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"18px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:11}}>DATA PRIVACY</div>
                      {["Data stored only on this machine","No telemetry or tracking","AI via Ollama or explicit API key","Backup files stay on your machine","Audit trail logs all actions"].map((item,i)=>(
                        <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:i<4?`1px solid ${T.bg}`:"none"}}><span style={{color:T.gn,fontSize:11,flexShrink:0}}>✓</span><span style={{fontSize:12,color:T.t2}}>{item}</span></div>
                      ))}
                      <button onClick={()=>{DB.set("scr","onboarding");window.location.reload();}} style={{marginTop:12,width:"100%",padding:"7px",background:"transparent",border:`1px solid ${T.rd}44`,borderRadius:4,color:T.rd,cursor:"pointer",fontSize:12,fontFamily:f}}>Reset & Restart Onboarding</button>
                    </div>
                  </div>
                )}
                {stab==="about"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"20px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:16}}><div style={{width:38,height:38,background:T.am,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,color:"#fff"}}>N</div><div><div style={{fontSize:16,color:T.tx,letterSpacing:2}}>NEXARA</div><div style={{fontSize:11,color:T.t3,fontFamily:mo}}>v1.0 · India Edition</div></div></div>
                      {[{l:"Build",v:"Phase 7 — Complete"},{l:"Platform",v:"Browser / Electron"},{l:"Data",v:"Local — never transmitted"},{l:"Compliance",v:"GST, PF, ESIC, PT, TDS"},{l:"Support",v:"support@nexara.in"}].map((r,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<4?`1px solid ${T.bg}`:"none"}}><span style={{fontSize:12,color:T.t3,fontFamily:mo}}>{r.l}</span><span style={{fontSize:12,color:T.t2}}>{r.v}</span></div>
                      ))}
                      <div style={{marginTop:12,padding:"9px 12px",background:T.al,border:`1px solid #FCD34D`,borderRadius:5,fontSize:10,color:T.ac,fontFamily:mo}}>⌘K Search · ⌘N Invoice · ⌘D Dark · ⌘B Backup</div>
                    </div>
                    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,padding:"20px"}}>
                      <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:11}}>22 MODULES BUILT</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3}}>
                        {["Dashboard","Accounting","GST & Tax","Cash Flow","Banking","HR & Payroll","Attendance","Recruitment","Inventory","Vendors","Production","CRM & Leads","Proposals","Legal","Contracts","Audit Trail","Analytics","Reports","Communications","Document Brain","Settings","Multi-Company"].map((m,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 0"}}><span style={{color:T.gn,fontSize:10}}>✓</span><span style={{fontSize:11,color:T.t2}}>{m}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!LIVE.includes(mod)&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"55vh",textAlign:"center"}}>
                <div style={{fontSize:34,marginBottom:13,opacity:0.12}}>{MODS.find(m=>m.id===mod)?.icon}</div>
                <h2 style={{fontSize:17,fontWeight:400,color:T.tx,marginBottom:6}}>{MODS.find(m=>m.id===mod)?.label}</h2>
                <p style={{color:T.t3,fontSize:11,maxWidth:240,lineHeight:1.7,fontFamily:mo}}>Being built. Live in next cycle.</p>
                <div style={{marginTop:16,padding:"4px 11px",background:T.al,border:`1px solid #FCD34D`,borderRadius:3,fontSize:10,color:T.ac,fontFamily:mo}}>NEXT PHASE</div>
              </div>
            )}
          </div>
          {aiOpen&&(
            <div style={{width:290,borderLeft:`1px solid ${T.bd}`,display:"flex",flexDirection:"column",background:T.sf,flexShrink:0}}>
              <div style={{padding:"11px 13px",borderBottom:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:12,color:T.tx}}>✦ Nexara AI</div><div style={{fontSize:9,color:T.t3,fontFamily:mo,letterSpacing:1}}>PRIVATE · LOCAL</div></div>
                <button onClick={()=>setAiOpen(false)} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:18}}>×</button>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
                {aiMsgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.r==="u"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"90%",padding:"8px 10px",borderRadius:6,background:m.r==="u"?T.tx:T.bg,border:`1px solid ${m.r==="u"?T.tx:T.bd}`}}>
                      <p style={{fontSize:12,color:m.r==="u"?T.bg:T.t2,lineHeight:1.65,margin:0}}>{m.t}</p>
                    </div>
                  </div>
                ))}
                {aiLoad&&<div style={{padding:"8px 10px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:6,fontSize:12,color:T.t3,fontFamily:mo}}>Thinking...</div>}
              </div>
              <div style={{padding:"9px 10px",borderTop:`1px solid ${T.bd}`}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                  {["GST liability?","Payroll?","Low stock?","Margin?"].map(q=>(
                    <button key={q} onClick={()=>setAiIn(q)} style={{fontSize:10,padding:"3px 6px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:3,color:T.t3,cursor:"pointer",fontFamily:mo}}>{q}</button>
                  ))}
                </div>
                <div style={{display:"flex",gap:6}}>
                  <input value={aiIn} onChange={e=>setAiIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAI()} placeholder="Ask your business..." style={{flex:1,padding:"7px 10px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:4,color:T.tx,fontSize:12,outline:"none",fontFamily:f}}/>
                  <BtnP onClick={askAI}>→</BtnP>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal==="txn"&&<Mdl title="New Ledger Entry" onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}><Inp label="PARTY" value={txnF.party} onChange={e=>setTxnF(p=>({...p,party:e.target.value}))} placeholder="e.g. Ramesh Steel"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="DATE" value={txnF.date} onChange={e=>setTxnF(p=>({...p,date:e.target.value}))} placeholder="2026-05-31"/><Inp label="HSN" value={txnF.hsn} onChange={e=>setTxnF(p=>({...p,hsn:e.target.value}))} placeholder="7208"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="AMOUNT (₹)" value={txnF.amount} onChange={e=>setTxnF(p=>({...p,amount:e.target.value}))} placeholder="245000"/><Inp label="GST (₹)" value={txnF.gst} onChange={e=>setTxnF(p=>({...p,gst:e.target.value}))} placeholder="44100"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><Sel label="TYPE" value={txnF.type} onChange={e=>setTxnF(p=>({...p,type:e.target.value}))} options={["Sale","Purchase","Expense"]}/><Sel label="CATEGORY" value={txnF.category} onChange={e=>setTxnF(p=>({...p,category:e.target.value}))} options={["Finished Goods","Raw Material","Services","Freight","Overhead","Utilities"]}/><Sel label="STATUS" value={txnF.status} onChange={e=>setTxnF(p=>({...p,status:e.target.value}))} options={["paid","pending","overdue"]}/></div></div><div style={{display:"flex",gap:8,marginTop:14}}><BtnP onClick={()=>{if(txnF.party&&txnF.amount){const t={id:Date.now(),...txnF,amount:parseFloat(txnF.amount),gst:parseFloat(txnF.gst||0)};setTxns(p=>[t,...p]);log("ADD","Accounting",`${t.type} — ${t.party} — ${fmt(t.amount)}`);setTxnF({party:"",type:"Sale",amount:"",gst:"",category:"Finished Goods",date:"",hsn:"",status:"pending"});setModal(null);}}}>Save Entry</BtnP><BtnG onClick={()=>setModal(null)}>Cancel</BtnG></div></Mdl>}
      {modal==="emp"&&<Mdl title="Add Employee" onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="FULL NAME" value={empF.name} onChange={e=>setEmpF(p=>({...p,name:e.target.value}))} placeholder="Rajesh Kumar"/><Inp label="DESIGNATION" value={empF.designation} onChange={e=>setEmpF(p=>({...p,designation:e.target.value}))} placeholder="Production Manager"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="PAN" value={empF.pan} onChange={e=>setEmpF(p=>({...p,pan:e.target.value}))} placeholder="ABCPK1234D"/><Inp label="DATE OF JOINING" value={empF.doj} onChange={e=>setEmpF(p=>({...p,doj:e.target.value}))} placeholder="2024-01-01"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><Inp label="BASIC (₹)" value={empF.basic} onChange={e=>setEmpF(p=>({...p,basic:e.target.value}))} placeholder="35000"/><Inp label="HRA (₹)" value={empF.hra} onChange={e=>setEmpF(p=>({...p,hra:e.target.value}))} placeholder="14000"/><Inp label="SPECIAL (₹)" value={empF.special} onChange={e=>setEmpF(p=>({...p,special:e.target.value}))} placeholder="5000"/></div><Sel label="DEPARTMENT" value={empF.dept} onChange={e=>setEmpF(p=>({...p,dept:e.target.value}))} options={["Operations","Finance","HR","Sales","Admin","Production","IT"]}/><div style={{display:"flex",gap:14}}>{[{l:"PF",k:"pf"},{l:"ESIC",k:"esic"}].map(fi=><label key={fi.k} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:T.t2}}><input type="checkbox" checked={!!empF[fi.k]} onChange={e=>setEmpF(p=>({...p,[fi.k]:e.target.checked}))}/>{fi.l}</label>)}</div></div><div style={{display:"flex",gap:8,marginTop:14}}><BtnP onClick={()=>{if(empF.name&&empF.basic){const e={id:Date.now(),...empF,basic:parseFloat(empF.basic),hra:parseFloat(empF.hra||0),special:parseFloat(empF.special||0),pt:200,status:"active"};setEmps(p=>[...p,e]);log("ADD","HR",`${e.name} — ${e.designation}`);setEmpF({name:"",designation:"",dept:"Operations",basic:"",hra:"",special:"",doj:"",pan:"",pf:true,esic:false,pt:200});setModal(null);}}}>Add Employee</BtnP><BtnG onClick={()=>setModal(null)}>Cancel</BtnG></div></Mdl>}
      {modal==="inv"&&<Mdl title="Add Inventory Item" onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="SKU" value={invF.sku} onChange={e=>setInvF(p=>({...p,sku:e.target.value}))} placeholder="RM-004"/><Inp label="ITEM NAME" value={invF.name} onChange={e=>setInvF(p=>({...p,name:e.target.value}))} placeholder="Steel Pipes"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><Inp label="QTY" value={invF.qty} onChange={e=>setInvF(p=>({...p,qty:e.target.value}))} placeholder="500"/><Inp label="COST/UNIT" value={invF.costPrice} onChange={e=>setInvF(p=>({...p,costPrice:e.target.value}))} placeholder="120"/><Inp label="REORDER AT" value={invF.reorderAt} onChange={e=>setInvF(p=>({...p,reorderAt:e.target.value}))} placeholder="50"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Sel label="CATEGORY" value={invF.category} onChange={e=>setInvF(p=>({...p,category:e.target.value}))} options={["Raw Material","Components","Finished Goods","Packaging","Tools"]}/><Sel label="UNIT" value={invF.unit} onChange={e=>setInvF(p=>({...p,unit:e.target.value}))} options={["pcs","kg","litre","sheet","roll","box","set"]}/></div><Inp label="SUPPLIER" value={invF.supplier} onChange={e=>setInvF(p=>({...p,supplier:e.target.value}))} placeholder="Ramesh Steel"/></div><div style={{display:"flex",gap:8,marginTop:14}}><BtnP onClick={()=>{if(invF.name&&invF.qty){const i={id:Date.now(),...invF,qty:parseFloat(invF.qty),costPrice:parseFloat(invF.costPrice||0),reorderAt:parseFloat(invF.reorderAt||0)};setInv(p=>[...p,i]);log("ADD","Inventory",`${i.name} — ${i.qty} ${i.unit}`);setInvF({sku:"",name:"",category:"Raw Material",qty:"",unit:"pcs",costPrice:"",reorderAt:"",supplier:""});setModal(null);}}}>Add Item</BtnP><BtnG onClick={()=>setModal(null)}>Cancel</BtnG></div></Mdl>}
      {modal==="lead"&&<Mdl title="Add Deal" onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="COMPANY" value={leadF.company} onChange={e=>setLeadF(p=>({...p,company:e.target.value}))} placeholder="Apex Industries"/><Inp label="CONTACT" value={leadF.contact} onChange={e=>setLeadF(p=>({...p,contact:e.target.value}))} placeholder="Rakesh Gupta"/></div><Inp label="DEAL VALUE (₹)" value={leadF.value} onChange={e=>setLeadF(p=>({...p,value:e.target.value}))} placeholder="500000"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Sel label="STAGE" value={leadF.stage} onChange={e=>setLeadF(p=>({...p,stage:e.target.value}))} options={["Discovery","Qualified","Proposal Sent","Negotiation","Closed Won","Closed Lost"]}/><Sel label="SOURCE" value={leadF.source} onChange={e=>setLeadF(p=>({...p,source:e.target.value}))} options={["Referral","Trade Show","Website","LinkedIn","Cold Outreach"]}/></div><Inp label="NOTES" value={leadF.notes} onChange={e=>setLeadF(p=>({...p,notes:e.target.value}))} placeholder="Key details..."/></div><div style={{display:"flex",gap:8,marginTop:14}}><BtnP onClick={()=>{if(leadF.company&&leadF.value){const l={id:Date.now(),...leadF,value:parseFloat(leadF.value),lastTouch:new Date().toISOString().slice(0,10)};setLeads(p=>[...p,l]);log("ADD","CRM",`Deal — ${l.company} — ${fmt(l.value)}`);setLeadF({company:"",contact:"",value:"",stage:"Discovery",source:"Referral",notes:""});setModal(null);}}}>Add Deal</BtnP><BtnG onClick={()=>setModal(null)}>Cancel</BtnG></div></Mdl>}
      {modal==="vendor"&&<Mdl title="Add Vendor" onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}><Inp label="VENDOR NAME" value={""} onChange={()=>{}} placeholder="Gupta Steel Pvt Ltd"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="GSTIN" value={""} onChange={()=>{}} placeholder="27AABCG..."/><Inp label="CONTACT" value={""} onChange={()=>{}} placeholder="9876543210"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="CITY" value={""} onChange={()=>{}} placeholder="Mumbai"/><Sel label="CATEGORY" value={"Raw Material"} onChange={()=>{}} options={["Raw Material","Components","Freight","Packaging","Services"]}/></div></div><div style={{display:"flex",gap:8,marginTop:14}}><BtnP onClick={()=>setModal(null)}>Add Vendor</BtnP><BtnG onClick={()=>setModal(null)}>Cancel</BtnG></div></Mdl>}
      {modal==="contract"&&<Mdl title="Add Contract" onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}><Inp label="CONTRACT TITLE" value={""} onChange={()=>{}} placeholder="Supply Agreement"/><Inp label="COUNTERPARTY" value={""} onChange={()=>{}} placeholder="Company Name"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><Inp label="START DATE" value={""} onChange={()=>{}} placeholder="2026-01-01"/><Inp label="END DATE" value={""} onChange={()=>{}} placeholder="2026-12-31"/><Inp label="VALUE (₹)" value={""} onChange={()=>{}} placeholder="1000000"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><Sel label="TYPE" value={"Customer"} onChange={()=>{}} options={["Customer","Vendor","Lease","Service"]}/><Sel label="STATUS" value={"Active"} onChange={()=>{}} options={["Active","Expiring","Draft"]}/><Sel label="RISK" value={"Low"} onChange={()=>{}} options={["Low","Medium","High"]}/></div></div><div style={{display:"flex",gap:8,marginTop:14}}><BtnP onClick={()=>setModal(null)}>Add Contract</BtnP><BtnG onClick={()=>setModal(null)}>Cancel</BtnG></div></Mdl>}
      {invModal&&<Mdl title="Tax Invoice Generator" onClose={()=>setInvModal(false)}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:11}}><div style={{padding:"9px 11px",background:T.bg,borderRadius:5,border:`1px solid ${T.bd}`}}><div style={{fontSize:9,color:T.t3,fontFamily:mo,marginBottom:2}}>FROM</div><div style={{fontSize:12,color:T.tx}}>{firm.companyName||"Company"}</div><div style={{fontSize:10,color:T.t3,fontFamily:mo}}>GSTIN: {firm.gstin||"—"}</div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}><Inp label="INV NO." value={invData.invoiceNo} onChange={e=>setInvData(p=>({...p,invoiceNo:e.target.value}))} placeholder="INV-001"/><Inp label="DATE" value={invData.date} onChange={e=>setInvData(p=>({...p,date:e.target.value}))} placeholder="2026-05-31"/></div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:11}}><Inp label="BILL TO" value={invData.party} onChange={e=>setInvData(p=>({...p,party:e.target.value}))} placeholder="Customer"/><Inp label="GSTIN" value={invData.gstin} onChange={e=>setInvData(p=>({...p,gstin:e.target.value}))} placeholder="27AABCX..."/><Inp label="ADDRESS" value={invData.address} onChange={e=>setInvData(p=>({...p,address:e.target.value}))} placeholder="City, State"/></div><div style={{marginBottom:10}}><div style={{display:"grid",gridTemplateColumns:"1fr 48px 78px 58px 22px",gap:4,padding:"4px 0",fontSize:9,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:4}}><span>DESCRIPTION</span><span>QTY</span><span>RATE</span><span>GST%</span><span/></div>{invData.items.map((item,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 48px 78px 58px 22px",gap:4,marginBottom:4}}><input value={item.desc} onChange={e=>setInvData(p=>({...p,items:p.items.map((x,j)=>j===i?{...x,desc:e.target.value}:x)}))} placeholder="Item" style={{padding:"6px 8px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:4,color:T.tx,fontSize:12,outline:"none",fontFamily:f}}/><input value={item.qty} onChange={e=>setInvData(p=>({...p,items:p.items.map((x,j)=>j===i?{...x,qty:e.target.value}:x)}))} style={{padding:"6px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:4,color:T.tx,fontSize:12,outline:"none",textAlign:"center"}}/><input value={item.rate} onChange={e=>setInvData(p=>({...p,items:p.items.map((x,j)=>j===i?{...x,rate:e.target.value}:x)}))} placeholder="0" style={{padding:"6px 8px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:4,color:T.tx,fontSize:12,outline:"none"}}/><select value={item.gst} onChange={e=>setInvData(p=>({...p,items:p.items.map((x,j)=>j===i?{...x,gst:parseFloat(e.target.value)}:x)}))} style={{padding:"6px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:4,color:T.tx,fontSize:11,outline:"none"}}>{[0,5,12,18,28].map(r=><option key={r} value={r}>{r}%</option>)}</select><button onClick={()=>setInvData(p=>({...p,items:p.items.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",color:T.rd,cursor:"pointer",fontSize:14,padding:0}}>×</button></div>)}<button onClick={()=>setInvData(p=>({...p,items:[...p.items,{desc:"",qty:1,rate:"",gst:18}]}))} style={{fontSize:11,padding:"4px 10px",background:"transparent",border:`1px dashed ${T.bd}`,borderRadius:3,color:T.t3,cursor:"pointer",fontFamily:f,marginTop:3}}>+ Add Item</button></div><div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:T.bg,borderRadius:5,marginBottom:11}}><span style={{fontSize:12,color:T.t2}}>Grand Total (incl. GST)</span><span style={{fontSize:16,color:T.bl}}>{fmt(invTotal)}</span></div><div style={{display:"flex",gap:8}}><BtnP onClick={()=>{const lines=invData.items.map(it=>{const b=(parseFloat(it.qty)||0)*(parseFloat(it.rate)||0);return`${it.desc.padEnd(26)} ${it.qty}×₹${it.rate} GST${it.gst}% = ${fmt(b*(1+it.gst/100))}`;});const text=`TAX INVOICE\n${firm.companyName||"Company"} · GSTIN: ${firm.gstin||"—"}\n${"─".repeat(48)}\nInvoice: ${invData.invoiceNo} · Date: ${invData.date}\nBill To: ${invData.party} · ${invData.address}\n${"─".repeat(48)}\n${lines.join("\n")}\n${"─".repeat(48)}\nTotal: ${fmt(invTotal)}\nComputer-generated invoice.`;const blob=new Blob([text],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`Invoice_${invData.invoiceNo}.txt`;a.click();URL.revokeObjectURL(url);log("EXPORT","Accounting","Invoice: "+invData.invoiceNo);setInvModal(false);}}>↓ Download</BtnP><BtnG onClick={()=>setInvModal(false)}>Cancel</BtnG></div></Mdl>}
      {vPayMod&&<Mdl title={`Pay — ${vPayMod.name}`} onClose={()=>{setVPayMod(null);setVPayAmt("");}}>
        <div style={{padding:"10px 12px",background:T.bg,borderRadius:5,border:`1px solid ${T.bd}`,marginBottom:11,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:T.t2}}>Outstanding</span><span style={{fontSize:14,color:T.rd,fontWeight:600}}>{fmt(vPayMod.outstanding)}</span></div>
        <Inp label="PAYMENT AMOUNT (₹)" value={vPayAmt} onChange={e=>setVPayAmt(e.target.value)} placeholder={String(vPayMod.outstanding)}/>
        <div style={{display:"flex",gap:4,marginTop:8,marginBottom:11}}>{[25,50,75,100].map(pct=><button key={pct} onClick={()=>setVPayAmt(String(Math.round(vPayMod.outstanding*pct/100)))} style={{fontSize:11,padding:"3px 8px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:3,color:T.t3,cursor:"pointer",fontFamily:mo}}>{pct}%</button>)}</div>
        <div style={{display:"flex",gap:8}}><BtnP onClick={()=>recVendorPay(vPayMod,vPayAmt)}>Confirm Payment</BtnP><BtnG onClick={()=>{setVPayMod(null);setVPayAmt("");}}>Cancel</BtnG></div>
      </Mdl>}
      {adjMod&&<Mdl title={`Adjust — ${adjMod.name}`} onClose={()=>setAdjMod(null)}>
        <div style={{padding:"10px 12px",background:T.bg,borderRadius:5,border:`1px solid ${T.bd}`,marginBottom:11,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:T.t2}}>Current Stock</span><span style={{fontSize:15,color:T.bl,fontWeight:600}}>{adjMod.qty} {adjMod.unit}</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <Inp label="ADJUSTMENT (+add / -reduce)" value={adjQty} onChange={e=>setAdjQty(e.target.value)} placeholder="+50 or -20"/>
          <div style={{display:"flex",gap:4}}>{["+10","+50","+100","-5","-10","-20"].map(v=><button key={v} onClick={()=>setAdjQty(v)} style={{fontSize:11,padding:"3px 8px",background:T.bg,border:`1px solid ${T.bd}`,borderRadius:3,color:v.startsWith("-")?T.rd:T.gn,cursor:"pointer",fontFamily:mo}}>{v}</button>)}</div>
          <Inp label="REASON / NOTE" value={adjNote} onChange={e=>setAdjNote(e.target.value)} placeholder="Physical count, delivery, damage..."/>
        </div>
        {adjQty&&!isNaN(parseInt(adjQty))&&<div style={{padding:"9px 12px",background:T.bg,borderRadius:5,border:`1px solid ${T.bd}`,marginTop:10,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:T.t2}}>New Stock</span><span style={{fontSize:14,color:T.bl,fontWeight:600}}>{Math.max(0,adjMod.qty+parseInt(adjQty))} {adjMod.unit}</span></div>}
        <div style={{display:"flex",gap:8,marginTop:13}}><BtnP onClick={()=>adjustStock(adjMod,adjQty,adjNote)}>Apply</BtnP><BtnG onClick={()=>setAdjMod(null)}>Cancel</BtnG></div>
      </Mdl>}
      {editMod?.type==="txn"&&<Mdl title="Edit Transaction" onClose={()=>setEditMod(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}><Inp label="PARTY" value={editMod.data.party} onChange={e=>setEditMod(p=>({...p,data:{...p.data,party:e.target.value}}))} placeholder="Party"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="AMOUNT (₹)" value={String(editMod.data.amount)} onChange={e=>setEditMod(p=>({...p,data:{...p.data,amount:parseFloat(e.target.value)||0}}))} placeholder="Amount"/><Inp label="GST (₹)" value={String(editMod.data.gst)} onChange={e=>setEditMod(p=>({...p,data:{...p.data,gst:parseFloat(e.target.value)||0}}))} placeholder="GST"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Sel label="TYPE" value={editMod.data.type} onChange={e=>setEditMod(p=>({...p,data:{...p.data,type:e.target.value}}))} options={["Sale","Purchase","Expense"]}/><Sel label="STATUS" value={editMod.data.status} onChange={e=>setEditMod(p=>({...p,data:{...p.data,status:e.target.value}}))} options={["paid","pending","overdue"]}/></div></div><div style={{display:"flex",gap:8,marginTop:13}}><BtnP onClick={()=>{setTxns(p=>p.map(t=>t.id===editMod.data.id?editMod.data:t));log("EDIT","Accounting","Updated: "+editMod.data.party);setEditMod(null);}}>Save</BtnP><BtnG onClick={()=>setEditMod(null)}>Cancel</BtnG></div></Mdl>}
      {editMod?.type==="emp"&&<Mdl title="Edit Employee" onClose={()=>setEditMod(null)}><div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><Inp label="NAME" value={editMod.data.name} onChange={e=>setEditMod(p=>({...p,data:{...p.data,name:e.target.value}}))} placeholder="Name"/><Inp label="DESIGNATION" value={editMod.data.designation} onChange={e=>setEditMod(p=>({...p,data:{...p.data,designation:e.target.value}}))} placeholder="Designation"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><Inp label="BASIC (₹)" value={String(editMod.data.basic)} onChange={e=>setEditMod(p=>({...p,data:{...p.data,basic:parseFloat(e.target.value)||0}}))} placeholder="Basic"/><Inp label="HRA (₹)" value={String(editMod.data.hra)} onChange={e=>setEditMod(p=>({...p,data:{...p.data,hra:parseFloat(e.target.value)||0}}))} placeholder="HRA"/><Inp label="SPECIAL (₹)" value={String(editMod.data.special)} onChange={e=>setEditMod(p=>({...p,data:{...p.data,special:parseFloat(e.target.value)||0}}))} placeholder="Special"/></div></div><div style={{display:"flex",gap:8,marginTop:13}}><BtnP onClick={()=>{setEmps(p=>p.map(e=>e.id===editMod.data.id?editMod.data:e));log("EDIT","HR","Updated: "+editMod.data.name);setEditMod(null);}}>Save</BtnP><BtnG onClick={()=>setEditMod(null)}>Cancel</BtnG></div></Mdl>}
      <div style={{position:"fixed",bottom:12,right:12,padding:"5px 10px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:5,fontSize:10,color:T.t3,fontFamily:mo,opacity:0.6,pointerEvents:"none"}}>⌘K Search · ⌘N Invoice · ⌘D Dark · ⌘B Backup</div>
    </div>
  );
}
