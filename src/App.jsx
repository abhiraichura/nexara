import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  T, f, fs, mo,
  Badge, KPI, Inp, Sel, TextArea, BtnP, BtnG, BtnDanger,
  SHdr, Tabs, Table, TRow, TH, TD, Modal, InfoBox,
  StatRow, Card, CardHdr, ProgressBar, Sparkline,
} from './components';
import { load, save, fmt, fmtN, fmtD, today, uid, calcPay, INDUSTRIES, STATES, ROLES, GST_RATES, TXN_CATS } from './data';
import { generate, AIPanel, AIStatusPill, AISetupPanel } from './AIStatus';
import { TaskManager, WorkflowAutomation, UserManagement } from './modules3';
import { Projects, ServiceJobCards, SubscriptionBilling } from './modules4';
import { BOMManager, MRPPlanner, QualityControl, FieldSales } from './modules5';
import { CashFlowForecast, ProfitabilityAnalysis, SmartReorder } from './modules6';
import { CAExport, BoardReports, EmployeeSelfService, WhatsAppDocs } from './modules7';
import { DocAutoClassify, SalaryBenchmark, VendorPortal, LeaveManagement } from './modules8';
import { VoicePanel } from './VoiceUI';
import { Assets, Goals, Risk, PayrollRun, SupplierComparison, InvoiceGenerator, DebtTender, Training, RegulatoryQA, Insurance, Performance, QuotationsChallan, CreditDebitNotes, PriceList, PDCTracker, OutstandingManager, DepreciationChart, PharmacyModule, JewelleryModule, NonMovingStock } from './modules2';
import { generatePDF } from './pdf';

// ─── ONBOARDING ────────────────────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ name: '', gstin: '', pan: '', phone: '', email: '', city: '', state: STATES[0], industry: INDUSTRIES[0], size: '1–10', country: 'India', fy: '2024–25' });
  const up = (k, v) => setD(p => ({ ...p, [k]: v }));

  const steps = [
    {
      title: 'Welcome to Nexara',
      sub: 'Your private all-in-one business operating system. Data stays on your machine — always.',
      fields: (
        <div style={{ display: 'grid', gap: 16 }}>
          <Inp label="Company / Firm Name *" value={d.name} onChange={e => up('name', e.target.value)} placeholder="Sharma Enterprises Pvt. Ltd." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Inp label="GSTIN" value={d.gstin} onChange={e => up('gstin', e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" />
            <Inp label="PAN" value={d.pan} onChange={e => up('pan', e.target.value.toUpperCase())} placeholder="AAAAA0000A" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Inp label="Phone" value={d.phone} onChange={e => up('phone', e.target.value)} placeholder="+91 98765 43210" />
            <Inp label="Email" value={d.email} onChange={e => up('email', e.target.value)} placeholder="owner@company.com" />
          </div>
        </div>
      ),
      ok: d.name.trim().length > 1,
    },
    {
      title: 'Location & Type',
      sub: 'We customise the interface, compliance rules, and terminology for your business.',
      fields: (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Inp label="City" value={d.city} onChange={e => up('city', e.target.value)} placeholder="Mumbai" />
            <Sel label="State" value={d.state} onChange={e => up('state', e.target.value)} options={STATES} />
          </div>
          <Sel label="Business Category" value={d.industry} onChange={e => up('industry', e.target.value)} options={INDUSTRIES} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Sel label="Team Size" value={d.size} onChange={e => up('size', e.target.value)} options={['1–10', '10–50', '50–200', '200+']} />
            <Sel label="Financial Year" value={d.fy} onChange={e => up('fy', e.target.value)} options={['2023–24', '2024–25', '2025–26']} />
          </div>
        </div>
      ),
      ok: true,
    },
  ];

  const cur = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, fontFamily: f }}>
      {/* Left panel */}
      <div style={{ width: 360, background: T.sb, display: 'flex', flexDirection: 'column', padding: '48px 40px', flexShrink: 0 }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#FFF', letterSpacing: -0.5, fontFamily: fs }}>Nexara</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: 2, fontFamily: mo, marginTop: 2 }}>BUSINESS OS</div>
        </div>
        <div style={{ flex: 1 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 28, opacity: i > step ? 0.35 : 1 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: i < step ? T.am : i === step ? T.am : '#374151',
                border: `2px solid ${i <= step ? T.am : '#4B5563'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#FFF', fontWeight: 700,
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div>
                <div style={{ fontSize: 13, color: i === step ? '#FFF' : '#9CA3AF', fontWeight: i === step ? 600 : 400 }}>
                  {s.title}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #374151', paddingTop: 20 }}>
          <div style={{ fontSize: 11, color: '#6B7280', fontFamily: mo, lineHeight: 1.8 }}>
            ✓ 100% offline — data never leaves<br />
            ✓ India-first compliance built-in<br />
            ✓ All modules, one install
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: T.tx, marginBottom: 6, fontFamily: fs }}>
            {cur.title}
          </h2>
          <p style={{ fontSize: 13, color: T.t3, marginBottom: 32, lineHeight: 1.6 }}>{cur.sub}</p>
          {cur.fields}
          <div style={{ display: 'flex', gap: 10, marginTop: 32, justifyContent: 'flex-end' }}>
            {step > 0 && <BtnG onClick={() => setStep(s => s - 1)}>← Back</BtnG>}
            <BtnP disabled={!cur.ok} onClick={() => {
              if (isLast) onDone(d);
              else setStep(s => s + 1);
            }}>
              {isLast ? 'Launch Nexara →' : 'Continue →'}
            </BtnP>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [co, setCo] = useState(() => load('co', null));
  const [mod, setMod] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => load('dark', false));
  const [aiStatus, setAiStatus] = useState('loading');
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchRes, setSearchRes] = useState([]);

  // Data stores
  const [txns, setTxns] = useState(() => load('txns', []));
  const [emps, setEmps] = useState(() => load('emps', []));
  const [inv, setInv] = useState(() => load('inv', []));
  const [vendors, setVendors] = useState(() => load('vendors', []));
  const [leads, setLeads] = useState(() => load('leads', []));
  const [docs, setDocs] = useState(() => load('docs', []));
  const [jobs, setJobs] = useState(() => load('jobs', []));
  const [contracts, setContracts] = useState(() => load('contracts', []));
  const [audit, setAudit] = useState(() => load('audit', []));
  const [notifs, setNotifs] = useState(() => load('notifs', [
    { id: '1', msg: 'GSTR-3B due in 5 days', mod: 'taxation', read: false },
    { id: '2', msg: 'Low stock alert: 3 items below reorder level', mod: 'inventory', read: false },
    { id: '3', msg: 'Payroll processing due this week', mod: 'hr', read: false },
    { id: '4', msg: 'Follow up: Mehta Industries lead (8 days)', mod: 'crm', read: false },
  ]));

  const log = useCallback((action, detail) => {
    const entry = { id: uid(), ts: new Date().toISOString(), action, detail };
    setAudit(a => { const n = [entry, ...a].slice(0, 500); save('audit', n); return n; });
  }, []);

  const writeDB = (key, val) => {
    if (window.electronAPI) window.electronAPI.dbSet(key, val).catch(() => {});
  };
  const saveTxns = v => { save('txns', v); writeDB('txns', v); setTxns(v); };
  const saveEmps = v => { save('emps', v); writeDB('emps', v); setEmps(v); };
  const saveInv = v => { save('inv', v); writeDB('inv', v); setInv(v); };
  const saveVendors = v => { save('vendors', v); writeDB('vendors', v); setVendors(v); };
  const saveLeads = v => { save('leads', v); writeDB('leads', v); setLeads(v); };
  const saveDocs = v => { save('docs', v); writeDB('docs', v); setDocs(v); };
  const saveJobs = v => { save('jobs', v); writeDB('jobs', v); setJobs(v); };
  const saveContracts = v => { save('contracts', v); writeDB('contracts', v); setContracts(v); };

  useEffect(() => { if (co) {
    save('co', co);
    if (window.electronAPI) window.electronAPI.dbSet('co', co);
  }}, [co]);

  // On first load, sync from SQLite to localStorage (handles reinstall / restore)
  useEffect(() => {
    if (!window.electronAPI) return;
    const syncFromDB = async () => {
      const keys = ['txns','emps','inv','vendors','leads','docs','jobs','contracts','audit','notifs'];
      for (const key of keys) {
        try {
          const val = await window.electronAPI.dbGet(key);
          if (val !== null && val !== undefined) {
            localStorage.setItem('nx_' + key, JSON.stringify(val));
          }
        } catch {}
      }
    };
    syncFromDB();
  }, []);
  useEffect(() => { save('dark', darkMode); }, [darkMode]);

  // Poll Ollama AI status every 8 seconds
  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(2000) });
        if (!r.ok) { setAiStatus('unavailable'); return; }
        const d = await r.json();
        const has = d.models?.some(m => m.name.startsWith('phi3'));
        setAiStatus(has ? 'ready' : 'no-model');
      } catch { setAiStatus('unavailable'); }
    };
    check();
    const t = setInterval(check, 8000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { save('notifs', notifs); }, [notifs]);

  // search
  useEffect(() => {
    if (!searchVal.trim()) { setSearchRes([]); return; }
    const q = searchVal.toLowerCase();
    const r = [];
    txns.forEach(t => { if (t.party?.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q)) r.push({ type: 'Transaction', label: t.party + ' — ' + fmt(t.amount), mod: 'accounting' }); });
    emps.forEach(e => { if (e.name?.toLowerCase().includes(q)) r.push({ type: 'Employee', label: e.name + ' · ' + e.role, mod: 'hr' }); });
    inv.forEach(i => { if (i.name?.toLowerCase().includes(q)) r.push({ type: 'Inventory', label: i.name + ' · ' + i.qty + ' units', mod: 'inventory' }); });
    leads.forEach(l => { if (l.co?.toLowerCase().includes(q)) r.push({ type: 'Lead', label: l.co + ' — ' + fmt(l.val), mod: 'crm' }); });
    vendors.forEach(v => { if (v.name?.toLowerCase().includes(q)) r.push({ type: 'Vendor', label: v.name, mod: 'vendors' }); });
    setSearchRes(r.slice(0, 8));
  }, [searchVal, txns, emps, inv, leads, vendors]);

  const unread = notifs.filter(n => !n.read).length;

  if (!co) return <Onboarding onDone={d => { save('co', d); setCo(d); }} />;

  // ── computed metrics ──
  const sales = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const profit = sales - expenses;
  const gstOut = txns.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) * Number(t.gst || 0)) / 100, 0);
  const gstIn = txns.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) * Number(t.gst || 0)) / 100, 0);
  const gstNet = gstOut - gstIn;
  const lowStock = inv.filter(i => Number(i.qty) <= Number(i.reorder || 5));
  const pending = txns.filter(t => t.status === 'pending');
  const totalPending = pending.reduce((s, t) => s + Number(t.amount), 0);

  // sparkline data for dashboard
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const salesSpk = [420000, 380000, 510000, 445000, 490000, sales || 520000];
  const expSpk = [290000, 310000, 275000, 320000, 300000, expenses || 280000];

  // ── sidebar nav ──
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    null,
    { id: 'accounting', label: 'Accounting', icon: '⊟' },
    { id: 'taxation', label: 'Taxation & GST', icon: '◈' },
    { id: 'cashflow', label: 'Cash Flow', icon: '◎' },
    { id: 'banking', label: 'Banking', icon: '◫' },
    null,
    { id: 'hr', label: 'HR & Payroll', icon: '◍' },
    { id: 'attendance', label: 'Attendance', icon: '◌' },
    { id: 'recruitment', label: 'Recruitment', icon: '◉' },
    null,
    { id: 'inventory', label: 'Inventory', icon: '▦' },
    { id: 'vendors', label: 'Vendors', icon: '◈' },
    { id: 'production', label: 'Production', icon: '▩' },
    null,
    { id: 'crm', label: 'CRM & Pipeline', icon: '◁' },
    { id: 'proposals', label: 'Proposals', icon: '▷' },
    null,
    { id: 'legal', label: 'Legal & Compliance', icon: '⊕' },
    { id: 'contracts', label: 'Contracts', icon: '⊘' },
    { id: 'documents', label: 'Document Brain', icon: '⊗' },
    null,
    { id: 'analytics', label: 'Analytics', icon: '◑' },
    { id: 'reports', label: 'Reports', icon: '≡' },
    { id: 'comms', label: 'Communications', icon: '◷' },
    null,
    { id: 'audit', label: 'Audit Trail', icon: '⊙' },
    null,
    { id: 'invoices', label: 'Invoices', icon: '◻' },
    { id: 'assets', label: 'Asset Tracking', icon: '▣' },
    { id: 'goals', label: 'Goals & OKRs', icon: '◈' },
    { id: 'risk', label: 'Risk Register', icon: '⚠' },
    { id: 'payrollrun', label: 'Payroll Run', icon: '◉' },
    { id: 'suppliercomp', label: 'Supplier Compare', icon: '◫' },
    { id: 'debttender', label: 'Debt & Tender', icon: '◷' },
    null,
    { id: 'training', label: 'Training Materials', icon: '◌' },
    { id: 'regulatoryqa', label: 'Regulatory Q&A', icon: '⊕' },
    { id: 'insurance', label: 'Insurance', icon: '⊘' },
    { id: 'performance', label: 'Performance', icon: '◑' },
    null,
    { id: 'quotations', label: 'Quotations & Challans', icon: '◻' },
    { id: 'cdnotes', label: 'Credit / Debit Notes', icon: '◱' },
    { id: 'pricelist', label: 'Price Lists', icon: '◲' },
    { id: 'pdc', label: 'PDC Cheques', icon: '◳' },
    { id: 'outstanding', label: 'Outstanding Mgmt', icon: '◴' },
    { id: 'depreciation', label: 'Depreciation Chart', icon: '◵' },
    { id: 'nonmoving', label: 'Non-Moving Stock', icon: '◶' },
    null,
    { id: 'pharmacy', label: 'Pharmacy Module', icon: '⊞' },
    { id: 'jewellery', label: 'Jewellery / Metal', icon: '⊟' },
    null,
    { id: 'tasks', label: 'Tasks & Activities', icon: '✓' },
    { id: 'workflow', label: 'Workflow Automation', icon: '⟳' },
    { id: 'users', label: 'User Management', icon: '👥' },
    null,
    { id: 'projects', label: 'Projects & Timesheets', icon: '◎' },
    { id: 'servicejobs', label: 'Service Job Cards', icon: '🔧' },
    { id: 'subscriptions', label: 'Subscription Billing', icon: '🔄' },
    null,
    { id: 'bom', label: 'Bill of Materials', icon: '📋' },
    { id: 'mrp', label: 'MRP Planner', icon: '🏭' },
    { id: 'qc', label: 'Quality Control', icon: '✅' },
    { id: 'fieldsales', label: 'Field Sales & Beats', icon: '🗺' },
    null,
    { id: 'cashforecast', label: 'Cash Flow Forecast', icon: '📈' },
    { id: 'profitability', label: 'Profitability Analysis', icon: '💰' },
    { id: 'smartreorder', label: 'Smart Reorder', icon: '📦' },
    null,
    { id: 'caexport', label: 'CA Export', icon: '📤' },
    { id: 'boardreports', label: 'Board Reports', icon: '📊' },
    { id: 'selfservice', label: 'Employee Self-Service', icon: '👤' },
    { id: 'whatsapp', label: 'WhatsApp Docs', icon: '💬' },
    { id: 'leavemgmt', label: 'Leave Management', icon: '📅' },
    null,
    { id: 'docclassify', label: 'Doc Auto-Classify', icon: '🤖' },
    { id: 'salarycheck', label: 'Salary Benchmarking', icon: '💵' },
    { id: 'vendorportal', label: 'Vendor Portal', icon: '🤝' },
    null,
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  // ── theme overrides for dark mode ──
  const bg = darkMode ? '#0F0D0B' : T.bg;
  const sbBg = darkMode ? '#080604' : T.sb;

  return (
    <div style={{ display: 'flex', height: '100vh', background: bg, fontFamily: f, overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 220, background: sbBg, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', borderRight: `1px solid #2A231D`, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #2A231D' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#FFF', fontFamily: fs, letterSpacing: -0.3 }}>Nexara</div>
          <div style={{ fontSize: 9, color: '#6B5E4E', letterSpacing: 2, fontFamily: mo, marginTop: 1 }}>BUSINESS OS</div>
        </div>
        {/* Company */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #2A231D' }}>
          <div style={{ fontSize: 12, color: '#E5D8C8', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {co.name}
          </div>
          <div style={{ fontSize: 10, color: '#6B5E4E', fontFamily: mo, marginTop: 1 }}>{co.industry}</div>
        </div>
        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {NAV.map((item, i) => {
            if (!item) return <div key={i} style={{ height: 1, background: '#2A231D', margin: '6px 6px' }} />;
            const active = mod === item.id;
            return (
              <button key={item.id} onClick={() => setMod(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                  padding: '7px 10px', borderRadius: 5, border: 'none',
                  background: active ? T.sba : 'transparent',
                  color: active ? '#F5D6B0' : '#9A8674',
                  cursor: 'pointer', textAlign: 'left', fontSize: 12.5, fontFamily: f,
                  fontWeight: active ? 600 : 400, transition: 'all 0.1s',
                  borderLeft: active ? `2px solid ${T.am}` : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.sbh; e.currentTarget.style.color = '#E5D8C8'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#F5D6B0' : '#9A8674'; }}
              >
                <span style={{ fontSize: 14, opacity: 0.8 }}>{item.icon}</span>
                {item.label}
                {item.id === 'inventory' && lowStock.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: T.rd, color: '#FFF', borderRadius: 8, padding: '1px 5px', fontSize: 9, fontFamily: mo }}>
                    {lowStock.length}
                  </span>
                )}
                {item.id === 'hr' && emps.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#334155', color: '#94A3B8', borderRadius: 8, padding: '1px 5px', fontSize: 9, fontFamily: mo }}>
                    {emps.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: darkMode ? '#0F0D0B' : T.bg }}>

        {/* Topbar */}
        <div style={{
          height: 52, display: 'flex', alignItems: 'center', padding: '0 24px',
          background: darkMode ? '#0F0D0B' : T.sf, borderBottom: `1px solid ${T.bd}`,
          gap: 12, flexShrink: 0,
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search anything… (transactions, employees, leads)"
              style={{
                width: '100%', padding: '6px 12px 6px 32px',
                background: T.sf2, border: `1px solid ${T.bd}`, borderRadius: 6,
                color: T.tx, fontSize: 12, fontFamily: f, outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.t4, fontSize: 13 }}>⌕</span>
            {searchRes.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, background: T.sf,
                border: `1px solid ${T.bd}`, borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                zIndex: 200, marginTop: 4, overflow: 'hidden',
              }}>
                {searchRes.map((r, i) => (
                  <div key={i} onClick={() => { setMod(r.mod); setSearchVal(''); setSearchRes([]); }}
                    style={{
                      padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      borderBottom: i < searchRes.length - 1 ? `1px solid ${T.bd}` : 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = T.sf2}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Badge l={r.type} col="neutral" />
                    <span style={{ fontSize: 12, color: T.t2 }}>{r.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* AI Status */}
            <AIStatusPill status={aiStatus} />

            {/* Voice shortcut hint */}
            <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, padding: '3px 8px', background: T.sf2, border: `1px solid ${T.bd}`, borderRadius: 4 }}>
              🎙 Voice
            </div>

            {/* Dark mode */}
            <button onClick={() => setDarkMode(d => !d)}
              style={{
                width: 32, height: 32, borderRadius: 6, background: T.sf2,
                border: `1px solid ${T.bd}`, cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              {darkMode ? '☀' : '◑'}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(n => !n)}
                style={{
                  width: 32, height: 32, borderRadius: 6, background: T.sf2,
                  border: `1px solid ${T.bd}`, cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                }}>
                🔔
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: T.rd, color: '#FFF', borderRadius: '50%',
                    width: 16, height: 16, fontSize: 9, fontFamily: mo,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unread}</span>
                )}
              </button>
              {notifOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, width: 300,
                  background: T.sf, border: `1px solid ${T.bd}`, borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 300, marginTop: 6, overflow: 'hidden',
                }}>
                  <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.bd}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.tx }}>Notifications</span>
                    <button onClick={() => { const n = notifs.map(x => ({ ...x, read: true })); setNotifs(n); }}
                      style={{ fontSize: 10, color: T.t3, background: 'none', border: 'none', cursor: 'pointer' }}>
                      Mark all read
                    </button>
                  </div>
                  {notifs.map(n => (
                    <div key={n.id} onClick={() => { setMod(n.mod); setNotifOpen(false); setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x)); }}
                      style={{
                        padding: '10px 14px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
                        background: n.read ? 'transparent' : T.aml,
                        borderBottom: `1px solid ${T.bd}`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = T.sf2}
                      onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : T.aml}
                    >
                      <span style={{ fontSize: 9, marginTop: 4, color: n.read ? T.t4 : T.am }}>●</span>
                      <span style={{ fontSize: 12, color: T.t2, lineHeight: 1.5 }}>{n.msg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User */}
            <div style={{
              height: 32, padding: '0 12px', borderRadius: 6, background: T.aml,
              border: `1px solid #FED7AA`, display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: T.ac, fontWeight: 600, cursor: 'pointer',
            }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: T.am, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#FFF' }}>
                {(co.name || 'U')[0].toUpperCase()}
              </span>
              {co.name.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Module content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {mod === 'dashboard' && <Dashboard {...{ co, txns, emps, inv, leads, vendors, sales, expenses, profit, gstNet, lowStock, totalPending, salesSpk, expSpk, months, fmt, fmtN, setMod }} />}
          {mod === 'accounting' && <Accounting {...{ txns, saveTxns, fmt, fmtN, fmtD, today, uid, log, GST_RATES, TXN_CATS }} />}
          {mod === 'taxation' && <Taxation {...{ txns, gstOut, gstIn, gstNet, fmt, fmtN }} />}
          {mod === 'cashflow' && <CashFlow {...{ txns, fmt }} />}
          {mod === 'banking' && <Banking {...{ txns, saveTxns, fmt, fmtN, fmtD, today, uid, log }} />}
          {mod === 'hr' && <HR {...{ emps, saveEmps, fmt, fmtN, fmtD, today, uid, log, calcPay, ROLES, co }} />}
          {mod === 'attendance' && <Attendance {...{ emps }} />}
          {mod === 'recruitment' && <Recruitment {...{ jobs, saveJobs, uid, log }} />}
          {mod === 'inventory' && <Inventory {...{ inv, saveInv, vendors, fmt, fmtN, today, uid, log }} />}
          {mod === 'vendors' && <Vendors {...{ vendors, saveVendors, fmt, fmtN, today, uid, log }} />}
          {mod === 'production' && <Production {...{ jobs, saveJobs, inv, fmt, uid, log }} />}
          {mod === 'crm' && <CRM {...{ leads, saveLeads, fmt, fmtN, today, uid, log }} />}
          {mod === 'proposals' && <Proposals {...{ leads, vendors, co, fmt }} />}
          {mod === 'legal' && <Legal {...{ co }} />}
          {mod === 'contracts' && <Contracts {...{ contracts, saveContracts, vendors, leads, fmtD, today, uid, log }} />}
          {mod === 'documents' && <Documents {...{ docs, saveDocs, uid, log }} />}
          {mod === 'analytics' && <Analytics {...{ txns, emps, inv, leads, fmt, fmtN, months }} />}
          {mod === 'reports' && <Reports {...{ txns, emps, inv, vendors, leads, contracts, co, fmt, fmtN, calcPay }} />}
          {mod === 'comms' && <Comms {...{ co, vendors, leads, txns, fmt }} />}
          {mod === 'audit' && <AuditLog {...{ audit, fmtD }} />}
          {mod === 'settings' && <Settings {...{ co, setCo, save, load }} />}
          {mod === 'tasks' && <TaskManager emps={emps} leads={leads} vendors={vendors} co={co} />}
          {mod === 'workflow' && <WorkflowAutomation txns={txns} leads={leads} emps={emps} inv={inv} co={co} />}
          {mod === 'users' && <UserManagement co={co} />}
          {mod === 'projects' && <Projects emps={emps} co={co} />}
          {mod === 'servicejobs' && <ServiceJobCards inv={inv} co={co} />}
          {mod === 'subscriptions' && <SubscriptionBilling co={co} fmtN={fmtN} fmt={fmt} />}
          {mod === 'bom' && <BOMManager inv={inv} co={co} />}
          {mod === 'mrp' && (() => { const [boms] = [JSON.parse(localStorage.getItem('nx_boms') || '[]')]; return <MRPPlanner inv={inv} boms={boms} saveInv={saveInv} co={co} />; })()}
          {mod === 'qc' && <QualityControl inv={inv} vendors={vendors} co={co} />}
          {mod === 'fieldsales' && <FieldSales emps={emps} leads={leads} co={co} />}
          {mod === 'cashforecast' && <CashFlowForecast txns={txns} emps={emps} co={co} />}
          {mod === 'profitability' && <ProfitabilityAnalysis txns={txns} inv={inv} co={co} />}
          {mod === 'smartreorder' && <SmartReorder inv={inv} saveInv={saveInv} vendors={vendors} txns={txns} co={co} />}
          {mod === 'caexport' && <CAExport txns={txns} emps={emps} inv={inv} vendors={vendors} co={co} calcPay={calcPay} />}
          {mod === 'boardreports' && <BoardReports txns={txns} emps={emps} inv={inv} leads={leads} contracts={contracts} co={co} calcPay={calcPay} fmt={fmt} fmtN={fmtN} />}
          {mod === 'selfservice' && <EmployeeSelfService emps={emps} co={co} calcPay={calcPay} />}
          {mod === 'whatsapp' && <WhatsAppDocs txns={txns} leads={leads} vendors={vendors} co={co} fmtN={fmtN} fmt={fmt} />}
          {mod === 'leavemgmt' && <LeaveManagement emps={emps} co={co} />}
          {mod === 'docclassify' && <DocAutoClassify co={co} />}
          {mod === 'salarycheck' && <SalaryBenchmark emps={emps} co={co} />}
          {mod === 'vendorportal' && <VendorPortal vendors={vendors} txns={txns} co={co} fmtN={fmtN} fmtD={fmtD} />}
          {mod === 'invoices' && <InvoiceGenerator {...{ co, leads, vendors }} />}
          {mod === 'assets' && <Assets co={co} />}
          {mod === 'goals' && <Goals co={co} />}
          {mod === 'risk' && <Risk co={co} />}
          {mod === 'payrollrun' && <PayrollRun {...{ emps, calcPay, co }} />}
          {mod === 'suppliercomp' && <SupplierComparison vendors={vendors} />}
          {mod === 'debttender' && <DebtTender {...{ co, leads, vendors }} />}
          {mod === 'training' && <Training emps={emps} co={co} />}
          {mod === 'regulatoryqa' && <RegulatoryQA co={co} />}
          {mod === 'insurance' && <Insurance co={co} />}
          {mod === 'performance' && <Performance emps={emps} co={co} />}
          {mod === 'quotations' && <QuotationsChallan co={co} vendors={vendors} leads={leads} fmt={fmt} fmtN={fmtN} />}
          {mod === 'cdnotes' && <CreditDebitNotes co={co} fmtN={fmtN} />}
          {mod === 'pricelist' && <PriceList inv={inv} fmtN={fmtN} />}
          {mod === 'pdc' && <PDCTracker fmtN={fmtN} fmtD={fmtD} />}
          {mod === 'outstanding' && <OutstandingManager txns={txns} fmt={fmt} fmtN={fmtN} fmtD={fmtD} />}
          {mod === 'depreciation' && <DepreciationChart fmt={fmt} fmtN={fmtN} />}
          {mod === 'nonmoving' && <NonMovingStock inv={inv} txns={txns} fmt={fmt} />}
          {mod === 'pharmacy' && <PharmacyModule co={co} />}
          {mod === 'jewellery' && <JewelleryModule co={co} />}
        </div>
      </div>

      {/* AI Assistant */}
      <VoicePanel
        co={co} txns={txns} saveTxns={saveTxns}
        emps={emps} saveEmps={saveEmps}
        inv={inv} saveInv={saveInv}
        leads={leads} saveLeads={saveLeads}
        setMod={setMod}
        sales={sales} expenses={expenses} profit={profit} gstNet={gstNet}
      />
      <AIPanel co={co} txns={txns} emps={emps} inv={inv} leads={leads} sales={sales} expenses={expenses} profit={profit} gstNet={gstNet} fmt={fmt} />
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ co, txns, emps, inv, leads, sales, expenses, profit, gstNet, lowStock, totalPending, salesSpk, expSpk, months, fmt, fmtN, setMod }) {
  const openLeads = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost');
  const wonLeads = leads.filter(l => l.stage === 'Won');

  return (
    <div>
      <SHdr title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${co.name.split(' ')[0]}`}
        sub={`${co.industry} · ${co.city}, ${co.state} · FY ${co.fy}`} />

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <KPI label="Total Revenue" value={fmt(sales)} sub={`${txns.filter(t=>t.type==='income').length} transactions`} ac={T.gn} />
        <KPI label="Net Profit" value={fmt(profit)} sub={profit >= 0 ? 'Positive margin' : 'Review expenses'} ac={profit >= 0 ? T.gn : T.rd} />
        <KPI label="GST Payable" value={fmt(gstNet)} sub="Output − Input tax" ac={T.am} />
        <KPI label="Pending Dues" value={fmt(totalPending)} sub={`${txns.filter(t=>t.status==='pending').length} entries`} ac={T.bl} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <Card>
          <CardHdr>Revenue Trend</CardHdr>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {months.map((m, i) => (
              <div key={m} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 9, color: T.t4, fontFamily: mo }}>{m}</div>
              </div>
            ))}
          </div>
          <Sparkline vals={salesSpk} color={T.gn} h={56} />
        </Card>
        <Card>
          <CardHdr>Expense Trend</CardHdr>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {months.map(m => (
              <div key={m} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 9, color: T.t4, fontFamily: mo }}>{m}</div>
              </div>
            ))}
          </div>
          <Sparkline vals={expSpk} color={T.rd} h={56} />
        </Card>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {/* Recent Transactions */}
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHdr action={<button onClick={() => setMod('accounting')} style={{ fontSize: 11, color: T.am, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>}>
            Recent Transactions
          </CardHdr>
          {txns.length === 0 ? (
            <div style={{ color: T.t4, fontSize: 12, textAlign: 'center', padding: '24px 0', fontFamily: mo }}>No transactions yet. Add one in Accounting.</div>
          ) : txns.slice(0, 6).map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${T.sf2}` }}>
              <div>
                <div style={{ fontSize: 13, color: T.tx, fontWeight: 500 }}>{t.party || t.note}</div>
                <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, marginTop: 2 }}>{t.cat} · {fmtD(t.date)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.type === 'income' ? T.gn : T.rd }}>
                  {t.type === 'income' ? '+' : '−'}{fmtN(t.amount)}
                </div>
                <Badge l={t.status || 'cleared'} col={t.status === 'pending' ? 'amber' : 'green'} />
              </div>
            </div>
          ))}
        </Card>

        {/* Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <CardHdr action={<button onClick={() => setMod('inventory')} style={{ fontSize: 11, color: T.am, background: 'none', border: 'none', cursor: 'pointer' }}>View →</button>}>
              Low Stock Alerts
            </CardHdr>
            {lowStock.length === 0 ? (
              <div style={{ fontSize: 12, color: T.t4, fontFamily: mo, textAlign: 'center', padding: '12px 0' }}>All stock levels OK</div>
            ) : lowStock.slice(0, 4).map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${T.sf2}` }}>
                <span style={{ fontSize: 12, color: T.t2 }}>{i.name}</span>
                <Badge l={`${i.qty} left`} col="red" />
              </div>
            ))}
          </Card>
          <Card>
            <CardHdr>Team & Pipeline</CardHdr>
            <StatRow label="Employees" value={emps.length} />
            <StatRow label="Active Leads" value={openLeads.length} />
            <StatRow label="Deals Won" value={wonLeads.length} />
            <StatRow label="Vendors" value={leads.length} />
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── ACCOUNTING ────────────────────────────────────────────────────────────────
function Accounting({ txns, saveTxns, fmt, fmtN, fmtD, today, uid, log, GST_RATES, TXN_CATS }) {
  const [tab, setTab] = useState('ledger');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ type: 'income', date: today(), party: '', note: '', cat: TXN_CATS[0], amount: '', gst: '18', hsn: '', status: 'cleared', rcm: false });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const sales = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const exp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const gstOut = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount) * Number(t.gst || 0) / 100, 0);
  const gstIn = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount) * Number(t.gst || 0) / 100, 0);

  const openAdd = (t) => {
    if (t) {
      setForm({ type: t.type, date: t.date, party: t.party || '', note: t.note || '', cat: t.cat, amount: t.amount, gst: t.gst || '18', hsn: t.hsn || '', status: t.status || 'cleared' });
      setEditId(t.id);
    } else {
      setForm({ type: 'income', date: today(), party: '', note: '', cat: TXN_CATS[0], amount: '', gst: '18', hsn: '', status: 'cleared', rcm: false });
      setEditId(null);
    }
    setShowAdd(true);
  };

  const save = () => {
    if (!form.amount || !form.date) return;
    if (editId) {
      const updated = txns.map(t => t.id === editId ? { ...t, ...form } : t);
      saveTxns(updated); log('Edited transaction', form.party || form.note);
    } else {
      const entry = { id: uid(), ...form };
      saveTxns([entry, ...txns]); log('Added transaction', form.party || form.note);
    }
    setShowAdd(false);
  };

  const del = (id) => { saveTxns(txns.filter(t => t.id !== id)); log('Deleted transaction', id); };

  return (
    <div>
      <SHdr title="Accounting" sub="Ledger, P&L, and GST — all computed live from your entries"
        action={<BtnP onClick={() => openAdd(null)}>+ Add Entry</BtnP>} />
      <Tabs tabs={[{id:'ledger',label:'Ledger'},{id:'pl',label:'P & L Summary'},{id:'bs',label:'Balance Sheet'},{id:'gst',label:'GST Draft'},{id:'hsn',label:'HSN Lookup'}]} active={tab} onChange={setTab} />

      {tab === 'ledger' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            <KPI label="Total Income" value={fmt(sales)} sub={`${txns.filter(t=>t.type==='income').length} entries`} ac={T.gn} />
            <KPI label="Total Expense" value={fmt(exp)} sub={`${txns.filter(t=>t.type==='expense').length} entries`} ac={T.rd} />
            <KPI label="Net P&L" value={fmt(sales - exp)} sub={sales > 0 ? `${Math.round((sales-exp)/sales*100)}% margin` : '—'} ac={T.am} />
          </div>
          {txns.length === 0 ? (
            <InfoBox type="info">No transactions yet. Click "+ Add Entry" to get started.</InfoBox>
          ) : (
            <Table cols="100px 1fr 1fr 80px 90px 90px 80px 80px">
              {[<TH key="h">Date</TH>, <TH key="h2">Party / Note</TH>, <TH key="h3">Category</TH>, <TH key="h4">GST%</TH>, <TH key="h5" right>Amount</TH>, <TH key="h6" right>GST Amt</TH>, <TH key="h7">Status</TH>, <TH key="h8">Action</TH>]}
              {txns.map(t => (
                <TRow key={t.id} cols="100px 1fr 1fr 80px 90px 90px 80px 80px">
                  <TD mono muted>{fmtD(t.date)}</TD>
                  <div>
                    <TD bold={t.type==='income'}>{t.party || '—'}</TD>
                    {t.note && <div style={{fontSize:11,color:T.t3}}>{t.note}</div>}
                  </div>
                  <TD muted>{t.cat}</TD>
                  <TD mono muted>{t.gst}%</TD>
                  <TD right color={t.type==='income'?T.gn:T.rd} bold>{t.type==='income'?'+':'-'}{fmtN(t.amount)}</TD>
                  <TD right mono muted>{fmtN(Number(t.amount)*Number(t.gst||0)/100)}</TD>
                  <Badge l={t.status||'cleared'} col={t.status==='pending'?'amber':'green'} />
                  <div style={{display:'flex',gap:6}}>
                    <BtnG small onClick={()=>openAdd(t)}>Edit</BtnG>
                    <BtnDanger small onClick={()=>del(t.id)}>Del</BtnDanger>
                  </div>
                </TRow>
              ))}
            </Table>
          )}
        </div>
      )}

      {tab === 'pl' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card>
            <CardHdr>Income Statement</CardHdr>
            {TXN_CATS.filter(c => ['Sales','Other Income'].includes(c)).map(c => {
              const amt = txns.filter(t=>t.type==='income'&&t.cat===c).reduce((s,t)=>s+Number(t.amount),0);
              return <StatRow key={c} label={c} value={fmtN(amt)} />;
            })}
            <StatRow label="TOTAL INCOME" value={fmtN(sales)} highlight color={T.gn} />
            <div style={{marginTop:12}} />
            {TXN_CATS.filter(c=>!['Sales','Other Income'].includes(c)).map(c => {
              const amt = txns.filter(t=>t.type==='expense'&&t.cat===c).reduce((s,t)=>s+Number(t.amount),0);
              return <StatRow key={c} label={c} value={fmtN(amt)} color={T.rd} />;
            })}
            <StatRow label="TOTAL EXPENSE" value={fmtN(exp)} highlight color={T.rd} />
            <StatRow label="NET PROFIT / LOSS" value={fmtN(sales-exp)} highlight color={sales-exp>=0?T.gn:T.rd} />
          </Card>
          <Card>
            <CardHdr>Key Ratios</CardHdr>
            <StatRow label="Gross Margin" value={sales > 0 ? `${Math.round((sales-exp)/sales*100)}%` : '—'} />
            <StatRow label="Expense Ratio" value={sales > 0 ? `${Math.round(exp/sales*100)}%` : '—'} />
            <StatRow label="Income Entries" value={txns.filter(t=>t.type==='income').length} />
            <StatRow label="Expense Entries" value={txns.filter(t=>t.type==='expense').length} />
            <StatRow label="Pending Dues" value={fmtN(txns.filter(t=>t.status==='pending').reduce((s,t)=>s+Number(t.amount),0))} />
            <StatRow label="Cleared Entries" value={txns.filter(t=>t.status==='cleared').length} />
          </Card>
        </div>
      )}

      {tab === 'bs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card>
            <CardHdr>Assets Side</CardHdr>
            <div style={{ fontSize: 11, color: T.t3, fontFamily: mo, marginBottom: 10 }}>CURRENT ASSETS</div>
            <StatRow label="Cash & Bank Balance" value={fmtN(txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0) - txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0))} />
            <StatRow label="Accounts Receivable (Pending)" value={fmtN(txns.filter(t=>t.type==='income'&&t.status==='pending').reduce((s,t)=>s+Number(t.amount),0))} />
            <StatRow label="Inventory Value" value={fmtN(0)} muted />
            <StatRow label="TOTAL CURRENT ASSETS" value={fmtN(Math.max(0, txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0) - txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)))} highlight />
            <div style={{ fontSize: 11, color: T.t3, fontFamily: mo, margin: '14px 0 8px' }}>LIABILITIES</div>
            <StatRow label="Accounts Payable (Pending)" value={fmtN(txns.filter(t=>t.type==='expense'&&t.status==='pending').reduce((s,t)=>s+Number(t.amount),0))} />
            <StatRow label="GST Payable" value={fmtN(Math.max(0, txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount)*Number(t.gst||0)/100,0) - txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount)*Number(t.gst||0)/100,0)))} />
            <StatRow label="TOTAL LIABILITIES" value={fmtN(txns.filter(t=>t.status==='pending').reduce((s,t)=>s+Number(t.amount),0))} highlight />
          </Card>
          <Card>
            <CardHdr>Equity & Summary</CardHdr>
            <div style={{ fontSize: 11, color: T.t3, fontFamily: mo, marginBottom: 10 }}>EQUITY</div>
            <StatRow label="Retained Earnings (Net Profit)" value={fmtN(txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0) - txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0))} />
            <StatRow label="Total Transactions" value={txns.length} />
            <StatRow label="Income Entries" value={txns.filter(t=>t.type==='income').length} />
            <StatRow label="Expense Entries" value={txns.filter(t=>t.type==='expense').length} />
            <div style={{ marginTop: 16 }}>
              <InfoBox type="info">This is a simplified balance sheet view derived from your ledger. For a formal audited balance sheet, export your data and have your CA prepare the full statement.</InfoBox>
            </div>
          </Card>
        </div>
      )}

      {tab === 'gst' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card>
            <CardHdr>GSTR-3B Draft</CardHdr>
            <InfoBox type="warning">Prepare and verify with your CA before filing. This is a computation, not a submission.</InfoBox>
            <div style={{marginTop:16}}>
              <StatRow label="3.1 — Outward Taxable Supplies (Sales)" value={fmtN(sales)} />
              <StatRow label="Output GST Collected" value={fmtN(gstOut)} color={T.rd} />
              <StatRow label="2A — Inward Supplies (Purchases)" value={fmtN(exp)} />
              <StatRow label="Input Tax Credit (ITC)" value={fmtN(gstIn)} color={T.gn} />
              <StatRow label="NET GST PAYABLE" value={fmtN(gstOut - gstIn)} highlight color={gstOut-gstIn>=0?T.rd:T.gn} />
            </div>
          </Card>
          <Card>
            <CardHdr>GST by Rate Slab</CardHdr>
            {GST_RATES.map(r => {
              const out = txns.filter(t=>t.type==='income'&&t.gst===r).reduce((s,t)=>s+Number(t.amount)*Number(r)/100,0);
              const inn = txns.filter(t=>t.type==='expense'&&t.gst===r).reduce((s,t)=>s+Number(t.amount)*Number(r)/100,0);
              return (
                <div key={r} style={{padding:'8px 0',borderBottom:`1px solid ${T.sf2}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:600,color:T.tx}}>{r}% Slab</span>
                    <Badge l={`Net: ${fmtN(out-inn)}`} col={out-inn>0?'amber':'green'} />
                  </div>
                  <div style={{display:'flex',gap:24}}>
                    <span style={{fontSize:11,color:T.t3}}>Out: {fmtN(out)}</span>
                    <span style={{fontSize:11,color:T.t3}}>In: {fmtN(inn)}</span>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {tab === 'hsn' && (
        <Card>
          <CardHdr>HSN / SAC Code Reference</CardHdr>
          <InfoBox type="info">Common HSN codes for quick reference. Always verify with your CA for your specific products.</InfoBox>
          <div style={{marginTop:16}}>
            {[
              ['1001','Wheat and meslin','5%'], ['2201','Water, mineral water','12%'], ['3004','Medicaments','12%'],
              ['4901','Books, newspapers','Nil'], ['6101','Men\'s overcoats','12%'], ['7208','Flat-rolled iron/steel','18%'],
              ['8471','Computers / laptops','18%'], ['8517','Mobile phones','18%'], ['8703','Motor cars','28%+cess'],
              ['9403','Furniture','18%'], ['9999','Services - General','18%'], ['998314','IT consulting','18%'],
            ].map(([code, desc, rate]) => (
              <div key={code} style={{display:'grid',gridTemplateColumns:'100px 1fr 80px',padding:'9px 0',borderBottom:`1px solid ${T.sf2}`,alignItems:'center'}}>
                <span style={{fontSize:13,fontFamily:mo,color:T.am,fontWeight:600}}>{code}</span>
                <span style={{fontSize:13,color:T.t2}}>{desc}</span>
                <Badge l={rate} col={rate==='Nil'?'green':'amber'} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {showAdd && (
        <Modal title={editId ? 'Edit Transaction' : 'Add Transaction'} onClose={() => setShowAdd(false)}>
          <div style={{display:'grid',gap:14}}>
            <div style={{display:'flex',gap:0}}>
              {['income','expense'].map(t => (
                <button key={t} onClick={() => up('type', t)}
                  style={{flex:1,padding:'9px',border:`1px solid ${T.bd}`,background:form.type===t?(t==='income'?T.gl:T.rl):'transparent',color:t==='income'?T.gn:T.rd,cursor:'pointer',fontFamily:f,fontSize:13,fontWeight:form.type===t?700:400,borderRadius:t==='income'?'6px 0 0 6px':'0 6px 6px 0'}}>
                  {t === 'income' ? '↑ Income' : '↓ Expense'}
                </button>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Inp label="Date *" type="date" value={form.date} onChange={e=>up('date',e.target.value)} />
              <Inp label="Amount (₹) *" type="number" value={form.amount} onChange={e=>up('amount',e.target.value)} placeholder="50000" />
            </div>
            <Inp label="Party Name" value={form.party} onChange={e=>up('party',e.target.value)} placeholder="Client / Vendor name" />
            <Inp label="Note / Description" value={form.note} onChange={e=>up('note',e.target.value)} placeholder="Invoice #, purpose…" />
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <Sel label="Category" value={form.cat} onChange={e=>up('cat',e.target.value)} options={TXN_CATS} />
              <Sel label="GST Rate %" value={form.gst} onChange={e=>up('gst',e.target.value)} options={GST_RATES} />
              <Sel label="Status" value={form.status} onChange={e=>up('status',e.target.value)} options={['cleared','pending']} />
            </div>
            <Inp label="HSN / SAC Code" value={form.hsn} onChange={e=>up('hsn',e.target.value)} placeholder="8471" />
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'4px 0'}}>
              <input type="checkbox" id="rcm" checked={form.rcm||false} onChange={e=>up('rcm',e.target.checked)} style={{accentColor:T.am,width:16,height:16}} />
              <label htmlFor="rcm" style={{fontSize:13,color:T.t2,cursor:'pointer'}}>RCM Applicable (Reverse Charge Mechanism)</label>
            </div>
            {form.amount && form.gst && (
              <InfoBox type="info">GST amount: {fmtN(Number(form.amount) * Number(form.gst) / 100)} at {form.gst}%</InfoBox>
            )}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:4}}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={save} disabled={!form.amount || !form.date}>{editId ? 'Save Changes' : 'Add Transaction'}</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TAXATION ──────────────────────────────────────────────────────────────────
function Taxation({ txns, gstOut, gstIn, gstNet, fmt, fmtN }) {
  const filings = [
    { name: 'GSTR-1', freq: 'Monthly (11th)', status: 'due', desc: 'Outward supply details', due: '11 Jul 2025' },
    { name: 'GSTR-3B', freq: 'Monthly (20th)', status: 'due', desc: 'Summary return + tax payment', due: '20 Jul 2025' },
    { name: 'GSTR-9', freq: 'Annual (31 Dec)', status: 'upcoming', desc: 'Annual GST return', due: '31 Dec 2025' },
    { name: 'TDS Return', freq: 'Quarterly', status: 'filed', desc: 'Form 26Q — salary + professional', due: '15 May 2025' },
    { name: 'Advance Tax', freq: 'Quarterly', status: 'upcoming', desc: '15 Sep installment due', due: '15 Sep 2025' },
    { name: 'ITR Filing', freq: 'Annual (31 Jul)', status: 'upcoming', desc: 'Income Tax Return', due: '31 Jul 2025' },
    { name: 'GSTR-2A Recon', freq: 'Monthly', status: 'upcoming', desc: 'Inward supply reconciliation with purchase register', due: 'Monthly review' },
    { name: 'GSTR-4', freq: 'Annual', status: 'upcoming', desc: 'Composition dealer annual return', due: '30 Apr 2025' },
  ];

  return (
    <div>
      <SHdr title="Taxation & GST" sub="Compliance calendar, return preparation, and tax liability — all computed privately" />
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        <KPI label="Output GST (Collected)" value={fmtN(gstOut)} sub="From sales invoices" ac={T.rd} />
        <KPI label="Input Tax Credit" value={fmtN(gstIn)} sub="From purchase invoices" ac={T.gn} />
        <KPI label="Net GST Payable" value={fmtN(gstNet)} sub={gstNet >= 0 ? 'Amount to deposit' : 'Carry forward credit'} ac={T.am} />
      </div>
      <InfoBox type="warning">Nexara prepares your data. Always have your CA review before filing any return.</InfoBox>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 20 }}>
        <Card>
          <CardHdr>RCM — Reverse Charge Mechanism</CardHdr>
          <InfoBox type="info">Under RCM, YOU pay GST instead of the supplier. Applicable on: GTA services, legal fees from advocates, import of services, specified goods from unregistered dealers.</InfoBox>
          <div style={{ marginTop: 12 }}>
            <StatRow label="RCM Transactions" value={txns.filter(t=>t.rcm).length || 0} />
            <StatRow label="RCM GST Liability" value={fmtN(txns.filter(t=>t.rcm).reduce((s,t)=>s+Number(t.amount)*Number(t.gst||0)/100,0))} color={T.rd} />
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: T.t3, lineHeight: 1.7 }}>
            To record RCM entries: Add a transaction in Accounting, tick RCM applicable. The GST will be shown as both output (liability) and input (ITC) in your GSTR-3B.
          </div>
        </Card>
        <Card>
          <CardHdr>E-Way Bill Tracking</CardHdr>
          <InfoBox type="info">E-Way Bill required for goods movement {'>'} ₹50,000 in value. Generate at ewaybillgst.gov.in using your GSTIN.</InfoBox>
          <div style={{ marginTop: 12 }}>
            {[
              ['Threshold', '₹50,000 per consignment'],
              ['Validity (up to 100km)', '1 day'],
              ['Validity (100–300km)', '3 days'],
              ['Validity (300–500km)', '5 days'],
              ['Generated by', 'Supplier, recipient, or transporter'],
              ['Portal', 'ewaybillgst.gov.in'],
            ].map(([l,v]) => <StatRow key={l} label={l} value={v} />)}
          </div>
        </Card>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14,marginTop:20}}>
        {filings.map(f => (
          <Card key={f.name}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:T.tx,fontFamily:mo}}>{f.name}</div>
                <div style={{fontSize:11,color:T.t3,marginTop:2}}>{f.desc}</div>
              </div>
              <Badge l={f.status.toUpperCase()} col={f.status==='filed'?'green':f.status==='due'?'red':'amber'} />
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
              <span style={{color:T.t3}}>{f.freq}</span>
              <span style={{color:T.tx,fontFamily:mo}}>Due: {f.due}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── CASH FLOW ─────────────────────────────────────────────────────────────────
function CashFlow({ txns, fmt }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const byMonth = months.map((m, mi) => {
    const inc = txns.filter(t => t.type==='income' && new Date(t.date).getMonth()===mi).reduce((s,t)=>s+Number(t.amount),0);
    const exp = txns.filter(t => t.type==='expense' && new Date(t.date).getMonth()===mi).reduce((s,t)=>s+Number(t.amount),0);
    return { m, inc, exp, net: inc - exp };
  });
  const maxVal = Math.max(...byMonth.map(b => Math.max(b.inc, b.exp)), 1);

  return (
    <div>
      <SHdr title="Cash Flow" sub="Monthly inflow vs outflow — computed from your accounting ledger" />
      <Card style={{marginBottom:20}}>
        <CardHdr>Monthly Cash Flow (Current Year)</CardHdr>
        <div style={{overflowX:'auto'}}>
          <div style={{display:'flex',gap:8,minWidth:600,padding:'8px 0',alignItems:'flex-end',height:160}}>
            {byMonth.map(({m,inc,exp,net}) => (
              <div key={m} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                <div style={{display:'flex',gap:2,alignItems:'flex-end',height:120}}>
                  <div style={{width:12,background:T.gn+'88',borderRadius:'2px 2px 0 0',height:`${(inc/maxVal)*100}%`,minHeight:inc>0?2:0}} title={`Income: ${fmt(inc)}`} />
                  <div style={{width:12,background:T.rd+'88',borderRadius:'2px 2px 0 0',height:`${(exp/maxVal)*100}%`,minHeight:exp>0?2:0}} title={`Expense: ${fmt(exp)}`} />
                </div>
                <div style={{fontSize:9,color:T.t4,fontFamily:mo}}>{m}</div>
                <div style={{fontSize:9,color:net>=0?T.gn:T.rd,fontFamily:mo,fontWeight:600}}>{net===0?'—':fmt(net)}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:16,marginTop:8}}>
          <span style={{fontSize:11,color:T.t3,display:'flex',alignItems:'center',gap:4}}><span style={{width:10,height:10,background:T.gn+'88',display:'inline-block',borderRadius:2}} /> Income</span>
          <span style={{fontSize:11,color:T.t3,display:'flex',alignItems:'center',gap:4}}><span style={{width:10,height:10,background:T.rd+'88',display:'inline-block',borderRadius:2}} /> Expense</span>
        </div>
      </Card>
      <Table cols="80px 1fr 1fr 1fr">
        {[<TH key="h">Month</TH>, <TH key="h2" right>Income</TH>, <TH key="h3" right>Expense</TH>, <TH key="h4" right>Net</TH>]}
        {byMonth.map(({m,inc,exp,net}) => (
          <TRow key={m} cols="80px 1fr 1fr 1fr">
            <TD mono>{m}</TD>
            <TD right color={T.gn}>{inc>0?fmt(inc):'—'}</TD>
            <TD right color={T.rd}>{exp>0?fmt(exp):'—'}</TD>
            <TD right color={net>=0?T.gn:T.rd} bold>{net!==0?fmt(net):'—'}</TD>
          </TRow>
        ))}
      </Table>
    </div>
  );
}

// ─── BANKING ───────────────────────────────────────────────────────────────────
function Banking({ txns, saveTxns, fmt, fmtN, fmtD, today, uid, log }) {
  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState([]);

  const parseCSV = () => {
    const lines = csvText.trim().split('\n').slice(1);
    const rows = lines.map(l => {
      const p = l.split(',');
      return { date: p[0]?.trim(), desc: p[1]?.trim(), credit: parseFloat(p[2]) || 0, debit: parseFloat(p[3]) || 0 };
    }).filter(r => r.date && (r.credit || r.debit));
    setParsed(rows);
  };

  const importAll = () => {
    const newTxns = parsed.map(r => ({
      id: uid(), type: r.credit > 0 ? 'income' : 'expense',
      date: r.date, party: r.desc, note: 'Imported from bank', amount: r.credit || r.debit,
      gst: '0', cat: 'Other Income', status: 'cleared',
    }));
    saveTxns([...newTxns, ...txns]);
    log('Bank import', `${newTxns.length} transactions`);
    setShowImport(false); setCsvText(''); setParsed([]);
  };

  const bankTxns = txns.slice(0, 20);

  return (
    <div>
      <SHdr title="Banking" sub="Bank statement view and CSV import for reconciliation"
        action={<BtnP onClick={() => setShowImport(true)}>↑ Import CSV</BtnP>} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        <KPI label="Total Credits" value={fmt(txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0))} sub="All income entries" ac={T.gn} />
        <KPI label="Total Debits" value={fmt(txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0))} sub="All expense entries" ac={T.rd} />
        <KPI label="Net Balance" value={fmt(txns.reduce((s,t)=>s+(t.type==='income'?1:-1)*Number(t.amount),0))} sub="Credits − Debits" ac={T.am} />
      </div>
      <Table cols="100px 1fr 100px 100px 80px">
        {[<TH key="h">Date</TH>,<TH key="h2">Description</TH>,<TH key="h3" right>Credit</TH>,<TH key="h4" right>Debit</TH>,<TH key="h5">Status</TH>]}
        {bankTxns.map(t => (
          <TRow key={t.id} cols="100px 1fr 100px 100px 80px">
            <TD mono muted>{fmtD(t.date)}</TD>
            <TD>{t.party || t.note}</TD>
            <TD right color={T.gn}>{t.type==='income'?fmtN(t.amount):'—'}</TD>
            <TD right color={T.rd}>{t.type==='expense'?fmtN(t.amount):'—'}</TD>
            <Badge l="Matched" col="green" />
          </TRow>
        ))}
      </Table>

      {showImport && (
        <Modal title="Import Bank Statement (CSV)" onClose={() => setShowImport(false)} wide>
          <InfoBox type="info">CSV format: Date, Description, Credit, Debit — one row per line. First row = header.</InfoBox>
          <div style={{marginTop:14}}>
            <TextArea label="Paste CSV content" value={csvText} onChange={e=>setCsvText(e.target.value)}
              placeholder="Date,Description,Credit,Debit&#10;01-Jul-2025,Customer Payment,50000,&#10;05-Jul-2025,Rent Paid,,25000" rows={8} />
          </div>
          {parsed.length > 0 && (
            <div style={{marginTop:14}}>
              <InfoBox type="success">{parsed.length} transactions parsed and ready to import.</InfoBox>
              <div style={{maxHeight:180,overflowY:'auto',marginTop:10}}>
                {parsed.map((r,i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${T.sf2}`,fontSize:12}}>
                    <span style={{color:T.t3,fontFamily:mo}}>{r.date}</span>
                    <span style={{color:T.t2,flex:1,padding:'0 12px'}}>{r.desc}</span>
                    {r.credit > 0 && <span style={{color:T.gn,fontFamily:mo}}>+{fmtN(r.credit)}</span>}
                    {r.debit > 0 && <span style={{color:T.rd,fontFamily:mo}}>−{fmtN(r.debit)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{display:'flex',gap:8,marginTop:16,justifyContent:'flex-end'}}>
            <BtnG onClick={() => setShowImport(false)}>Cancel</BtnG>
            {parsed.length === 0 ? <BtnP onClick={parseCSV}>Parse CSV</BtnP> : <BtnP onClick={importAll}>Import {parsed.length} Rows</BtnP>}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── HR & PAYROLL ──────────────────────────────────────────────────────────────
function HR({ emps, saveEmps, fmt, fmtN, fmtD, today, uid, log, calcPay, ROLES, co }) {
  const [tab, setTab] = useState('employees');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [slipFor, setSlipFor] = useState(null);
  const [form, setForm] = useState({ name:'', role:'', dept:'', ctc:'', doj:today(), email:'', phone:'', status:'Active' });
  const up = (k,v) => setForm(p=>({...p,[k]:v}));

  const openAdd = (e) => {
    if (e) { setForm({name:e.name,role:e.role,dept:e.dept||'',ctc:e.ctc,doj:e.doj,email:e.email||'',phone:e.phone||'',status:e.status||'Active'}); setEditId(e.id); }
    else { setForm({name:'',role:'',dept:'',ctc:'',doj:today(),email:'',phone:'',status:'Active'}); setEditId(null); }
    setShowAdd(true);
  };

  const saveEmp = () => {
    if (!form.name || !form.ctc) return;
    if (editId) { saveEmps(emps.map(e=>e.id===editId?{...e,...form}:e)); log('Edited employee', form.name); }
    else { saveEmps([{id:uid(),...form},...emps]); log('Added employee', form.name); }
    setShowAdd(false);
  };

  const del = (id) => { saveEmps(emps.filter(e=>e.id!==id)); log('Removed employee', id); };
  const totalCTC = emps.reduce((s,e)=>s+Number(e.ctc||0),0);
  const totalPF = emps.reduce((s,e)=>s+calcPay(e.ctc).pfEr,0);
  const totalESIC = emps.reduce((s,e)=>s+calcPay(e.ctc).esicEr,0);

  return (
    <div>
      <SHdr title="HR & Payroll" sub={`${emps.length} employees · Total CTC: ${fmt(totalCTC)}`}
        action={<BtnP onClick={()=>openAdd(null)}>+ Add Employee</BtnP>} />
      <Tabs tabs={[{id:'employees',label:'Employees'},{id:'payroll',label:'Payroll'},{id:'statutory',label:'Statutory Compliance'}]} active={tab} onChange={setTab} />

      {tab === 'employees' && (
        emps.length === 0 ? <InfoBox type="info">No employees added yet. Click "+ Add Employee" to begin.</InfoBox> :
        <Table cols="1fr 120px 120px 110px 100px 100px 120px">
          {[<TH key="h">Name</TH>,<TH key="h2">Role</TH>,<TH key="h3">Department</TH>,<TH key="h4">DOJ</TH>,<TH key="h5" right>CTC/yr</TH>,<TH key="h6">Status</TH>,<TH key="h7">Actions</TH>]}
          {emps.map(e => (
            <TRow key={e.id} cols="1fr 120px 120px 110px 100px 100px 120px">
              <div>
                <TD bold>{e.name}</TD>
                {e.email && <div style={{fontSize:11,color:T.t3}}>{e.email}</div>}
              </div>
              <TD muted>{e.role}</TD>
              <TD muted>{e.dept||'—'}</TD>
              <TD mono muted>{fmtD(e.doj)}</TD>
              <TD right bold>{fmtN(e.ctc)}</TD>
              <Badge l={e.status||'Active'} col={e.status==='Active'?'green':'neutral'} />
              <div style={{display:'flex',gap:4}}>
                <BtnG small onClick={()=>setSlipFor(e)}>Slip</BtnG>
                <BtnG small onClick={()=>openAdd(e)}>Edit</BtnG>
                <BtnDanger small onClick={()=>del(e.id)}>Del</BtnDanger>
              </div>
            </TRow>
          ))}
        </Table>
      )}

      {tab === 'payroll' && (
        emps.length === 0 ? <InfoBox type="info">Add employees to view payroll breakdown.</InfoBox> :
        <Table cols="1fr 90px 90px 90px 80px 80px 70px 90px">
          {[<TH key="h">Employee</TH>,<TH key="h2" right>Gross</TH>,<TH key="h3" right>PF (Emp)</TH>,<TH key="h4" right>ESIC</TH>,<TH key="h5" right>PT</TH>,<TH key="h6" right>TDS</TH>,<TH key="h7" right>Net</TH>,<TH key="h8" right>CTC</TH>]}
          {emps.map(e => { const p = calcPay(e.ctc); return (
            <TRow key={e.id} cols="1fr 90px 90px 90px 80px 80px 70px 90px">
              <TD bold>{e.name}</TD>
              <TD right mono>{fmtN(p.gross)}</TD>
              <TD right mono muted>{fmtN(p.pfEmp)}</TD>
              <TD right mono muted>{fmtN(p.esic)}</TD>
              <TD right mono muted>{fmtN(p.pt)}</TD>
              <TD right mono muted>{fmtN(p.tds)}</TD>
              <TD right bold color={T.gn}>{fmtN(p.net)}</TD>
              <TD right mono muted>{fmtN(p.monthly)}</TD>
            </TRow>
          );})}
        </Table>
      )}

      {tab === 'statutory' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <Card>
            <CardHdr>Monthly Statutory Obligations</CardHdr>
            <StatRow label="PF Employer Contribution (12%)" value={fmtN(totalPF)} color={T.rd} />
            <StatRow label="ESIC Employer Contribution (3.25%)" value={fmtN(totalESIC)} color={T.rd} />
            <StatRow label="Total Payroll Cost" value={fmtN(totalCTC/12 + totalPF + totalESIC)} highlight />
          </Card>
          <Card>
            <CardHdr>Compliance Calendar</CardHdr>
            {[['PF Challan','15th every month'],['ESIC Challan','15th every month'],['PT Payment','State-specific'],['TDS Deposit','7th next month'],['Form 16','By 15 Jun'],['PF Annual Return','25 April']].map(([l,v])=>(
              <StatRow key={l} label={l} value={v} />
            ))}
          </Card>
        </div>
      )}

      {showAdd && (
        <Modal title={editId?'Edit Employee':'Add Employee'} onClose={()=>setShowAdd(false)}>
          <div style={{display:'grid',gap:14}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Inp label="Full Name *" value={form.name} onChange={e=>up('name',e.target.value)} placeholder="Rajesh Kumar" />
              <Inp label="Annual CTC (₹) *" type="number" value={form.ctc} onChange={e=>up('ctc',e.target.value)} placeholder="600000" />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Inp label="Role / Designation" value={form.role} onChange={e=>up('role',e.target.value)} placeholder="Senior Accountant" />
              <Inp label="Department" value={form.dept} onChange={e=>up('dept',e.target.value)} placeholder="Finance" />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Inp label="Date of Joining" type="date" value={form.doj} onChange={e=>up('doj',e.target.value)} />
              <Sel label="Status" value={form.status} onChange={e=>up('status',e.target.value)} options={['Active','On Leave','Probation','Resigned']} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Inp label="Email" value={form.email} onChange={e=>up('email',e.target.value)} placeholder="rajesh@company.com" />
              <Inp label="Phone" value={form.phone} onChange={e=>up('phone',e.target.value)} placeholder="+91 98765 43210" />
            </div>
            {form.ctc && (() => { const p=calcPay(form.ctc); return (
              <InfoBox type="info">
                Net take-home: {fmtN(p.net)}/mo · PF: {fmtN(p.pfEmp)} · ESIC: {fmtN(p.esic)} · TDS: {fmtN(p.tds)}
              </InfoBox>
            );})()}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <BtnG onClick={()=>setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={saveEmp} disabled={!form.name||!form.ctc}>{editId?'Save Changes':'Add Employee'}</BtnP>
            </div>
          </div>
        </Modal>
      )}

      {slipFor && (() => { const e=slipFor; const p=calcPay(e.ctc); return (
        <Modal title={`Payslip — ${e.name}`} onClose={()=>setSlipFor(null)}>
          <div style={{background:T.sf2,border:`1px solid ${T.bd}`,borderRadius:8,padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:T.tx}}>{e.name}</div>
                <div style={{fontSize:12,color:T.t3}}>{e.role} · {e.dept||'—'}</div>
              </div>
              <div style={{textAlign:'right',fontSize:11,color:T.t3,fontFamily:mo}}>
                <div>DOJ: {fmtD(e.doj)}</div>
                <div>Month: {new Date().toLocaleString('default',{month:'long',year:'numeric'})}</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}}>
              <div>
                <div style={{fontSize:10,color:T.t3,fontFamily:mo,fontWeight:600,letterSpacing:1,marginBottom:8}}>EARNINGS</div>
                {[['Basic',p.basic],['HRA',p.hra],['Special Allowance',p.spl]].map(([l,v])=><StatRow key={l} label={l} value={fmtN(v)} />)}
                <StatRow label="GROSS" value={fmtN(p.gross)} highlight />
              </div>
              <div style={{paddingLeft:20,borderLeft:`1px solid ${T.bd}`}}>
                <div style={{fontSize:10,color:T.t3,fontFamily:mo,fontWeight:600,letterSpacing:1,marginBottom:8}}>DEDUCTIONS</div>
                {[['PF (Employee 12%)',p.pfEmp],['ESIC (0.75%)',p.esic],['Professional Tax',p.pt],['TDS',p.tds]].map(([l,v])=><StatRow key={l} label={l} value={fmtN(v)} color={T.rd} />)}
                <StatRow label="TOTAL DEDUCTIONS" value={fmtN(p.deductions)} highlight color={T.rd} />
              </div>
            </div>
            <div style={{marginTop:12,padding:12,background:T.aml,borderRadius:6,display:'flex',justifyContent:'space-between'}}>
              <span style={{fontWeight:700,color:T.tx}}>NET TAKE-HOME</span>
              <span style={{fontWeight:700,color:T.gn,fontSize:18}}>{fmtN(p.net)}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:14,justifyContent:'flex-end'}}>
            <BtnG onClick={()=>setSlipFor(null)}>Close</BtnG>
            <BtnP onClick={async ()=>{ await generatePDF('payslip', { co, emp: e, pay: p }); }}>↓ PDF</BtnP>
          </div>
        </Modal>
      );})()}
    </div>
  );
}

// ─── ATTENDANCE ────────────────────────────────────────────────────────────────
function Attendance({ emps }) {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('nx_attendance');
    return saved ? JSON.parse(saved) : {};
  });
  const todayStr = new Date().toISOString().split('T')[0];

  const mark = (empId, status) => {
    const updated = { ...records, [`${empId}_${todayStr}`]: status };
    setRecords(updated);
    localStorage.setItem('nx_attendance', JSON.stringify(updated));
  };

  const getStatus = (empId) => records[`${empId}_${todayStr}`] || null;

  const presentToday = emps.filter(e => getStatus(e.id) === 'present').length;
  const absentToday = emps.filter(e => getStatus(e.id) === 'absent').length;

  return (
    <div>
      <SHdr title="Attendance" sub={`Today: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Present Today" value={presentToday} sub={`of ${emps.length} employees`} ac={T.gn} />
        <KPI label="Absent Today" value={absentToday} sub="marked absent" ac={T.rd} />
        <KPI label="Not Marked" value={emps.length - presentToday - absentToday} sub="pending mark" ac={T.am} />
      </div>
      {emps.length === 0 ? <InfoBox type="info">Add employees in HR & Payroll to track attendance.</InfoBox> :
        <Table cols="1fr 120px 120px 180px">
          {[<TH key="h">Employee</TH>, <TH key="h2">Role</TH>, <TH key="h3">Status</TH>, <TH key="h4">Mark Today</TH>]}
          {emps.map(e => {
            const st = getStatus(e.id);
            return (
              <TRow key={e.id} cols="1fr 120px 120px 180px">
                <TD bold>{e.name}</TD>
                <TD muted>{e.role}</TD>
                <div>{st ? <Badge l={st.toUpperCase()} col={st === 'present' ? 'green' : st === 'absent' ? 'red' : 'amber'} /> : <span style={{ fontSize: 11, color: T.t4 }}>Not marked</span>}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <BtnP small onClick={() => mark(e.id, 'present')}>✓ Present</BtnP>
                  <BtnDanger small onClick={() => mark(e.id, 'absent')}>✕ Absent</BtnDanger>
                </div>
              </TRow>
            );
          })}
        </Table>
      }
    </div>
  );
}

// ─── RECRUITMENT ───────────────────────────────────────────────────────────────
function Recruitment({ jobs, saveJobs, uid, log }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', dept: '', type: 'Full Time', status: 'Open', target: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addJob = () => {
    if (!form.title) return;
    saveJobs([{ id: uid(), ...form, posted: new Date().toISOString().split('T')[0], applicants: 0 }, ...jobs]);
    log('Job posted', form.title); setShowAdd(false);
    setForm({ title: '', dept: '', type: 'Full Time', status: 'Open', target: '' });
  };

  return (
    <div>
      <SHdr title="Recruitment" sub={`${jobs.filter(j => j.status === 'Open').length} open positions`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ Post Job</BtnP>} />
      {jobs.length === 0 ? <InfoBox type="info">No job postings yet. Click "+ Post Job" to begin hiring.</InfoBox> :
        <Table cols="1fr 120px 100px 100px 80px 100px">
          {[<TH key="h">Position</TH>, <TH key="h2">Department</TH>, <TH key="h3">Type</TH>, <TH key="h4">Status</TH>, <TH key="h5">Applicants</TH>, <TH key="h6">Posted</TH>]}
          {jobs.map(j => (
            <TRow key={j.id} cols="1fr 120px 100px 100px 80px 100px">
              <div><TD bold>{j.title}</TD>{j.target && <div style={{ fontSize: 11, color: T.t3 }}>Target: {j.target}</div>}</div>
              <TD muted>{j.dept || '—'}</TD>
              <TD muted>{j.type}</TD>
              <Badge l={j.status} col={j.status === 'Open' ? 'green' : j.status === 'On Hold' ? 'amber' : 'neutral'} />
              <TD mono>{j.applicants || 0}</TD>
              <TD mono muted>{j.posted}</TD>
            </TRow>
          ))}
        </Table>
      }
      {showAdd && (
        <Modal title="Post New Job" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Job Title *" value={form.title} onChange={e => up('title', e.target.value)} placeholder="Senior Accountant" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Department" value={form.dept} onChange={e => up('dept', e.target.value)} placeholder="Finance" />
              <Inp label="Target Date" value={form.target} onChange={e => up('target', e.target.value)} placeholder="Aug 2025" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Sel label="Employment Type" value={form.type} onChange={e => up('type', e.target.value)} options={['Full Time', 'Part Time', 'Contract', 'Intern']} />
              <Sel label="Status" value={form.status} onChange={e => up('status', e.target.value)} options={['Open', 'On Hold', 'Closed']} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addJob} disabled={!form.title}>Post Job</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── INVENTORY ─────────────────────────────────────────────────────────────────
function Inventory({ inv, saveInv, vendors, fmt, fmtN, today, uid, log }) {
  const [tab, setTab] = useState('stock');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', cat: '', qty: '', unit: 'pcs', rate: '', reorder: '10', vendor: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = (i) => {
    if (i) { setForm({ name: i.name, sku: i.sku || '', cat: i.cat || '', qty: i.qty, unit: i.unit || 'pcs', rate: i.rate || '', reorder: i.reorder || '10', vendor: i.vendor || '' }); setEditId(i.id); }
    else { setForm({ name: '', sku: '', cat: '', qty: '', unit: 'pcs', rate: '', reorder: '10', vendor: '' }); setEditId(null); }
    setShowAdd(true);
  };

  const saveItem = () => {
    if (!form.name || !form.qty) return;
    if (editId) { saveInv(inv.map(i => i.id === editId ? { ...i, ...form } : i)); log('Edited inventory', form.name); }
    else { saveInv([{ id: uid(), ...form }, ...inv]); log('Added inventory item', form.name); }
    setShowAdd(false);
  };

  const del = (id) => { saveInv(inv.filter(i => i.id !== id)); log('Deleted inventory item', id); };
  const totalVal = inv.reduce((s, i) => s + Number(i.qty || 0) * Number(i.rate || 0), 0);
  const lowStock = inv.filter(i => Number(i.qty) <= Number(i.reorder || 5));
  const cats = [...new Set(inv.map(i => i.cat).filter(Boolean))];

  return (
    <div>
      <SHdr title="Inventory" sub={`${inv.length} items · Total value: ${fmt(totalVal)} · ${lowStock.length} low stock alerts`}
        action={<BtnP onClick={() => openAdd(null)}>+ Add Item</BtnP>} />
      <Tabs tabs={[{ id: 'stock', label: 'Stock List' }, { id: 'low', label: `Low Stock (${lowStock.length})` }, { id: 'val', label: 'Valuation' }]} active={tab} onChange={setTab} />

      {tab === 'stock' && (
        inv.length === 0 ? <InfoBox type="info">No inventory items yet.</InfoBox> :
          <Table cols="1fr 80px 80px 70px 90px 100px 80px 120px">
            {[<TH key="h">Item</TH>, <TH key="h2">SKU</TH>, <TH key="h3">Category</TH>, <TH key="h4" right>Qty</TH>, <TH key="h5" right>Rate</TH>, <TH key="h6" right>Value</TH>, <TH key="h7">Level</TH>, <TH key="h8">Actions</TH>]}
            {inv.map(i => {
              const low = Number(i.qty) <= Number(i.reorder || 5);
              return (
                <TRow key={i.id} cols="1fr 80px 80px 70px 90px 100px 80px 120px" highlight={low}>
                  <TD bold>{i.name}</TD>
                  <TD mono muted>{i.sku || '—'}</TD>
                  <TD muted>{i.cat || '—'}</TD>
                  <TD right bold color={low ? T.rd : T.tx}>{i.qty} {i.unit}</TD>
                  <TD right mono>{i.rate ? fmtN(i.rate) : '—'}</TD>
                  <TD right bold>{i.rate ? fmt(Number(i.qty) * Number(i.rate)) : '—'}</TD>
                  <Badge l={low ? 'LOW' : 'OK'} col={low ? 'red' : 'green'} />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <BtnG small onClick={() => openAdd(i)}>Edit</BtnG>
                    <BtnDanger small onClick={() => del(i.id)}>Del</BtnDanger>
                  </div>
                </TRow>
              );
            })}
          </Table>
      )}

      {tab === 'low' && (
        lowStock.length === 0 ? <InfoBox type="success">All stock levels are above reorder points.</InfoBox> :
          <div>
            <InfoBox type="warning">{lowStock.length} items need restocking. Reorder immediately to avoid stockouts.</InfoBox>
            <div style={{ marginTop: 16 }}>
              {lowStock.map(i => (
                <Card key={i.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{i.name}</div>
                      <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>SKU: {i.sku || '—'} · Reorder at: {i.reorder || 5} {i.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: T.rd }}>{i.qty} <span style={{ fontSize: 12 }}>{i.unit}</span></div>
                      <div style={{ fontSize: 11, color: T.t3 }}>remaining</div>
                    </div>
                  </div>
                  <ProgressBar value={Number(i.qty)} max={Number(i.reorder || 5) * 3} color={T.rd} />
                </Card>
              ))}
            </div>
          </div>
      )}

      {tab === 'val' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card>
            <CardHdr>By Category</CardHdr>
            {cats.length === 0 ? <span style={{ color: T.t4, fontSize: 12 }}>No categories set</span> :
              cats.map(c => {
                const val = inv.filter(i => i.cat === c).reduce((s, i) => s + Number(i.qty || 0) * Number(i.rate || 0), 0);
                return <StatRow key={c} label={c} value={fmt(val)} />;
              })}
            <StatRow label="TOTAL" value={fmt(totalVal)} highlight />
          </Card>
          <Card>
            <CardHdr>Summary</CardHdr>
            <StatRow label="Total SKUs" value={inv.length} />
            <StatRow label="Total Stock Value" value={fmt(totalVal)} />
            <StatRow label="Low Stock Items" value={lowStock.length} color={lowStock.length > 0 ? T.rd : T.gn} />
            <StatRow label="Categories" value={cats.length} />
            <StatRow label="Avg Item Value" value={inv.length > 0 ? fmt(totalVal / inv.length) : '—'} />
          </Card>
        </div>
      )}

      {showAdd && (
        <Modal title={editId ? 'Edit Item' : 'Add Inventory Item'} onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Item Name *" value={form.name} onChange={e => up('name', e.target.value)} placeholder="Steel Rods 10mm" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="SKU Code" value={form.sku} onChange={e => up('sku', e.target.value)} placeholder="STL-10MM-001" />
              <Inp label="Category" value={form.cat} onChange={e => up('cat', e.target.value)} placeholder="Raw Material" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Quantity *" type="number" value={form.qty} onChange={e => up('qty', e.target.value)} placeholder="500" />
              <Sel label="Unit" value={form.unit} onChange={e => up('unit', e.target.value)} options={['pcs', 'kg', 'litre', 'meter', 'box', 'set', 'ton']} />
              <Inp label="Reorder Level" type="number" value={form.reorder} onChange={e => up('reorder', e.target.value)} placeholder="50" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Unit Rate (₹)" type="number" value={form.rate} onChange={e => up('rate', e.target.value)} placeholder="120" />
              <Inp label="Primary Vendor" value={form.vendor} onChange={e => up('vendor', e.target.value)} placeholder="Supplier name" />
            </div>
            {form.qty && form.rate && <InfoBox type="info">Total value: {fmtN(Number(form.qty) * Number(form.rate))}</InfoBox>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={saveItem} disabled={!form.name || !form.qty}>{editId ? 'Save Changes' : 'Add Item'}</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── VENDORS ───────────────────────────────────────────────────────────────────
function Vendors({ vendors, saveVendors, fmt, fmtN, today, uid, log }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', gstin: '', cat: '', phone: '', email: '', outstanding: '', rating: '4' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = (v) => {
    if (v) { setForm({ name: v.name, gstin: v.gstin || '', cat: v.cat || '', phone: v.phone || '', email: v.email || '', outstanding: v.outstanding || '', rating: v.rating || '4' }); setEditId(v.id); }
    else { setForm({ name: '', gstin: '', cat: '', phone: '', email: '', outstanding: '', rating: '4' }); setEditId(null); }
    setShowAdd(true);
  };

  const saveVendor = () => {
    if (!form.name) return;
    if (editId) { saveVendors(vendors.map(v => v.id === editId ? { ...v, ...form } : v)); log('Edited vendor', form.name); }
    else { saveVendors([{ id: uid(), ...form, since: today() }, ...vendors]); log('Added vendor', form.name); }
    setShowAdd(false);
  };

  const del = (id) => { saveVendors(vendors.filter(v => v.id !== id)); log('Deleted vendor', id); };
  const totalOut = vendors.reduce((s, v) => s + Number(v.outstanding || 0), 0);

  return (
    <div>
      <SHdr title="Vendors & Suppliers" sub={`${vendors.length} vendors · Total outstanding: ${fmt(totalOut)}`}
        action={<BtnP onClick={() => openAdd(null)}>+ Add Vendor</BtnP>} />
      {vendors.length === 0 ? <InfoBox type="info">No vendors added yet.</InfoBox> :
        <Table cols="1fr 120px 120px 100px 100px 80px 120px">
          {[<TH key="h">Vendor</TH>, <TH key="h2">GSTIN</TH>, <TH key="h3">Category</TH>, <TH key="h4">Phone</TH>, <TH key="h5" right>Outstanding</TH>, <TH key="h6">Rating</TH>, <TH key="h7">Actions</TH>]}
          {vendors.map(v => (
            <TRow key={v.id} cols="1fr 120px 120px 100px 100px 80px 120px">
              <div>
                <TD bold>{v.name}</TD>
                {v.email && <div style={{ fontSize: 11, color: T.t3 }}>{v.email}</div>}
              </div>
              <TD mono muted>{v.gstin || '—'}</TD>
              <TD muted>{v.cat || '—'}</TD>
              <TD mono muted>{v.phone || '—'}</TD>
              <TD right bold color={Number(v.outstanding) > 0 ? T.rd : T.gn}>{v.outstanding ? fmtN(v.outstanding) : '—'}</TD>
              <span style={{ fontSize: 13, color: T.am }}>{'★'.repeat(Number(v.rating || 0))}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <BtnG small onClick={() => openAdd(v)}>Edit</BtnG>
                <BtnDanger small onClick={() => del(v.id)}>Del</BtnDanger>
              </div>
            </TRow>
          ))}
        </Table>
      }
      {showAdd && (
        <Modal title={editId ? 'Edit Vendor' : 'Add Vendor'} onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Vendor Name *" value={form.name} onChange={e => up('name', e.target.value)} placeholder="Tata Steel Ltd." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="GSTIN" value={form.gstin} onChange={e => up('gstin', e.target.value.toUpperCase())} placeholder="27AAAAA0000A1Z5" />
              <Inp label="Category" value={form.cat} onChange={e => up('cat', e.target.value)} placeholder="Raw Material" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Phone" value={form.phone} onChange={e => up('phone', e.target.value)} />
              <Inp label="Email" value={form.email} onChange={e => up('email', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Outstanding Amount (₹)" type="number" value={form.outstanding} onChange={e => up('outstanding', e.target.value)} />
              <Sel label="Rating" value={form.rating} onChange={e => up('rating', e.target.value)} options={['5', '4', '3', '2', '1']} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={saveVendor} disabled={!form.name}>{editId ? 'Save' : 'Add Vendor'}</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PRODUCTION ────────────────────────────────────────────────────────────────
function Production({ jobs, saveJobs, inv, fmt, uid, log }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ order: '', product: '', qty: '', status: 'Scheduled', due: '', progress: '0', notes: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addJob = () => {
    if (!form.product) return;
    saveJobs([{ id: uid(), ...form }, ...jobs]);
    log('Production job created', form.product); setShowAdd(false);
    setForm({ order: '', product: '', qty: '', status: 'Scheduled', due: '', progress: '0', notes: '' });
  };

  const updateStatus = (id, status) => { saveJobs(jobs.map(j => j.id === id ? { ...j, status } : j)); };
  const updateProgress = (id, progress) => { saveJobs(jobs.map(j => j.id === id ? { ...j, progress } : j)); };

  return (
    <div>
      <SHdr title="Production Planning" sub={`${jobs.filter(j => j.status === 'In Progress').length} active · ${jobs.filter(j => j.status === 'Completed').length} completed`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ New Job Order</BtnP>} />
      {jobs.length === 0 ? <InfoBox type="info">No job orders yet. Create one to track production.</InfoBox> : jobs.map(j => (
        <Card key={j.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{j.product} {j.qty && `× ${j.qty}`}</div>
              {j.order && <div style={{ fontSize: 11, color: T.t3, fontFamily: mo, marginTop: 2 }}>Order: {j.order}</div>}
              {j.notes && <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>{j.notes}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge l={j.status} col={j.status === 'Completed' ? 'green' : j.status === 'In Progress' ? 'amber' : 'neutral'} />
              {j.due && <span style={{ fontSize: 10, color: T.t3, fontFamily: mo }}>Due: {j.due}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: T.t3 }}>Progress</span>
                <span style={{ fontSize: 11, fontFamily: mo, color: T.am }}>{j.progress || 0}%</span>
              </div>
              <ProgressBar value={Number(j.progress || 0)} max={100} color={T.am} />
            </div>
            <input type="range" min="0" max="100" value={j.progress || 0}
              onChange={e => updateProgress(j.id, e.target.value)}
              style={{ width: 80, accentColor: T.am }} />
            <Sel label="" value={j.status} onChange={e => updateStatus(j.id, e.target.value)} options={['Scheduled', 'In Progress', 'On Hold', 'Completed']} />
          </div>
        </Card>
      ))}

      {showAdd && (
        <Modal title="New Job Order" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Order / WO Number" value={form.order} onChange={e => up('order', e.target.value)} placeholder="WO-2025-001" />
              <Inp label="Product / Item *" value={form.product} onChange={e => up('product', e.target.value)} placeholder="Steel Frame A" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Quantity" type="number" value={form.qty} onChange={e => up('qty', e.target.value)} />
              <Inp label="Due Date" type="date" value={form.due} onChange={e => up('due', e.target.value)} />
              <Sel label="Status" value={form.status} onChange={e => up('status', e.target.value)} options={['Scheduled', 'In Progress', 'On Hold']} />
            </div>
            <TextArea label="Notes" value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="Material requirements, instructions…" rows={3} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addJob} disabled={!form.product}>Create Job Order</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CRM ───────────────────────────────────────────────────────────────────────
function CRM({ leads, saveLeads, fmt, fmtN, today, uid, log }) {
  const [tab, setTab] = useState('list');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ co: '', contact: '', phone: '', email: '', val: '', stage: 'Prospect', source: 'Direct', notes: '', date: today() });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const STAGES = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  const openAdd = (l) => {
    if (l) { setForm({ co: l.co, contact: l.contact || '', phone: l.phone || '', email: l.email || '', val: l.val || '', stage: l.stage, notes: l.notes || '', date: l.date || today() }); setEditId(l.id); }
    else { setForm({ co: '', contact: '', phone: '', email: '', val: '', stage: 'Prospect', notes: '', date: today() }); setEditId(null); }
    setShowAdd(true);
  };

  const saveLead = () => {
    if (!form.co) return;
    if (editId) { saveLeads(leads.map(l => l.id === editId ? { ...l, ...form } : l)); log('Edited lead', form.co); }
    else { saveLeads([{ id: uid(), ...form }, ...leads]); log('Added lead', form.co); }
    setShowAdd(false);
  };

  const del = (id) => { saveLeads(leads.filter(l => l.id !== id)); log('Deleted lead', id); };
  const moveStage = (id, stage) => { saveLeads(leads.map(l => l.id === id ? { ...l, stage } : l)); log('Lead stage changed', stage); };

  const pipelineVal = leads.filter(l => !['Won', 'Lost'].includes(l.stage)).reduce((s, l) => s + Number(l.val || 0), 0);
  const wonVal = leads.filter(l => l.stage === 'Won').reduce((s, l) => s + Number(l.val || 0), 0);

  return (
    <div>
      <SHdr title="CRM & Pipeline" sub={`${leads.length} total leads · Pipeline: ${fmt(pipelineVal)} · Won: ${fmt(wonVal)}`}
        action={<BtnP onClick={() => openAdd(null)}>+ Add Lead</BtnP>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Active Pipeline" value={fmt(pipelineVal)} sub={`${leads.filter(l => !['Won','Lost'].includes(l.stage)).length} leads`} ac={T.bl} />
        <KPI label="Won This Year" value={fmt(wonVal)} sub={`${leads.filter(l => l.stage === 'Won').length} deals`} ac={T.gn} />
        <KPI label="Lost" value={leads.filter(l => l.stage === 'Lost').length} sub="deals lost" ac={T.rd} />
        <KPI label="Win Rate" value={leads.length > 0 ? `${Math.round(leads.filter(l => l.stage === 'Won').length / leads.filter(l => ['Won','Lost'].includes(l.stage)).length * 100) || 0}%` : '—'} sub="of closed deals" ac={T.am} />
      </div>
      <Tabs tabs={[{ id: 'list', label: 'List View' }, { id: 'kanban', label: 'Kanban Board' }]} active={tab} onChange={setTab} />

      {tab === 'list' && (
        leads.length === 0 ? <InfoBox type="info">No leads yet. Add your first prospect.</InfoBox> :
          <Table cols="1fr 120px 100px 100px 90px 80px 150px">
            {[<TH key="h">Company</TH>, <TH key="h2">Contact</TH>, <TH key="h3">Phone</TH>, <TH key="h4" right>Deal Value</TH>, <TH key="h5">Stage</TH>, <TH key="h6">Added</TH>, <TH key="h7">Actions</TH>]}
            {leads.map(l => (
              <TRow key={l.id} cols="1fr 120px 100px 100px 90px 80px 150px">
                <div><TD bold>{l.co}</TD>{l.notes && <div style={{ fontSize: 11, color: T.t3 }}>{l.notes.slice(0, 40)}{l.notes.length > 40 ? '…' : ''}</div>}</div>
                <TD muted>{l.contact || '—'}</TD>
                <TD mono muted>{l.phone || '—'}</TD>
                <TD right bold color={T.bl}>{l.val ? fmtN(l.val) : '—'}</TD>
                <Badge l={l.stage} col={l.stage === 'Won' ? 'green' : l.stage === 'Lost' ? 'red' : l.stage === 'Negotiation' ? 'amber' : 'blue'} />
                <TD mono muted>{l.date}</TD>
                <div style={{ display: 'flex', gap: 4 }}>
                  <BtnG small onClick={() => openAdd(l)}>Edit</BtnG>
                  <BtnDanger small onClick={() => del(l.id)}>Del</BtnDanger>
                </div>
              </TRow>
            ))}
          </Table>
      )}

      {tab === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, overflowX: 'auto' }}>
          {STAGES.map(stage => (
            <div key={stage}>
              <div style={{ padding: '8px 10px', background: T.sf2, borderRadius: '6px 6px 0 0', border: `1px solid ${T.bd}`, borderBottom: 'none' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.t3, letterSpacing: 1, fontFamily: mo, textTransform: 'uppercase' }}>{stage}</div>
                <div style={{ fontSize: 12, color: T.am, fontFamily: mo, marginTop: 2 }}>
                  {fmt(leads.filter(l => l.stage === stage).reduce((s, l) => s + Number(l.val || 0), 0))}
                </div>
              </div>
              <div style={{ border: `1px solid ${T.bd}`, borderRadius: '0 0 6px 6px', minHeight: 100, padding: 6 }}>
                {leads.filter(l => l.stage === stage).map(l => (
                  <div key={l.id} style={{ background: T.sf, border: `1px solid ${T.bd}`, borderRadius: 5, padding: '8px 10px', marginBottom: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.tx, marginBottom: 3 }}>{l.co}</div>
                    {l.val && <div style={{ fontSize: 11, color: T.am, fontFamily: mo }}>{fmtN(l.val)}</div>}
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      {STAGES.filter(s => s !== stage).slice(0, 2).map(s => (
                        <button key={s} onClick={() => moveStage(l.id, s)}
                          style={{ fontSize: 9, padding: '2px 5px', background: T.sf2, border: `1px solid ${T.bd}`, borderRadius: 3, cursor: 'pointer', color: T.t3 }}>
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title={editId ? 'Edit Lead' : 'Add Lead'} onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Company Name *" value={form.co} onChange={e => up('co', e.target.value)} placeholder="Mehta Industries Pvt. Ltd." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Contact Person" value={form.contact} onChange={e => up('contact', e.target.value)} placeholder="Amit Mehta" />
              <Inp label="Phone" value={form.phone} onChange={e => up('phone', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Email" value={form.email} onChange={e => up('email', e.target.value)} />
              <Inp label="Deal Value (₹)" type="number" value={form.val} onChange={e => up('val', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Sel label="Stage" value={form.stage} onChange={e => up('stage', e.target.value)} options={STAGES} />
              <Sel label="Lead Source" value={form.source} onChange={e => up('source', e.target.value)} options={['Direct','Referral','Website','LinkedIn','Trade Show','Cold Call','Other']} />
              <Inp label="Date" type="date" value={form.date} onChange={e => up('date', e.target.value)} />
            </div>
            <TextArea label="Notes" value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="Key details, next steps…" rows={3} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={saveLead} disabled={!form.co}>{editId ? 'Save Changes' : 'Add Lead'}</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PROPOSALS ─────────────────────────────────────────────────────────────────
function Proposals({ leads, co, fmt, fmtN }) {
  const [selected, setSelected] = useState(null);
  const [genFor, setGenFor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');

  const activeLeads = leads.filter(l => !['Won', 'Lost'].includes(l.stage));

  const generate = async (lead) => {
    setLoading(true); setGenFor(lead); setDraft('');
    try {
      const txt = await generate(
        `Write a professional business proposal letter from ${co.name} (${co.city}, ${co.state}) to ${lead.co}${lead.contact ? ', Attn: ' + lead.contact : ''}. Deal value: ${lead.val ? fmtN(lead.val) : 'To be discussed'}. Stage: ${lead.stage}. Keep it formal, concise (3-4 paragraphs), and persuasive. Include a clear call to action.`
      );
      setDraft(txt || 'Could not generate draft.');
    } catch { setDraft('Generation failed. Check your internet connection.'); }
    setLoading(false);
  };

  return (
    <div>
      <SHdr title="Proposals" sub="AI-drafted proposals for active pipeline leads" />
      {activeLeads.length === 0 ? <InfoBox type="info">No active leads. Add leads in CRM to generate proposals.</InfoBox> :
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          <div>
            {activeLeads.map(l => (
              <Card key={l.id} style={{ marginBottom: 10, cursor: 'pointer', border: selected?.id === l.id ? `1px solid ${T.am}` : `1px solid ${T.bd}` }}
                onClick={() => setSelected(l)}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.tx }}>{l.co}</div>
                <div style={{ fontSize: 11, color: T.t3, marginTop: 4 }}>{l.stage} · {l.val ? fmtN(l.val) : '—'}</div>
              </Card>
            ))}
          </div>
          <Card>
            {!selected ? (
              <div style={{ color: T.t4, textAlign: 'center', padding: '40px 0', fontSize: 13 }}>Select a lead to generate a proposal</div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.tx }}>{selected.co}</div>
                    <div style={{ fontSize: 11, color: T.t3 }}>{selected.stage} · {selected.val ? fmtN(selected.val) : 'Value TBD'}</div>
                  </div>
                  <BtnP onClick={() => generate(selected)} disabled={loading}>{loading ? 'Drafting…' : 'Draft with AI'}</BtnP>
                </div>
                {draft ? (
                  <div>
                    <TextArea label="Proposal Draft (editable)" value={draft} onChange={e => setDraft(e.target.value)} rows={14} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <BtnP onClick={() => navigator.clipboard.writeText(draft)} small>Copy</BtnP>
                      <BtnG onClick={() => { const w = window.open(); w.document.write(`<pre style="font-family:Georgia;padding:40px;line-height:1.8">${draft}</pre>`); w.print(); }} small>Print</BtnG>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: T.t4, textAlign: 'center', padding: '30px 0', fontSize: 12, fontFamily: mo }}>
                    {loading ? 'AI is drafting your proposal…' : 'Click "Draft with AI" to generate a proposal letter'}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      }
    </div>
  );
}

// ─── LEGAL & COMPLIANCE ────────────────────────────────────────────────────────
function Legal({ co }) {
  const items = [
    { cat: 'GST Compliance', items: ['GSTR-1 by 11th every month', 'GSTR-3B by 20th every month', 'GSTR-9 annual return by 31 Dec', 'E-invoicing if turnover > ₹5Cr', 'E-waybill for goods movement > ₹50,000'] },
    { cat: 'Income Tax', items: ['TDS deduction & deposit by 7th next month', 'Advance tax: Jun 15, Sep 15, Dec 15, Mar 15', 'ITR filing by 31 Jul (non-audit)', 'Tax audit if turnover > ₹1Cr (businesses)', 'Form 16 issue to employees by 15 Jun'] },
    { cat: 'Company Law (MCA)', items: ['Annual return MGT-7 within 60 days of AGM', 'Financial statements AOC-4 within 30 days of AGM', 'Board meetings: min 4 per year', 'AGM within 6 months of financial year end', 'Director KYC (DIR-3 KYC) annually'] },
    { cat: 'Labour & HR', items: ['PF ECR challan by 15th every month', 'ESIC challan by 15th every month', 'Professional Tax as per state schedule', 'Shops & Establishments renewal annually', 'Gratuity provisioning after 5 years'] },
    { cat: 'MSME / Other', items: ['Udyam Registration (free, online)', 'FSSAI license if food business', 'Trade License from local municipality', 'Import-Export Code (IEC) if trading internationally', 'BIS certification if manufacturing regulated products'] },
  ];

  return (
    <div>
      <SHdr title="Legal & Compliance" sub={`Compliance calendar for ${co.industry} businesses in ${co.state}`} />
      <InfoBox type="warning">This is a reference guide only. Always consult your CA and legal advisor for your specific situation.</InfoBox>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 20 }}>
        {items.map(({ cat, items: list }) => (
          <Card key={cat}>
            <CardHdr>{cat}</CardHdr>
            {list.map(item => (
              <div key={item} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: `1px solid ${T.sf2}`, alignItems: 'flex-start' }}>
                <span style={{ color: T.am, fontSize: 12, marginTop: 1, flexShrink: 0 }}>▸</span>
                <span style={{ fontSize: 12, color: T.t2, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── CONTRACTS ─────────────────────────────────────────────────────────────────
function Contracts({ contracts, saveContracts, vendors, leads, fmtD, today, uid, log }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', party: '', type: 'Vendor', value: '', start: today(), end: '', status: 'Active', notes: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addContract = () => {
    if (!form.title) return;
    saveContracts([{ id: uid(), ...form }, ...contracts]);
    log('Contract added', form.title); setShowAdd(false);
    setForm({ title: '', party: '', type: 'Vendor', value: '', start: today(), end: '', status: 'Active', notes: '' });
  };

  const del = (id) => { saveContracts(contracts.filter(c => c.id !== id)); };

  const expiringSoon = contracts.filter(c => {
    if (!c.end) return false;
    const days = Math.ceil((new Date(c.end) - new Date()) / (1000 * 86400));
    return days <= 30 && days > 0;
  });

  return (
    <div>
      <SHdr title="Contracts" sub={`${contracts.length} contracts · ${expiringSoon.length} expiring within 30 days`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ Add Contract</BtnP>} />
      {expiringSoon.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <InfoBox type="warning">
            {expiringSoon.length} contract(s) expiring soon: {expiringSoon.map(c => c.title).join(', ')}
          </InfoBox>
        </div>
      )}
      {contracts.length === 0 ? <InfoBox type="info">No contracts tracked yet.</InfoBox> :
        <Table cols="1fr 120px 90px 90px 90px 80px 80px">
          {[<TH key="h">Contract</TH>, <TH key="h2">Party</TH>, <TH key="h3">Type</TH>, <TH key="h4">Start</TH>, <TH key="h5">Expires</TH>, <TH key="h6">Status</TH>, <TH key="h7">Action</TH>]}
          {contracts.map(c => {
            const daysLeft = c.end ? Math.ceil((new Date(c.end) - new Date()) / (1000 * 86400)) : null;
            return (
              <TRow key={c.id} cols="1fr 120px 90px 90px 90px 80px 80px" highlight={daysLeft !== null && daysLeft <= 30 && daysLeft > 0}>
                <div><TD bold>{c.title}</TD>{c.notes && <div style={{ fontSize: 11, color: T.t3 }}>{c.notes.slice(0, 35)}…</div>}</div>
                <TD muted>{c.party}</TD>
                <TD muted>{c.type}</TD>
                <TD mono muted>{fmtD(c.start)}</TD>
                <div>
                  <TD mono muted>{c.end ? fmtD(c.end) : '—'}</TD>
                  {daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && <div style={{ fontSize: 9, color: T.rd, fontFamily: mo }}>{daysLeft}d left</div>}
                </div>
                <Badge l={c.status} col={c.status === 'Active' ? 'green' : c.status === 'Expired' ? 'red' : 'neutral'} />
                <BtnDanger small onClick={() => del(c.id)}>Del</BtnDanger>
              </TRow>
            );
          })}
        </Table>
      }
      {showAdd && (
        <Modal title="Add Contract" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Contract Title *" value={form.title} onChange={e => up('title', e.target.value)} placeholder="Annual Maintenance Agreement" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Party Name" value={form.party} onChange={e => up('party', e.target.value)} placeholder="Vendor / Client name" />
              <Sel label="Type" value={form.type} onChange={e => up('type', e.target.value)} options={['Vendor', 'Client', 'Employment', 'NDA', 'Lease', 'Other']} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Start Date" type="date" value={form.start} onChange={e => up('start', e.target.value)} />
              <Inp label="Expiry Date" type="date" value={form.end} onChange={e => up('end', e.target.value)} />
              <Sel label="Status" value={form.status} onChange={e => up('status', e.target.value)} options={['Active', 'Draft', 'Expired', 'Terminated']} />
            </div>
            <TextArea label="Notes / Key Terms" value={form.notes} onChange={e => up('notes', e.target.value)} rows={3} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addContract} disabled={!form.title}>Add Contract</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DOCUMENTS ─────────────────────────────────────────────────────────────────
function Documents({ docs, saveDocs, uid, log }) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('library');
  const fileRef = useRef(null);

  const upload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const doc = { id: uid(), name: file.name, type: file.type, size: Math.round(file.size / 1024) + 'KB', date: new Date().toISOString().split('T')[0], content: ev.target.result.slice(0, 8000) };
      saveDocs([doc, ...docs]); log('Document uploaded', file.name);
    };
    reader.readAsText(file);
  };

  const ask = async () => {
    if (!query.trim() || docs.length === 0) return;
    setLoading(true); setAnswer('');
    try {
      const context = docs.map(d => `Document: ${d.name}\n---\n${d.content || '(binary file)'}`).join('\n\n').slice(0, 6000);
      const ans = await generate(
        `Based on the following documents:\n\n${context}\n\nAnswer this question: ${query}\n\nCite which document your answer comes from.`
      );
      setAnswer(ans || 'No answer generated.');
    } catch { setAnswer('Could not query documents. Check internet connection.'); }
    setLoading(false);
  };

  const del = (id) => { saveDocs(docs.filter(d => d.id !== id)); };

  return (
    <div>
      <SHdr title="Document Brain" sub="Upload documents — query them privately with AI"
        action={<>
          <input ref={fileRef} type="file" accept=".txt,.csv,.md,.json" onChange={upload} style={{ display: 'none' }} />
          <BtnP onClick={() => fileRef.current.click()}>↑ Upload Document</BtnP>
        </>} />
      <Tabs tabs={[{ id: 'library', label: `Library (${docs.length})` }, { id: 'query', label: 'AI Query' }]} active={tab} onChange={setTab} />

      {tab === 'library' && (
        docs.length === 0 ? <InfoBox type="info">Upload text-based documents (.txt, .csv, .md, .json) to build your private knowledge base.</InfoBox> :
          <Table cols="1fr 80px 80px 100px 80px">
            {[<TH key="h">Document</TH>, <TH key="h2">Type</TH>, <TH key="h3">Size</TH>, <TH key="h4">Uploaded</TH>, <TH key="h5">Action</TH>]}
            {docs.map(d => (
              <TRow key={d.id} cols="1fr 80px 80px 100px 80px">
                <TD bold>{d.name}</TD>
                <Badge l={d.type.split('/')[1]?.toUpperCase() || 'TXT'} col="blue" />
                <TD mono muted>{d.size}</TD>
                <TD mono muted>{d.date}</TD>
                <BtnDanger small onClick={() => del(d.id)}>Del</BtnDanger>
              </TRow>
            ))}
          </Table>
      )}

      {tab === 'query' && (
        <div>
          {docs.length === 0 && <div style={{ marginBottom: 16 }}><InfoBox type="warning">Upload documents first to query them.</InfoBox></div>}
          <Card>
            <CardHdr>Ask a question across all your documents</CardHdr>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <Inp value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. What are the payment terms in our supplier contract?" />
              </div>
              <BtnP onClick={ask} disabled={loading || !query.trim() || docs.length === 0}>{loading ? 'Searching…' : 'Ask'}</BtnP>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {['What are the payment terms?', 'Summarise all contracts', 'Find penalty clauses', 'Key obligations'].map(s => (
                <button key={s} onClick={() => setQuery(s)}
                  style={{ fontSize: 11, padding: '4px 10px', background: T.aml, border: `1px solid #FED7AA`, borderRadius: 4, cursor: 'pointer', color: T.ac }}>
                  {s}
                </button>
              ))}
            </div>
            {answer && (
              <div style={{ background: T.sf2, border: `1px solid ${T.bd}`, borderRadius: 6, padding: 16, fontSize: 13, color: T.t2, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {answer}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS ─────────────────────────────────────────────────────────────────
function Analytics({ txns, emps, inv, leads, fmt, fmtN, months }) {
  const [tab, setTab] = useState('overview');

  const sales = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const exp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const totalCTC = emps.reduce((s, e) => s + Number(e.ctc || 0), 0);
  const wonLeads = leads.filter(l => l.stage === 'Won');
  const wonVal = wonLeads.reduce((s, l) => s + Number(l.val || 0), 0);

  const byCategory = TXN_CATS.map(c => ({
    cat: c,
    inc: txns.filter(t => t.type === 'income' && t.cat === c).reduce((s, t) => s + Number(t.amount), 0),
    exp: txns.filter(t => t.type === 'expense' && t.cat === c).reduce((s, t) => s + Number(t.amount), 0),
  })).filter(c => c.inc > 0 || c.exp > 0);

  return (
    <div>
      <SHdr title="Analytics" sub="Business intelligence computed from your live data" />
      <Tabs tabs={[{ id: 'overview', label: 'Overview' }, { id: 'finance', label: 'Financial' }, { id: 'people', label: 'People' }, { id: 'pipeline', label: 'Pipeline' }]} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            <KPI label="Revenue" value={fmt(sales)} sub="Total income" ac={T.gn} />
            <KPI label="Expenses" value={fmt(exp)} sub="Total outflow" ac={T.rd} />
            <KPI label="Net Margin" value={sales > 0 ? `${Math.round((sales - exp) / sales * 100)}%` : '—'} sub="Profit margin" ac={T.am} />
            <KPI label="Revenue / Employee" value={emps.length > 0 ? fmt(sales / emps.length) : '—'} sub="Productivity metric" ac={T.bl} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Card>
              <CardHdr>Revenue vs Expense</CardHdr>
              <StatRow label="Total Revenue" value={fmtN(sales)} color={T.gn} />
              <StatRow label="Total Expense" value={fmtN(exp)} color={T.rd} />
              <StatRow label="Gross Profit" value={fmtN(sales - exp)} highlight color={sales - exp >= 0 ? T.gn : T.rd} />
              <StatRow label="Expense Ratio" value={sales > 0 ? `${Math.round(exp / sales * 100)}%` : '—'} />
            </Card>
            <Card>
              <CardHdr>Business Health Score</CardHdr>
              {[
                ['Transactions recorded', txns.length > 10 ? 'Good' : 'Low', txns.length > 10 ? 'green' : 'amber'],
                ['Employees tracked', emps.length > 0 ? 'Good' : 'None', emps.length > 0 ? 'green' : 'neutral'],
                ['Inventory managed', inv.length > 0 ? 'Good' : 'None', inv.length > 0 ? 'green' : 'neutral'],
                ['Pipeline active', leads.length > 0 ? 'Good' : 'None', leads.length > 0 ? 'green' : 'neutral'],
                ['Profitability', sales > exp ? 'Positive' : sales > 0 ? 'Negative' : 'No data', sales > exp ? 'green' : sales > 0 ? 'red' : 'neutral'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${T.sf2}` }}>
                  <span style={{ fontSize: 12, color: T.t2 }}>{l}</span>
                  <Badge l={v} col={c} />
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {tab === 'finance' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card>
            <CardHdr>By Category</CardHdr>
            {byCategory.length === 0 ? <span style={{ color: T.t4, fontSize: 12 }}>No data yet</span> : byCategory.map(({ cat, inc, exp }) => (
              <div key={cat} style={{ padding: '8px 0', borderBottom: `1px solid ${T.sf2}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: T.t2 }}>{cat}</span>
                  <span style={{ fontSize: 12, fontFamily: mo, color: inc > 0 ? T.gn : T.rd }}>{inc > 0 ? '+' + fmtN(inc) : '−' + fmtN(exp)}</span>
                </div>
                <ProgressBar value={Math.max(inc, exp)} max={Math.max(...byCategory.map(c => Math.max(c.inc, c.exp)), 1)} color={inc > 0 ? T.gn : T.rd} />
              </div>
            ))}
          </Card>
          <Card>
            <CardHdr>Key Financial Ratios</CardHdr>
            <StatRow label="Revenue" value={fmtN(sales)} />
            <StatRow label="Total Expense" value={fmtN(exp)} />
            <StatRow label="Net Profit" value={fmtN(sales - exp)} color={sales > exp ? T.gn : T.rd} />
            <StatRow label="Profit Margin" value={sales > 0 ? `${((sales - exp) / sales * 100).toFixed(1)}%` : '—'} />
            <StatRow label="Annual Payroll Cost" value={fmtN(totalCTC)} />
            <StatRow label="Payroll % of Revenue" value={sales > 0 ? `${Math.round(totalCTC / sales * 100)}%` : '—'} />
          </Card>
        </div>
      )}

      {tab === 'people' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card>
            <CardHdr>Workforce Summary</CardHdr>
            <StatRow label="Total Headcount" value={emps.length} />
            <StatRow label="Total CTC (Annual)" value={fmtN(totalCTC)} />
            <StatRow label="Avg Salary" value={emps.length > 0 ? fmtN(Math.round(totalCTC / emps.length)) : '—'} />
            <StatRow label="Revenue Per Employee" value={emps.length > 0 && sales > 0 ? fmt(Math.round(sales / emps.length)) : '—'} />
            <StatRow label="Active Employees" value={emps.filter(e => (e.status || 'Active') === 'Active').length} />
          </Card>
          <Card>
            <CardHdr>By Department</CardHdr>
            {[...new Set(emps.map(e => e.dept || 'Unassigned'))].map(dept => {
              const group = emps.filter(e => (e.dept || 'Unassigned') === dept);
              const ctc = group.reduce((s, e) => s + Number(e.ctc || 0), 0);
              return <StatRow key={dept} label={dept} value={`${group.length} · ${fmtN(ctc)}/yr`} />;
            })}
          </Card>
        </div>
      )}

      {tab === 'pipeline' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            <KPI label="Total Pipeline" value={fmt(leads.filter(l => !['Won','Lost'].includes(l.stage)).reduce((s,l)=>s+Number(l.val||0),0))} sub="active opportunities" ac={T.bl} />
            <KPI label="Won Revenue" value={fmt(wonVal)} sub={`${wonLeads.length} deals closed`} ac={T.gn} />
            <KPI label="Win Rate" value={leads.filter(l=>['Won','Lost'].includes(l.stage)).length > 0 ? `${Math.round(wonLeads.length/leads.filter(l=>['Won','Lost'].includes(l.stage)).length*100)}%` : '—'} sub="of closed deals" ac={T.am} />
          </div>
          <Card>
            <CardHdr>Pipeline by Stage</CardHdr>
            {['Prospect','Qualified','Proposal','Negotiation','Won','Lost'].map(stage => {
              const stageLeads = leads.filter(l => l.stage === stage);
              const val = stageLeads.reduce((s,l)=>s+Number(l.val||0),0);
              return (
                <div key={stage} style={{ padding: '8px 0', borderBottom: `1px solid ${T.sf2}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: T.t2 }}>{stage}</span>
                      <Badge l={`${stageLeads.length}`} col="neutral" />
                    </div>
                    <span style={{ fontSize: 12, fontFamily: mo, color: T.tx }}>{val > 0 ? fmtN(val) : '—'}</span>
                  </div>
                  <ProgressBar value={stageLeads.length} max={Math.max(...['Prospect','Qualified','Proposal','Negotiation','Won','Lost'].map(s=>leads.filter(l=>l.stage===s).length),1)} color={stage==='Won'?T.gn:stage==='Lost'?T.rd:T.am} />
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── REPORTS ───────────────────────────────────────────────────────────────────
function Reports({ txns, emps, inv, vendors, leads, contracts, co, fmt, fmtN, calcPay }) {
  const [previews, setPreviews] = useState({});

  const sales = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const exp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  const reports = [
    {
      id: 'pl', title: 'P&L Statement', desc: 'Income, expenses, net profit',
      gen: () => `${co.name} — Profit & Loss Statement\n${'='.repeat(50)}\n\nTotal Income:    ${fmtN(sales)}\nTotal Expense:   ${fmtN(exp)}\nNet Profit:      ${fmtN(sales - exp)}\nMargin:          ${sales > 0 ? Math.round((sales - exp) / sales * 100) : 0}%\n\nGenerated: ${new Date().toLocaleString()}`,
    },
    {
      id: 'gst', title: 'GST Summary', desc: 'Output, input, net payable',
      gen: () => {
        const gstOut = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount) * Number(t.gst || 0) / 100, 0);
        const gstIn = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount) * Number(t.gst || 0) / 100, 0);
        return `${co.name} — GST Summary\nGSTIN: ${co.gstin || 'Not set'}\n${'='.repeat(50)}\n\nOutput GST:      ${fmtN(gstOut)}\nInput Tax Credit:${fmtN(gstIn)}\nNet GST Payable: ${fmtN(gstOut - gstIn)}\n\nGenerated: ${new Date().toLocaleString()}`;
      },
    },
    {
      id: 'payroll', title: 'Payroll Register', desc: 'All employees, CTC, net pay',
      gen: () => `${co.name} — Payroll Register\n${'='.repeat(50)}\n\n${emps.map(e => `${e.name.padEnd(25)} CTC: ${fmtN(e.ctc).padStart(12)}`).join('\n')}\n\nTotal CTC: ${fmtN(emps.reduce((s, e) => s + Number(e.ctc || 0), 0))}\nHeadcount: ${emps.length}\n\nGenerated: ${new Date().toLocaleString()}`,
    },
    {
      id: 'inventory', title: 'Inventory Valuation', desc: 'Stock, rates, total value',
      gen: () => `${co.name} — Inventory Valuation\n${'='.repeat(50)}\n\n${inv.map(i => `${i.name.padEnd(25)} Qty: ${String(i.qty).padStart(6)} ${i.unit}  Value: ${fmtN(Number(i.qty) * Number(i.rate || 0))}`).join('\n')}\n\nTotal Value: ${fmt(inv.reduce((s, i) => s + Number(i.qty || 0) * Number(i.rate || 0), 0))}\n\nGenerated: ${new Date().toLocaleString()}`,
    },
    {
      id: 'vendor', title: 'Vendor Outstanding', desc: 'All vendors, dues payable',
      gen: () => `${co.name} — Vendor Outstanding\n${'='.repeat(50)}\n\n${vendors.map(v => `${v.name.padEnd(25)} Outstanding: ${fmtN(v.outstanding || 0)}`).join('\n')}\n\nTotal Outstanding: ${fmtN(vendors.reduce((s, v) => s + Number(v.outstanding || 0), 0))}\n\nGenerated: ${new Date().toLocaleString()}`,
    },
    {
      id: 'pipeline', title: 'Sales Pipeline', desc: 'All leads by stage and value',
      gen: () => `${co.name} — Sales Pipeline\n${'='.repeat(50)}\n\n${leads.map(l => `${l.co.padEnd(30)} ${l.stage.padEnd(15)} ${l.val ? fmtN(l.val) : '—'}`).join('\n')}\n\nTotal Pipeline: ${fmt(leads.reduce((s, l) => s + Number(l.val || 0), 0))}\n\nGenerated: ${new Date().toLocaleString()}`,
    },
  ];

  const download = async (report) => {
    if (['pl','gst','payroll_register','inventory','vendor_outstanding','board_report'].includes(report.id)) {
      await generatePDF(report.id === 'payroll' ? 'payroll_register' : report.id, { co, txns, emps, inv, vendors, leads, calcPay });
    } else {
      const text = report.gen();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${report.id}_${new Date().toISOString().split('T')[0]}.txt`;
      a.click(); URL.revokeObjectURL(url);
    }
  };

  const preview = (report) => {
    setPreviews(p => ({ ...p, [report.id]: p[report.id] ? null : report.gen() }));
  };

  return (
    <div>
      <SHdr title="Reports" sub="Generate and download business reports from your live data" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {reports.map(r => (
          <Card key={r.id}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.tx, marginBottom: 3 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: T.t3 }}>{r.desc}</div>
            </div>
            {previews[r.id] && (
              <pre style={{ fontSize: 10, color: T.t2, background: T.sf2, padding: 10, borderRadius: 5, maxHeight: 160, overflowY: 'auto', fontFamily: mo, marginBottom: 10, lineHeight: 1.5, border: `1px solid ${T.bd}` }}>
                {previews[r.id]}
              </pre>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <BtnG small onClick={() => preview(r)}>{previews[r.id] ? 'Hide' : 'Preview'}</BtnG>
              <BtnP small onClick={() => download(r)}>{['pl','gst','payroll_register','inventory','vendor_outstanding','board_report'].includes(r.id) ? '↓ PDF' : '↓ Download'}</BtnP>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── COMMUNICATIONS ────────────────────────────────────────────────────────────
function Comms({ co, vendors, leads, txns, fmt }) {
  const [selected, setSelected] = useState(0);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState({});

  const templates = [
    { id: 'payment', label: 'Payment Reminder', desc: 'Chase overdue invoices', prompt: () => `Write a professional but firm payment reminder email from ${co.name} to a client whose payment of ${fmt(txns.filter(t=>t.status==='pending').reduce((s,t)=>s+Number(t.amount),0))} is overdue by 30 days. Be polite but clear. Sign off as ${co.name} accounts team.` },
    { id: 'vendor', label: 'Vendor Negotiation', desc: 'Price/terms negotiation', prompt: () => `Write a vendor negotiation email from ${co.name} requesting a 10% volume discount on supplies. We have been a consistent customer. Keep it professional and collaborative.` },
    { id: 'po', label: 'Purchase Order', desc: 'PO to vendor', prompt: () => `Write a formal purchase order email from ${co.name} (${co.city}) to a supplier. Include standard PO terms: 30-day payment, GST invoice required, delivery within 14 days.` },
    { id: 'proposal', label: 'Sales Introduction', desc: 'Cold outreach / intro', prompt: () => `Write a professional business introduction email from ${co.name} (${co.industry} business in ${co.city}) to a potential client. Highlight reliability, quality, and competitive pricing. Keep it concise — 3 short paragraphs.` },
    { id: 'appt', label: 'Appointment Letter', desc: 'HR appointment letter', prompt: () => `Write a formal appointment letter from ${co.name} to a new employee. Include probation period (3 months), CTC, start date placeholder, confidentiality clause, and professional tone.` },
    { id: 'dispute', label: 'Dispute Resolution', desc: 'Complaint or dispute letter', prompt: () => `Write a formal but professional dispute resolution letter from ${co.name} to a vendor or client regarding a billing discrepancy. Be assertive without being aggressive. Request resolution within 7 business days.` },
  ];

  const generate = async (tpl) => {
    setLoading(p => ({ ...p, [tpl.id]: true }));
    try {
      const txt = await generate(tpl.prompt());
      setDrafts(p => ({ ...p, [tpl.id]: txt || 'Generation failed.' }));
    } catch { setDrafts(p => ({ ...p, [tpl.id]: 'Could not generate. Check internet.' })); }
    setLoading(p => ({ ...p, [tpl.id]: false }));
  };

  const tpl = templates[selected];

  return (
    <div>
      <SHdr title="Communications" sub="AI-drafted business letters and emails using your company context" />
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        <div>
          {templates.map((t, i) => (
            <button key={t.id} onClick={() => setSelected(i)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
                background: selected === i ? T.aml : 'transparent',
                border: `1px solid ${selected === i ? '#FED7AA' : T.bd}`,
                borderRadius: 6, marginBottom: 6, cursor: 'pointer',
                borderLeft: selected === i ? `3px solid ${T.am}` : `3px solid transparent`,
              }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: selected === i ? T.ac : T.tx }}>{t.label}</div>
              <div style={{ fontSize: 10, color: T.t3, marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.tx }}>{tpl.label}</div>
              <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>{tpl.desc} — drafted using your company data</div>
            </div>
            <BtnP onClick={() => generate(tpl)} disabled={loading[tpl.id]}>{loading[tpl.id] ? 'Drafting…' : 'Generate Draft'}</BtnP>
          </div>
          {drafts[tpl.id] ? (
            <div>
              <TextArea value={drafts[tpl.id]} onChange={e => setDrafts(p => ({ ...p, [tpl.id]: e.target.value }))} rows={14} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <BtnP small onClick={() => navigator.clipboard.writeText(drafts[tpl.id])}>Copy</BtnP>
                <BtnG small onClick={() => setDrafts(p => ({ ...p, [tpl.id]: null }))}>Clear</BtnG>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: T.t4, fontSize: 12, fontFamily: mo }}>
              Click "Generate Draft" — AI drafts the letter using your company name, location, and live data
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── AUDIT LOG ─────────────────────────────────────────────────────────────────
function AuditLog({ audit, fmtD }) {
  return (
    <div>
      <SHdr title="Audit Trail" sub={`${audit.length} actions logged — complete change history`}
        action={<BtnG onClick={() => { const text = audit.map(a => `${a.ts} | ${a.action} | ${a.detail}`).join('\n'); const blob = new Blob([text], {type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='nexara_audit_trail.txt'; a.click(); }}>↓ Export</BtnG>} />
      {audit.length === 0 ? <InfoBox type="info">No actions recorded yet. All changes to your data are logged here automatically.</InfoBox> :
        <Table cols="180px 160px 1fr">
          {[<TH key="h">Timestamp</TH>, <TH key="h2">Action</TH>, <TH key="h3">Detail</TH>]}
          {audit.map(a => (
            <TRow key={a.id} cols="180px 160px 1fr">
              <TD mono muted>{new Date(a.ts).toLocaleString('en-IN')}</TD>
              <TD bold>{a.action}</TD>
              <TD muted>{a.detail}</TD>
            </TRow>
          ))}
        </Table>
      }
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings({ co, setCo, save, load }) {
  const [tab, setTab] = useState('firm');
  const [form, setForm] = useState({ ...co });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    save('co', form); setCo(form);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const backup = async () => {
    let data = {};
    if (window.electronAPI) {
      data = await window.electronAPI.dbExport();
    } else {
      ['co','txns','emps','inv','vendors','leads','docs','jobs','contracts','audit'].forEach(k => {
        const v = localStorage.getItem('nx_' + k);
        if (v) data[k] = JSON.parse(v);
      });
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `nexara_backup_${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const restore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (window.electronAPI) {
          await window.electronAPI.dbImport(data);
        } else {
          Object.entries(data).forEach(([k, v]) => save(k, v));
        }
        alert('Restore successful. Please restart the app to see restored data.');
      } catch { alert('Invalid backup file.'); }
    };
    reader.readAsText(file);
  };

  const restoreRef = useRef(null);

  return (
    <div>
      <SHdr title="Settings" sub="Firm profile, data management, and integrations" />
      <Tabs tabs={[{ id: 'firm', label: 'Firm Profile' }, { id: 'data', label: 'Data & Backup' }, { id: 'ai', label: 'AI Setup' }, { id: 'about', label: 'About Nexara' }]} active={tab} onChange={setTab} />

      {tab === 'firm' && (
        <div style={{ maxWidth: 600 }}>
          <Card>
            <CardHdr>Company Information</CardHdr>
            <div style={{ display: 'grid', gap: 14 }}>
              <Inp label="Company Name" value={form.name} onChange={e => up('name', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Inp label="GSTIN" value={form.gstin} onChange={e => up('gstin', e.target.value.toUpperCase())} />
                <Inp label="PAN" value={form.pan} onChange={e => up('pan', e.target.value.toUpperCase())} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Inp label="Phone" value={form.phone} onChange={e => up('phone', e.target.value)} />
                <Inp label="Email" value={form.email} onChange={e => up('email', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Inp label="City" value={form.city} onChange={e => up('city', e.target.value)} />
                <Sel label="State" value={form.state} onChange={e => up('state', e.target.value)} options={STATES} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Sel label="Industry" value={form.industry} onChange={e => up('industry', e.target.value)} options={INDUSTRIES} />
                <Sel label="Financial Year" value={form.fy} onChange={e => up('fy', e.target.value)} options={['2023–24', '2024–25', '2025–26']} />
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <BtnP onClick={saveSettings}>Save Changes</BtnP>
                {saved && <span style={{ color: T.gn, fontSize: 12, fontFamily: mo }}>✓ Saved</span>}
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'data' && (
        <div style={{ maxWidth: 600, display: 'grid', gap: 14 }}>
          <Card>
            <CardHdr>Backup & Restore</CardHdr>
            <InfoBox type="info">All data is stored locally on this device. Regular backups are recommended.</InfoBox>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <BtnP onClick={backup}>↓ Download Backup</BtnP>
              <input ref={restoreRef} type="file" accept=".json" onChange={restore} style={{ display: 'none' }} />
              <BtnG onClick={() => restoreRef.current.click()}>↑ Restore from Backup</BtnG>
            </div>
          </Card>
          <Card>
            <CardHdr>Data Summary</CardHdr>
            {[['Company Profile', 'Stored'],['Transactions', localStorage.getItem('nx_txns') ? JSON.parse(localStorage.getItem('nx_txns')).length + ' entries' : '0'],['Employees', localStorage.getItem('nx_emps') ? JSON.parse(localStorage.getItem('nx_emps')).length + ' records' : '0'],['Inventory', localStorage.getItem('nx_inv') ? JSON.parse(localStorage.getItem('nx_inv')).length + ' items' : '0'],['Documents', localStorage.getItem('nx_docs') ? JSON.parse(localStorage.getItem('nx_docs')).length + ' files' : '0']].map(([l,v])=><StatRow key={l} label={l} value={v} />)}
          </Card>
          <Card>
            <CardHdr danger>Danger Zone</CardHdr>
            <div style={{ display: 'flex', gap: 10 }}>
              <BtnDanger onClick={() => { if (window.confirm('Reset all data? This cannot be undone.')) { ['txns','emps','inv','vendors','leads','docs','jobs','contracts','audit'].forEach(k => localStorage.removeItem('nx_'+k)); window.location.reload(); } }}>Reset All Data</BtnDanger>
              <BtnDanger onClick={() => { if (window.confirm('Reset company profile and restart onboarding?')) { localStorage.removeItem('nx_co'); window.location.reload(); } }}>Re-run Onboarding</BtnDanger>
            </div>
          </Card>
        </div>
      )}

      {tab === 'ai' && (
        <div style={{ maxWidth: 560 }}>
          <Card>
            <CardHdr>Offline AI Configuration</CardHdr>
            <AISetupPanel />
          </Card>
        </div>
      )}

      {tab === 'about' && (
        <Card style={{ maxWidth: 500 }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 32, fontFamily: fs, fontWeight: 700, color: T.tx, marginBottom: 6 }}>Nexara</div>
            <div style={{ fontSize: 11, color: T.t3, letterSpacing: 2, fontFamily: mo, marginBottom: 24 }}>PRIVATE BUSINESS OPERATING SYSTEM</div>
            <div style={{ fontSize: 13, color: T.t2, lineHeight: 1.8, marginBottom: 24 }}>
              Version 1.0 · India Edition<br />
              22 fully-functional modules<br />
              100% offline · Your data never leaves this device
            </div>
            <InfoBox type="success">
              All your business data is stored exclusively on this machine. Nexara has no servers, no cloud sync, and no data sharing. You own your data completely.
            </InfoBox>
          </div>
        </Card>
      )}
    </div>
  );
}

