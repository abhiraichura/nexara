import { generate } from './AIStatus';
import React, { useState, useRef } from 'react';
import {
  T, f, mo, Badge, KPI, Inp, Sel, TextArea, BtnP, BtnG, BtnDanger,
  SHdr, Tabs, Table, TRow, TH, TD, Modal, InfoBox, StatRow, Card, CardHdr, ProgressBar
} from './components';
import { uid, today, fmt, fmtN, fmtD, load, save } from './data';
import { generatePDF } from './pdf';

// ─── ASSETS ────────────────────────────────────────────────────────────────────
export function Assets({ co }) {
  const [assets, setAssets] = useState(() => load('assets', []));
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', cat: 'Equipment', location: '', purchaseDate: today(), cost: '', currentVal: '', condition: 'Good', notes: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const sv = v => { save('assets', v); setAssets(v); };
  const openAdd = (a) => {
    if (a) { setForm({ name: a.name, cat: a.cat, location: a.location || '', purchaseDate: a.purchaseDate, cost: a.cost, currentVal: a.currentVal || '', condition: a.condition || 'Good', notes: a.notes || '' }); setEditId(a.id); }
    else { setForm({ name: '', cat: 'Equipment', location: '', purchaseDate: today(), cost: '', currentVal: '', condition: 'Good', notes: '' }); setEditId(null); }
    setShowAdd(true);
  };
  const saveAsset = () => {
    if (!form.name) return;
    if (editId) sv(assets.map(a => a.id === editId ? { ...a, ...form } : a));
    else sv([{ id: uid(), ...form }, ...assets]);
    setShowAdd(false);
  };
  const del = id => sv(assets.filter(a => a.id !== id));
  const totalCost = assets.reduce((s, a) => s + Number(a.cost || 0), 0);
  const totalCurr = assets.reduce((s, a) => s + Number(a.currentVal || a.cost || 0), 0);

  return (
    <div>
      <SHdr title="Asset Tracking" sub={`${assets.length} assets · Book value: ${fmt(totalCost)} · Current value: ${fmt(totalCurr)}`}
        action={<BtnP onClick={() => openAdd(null)}>+ Add Asset</BtnP>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Total Assets" value={String(assets.length)} sub="tracked items" ac={T.bl} />
        <KPI label="Book Value" value={fmt(totalCost)} sub="purchase cost" ac={T.am} />
        <KPI label="Current Value" value={fmt(totalCurr)} sub="estimated today" ac={T.gn} />
      </div>
      {assets.length === 0 ? <InfoBox type="info">No assets tracked yet. Add equipment, vehicles, furniture, or any fixed asset.</InfoBox> :
        <Table cols="1fr 100px 100px 80px 90px 90px 70px 120px">
          {[<TH key="h">Asset</TH>, <TH key="h2">Category</TH>, <TH key="h3">Location</TH>, <TH key="h4">Condition</TH>, <TH key="h5" right>Cost</TH>, <TH key="h6" right>Curr. Value</TH>, <TH key="h7">Date</TH>, <TH key="h8">Actions</TH>]}
          {assets.map(a => (
            <TRow key={a.id} cols="1fr 100px 100px 80px 90px 90px 70px 120px">
              <div><TD bold>{a.name}</TD>{a.notes && <div style={{ fontSize: 11, color: T.t3 }}>{a.notes.slice(0, 40)}</div>}</div>
              <TD muted>{a.cat}</TD>
              <TD muted>{a.location || '—'}</TD>
              <Badge l={a.condition} col={a.condition === 'Good' ? 'green' : a.condition === 'Fair' ? 'amber' : 'red'} />
              <TD right mono>{fmtN(a.cost)}</TD>
              <TD right mono>{fmtN(a.currentVal || a.cost)}</TD>
              <TD mono muted>{a.purchaseDate}</TD>
              <div style={{ display: 'flex', gap: 4 }}>
                <BtnG small onClick={() => openAdd(a)}>Edit</BtnG>
                <BtnDanger small onClick={() => del(a.id)}>Del</BtnDanger>
              </div>
            </TRow>
          ))}
        </Table>
      }
      {showAdd && (
        <Modal title={editId ? 'Edit Asset' : 'Add Asset'} onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Asset Name *" value={form.name} onChange={e => up('name', e.target.value)} placeholder="Dell Laptop, Toyota Innova, CNC Machine…" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Sel label="Category" value={form.cat} onChange={e => up('cat', e.target.value)} options={['Equipment', 'Vehicle', 'Furniture', 'Electronics', 'Software', 'Land & Building', 'Other']} />
              <Inp label="Location" value={form.location} onChange={e => up('location', e.target.value)} placeholder="Office, Warehouse, Site A…" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => up('purchaseDate', e.target.value)} />
              <Inp label="Purchase Cost (₹)" type="number" value={form.cost} onChange={e => up('cost', e.target.value)} />
              <Inp label="Current Value (₹)" type="number" value={form.currentVal} onChange={e => up('currentVal', e.target.value)} placeholder="Leave blank = same as cost" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <Sel label="Condition" value={form.condition} onChange={e => up('condition', e.target.value)} options={['Excellent', 'Good', 'Fair', 'Poor', 'Scrapped']} />
              <Inp label="Notes" value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="Serial no, warranty info…" />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={saveAsset} disabled={!form.name}>{editId ? 'Save' : 'Add Asset'}</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── GOALS ─────────────────────────────────────────────────────────────────────
export function Goals({ co }) {
  const [goals, setGoals] = useState(() => load('goals', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', cat: 'Revenue', target: '', unit: '₹', deadline: '', progress: '0', status: 'On Track', notes: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('goals', v); setGoals(v); };
  const addGoal = () => {
    if (!form.title) return;
    sv([{ id: uid(), ...form }, ...goals]); setShowAdd(false);
    setForm({ title: '', cat: 'Revenue', target: '', unit: '₹', deadline: '', progress: '0', status: 'On Track', notes: '' });
  };
  const del = id => sv(goals.filter(g => g.id !== id));
  const updateProgress = (id, progress) => sv(goals.map(g => g.id === id ? { ...g, progress } : g));
  const updateStatus = (id, status) => sv(goals.map(g => g.id === id ? { ...g, status } : g));

  const onTrack = goals.filter(g => g.status === 'On Track').length;
  const atRisk = goals.filter(g => g.status === 'At Risk').length;
  const done = goals.filter(g => g.status === 'Achieved').length;

  return (
    <div>
      <SHdr title="Strategic Goals & OKRs" sub={`${goals.length} goals · ${onTrack} on track · ${atRisk} at risk · ${done} achieved`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ Add Goal</BtnP>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="On Track" value={String(onTrack)} sub="progressing well" ac={T.gn} />
        <KPI label="At Risk" value={String(atRisk)} sub="needs attention" ac={T.rd} />
        <KPI label="Achieved" value={String(done)} sub="completed goals" ac={T.am} />
      </div>
      {goals.length === 0 ? <InfoBox type="info">No goals set. Add revenue targets, headcount goals, or any strategic objective.</InfoBox> :
        goals.map(g => (
          <Card key={g.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{g.title}</span>
                  <Badge l={g.cat} col="blue" />
                  <Badge l={g.status} col={g.status === 'Achieved' ? 'green' : g.status === 'At Risk' ? 'red' : 'amber'} />
                </div>
                {g.target && <div style={{ fontSize: 12, color: T.t3 }}>Target: {g.unit}{g.target}{g.deadline ? ` · Due: ${fmtD(g.deadline)}` : ''}</div>}
                {g.notes && <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>{g.notes}</div>}
              </div>
              <BtnDanger small onClick={() => del(g.id)}>Del</BtnDanger>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: T.t3 }}>Progress</span>
                  <span style={{ fontSize: 11, fontFamily: mo, color: T.am, fontWeight: 600 }}>{g.progress}%</span>
                </div>
                <ProgressBar value={Number(g.progress)} max={100}
                  color={g.status === 'Achieved' ? T.gn : g.status === 'At Risk' ? T.rd : T.am} />
              </div>
              <input type="range" min="0" max="100" value={g.progress}
                onChange={e => updateProgress(g.id, e.target.value)}
                style={{ width: 80, accentColor: T.am }} />
              <Sel label="" value={g.status} onChange={e => updateStatus(g.id, e.target.value)}
                options={['On Track', 'At Risk', 'Achieved', 'Paused']} />
            </div>
          </Card>
        ))
      }
      {showAdd && (
        <Modal title="Add Strategic Goal" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Goal Title *" value={form.title} onChange={e => up('title', e.target.value)} placeholder="Reach ₹1Cr revenue by Dec 2025" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Sel label="Category" value={form.cat} onChange={e => up('cat', e.target.value)} options={['Revenue', 'Profitability', 'Headcount', 'Sales', 'Operations', 'Compliance', 'Growth', 'Other']} />
              <Inp label="Deadline" type="date" value={form.deadline} onChange={e => up('deadline', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Target Value" value={form.target} onChange={e => up('target', e.target.value)} placeholder="10000000" />
              <Sel label="Unit" value={form.unit} onChange={e => up('unit', e.target.value)} options={['₹', '%', 'units', 'employees', 'clients', 'days', 'other']} />
            </div>
            <TextArea label="Notes / Key Results" value={form.notes} onChange={e => up('notes', e.target.value)} rows={3} placeholder="Key results, milestones, strategy…" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addGoal} disabled={!form.title}>Add Goal</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── RISK ──────────────────────────────────────────────────────────────────────
export function Risk({ co }) {
  const [risks, setRisks] = useState(() => load('risks', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', cat: 'Financial', likelihood: 'Medium', impact: 'Medium', status: 'Open', owner: '', mitigation: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('risks', v); setRisks(v); };
  const addRisk = () => {
    if (!form.title) return;
    sv([{ id: uid(), ...form, date: today() }, ...risks]); setShowAdd(false);
    setForm({ title: '', cat: 'Financial', likelihood: 'Medium', impact: 'Medium', status: 'Open', owner: '', mitigation: '' });
  };
  const del = id => sv(risks.filter(r => r.id !== id));
  const scoreColor = (l, i) => {
    const s = { High: 3, Medium: 2, Low: 1 };
    const score = s[l] * s[i];
    return score >= 6 ? T.rd : score >= 3 ? T.am : T.gn;
  };
  const highRisks = risks.filter(r => r.likelihood === 'High' && r.impact === 'High').length;

  return (
    <div>
      <SHdr title="Risk Assessment" sub={`${risks.length} risks identified · ${highRisks} critical`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ Add Risk</BtnP>} />
      {highRisks > 0 && <div style={{ marginBottom: 16 }}><InfoBox type="error">{highRisks} high-likelihood, high-impact risk(s) require immediate attention.</InfoBox></div>}
      {risks.length === 0 ? <InfoBox type="info">No risks logged. Use this module to track financial, operational, compliance, and strategic risks.</InfoBox> :
        <Table cols="1fr 100px 90px 80px 80px 1fr 80px">
          {[<TH key="h">Risk</TH>, <TH key="h2">Category</TH>, <TH key="h3">Likelihood</TH>, <TH key="h4">Impact</TH>, <TH key="h5">Score</TH>, <TH key="h6">Mitigation</TH>, <TH key="h7">Action</TH>]}
          {risks.map(r => {
            const col = scoreColor(r.likelihood, r.impact);
            return (
              <TRow key={r.id} cols="1fr 100px 90px 80px 80px 1fr 80px">
                <div><TD bold>{r.title}</TD>{r.owner && <div style={{ fontSize: 11, color: T.t3 }}>Owner: {r.owner}</div>}</div>
                <TD muted>{r.cat}</TD>
                <Badge l={r.likelihood} col={r.likelihood === 'High' ? 'red' : r.likelihood === 'Medium' ? 'amber' : 'green'} />
                <Badge l={r.impact} col={r.impact === 'High' ? 'red' : r.impact === 'Medium' ? 'amber' : 'green'} />
                <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{r.likelihood === 'High' && r.impact === 'High' ? 'CRITICAL' : r.likelihood === 'Low' && r.impact === 'Low' ? 'LOW' : 'MEDIUM'}</span>
                <TD muted>{r.mitigation || '—'}</TD>
                <BtnDanger small onClick={() => del(r.id)}>Del</BtnDanger>
              </TRow>
            );
          })}
        </Table>
      }
      {showAdd && (
        <Modal title="Log Risk" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Risk Title *" value={form.title} onChange={e => up('title', e.target.value)} placeholder="Key customer churn, Regulatory change, Cash flow gap…" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Sel label="Category" value={form.cat} onChange={e => up('cat', e.target.value)} options={['Financial', 'Operational', 'Compliance', 'Strategic', 'Reputational', 'Technology', 'HR', 'Other']} />
              <Sel label="Likelihood" value={form.likelihood} onChange={e => up('likelihood', e.target.value)} options={['High', 'Medium', 'Low']} />
              <Sel label="Impact" value={form.impact} onChange={e => up('impact', e.target.value)} options={['High', 'Medium', 'Low']} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Risk Owner" value={form.owner} onChange={e => up('owner', e.target.value)} placeholder="Name or department" />
              <Sel label="Status" value={form.status} onChange={e => up('status', e.target.value)} options={['Open', 'Mitigated', 'Accepted', 'Closed']} />
            </div>
            <TextArea label="Mitigation Plan" value={form.mitigation} onChange={e => up('mitigation', e.target.value)} rows={3} placeholder="Steps taken or planned to reduce this risk…" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addRisk} disabled={!form.title}>Log Risk</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PAYROLL RUN ───────────────────────────────────────────────────────────────
export function PayrollRun({ emps, calcPay, co }) {
  const [runs, setRuns] = useState(() => load('payroll_runs', []));
  const [confirming, setConfirming] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const sv = v => { save('payroll_runs', v); setRuns(v); };

  const alreadyRun = runs.find(r => r.month === month);
  const totalNet = emps.reduce((s, e) => s + calcPay(e.ctc).net, 0);
  const totalPF = emps.reduce((s, e) => s + calcPay(e.ctc).pfEmp + calcPay(e.ctc).pfEr, 0);
  const totalESIC = emps.reduce((s, e) => s + calcPay(e.ctc).esic + calcPay(e.ctc).esicEr, 0);
  const totalTDS = emps.reduce((s, e) => s + calcPay(e.ctc).tds, 0);

  const runPayroll = () => {
    const run = {
      id: uid(), month, date: today(), employees: emps.length,
      totalNet, totalPF, totalESIC, totalTDS,
      total: totalNet + totalPF + totalESIC + totalTDS,
      breakdown: emps.map(e => ({ name: e.name, role: e.role, ...calcPay(e.ctc) })),
    };
    sv([run, ...runs]); setConfirming(false);
  };

  return (
    <div>
      <SHdr title="Payroll Processing" sub="Run monthly payroll and track payment history" />
      <Card style={{ marginBottom: 20 }}>
        <CardHdr>Run Payroll</CardHdr>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
          <KPI label="Employees" value={String(emps.length)} sub="to be paid" ac={T.bl} />
          <KPI label="Net Payroll" value={fmt(totalNet)} sub="take-home total" ac={T.gn} />
          <KPI label="PF (Emp + Er)" value={fmtN(totalPF)} sub="to deposit by 15th" ac={T.am} />
          <KPI label="TDS to Deposit" value={fmtN(totalTDS)} sub="by 7th next month" ac={T.rd} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 180 }}>
            <Inp label="Pay Month" type="month" value={month} onChange={e => setMonth(e.target.value)} />
          </div>
          {alreadyRun
            ? <InfoBox type="success">Payroll already processed for {month}. See history below.</InfoBox>
            : emps.length === 0
              ? <InfoBox type="warning">Add employees in HR & Payroll first.</InfoBox>
              : <BtnP onClick={() => setConfirming(true)}>Process Payroll for {month}</BtnP>
          }
        </div>
      </Card>
      {runs.length > 0 && (
        <Table cols="100px 80px 100px 100px 100px 100px">
          {[<TH key="h">Month</TH>, <TH key="h2">Staff</TH>, <TH key="h3" right>Net Payroll</TH>, <TH key="h4" right>PF</TH>, <TH key="h5" right>TDS</TH>, <TH key="h6" right>Total Cost</TH>]}
          {runs.map(r => (
            <TRow key={r.id} cols="100px 80px 100px 100px 100px 100px">
              <TD mono bold>{r.month}</TD>
              <TD>{r.employees}</TD>
              <TD right color={T.gn}>{fmtN(r.totalNet)}</TD>
              <TD right muted>{fmtN(r.totalPF)}</TD>
              <TD right muted>{fmtN(r.totalTDS)}</TD>
              <TD right bold>{fmtN(r.total)}</TD>
            </TRow>
          ))}
        </Table>
      )}
      {confirming && (
        <Modal title="Confirm Payroll Run" onClose={() => setConfirming(false)}>
          <InfoBox type="warning">You are about to process payroll for {month}. This will record the run in your history.</InfoBox>
          <div style={{ marginTop: 16 }}>
            <StatRow label="Employees to pay" value={emps.length} />
            <StatRow label="Net salaries" value={fmtN(totalNet)} />
            <StatRow label="PF (employer + employee)" value={fmtN(totalPF)} />
            <StatRow label="ESIC (employer + employee)" value={fmtN(totalESIC)} />
            <StatRow label="TDS to deduct & deposit" value={fmtN(totalTDS)} />
            <StatRow label="TOTAL COST TO COMPANY" value={fmtN(totalNet + totalPF + totalESIC + totalTDS)} highlight />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <BtnG onClick={() => setConfirming(false)}>Cancel</BtnG>
            <BtnP onClick={runPayroll}>Confirm & Process</BtnP>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SUPPLIER COMPARISON ───────────────────────────────────────────────────────
export function SupplierComparison({ vendors }) {
  const [items, setItems] = useState(() => load('supplier_compare', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ item: '', vendor1: '', price1: '', vendor2: '', price2: '', vendor3: '', price3: '', unit: 'pcs', notes: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('supplier_compare', v); setItems(v); };
  const addItem = () => {
    if (!form.item) return;
    sv([{ id: uid(), ...form }, ...items]); setShowAdd(false);
    setForm({ item: '', vendor1: '', price1: '', vendor2: '', price2: '', vendor3: '', price3: '', unit: 'pcs', notes: '' });
  };
  const del = id => sv(items.filter(i => i.id !== id));

  return (
    <div>
      <SHdr title="Supplier Price Comparison" sub="Compare quotes from multiple vendors for the same item"
        action={<BtnP onClick={() => setShowAdd(true)}>+ Compare Item</BtnP>} />
      {items.length === 0 ? <InfoBox type="info">No comparisons yet. Add an item to compare prices from different vendors.</InfoBox> :
        items.map(item => {
          const prices = [
            { vendor: item.vendor1, price: Number(item.price1) },
            { vendor: item.vendor2, price: Number(item.price2) },
            { vendor: item.vendor3, price: Number(item.price3) },
          ].filter(p => p.vendor && p.price > 0);
          const cheapest = prices.reduce((a, b) => b.price < a.price ? b : a, prices[0]);
          const maxP = Math.max(...prices.map(p => p.price));
          return (
            <Card key={item.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{item.item}</span>
                  <span style={{ fontSize: 11, color: T.t3, marginLeft: 8 }}>per {item.unit}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {cheapest && <Badge l={`Best: ${cheapest.vendor} @ ${fmtN(cheapest.price)}`} col="green" />}
                  <BtnDanger small onClick={() => del(item.id)}>Del</BtnDanger>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {prices.map((p, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 6, border: `1px solid ${p.vendor === cheapest?.vendor ? T.gn : T.bd}`,
                    background: p.vendor === cheapest?.vendor ? T.gl : T.sf2,
                  }}>
                    <div style={{ fontSize: 11, color: T.t3, marginBottom: 4 }}>{p.vendor}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: p.vendor === cheapest?.vendor ? T.gn : T.tx }}>
                      {fmtN(p.price)}
                    </div>
                    <ProgressBar value={maxP - p.price + 1} max={maxP} color={p.vendor === cheapest?.vendor ? T.gn : T.bd2} />
                    {cheapest && p.vendor !== cheapest.vendor && p.price > 0 && (
                      <div style={{ fontSize: 10, color: T.rd, marginTop: 4, fontFamily: mo }}>
                        +{fmtN(p.price - cheapest.price)} vs best
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {item.notes && <div style={{ fontSize: 11, color: T.t3, marginTop: 8 }}>{item.notes}</div>}
            </Card>
          );
        })
      }
      {showAdd && (
        <Modal title="Add Price Comparison" onClose={() => setShowAdd(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Item / Service *" value={form.item} onChange={e => up('item', e.target.value)} placeholder="Steel Rods 10mm" />
              <Sel label="Unit" value={form.unit} onChange={e => up('unit', e.target.value)} options={['pcs', 'kg', 'litre', 'meter', 'box', 'ton', 'set']} />
            </div>
            {[['1', 'First'], ['2', 'Second'], ['3', 'Third']].map(([n, label]) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Inp label={`${label} Vendor`} value={form[`vendor${n}`]} onChange={e => up(`vendor${n}`, e.target.value)} placeholder="Vendor name" />
                <Inp label={`${label} Price (₹)`} type="number" value={form[`price${n}`]} onChange={e => up(`price${n}`, e.target.value)} />
              </div>
            ))}
            <TextArea label="Notes" value={form.notes} onChange={e => up('notes', e.target.value)} rows={2} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addItem} disabled={!form.item}>Add Comparison</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── INVOICE GENERATOR ─────────────────────────────────────────────────────────
export function InvoiceGenerator({ co, leads, vendors }) {
  const [invoices, setInvoices] = useState(() => load('invoices', []));
  const [showNew, setShowNew] = useState(false);
  const [viewInv, setViewInv] = useState(null);
  const [form, setForm] = useState({
    number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    date: today(), dueDate: '', billTo: '', billGstin: '',
    items: [{ desc: '', hsn: '', qty: '1', rate: '', gst: '18' }],
    notes: 'Payment due within 30 days. NEFT/IMPS accepted.',
    bank: '', account: '', ifsc: '',
  });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('invoices', v); setInvoices(v); };

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { desc: '', hsn: '', qty: '1', rate: '', gst: '18' }] }));
  const updItem = (i, k, v) => setForm(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));
  const delItem = i => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  const subtotal = form.items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.rate || 0), 0);
  const gstAmt = form.items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.rate || 0) * Number(i.gst || 0) / 100, 0);
  const total = subtotal + gstAmt;

  const saveInvoice = () => {
    const inv = { id: uid(), ...form, subtotal, gstAmt, total, status: 'Draft', createdAt: today() };
    sv([inv, ...invoices]); setShowNew(false);
  };

  const exportPDF = async (inv) => {
    await generatePDF('invoice', { co, inv });
  };

  return (
    <div>
      <SHdr title="Invoice Generator" sub={`${invoices.length} invoices created · Total: ${fmt(invoices.reduce((s, i) => s + Number(i.total || 0), 0))}`}
        action={<BtnP onClick={() => setShowNew(true)}>+ New Invoice</BtnP>} />
      {invoices.length === 0 ? <InfoBox type="info">No invoices yet. Create your first tax invoice.</InfoBox> :
        <Table cols="120px 1fr 100px 100px 80px 120px">
          {[<TH key="h">Invoice #</TH>, <TH key="h2">Bill To</TH>, <TH key="h3">Date</TH>, <TH key="h4" right>Amount</TH>, <TH key="h5">Status</TH>, <TH key="h6">Actions</TH>]}
          {invoices.map(inv => (
            <TRow key={inv.id} cols="120px 1fr 100px 100px 80px 120px">
              <TD mono bold color={T.am}>{inv.number}</TD>
              <TD>{inv.billTo || '—'}</TD>
              <TD mono muted>{inv.date}</TD>
              <TD right bold>{fmtN(inv.total)}</TD>
              <Badge l={inv.status} col={inv.status === 'Paid' ? 'green' : inv.status === 'Sent' ? 'blue' : 'neutral'} />
              <div style={{ display: 'flex', gap: 4 }}>
                <BtnG small onClick={() => setViewInv(inv)}>View</BtnG>
                <BtnP small onClick={() => exportPDF(inv)}>PDF</BtnP>
              </div>
            </TRow>
          ))}
        </Table>
      }

      {showNew && (
        <Modal title="New Tax Invoice" onClose={() => setShowNew(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Invoice Number" value={form.number} onChange={e => up('number', e.target.value)} />
              <Inp label="Invoice Date" type="date" value={form.date} onChange={e => up('date', e.target.value)} />
              <Inp label="Due Date" type="date" value={form.dueDate} onChange={e => up('dueDate', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Bill To (Company/Name)" value={form.billTo} onChange={e => up('billTo', e.target.value)} placeholder="Client name" />
              <Inp label="Customer GSTIN" value={form.billGstin} onChange={e => up('billGstin', e.target.value.toUpperCase())} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.t3, letterSpacing: 0.8, fontFamily: mo, marginBottom: 8, fontWeight: 500 }}>LINE ITEMS</div>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 60px 90px 70px 32px', gap: 6, marginBottom: 6, alignItems: 'flex-end' }}>
                  <Inp value={item.desc} onChange={e => updItem(i, 'desc', e.target.value)} placeholder="Description" />
                  <Inp value={item.hsn} onChange={e => updItem(i, 'hsn', e.target.value)} placeholder="HSN" />
                  <Inp type="number" value={item.qty} onChange={e => updItem(i, 'qty', e.target.value)} placeholder="Qty" />
                  <Inp type="number" value={item.rate} onChange={e => updItem(i, 'rate', e.target.value)} placeholder="Rate ₹" />
                  <Sel value={item.gst} onChange={e => updItem(i, 'gst', e.target.value)} options={['0', '5', '12', '18', '28']} />
                  <button onClick={() => delItem(i)} style={{ width: 28, height: 34, background: T.rl, border: `1px solid ${T.rd}44`, borderRadius: 5, cursor: 'pointer', color: T.rd, fontSize: 14 }}>×</button>
                </div>
              ))}
              <BtnG small onClick={addItem}>+ Add Line</BtnG>
            </div>
            <div style={{ background: T.sf2, padding: 12, borderRadius: 6, border: `1px solid ${T.bd}` }}>
              <StatRow label="Subtotal" value={fmtN(subtotal)} />
              <StatRow label="GST" value={fmtN(gstAmt)} />
              <StatRow label="TOTAL" value={fmtN(total)} highlight />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Bank Name" value={form.bank} onChange={e => up('bank', e.target.value)} placeholder="HDFC Bank" />
              <Inp label="Account Number" value={form.account} onChange={e => up('account', e.target.value)} />
              <Inp label="IFSC Code" value={form.ifsc} onChange={e => up('ifsc', e.target.value.toUpperCase())} />
            </div>
            <TextArea label="Payment Terms / Notes" value={form.notes} onChange={e => up('notes', e.target.value)} rows={2} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowNew(false)}>Cancel</BtnG>
              <BtnP onClick={saveInvoice}>Save Invoice</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DEBT RECOVERY & TENDER (via Comms module extension) ──────────────────────
export function DebtTender({ co, leads, vendors }) {
  const [tab, setTab] = useState('debt');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [debtForm, setDebtForm] = useState({ party: '', amount: '', overdueBy: '30', pastAttempts: '1' });
  const [tenderForm, setTenderForm] = useState({ project: '', scope: '', budget: '', deadline: '' });
  const upD = (k, v) => setDebtForm(p => ({ ...p, [k]: v }));
  const upT = (k, v) => setTenderForm(p => ({ ...p, [k]: v }));

  const generate = async (prompt) => {
    setLoading(true); setDraft('');
    try {
      const txt = await generate(prompt);
      setDraft(txt || 'Could not generate.');
    } catch (e) { setDraft('AI not ready: ' + e.message); }
    setLoading(false);
  };

  return (
    <div>
      <SHdr title="Debt Recovery & Tender/RFP" sub="AI-drafted legal and procurement communications" />
      <Tabs tabs={[{ id: 'debt', label: 'Debt Recovery' }, { id: 'tender', label: 'Tender / RFP Response' }]} active={tab} onChange={setTab} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <Card>
          {tab === 'debt' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <CardHdr>Recovery Details</CardHdr>
              <Inp label="Debtor Name / Company" value={debtForm.party} onChange={e => upD('party', e.target.value)} placeholder="ABC Traders Pvt. Ltd." />
              <Inp label="Amount Overdue (₹)" type="number" value={debtForm.amount} onChange={e => upD('amount', e.target.value)} />
              <Inp label="Overdue by (days)" type="number" value={debtForm.overdueBy} onChange={e => upD('overdueBy', e.target.value)} />
              <Sel label="Previous Attempts" value={debtForm.pastAttempts} onChange={e => upD('pastAttempts', e.target.value)} options={['0 (first notice)', '1', '2', '3+ (final notice)']} />
              <BtnP disabled={loading || !debtForm.party || !debtForm.amount} onClick={() => generate(
                `Write a formal debt recovery letter from ${co.name} to ${debtForm.party}. Amount overdue: ₹${Number(debtForm.amount).toLocaleString('en-IN')}. Overdue by ${debtForm.overdueBy} days. Previous attempts: ${debtForm.pastAttempts}. Tone: ${debtForm.pastAttempts.includes('3') ? 'firm final notice, mention legal action' : 'professional but stern'}. Include reference to legal remedies if unpaid. Sign off as ${co.name} management.`
              )}>{loading ? 'Drafting…' : 'Generate Recovery Letter'}</BtnP>
            </div>
          )}
          {tab === 'tender' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <CardHdr>Tender Details</CardHdr>
              <Inp label="Project / Tender Name" value={tenderForm.project} onChange={e => upT('project', e.target.value)} />
              <TextArea label="Scope of Work" value={tenderForm.scope} onChange={e => upT('scope', e.target.value)} rows={3} placeholder="Describe what work is required…" />
              <Inp label="Budget / Value (₹)" value={tenderForm.budget} onChange={e => upT('budget', e.target.value)} />
              <Inp label="Submission Deadline" type="date" value={tenderForm.deadline} onChange={e => upT('deadline', e.target.value)} />
              <BtnP disabled={loading || !tenderForm.project} onClick={() => generate(
                `Write a professional tender/RFP response from ${co.name} (${co.industry} company in ${co.city}) for the project: "${tenderForm.project}". Scope: ${tenderForm.scope || 'as described in tender documents'}. Budget: ${tenderForm.budget ? '₹' + tenderForm.budget : 'as quoted'}. Deadline: ${tenderForm.deadline || 'as specified'}. Highlight our experience, quality, and competitive pricing. Formal structure: introduction, understanding of scope, our approach, timeline, and a closing call to action.`
              )}>{loading ? 'Drafting…' : 'Generate RFP Response'}</BtnP>
            </div>
          )}
        </Card>
        <Card>
          {draft ? (
            <div>
              <CardHdr>Generated Draft</CardHdr>
              <TextArea value={draft} onChange={e => setDraft(e.target.value)} rows={18} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <BtnP small onClick={() => navigator.clipboard.writeText(draft)}>Copy</BtnP>
                <BtnG small onClick={() => { const w = window.open(); w.document.write(`<pre style="font-family:Georgia;padding:40px;line-height:1.8;font-size:14px">${draft}</pre>`); w.print(); }}>Print</BtnG>
                <BtnG small onClick={() => setDraft('')}>Clear</BtnG>
              </div>
            </div>
          ) : (
            <div style={{ color: T.t4, textAlign: 'center', padding: '60px 20px', fontSize: 12, fontFamily: mo }}>
              {loading ? 'AI is drafting your letter…' : 'Fill in the details and click Generate'}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── TRAINING MATERIAL GENERATOR ──────────────────────────────────────────────
export function Training({ emps, co }) {
  const [topic, setTopic] = useState('');
  const [role, setRole] = useState('All Employees');
  const [material, setMaterial] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(() => load('training_materials', []));
  const svSaved = v => { save('training_materials', v); setSaved(v); };

  const runGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setMaterial('');
    try {
      const txt = await generate(
        `Create a structured training guide for ${co.name} (${co.industry} company) on the topic: "${topic}". Target audience: ${role}. Include: 1) Learning Objectives, 2) Key Concepts (with examples), 3) Step-by-step process, 4) Common mistakes to avoid, 5) Quick reference checklist. Keep it practical and specific to a ${co.industry} business context.`
      );
      setMaterial(txt || 'Could not generate.');
    } catch (e) { setMaterial('AI not ready: ' + e.message); }
    setLoading(false);
  };

  const saveMaterial = () => {
    if (!material) return;
    svSaved([{ id: uid(), topic, role, material, date: today() }, ...saved]);
  };

  const roles = ['All Employees', 'New Joiners', 'Sales Team', 'Accounts Team', 'Operations', 'Management', ...(emps.map(e => e.role).filter(Boolean))];
  const uniqueRoles = [...new Set(roles)];

  return (
    <div>
      <SHdr title="Training Material Generator" sub="AI-generated training guides tailored to your business and role" />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <CardHdr>Generate Training Guide</CardHdr>
            <div style={{ display: 'grid', gap: 12 }}>
              <Inp label="Training Topic" value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="GST filing process, Sales techniques, Safety procedures…" />
              <Sel label="Target Audience" value={role} onChange={e => setRole(e.target.value)} options={uniqueRoles} />
              <BtnP onClick={runGenerate} disabled={loading || !topic.trim()}>
                {loading ? 'Generating…' : 'Generate Training Guide'}
              </BtnP>
            </div>
          </Card>
          {saved.length > 0 && (
            <Card>
              <CardHdr>Saved Materials ({saved.length})</CardHdr>
              {saved.map(s => (
                <div key={s.id} onClick={() => setMaterial(s.material)}
                  style={{ padding: '8px 0', borderBottom: `1px solid ${T.sf2}`, cursor: 'pointer' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.tx }}>{s.topic}</div>
                  <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, marginTop: 2 }}>{s.role} · {s.date}</div>
                </div>
              ))}
            </Card>
          )}
        </div>
        <Card>
          {material ? (
            <div>
              <CardHdr action={
                <div style={{ display: 'flex', gap: 8 }}>
                  <BtnG small onClick={saveMaterial}>Save</BtnG>
                  <BtnP small onClick={() => navigator.clipboard.writeText(material)}>Copy</BtnP>
                </div>
              }>Generated Guide</CardHdr>
              <div style={{ fontSize: 13, color: T.t2, lineHeight: 1.9, whiteSpace: 'pre-wrap', maxHeight: 520, overflowY: 'auto' }}>
                {material}
              </div>
            </div>
          ) : (
            <div style={{ color: T.t4, textAlign: 'center', padding: '60px 20px', fontSize: 12, fontFamily: mo }}>
              {loading ? 'AI is writing your training material…' : 'Enter a topic and generate a custom training guide for your team'}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── REGULATORY Q&A ────────────────────────────────────────────────────────────
export function RegulatoryQA({ co }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => load('reg_qa_history', []));
  const svH = v => { save('reg_qa_history', v); setHistory(v); };

  const QUICK = [
    'What are my GST filing deadlines?',
    'When do I need a statutory audit?',
    'What is the PF contribution rate for employers?',
    'Do I need to register under MSME / Udyam?',
    'What are the penalties for late GST filing?',
    'When does my company need to file GSTR-9?',
    'What is the threshold for TDS deduction?',
    'Do I need FSSAI license for my business?',
  ];

  const ask = async (q) => {
    const finalQ = q || question;
    if (!finalQ.trim()) return;
    setQuestion(finalQ); setLoading(true); setAnswer('');
    try {
      const ans = await generate(
        finalQ,
        `You are a regulatory compliance advisor for Indian businesses. The user's company is ${co.name}, a ${co.industry} business in ${co.state}. Answer their compliance question clearly, citing specific rules, thresholds, and deadlines where applicable. Always end with: "Verify with your CA or legal advisor before acting on this." Be specific and practical.`
      );
      setAnswer(ans);
      svH([{ id: uid(), q: finalQ, a: ans, date: today() }, ...history].slice(0, 20));
    } catch { setAnswer('Could not connect. Check your internet connection.'); }
    setLoading(false);
  };

  return (
    <div>
      <SHdr title="Regulatory & Compliance Q&A" sub={`AI compliance advisor for ${co.industry} businesses in ${co.state} — powered by Indian regulatory knowledge`} />
      <InfoBox type="warning">All answers are for reference only. Always verify with your CA or legal advisor before taking action.</InfoBox>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <div>
          <Card style={{ marginBottom: 14 }}>
            <CardHdr>Ask a Compliance Question</CardHdr>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <TextArea value={question} onChange={e => setQuestion(e.target.value)}
                placeholder="e.g. My turnover crossed ₹5 crore this year. What changes for GST compliance?" rows={4} />
              <BtnP onClick={() => ask()} disabled={loading || !question.trim()}>
                {loading ? 'Analysing…' : 'Get Answer'}
              </BtnP>
            </div>
          </Card>
          <Card>
            <CardHdr>Quick Questions</CardHdr>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {QUICK.map(q => (
                <button key={q} onClick={() => ask(q)}
                  style={{
                    padding: '8px 12px', background: T.sf2, border: `1px solid ${T.bd}`,
                    borderRadius: 5, cursor: 'pointer', fontSize: 12, color: T.t2,
                    textAlign: 'left', lineHeight: 1.4,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.am}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.bd}>
                  {q}
                </button>
              ))}
            </div>
          </Card>
        </div>
        <div>
          <Card style={{ marginBottom: 14, minHeight: 300 }}>
            <CardHdr action={answer ? <BtnG small onClick={() => navigator.clipboard.writeText(answer)}>Copy</BtnG> : null}>
              Answer
            </CardHdr>
            {answer ? (
              <div style={{ fontSize: 13, color: T.t2, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{answer}</div>
            ) : (
              <div style={{ color: T.t4, textAlign: 'center', padding: '40px 0', fontSize: 12, fontFamily: mo }}>
                {loading ? 'Analysing your question against Indian regulations…' : 'Ask a question to get a specific compliance answer'}
              </div>
            )}
          </Card>
          {history.length > 0 && (
            <Card>
              <CardHdr>Recent Questions ({history.length})</CardHdr>
              {history.slice(0, 5).map(h => (
                <div key={h.id} onClick={() => { setQuestion(h.q); setAnswer(h.a); }}
                  style={{ padding: '8px 0', borderBottom: `1px solid ${T.sf2}`, cursor: 'pointer' }}>
                  <div style={{ fontSize: 12, color: T.t2 }}>{h.q.slice(0, 70)}{h.q.length > 70 ? '…' : ''}</div>
                  <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, marginTop: 2 }}>{h.date}</div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── INSURANCE DOCUMENT ANALYSER ──────────────────────────────────────────────
export function Insurance({ co }) {
  const [policies, setPolicies] = useState(() => load('insurance', []));
  const [showAdd, setShowAdd] = useState(false);
  const [analysing, setAnalysing] = useState(null);
  const [form, setForm] = useState({ type: 'General Liability', insurer: '', policyNo: '', premium: '', sumInsured: '', start: today(), end: '', coverage: '', exclusions: '', notes: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('insurance', v); setPolicies(v); };

  const addPolicy = () => {
    if (!form.type || !form.insurer) return;
    sv([{ id: uid(), ...form, analysis: '' }, ...policies]);
    setShowAdd(false);
    setForm({ type: 'General Liability', insurer: '', policyNo: '', premium: '', sumInsured: '', start: today(), end: '', coverage: '', exclusions: '', notes: '' });
  };

  const analyse = async (policy) => {
    setAnalysing(policy.id);
    try {
      const analysis = await generate(
        `Analyse this insurance policy for ${co.name} (${co.industry}):\nType: ${policy.type}\nInsurer: ${policy.insurer}\nSum Insured: ₹${policy.sumInsured}\nCoverage: ${policy.coverage}\nExclusions: ${policy.exclusions}\n\nProvide: 1) Coverage adequacy for a ${co.industry} business, 2) Key risks NOT covered by this policy, 3) Recommended additional coverage, 4) Red flags or concerns. Be specific and practical.`
      );
      sv(policies.map(p => p.id === policy.id ? { ...p, analysis } : p));
    } catch { }
    setAnalysing(null);
  };

  const del = id => sv(policies.filter(p => p.id !== id));
  const expiringSoon = policies.filter(p => {
    if (!p.end) return false;
    const days = Math.ceil((new Date(p.end) - new Date()) / 86400000);
    return days <= 60 && days > 0;
  });

  return (
    <div>
      <SHdr title="Insurance Policies" sub={`${policies.length} policies tracked · ${expiringSoon.length} renewing within 60 days`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ Add Policy</BtnP>} />
      {expiringSoon.length > 0 && <div style={{ marginBottom: 16 }}><InfoBox type="warning">{expiringSoon.length} policy/policies expiring soon: {expiringSoon.map(p => p.type).join(', ')}</InfoBox></div>}
      {policies.length === 0 ? <InfoBox type="info">Track all your business insurance policies here. Add a policy and use AI to analyse coverage gaps.</InfoBox> :
        policies.map(p => {
          const daysLeft = p.end ? Math.ceil((new Date(p.end) - new Date()) / 86400000) : null;
          return (
            <Card key={p.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{p.type}</span>
                    <Badge l={p.insurer} col="blue" />
                    {daysLeft !== null && daysLeft <= 60 && <Badge l={`${daysLeft}d left`} col={daysLeft <= 30 ? 'red' : 'amber'} />}
                  </div>
                  <div style={{ fontSize: 11, color: T.t3, fontFamily: mo }}>
                    Policy: {p.policyNo || '—'} · Premium: {p.premium ? fmtN(p.premium) : '—'}/yr · Sum Insured: {p.sumInsured ? fmtN(p.sumInsured) : '—'}
                  </div>
                  <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>
                    Valid: {p.start} to {p.end || 'Ongoing'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <BtnP small onClick={() => analyse(p)} disabled={analysing === p.id}>
                    {analysing === p.id ? 'Analysing…' : '✦ AI Analyse'}
                  </BtnP>
                  <BtnDanger small onClick={() => del(p.id)}>Del</BtnDanger>
                </div>
              </div>
              {p.coverage && <div style={{ fontSize: 12, color: T.t2, marginBottom: 4 }}><strong>Coverage:</strong> {p.coverage}</div>}
              {p.exclusions && <div style={{ fontSize: 12, color: T.rd, marginBottom: 4 }}><strong>Exclusions:</strong> {p.exclusions}</div>}
              {p.analysis && (
                <div style={{ marginTop: 10, padding: 12, background: T.bll, border: `1px solid #BFDBFE`, borderRadius: 6, fontSize: 12, color: T.bl, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  <div style={{ fontSize: 10, fontFamily: mo, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>AI ANALYSIS</div>
                  {p.analysis}
                </div>
              )}
            </Card>
          );
        })
      }
      {showAdd && (
        <Modal title="Add Insurance Policy" onClose={() => setShowAdd(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Sel label="Policy Type" value={form.type} onChange={e => up('type', e.target.value)} options={['General Liability', 'Property / Fire', 'Professional Indemnity', 'Directors & Officers', 'Workmen Compensation', 'Vehicle Insurance', 'Health / Group Mediclaim', 'Cyber Liability', 'Product Liability', 'Marine Cargo', 'Key Man Insurance', 'Other']} />
              <Inp label="Insurer Name *" value={form.insurer} onChange={e => up('insurer', e.target.value)} placeholder="New India Assurance, HDFC Ergo…" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Policy Number" value={form.policyNo} onChange={e => up('policyNo', e.target.value)} />
              <Inp label="Annual Premium (₹)" type="number" value={form.premium} onChange={e => up('premium', e.target.value)} />
              <Inp label="Sum Insured (₹)" type="number" value={form.sumInsured} onChange={e => up('sumInsured', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Policy Start" type="date" value={form.start} onChange={e => up('start', e.target.value)} />
              <Inp label="Policy End / Renewal" type="date" value={form.end} onChange={e => up('end', e.target.value)} />
            </div>
            <TextArea label="What's Covered" value={form.coverage} onChange={e => up('coverage', e.target.value)} rows={2} placeholder="Describe coverage: fire, theft, third-party liability…" />
            <TextArea label="Key Exclusions" value={form.exclusions} onChange={e => up('exclusions', e.target.value)} rows={2} placeholder="What is NOT covered…" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addPolicy} disabled={!form.insurer}>Add Policy</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PERFORMANCE TRACKING ──────────────────────────────────────────────────────
export function Performance({ emps, co }) {
  const [reviews, setReviews] = useState(() => load('performance', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ empId: '', period: '', quality: '3', productivity: '3', teamwork: '3', punctuality: '3', goals: '3', strengths: '', improvements: '', notes: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('performance', v); setReviews(v); };

  const addReview = () => {
    if (!form.empId) return;
    const emp = emps.find(e => e.id === form.empId);
    const avg = ((Number(form.quality) + Number(form.productivity) + Number(form.teamwork) + Number(form.punctuality) + Number(form.goals)) / 5).toFixed(1);
    sv([{ id: uid(), ...form, empName: emp?.name, role: emp?.role, avg, date: today() }, ...reviews]);
    setShowAdd(false);
  };

  const scoreColor = (s) => Number(s) >= 4 ? T.gn : Number(s) >= 3 ? T.am : T.rd;
  const scoreLabel = (s) => Number(s) >= 4.5 ? 'Excellent' : Number(s) >= 3.5 ? 'Good' : Number(s) >= 2.5 ? 'Average' : 'Needs Improvement';

  return (
    <div>
      <SHdr title="Staff Performance Reviews" sub={`${reviews.length} reviews recorded`}
        action={emps.length > 0 ? <BtnP onClick={() => setShowAdd(true)}>+ Add Review</BtnP> : null} />
      {emps.length === 0 ? <InfoBox type="info">Add employees in HR & Payroll first to track performance.</InfoBox> :
        reviews.length === 0 ? <InfoBox type="info">No performance reviews yet. Start tracking team performance.</InfoBox> :
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {reviews.map(r => (
              <Card key={r.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{r.empName}</div>
                    <div style={{ fontSize: 11, color: T.t3 }}>{r.role} · {r.period} · {r.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: scoreColor(r.avg) }}>{r.avg}</div>
                    <div style={{ fontSize: 10, color: T.t3, fontFamily: mo }}>{scoreLabel(r.avg)}</div>
                  </div>
                </div>
                {[['Quality', r.quality], ['Productivity', r.productivity], ['Teamwork', r.teamwork], ['Punctuality', r.punctuality], ['Goals', r.goals]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: T.t3, width: 90 }}>{l}</span>
                    <ProgressBar value={Number(v)} max={5} color={scoreColor(v)} />
                    <span style={{ fontSize: 11, fontFamily: mo, color: scoreColor(v), width: 16 }}>{v}</span>
                  </div>
                ))}
                {r.strengths && <div style={{ fontSize: 11, color: T.gn, marginTop: 8 }}>↑ {r.strengths}</div>}
                {r.improvements && <div style={{ fontSize: 11, color: T.rd, marginTop: 3 }}>↓ {r.improvements}</div>}
              </Card>
            ))}
          </div>
      }
      {showAdd && (
        <Modal title="Add Performance Review" onClose={() => setShowAdd(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Sel label="Employee *" value={form.empId} onChange={e => up('empId', e.target.value)}
                options={['', ...emps.map(e => e.id)]}
              />
              <Inp label="Review Period" value={form.period} onChange={e => up('period', e.target.value)} placeholder="Q1 2025, Annual 2024…" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
              {[['quality','Quality'],['productivity','Productivity'],['teamwork','Teamwork'],['punctuality','Punctuality'],['goals','Goals Met']].map(([k,l]) => (
                <Sel key={k} label={l} value={form[k]} onChange={e => up(k, e.target.value)} options={['5','4','3','2','1']} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <TextArea label="Key Strengths" value={form.strengths} onChange={e => up('strengths', e.target.value)} rows={2} />
              <TextArea label="Areas to Improve" value={form.improvements} onChange={e => up('improvements', e.target.value)} rows={2} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addReview} disabled={!form.empId}>Save Review</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── QUOTATIONS & CHALLANS ─────────────────────────────────────────────────────
export function QuotationsChallan({ co, vendors, leads, fmt, fmtN }) {
  const [tab, setTab] = useState('quotations');
  const [quotations, setQuotations] = useState(() => load('quotations', []));
  const [challans, setChallans] = useState(() => load('challans', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'quotation', number: '', date: today(), validTill: '', party: '', items: [{ desc: '', qty: '1', rate: '', gst: '18', unit: 'pcs' }], notes: 'Prices valid for 7 days. Subject to availability.' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const svQ = v => { save('quotations', v); setQuotations(v); };
  const svC = v => { save('challans', v); setChallans(v); };

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { desc: '', qty: '1', rate: '', gst: '18', unit: 'pcs' }] }));
  const updItem = (i, k, v) => setForm(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));
  const delItem = i => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  const subtotal = form.items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.rate || 0), 0);
  const gstAmt = form.items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.rate || 0) * Number(i.gst || 0) / 100, 0);

  const save_ = () => {
    const entry = { id: uid(), ...form, subtotal, gstAmt, total: subtotal + gstAmt, status: 'Draft', createdAt: today() };
    if (form.type === 'quotation') { svQ([entry, ...quotations]); }
    else { svC([entry, ...challans]); }
    setShowAdd(false);
  };

  const convertToChallan = (q) => {
    const ch = { ...q, id: uid(), type: 'challan', number: 'CH-' + Date.now().toString().slice(-5), status: 'Draft', createdAt: today() };
    svC([ch, ...challans]);
  };

  const list = tab === 'quotations' ? quotations : challans;

  return (
    <div>
      <SHdr title="Quotations & Challans" sub="Create formal quotations, delivery challans, and convert between them"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnG onClick={() => { setForm(p => ({ ...p, type: 'quotation', number: 'QT-' + Date.now().toString().slice(-5) })); setShowAdd(true); }}>+ Quotation</BtnG>
            <BtnP onClick={() => { setForm(p => ({ ...p, type: 'challan', number: 'CH-' + Date.now().toString().slice(-5) })); setShowAdd(true); }}>+ Challan</BtnP>
          </div>
        } />
      <Tabs tabs={[{ id: 'quotations', label: `Quotations (${quotations.length})` }, { id: 'challans', label: `Challans (${challans.length})` }]} active={tab} onChange={setTab} />
      {list.length === 0 ? <InfoBox type="info">No {tab} yet. Create one using the buttons above.</InfoBox> :
        <Table cols="120px 1fr 100px 100px 80px 140px">
          {[<TH key="h">Number</TH>, <TH key="h2">Party</TH>, <TH key="h3">Date</TH>, <TH key="h4" right>Amount</TH>, <TH key="h5">Status</TH>, <TH key="h6">Actions</TH>]}
          {list.map(q => (
            <TRow key={q.id} cols="120px 1fr 100px 100px 80px 140px">
              <TD mono bold color={T.am}>{q.number}</TD>
              <TD>{q.party || '—'}</TD>
              <TD mono muted>{q.date}</TD>
              <TD right bold>{fmtN(q.total)}</TD>
              <Badge l={q.status} col={q.status === 'Approved' ? 'green' : q.status === 'Rejected' ? 'red' : 'neutral'} />
              <div style={{ display: 'flex', gap: 4 }}>
                {tab === 'quotations' && <BtnG small onClick={() => convertToChallan(q)}>→ Challan</BtnG>}
                <BtnDanger small onClick={() => tab === 'quotations' ? svQ(quotations.filter(x => x.id !== q.id)) : svC(challans.filter(x => x.id !== q.id))}>Del</BtnDanger>
              </div>
            </TRow>
          ))}
        </Table>
      }
      {showAdd && (
        <Modal title={form.type === 'quotation' ? 'New Quotation' : 'New Delivery Challan'} onClose={() => setShowAdd(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Number" value={form.number} onChange={e => up('number', e.target.value)} />
              <Inp label="Date" type="date" value={form.date} onChange={e => up('date', e.target.value)} />
              {form.type === 'quotation' && <Inp label="Valid Till" type="date" value={form.validTill} onChange={e => up('validTill', e.target.value)} />}
            </div>
            <Inp label="Party Name (Client / Customer)" value={form.party} onChange={e => up('party', e.target.value)} placeholder="Mehta Industries" />
            <div>
              <div style={{ fontSize: 11, color: T.t3, fontFamily: mo, marginBottom: 8, fontWeight: 500 }}>ITEMS</div>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 60px 70px 90px 70px 28px', gap: 6, marginBottom: 6 }}>
                  <Inp value={item.desc} onChange={e => updItem(i, 'desc', e.target.value)} placeholder="Item description" />
                  <Inp type="number" value={item.qty} onChange={e => updItem(i, 'qty', e.target.value)} placeholder="Qty" />
                  <Sel value={item.unit} onChange={e => updItem(i, 'unit', e.target.value)} options={['pcs', 'kg', 'box', 'meter', 'litre', 'set']} />
                  <Inp type="number" value={item.rate} onChange={e => updItem(i, 'rate', e.target.value)} placeholder="Rate ₹" />
                  <Sel value={item.gst} onChange={e => updItem(i, 'gst', e.target.value)} options={['0', '5', '12', '18', '28']} />
                  <button onClick={() => delItem(i)} style={{ width: 28, height: 34, background: T.rl, border: `1px solid ${T.rd}44`, borderRadius: 5, cursor: 'pointer', color: T.rd }}>×</button>
                </div>
              ))}
              <BtnG small onClick={addItem}>+ Add Line</BtnG>
            </div>
            <div style={{ background: T.sf2, padding: 12, borderRadius: 6 }}>
              <StatRow label="Subtotal" value={fmtN(subtotal)} />
              <StatRow label="GST" value={fmtN(gstAmt)} />
              <StatRow label="TOTAL" value={fmtN(subtotal + gstAmt)} highlight />
            </div>
            <TextArea label="Terms & Notes" value={form.notes} onChange={e => up('notes', e.target.value)} rows={2} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={save_}>Save {form.type === 'quotation' ? 'Quotation' : 'Challan'}</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CREDIT / DEBIT NOTES ──────────────────────────────────────────────────────
export function CreditDebitNotes({ co, fmtN }) {
  const [notes, setNotes] = useState(() => load('cdn_notes', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'credit', number: '', date: today(), party: '', amount: '', gst: '18', reason: '', refInvoice: '', adjustStock: false, item: '', qty: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('cdn_notes', v); setNotes(v); };

  const save_ = () => {
    if (!form.party || !form.amount) return;
    sv([{ id: uid(), ...form }, ...notes]);
    setShowAdd(false);
  };

  const totalCredit = notes.filter(n => n.type === 'credit').reduce((s, n) => s + Number(n.amount), 0);
  const totalDebit = notes.filter(n => n.type === 'debit').reduce((s, n) => s + Number(n.amount), 0);

  return (
    <div>
      <SHdr title="Credit & Debit Notes" sub="Manage returns, adjustments, and corrections with proper GST treatment"
        action={<BtnP onClick={() => { setForm({ type: 'credit', number: 'CN-' + Date.now().toString().slice(-5), date: today(), party: '', amount: '', gst: '18', reason: '', refInvoice: '', adjustStock: false, item: '', qty: '' }); setShowAdd(true); }}>+ New Note</BtnP>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <KPI label="Total Credit Notes" value={String(notes.filter(n => n.type === 'credit').length)} sub={fmtN(totalCredit)} ac={T.gn} />
        <KPI label="Total Debit Notes" value={String(notes.filter(n => n.type === 'debit').length)} sub={fmtN(totalDebit)} ac={T.rd} />
        <KPI label="Net Adjustment" value={fmtN(totalDebit - totalCredit)} sub="Debit − Credit" ac={T.am} />
      </div>
      {notes.length === 0 ? <InfoBox type="info">No credit/debit notes yet. Use these for returns, price corrections, and adjustments.</InfoBox> :
        <Table cols="120px 1fr 80px 100px 90px 100px 80px">
          {[<TH key="h">Number</TH>, <TH key="h2">Party</TH>, <TH key="h3">Type</TH>, <TH key="h4">Date</TH>, <TH key="h5" right>Amount</TH>, <TH key="h6">Reason</TH>, <TH key="h7">Action</TH>]}
          {notes.map(n => (
            <TRow key={n.id} cols="120px 1fr 80px 100px 90px 100px 80px">
              <TD mono bold color={T.am}>{n.number}</TD>
              <TD>{n.party}</TD>
              <Badge l={n.type.toUpperCase()} col={n.type === 'credit' ? 'green' : 'red'} />
              <TD mono muted>{n.date}</TD>
              <TD right bold color={n.type === 'credit' ? T.gn : T.rd}>{fmtN(n.amount)}</TD>
              <TD muted>{n.reason || '—'}</TD>
              <BtnDanger small onClick={() => sv(notes.filter(x => x.id !== n.id))}>Del</BtnDanger>
            </TRow>
          ))}
        </Table>
      }
      {showAdd && (
        <Modal title="New Credit / Debit Note" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', gap: 0, marginBottom: 4 }}>
              {['credit', 'debit'].map(t => (
                <button key={t} onClick={() => up('type', t)}
                  style={{ flex: 1, padding: '9px', border: `1px solid ${T.bd}`, background: form.type === t ? (t === 'credit' ? T.gl : T.rl) : 'transparent', color: t === 'credit' ? T.gn : T.rd, cursor: 'pointer', fontFamily: f, fontSize: 13, fontWeight: form.type === t ? 700 : 400, borderRadius: t === 'credit' ? '6px 0 0 6px' : '0 6px 6px 0' }}>
                  {t === 'credit' ? '↓ Credit Note (Refund to Party)' : '↑ Debit Note (Charge to Party)'}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Note Number" value={form.number} onChange={e => up('number', e.target.value)} />
              <Inp label="Date" type="date" value={form.date} onChange={e => up('date', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Party Name *" value={form.party} onChange={e => up('party', e.target.value)} />
              <Inp label="Ref Invoice Number" value={form.refInvoice} onChange={e => up('refInvoice', e.target.value)} placeholder="Original invoice#" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Amount (₹) *" type="number" value={form.amount} onChange={e => up('amount', e.target.value)} />
              <Sel label="GST Rate %" value={form.gst} onChange={e => up('gst', e.target.value)} options={['0', '5', '12', '18', '28']} />
            </div>
            <Inp label="Reason" value={form.reason} onChange={e => up('reason', e.target.value)} placeholder="Return of goods, price correction, damaged goods…" />
            {form.amount && <InfoBox type="info">GST adjustment: {fmtN(Number(form.amount) * Number(form.gst) / 100)} on {fmtN(form.amount)}</InfoBox>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={save_} disabled={!form.party || !form.amount}>Save Note</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PRICE LIST MANAGEMENT ─────────────────────────────────────────────────────
export function PriceList({ inv, fmtN }) {
  const [lists, setLists] = useState(() => load('price_lists', [
    { id: uid(), name: 'Retail', margin: '15' },
    { id: uid(), name: 'Wholesale', margin: '8' },
    { id: uid(), name: 'Distributor', margin: '5' },
  ]));
  const [overrides, setOverrides] = useState(() => load('price_overrides', {}));
  const sv = v => { save('price_lists', v); setLists(v); };
  const svO = v => { save('price_overrides', v); setOverrides(v); };

  const getPrice = (item, list) => {
    const key = `${item.id}_${list.id}`;
    if (overrides[key]) return Number(overrides[key]);
    return Math.round(Number(item.rate || 0) * (1 + Number(list.margin || 0) / 100));
  };

  const setOverride = (item, list, val) => {
    const key = `${item.id}_${list.id}`;
    svO({ ...overrides, [key]: val });
  };

  const [newList, setNewList] = useState('');

  return (
    <div>
      <SHdr title="Price List Management" sub="Multiple pricing tiers — retail, wholesale, distributor — applied to your inventory" />
      <Card style={{ marginBottom: 20 }}>
        <CardHdr>Price List Tiers</CardHdr>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {lists.map(l => (
            <div key={l.id} style={{ padding: '8px 14px', background: T.aml, border: `1px solid #FED7AA`, borderRadius: 6, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.ac }}>{l.name}</span>
              <span style={{ fontSize: 11, color: T.t3 }}>+{l.margin}% margin</span>
              <BtnDanger small onClick={() => sv(lists.filter(x => x.id !== l.id))}>×</BtnDanger>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={newList} onChange={e => setNewList(e.target.value)} placeholder="New list name"
              style={{ padding: '6px 10px', border: `1px solid ${T.bd}`, borderRadius: 5, fontSize: 12, fontFamily: f, width: 120, outline: 'none' }} />
            <BtnP small onClick={() => { if (newList.trim()) { sv([...lists, { id: uid(), name: newList.trim(), margin: '10' }]); setNewList(''); } }}>Add</BtnP>
          </div>
        </div>
      </Card>
      {inv.length === 0 ? <InfoBox type="info">Add inventory items first to manage pricing.</InfoBox> :
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: T.sf, border: `1px solid ${T.bd}`, borderRadius: 8 }}>
            <thead>
              <tr style={{ background: T.sb }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#9A8674', fontFamily: mo, letterSpacing: 1, fontWeight: 600 }}>ITEM</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 10, color: '#9A8674', fontFamily: mo, letterSpacing: 1, fontWeight: 600 }}>BASE RATE</th>
                {lists.map(l => (
                  <th key={l.id} style={{ padding: '10px 16px', textAlign: 'right', fontSize: 10, color: '#9A8674', fontFamily: mo, letterSpacing: 1, fontWeight: 600 }}>{l.name.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inv.map((item, idx) => (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? 'transparent' : T.sf2, borderBottom: `1px solid ${T.bd}` }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: T.tx, fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, fontFamily: mo, color: T.t3 }}>{fmtN(item.rate || 0)}</td>
                  {lists.map(l => (
                    <td key={l.id} style={{ padding: '6px 16px', textAlign: 'right' }}>
                      <input
                        defaultValue={getPrice(item, l)}
                        onBlur={e => setOverride(item, l, e.target.value)}
                        style={{ width: 90, padding: '4px 8px', textAlign: 'right', border: `1px solid ${T.bd}`, borderRadius: 4, fontSize: 12, fontFamily: mo, background: overrides[`${item.id}_${l.id}`] ? T.aml : 'transparent', outline: 'none' }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
}

// ─── PDC (POST DATED CHEQUES) ──────────────────────────────────────────────────
export function PDCTracker({ fmtN, fmtD }) {
  const [cheques, setCheques] = useState(() => load('pdc_cheques', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'received', party: '', bank: '', chequeNo: '', amount: '', date: today(), dueDate: '', status: 'Pending', notes: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('pdc_cheques', v); setCheques(v); };

  const savePDC = () => {
    if (!form.party || !form.amount) return;
    sv([{ id: uid(), ...form }, ...cheques]);
    setShowAdd(false);
  };

  const updateStatus = (id, status) => sv(cheques.map(c => c.id === id ? { ...c, status } : c));

  const today_ = new Date().toISOString().split('T')[0];
  const dueSoon = cheques.filter(c => c.status === 'Pending' && c.dueDate && c.dueDate <= new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const overdue = cheques.filter(c => c.status === 'Pending' && c.dueDate && c.dueDate < today_);

  return (
    <div>
      <SHdr title="Post Dated Cheques (PDC)" sub={`${cheques.length} cheques · ${dueSoon.length} due this week · ${overdue.length} overdue`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ Add Cheque</BtnP>} />
      {overdue.length > 0 && <div style={{ marginBottom: 14 }}><InfoBox type="error">{overdue.length} cheque(s) are overdue: {overdue.map(c => `${c.party} (${fmtN(c.amount)})`).join(', ')}</InfoBox></div>}
      {dueSoon.length > 0 && !overdue.length && <div style={{ marginBottom: 14 }}><InfoBox type="warning">{dueSoon.length} cheque(s) due within 7 days.</InfoBox></div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Cheques Received" value={fmtN(cheques.filter(c => c.type === 'received' && c.status === 'Pending').reduce((s, c) => s + Number(c.amount), 0))} sub="pending deposit" ac={T.gn} />
        <KPI label="Cheques Issued" value={fmtN(cheques.filter(c => c.type === 'issued' && c.status === 'Pending').reduce((s, c) => s + Number(c.amount), 0))} sub="pending clearance" ac={T.rd} />
        <KPI label="Cleared This Month" value={String(cheques.filter(c => c.status === 'Cleared').length)} sub="cheques processed" ac={T.am} />
      </div>
      {cheques.length === 0 ? <InfoBox type="info">No cheques tracked. Add received and issued post-dated cheques to monitor cash flow.</InfoBox> :
        <Table cols="80px 1fr 100px 80px 100px 100px 80px 120px">
          {[<TH key="h">Type</TH>, <TH key="h2">Party</TH>, <TH key="h3">Cheque #</TH>, <TH key="h4">Bank</TH>, <TH key="h5" right>Amount</TH>, <TH key="h6">Due Date</TH>, <TH key="h7">Status</TH>, <TH key="h8">Action</TH>]}
          {cheques.map(c => {
            const isOverdue = c.status === 'Pending' && c.dueDate && c.dueDate < today_;
            return (
              <TRow key={c.id} cols="80px 1fr 100px 80px 100px 100px 80px 120px" highlight={isOverdue}>
                <Badge l={c.type.toUpperCase()} col={c.type === 'received' ? 'green' : 'red'} />
                <TD bold>{c.party}</TD>
                <TD mono muted>{c.chequeNo || '—'}</TD>
                <TD muted>{c.bank || '—'}</TD>
                <TD right bold color={c.type === 'received' ? T.gn : T.rd}>{fmtN(c.amount)}</TD>
                <div>
                  <TD mono muted>{c.dueDate || '—'}</TD>
                  {isOverdue && <div style={{ fontSize: 9, color: T.rd, fontFamily: mo }}>OVERDUE</div>}
                </div>
                <Badge l={c.status} col={c.status === 'Cleared' ? 'green' : c.status === 'Bounced' ? 'red' : 'amber'} />
                <div style={{ display: 'flex', gap: 4 }}>
                  <BtnG small onClick={() => updateStatus(c.id, 'Cleared')}>Cleared</BtnG>
                  <BtnDanger small onClick={() => sv(cheques.filter(x => x.id !== c.id))}>Del</BtnDanger>
                </div>
              </TRow>
            );
          })}
        </Table>
      }
      {showAdd && (
        <Modal title="Add Post Dated Cheque" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {['received', 'issued'].map(t => (
                <button key={t} onClick={() => up('type', t)}
                  style={{ flex: 1, padding: '9px', border: `1px solid ${T.bd}`, background: form.type === t ? (t === 'received' ? T.gl : T.rl) : 'transparent', color: t === 'received' ? T.gn : T.rd, cursor: 'pointer', fontFamily: f, fontSize: 13, fontWeight: form.type === t ? 700 : 400, borderRadius: t === 'received' ? '6px 0 0 6px' : '0 6px 6px 0' }}>
                  {t === 'received' ? '↓ Received from Party' : '↑ Issued to Party'}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Party Name *" value={form.party} onChange={e => up('party', e.target.value)} />
              <Inp label="Amount (₹) *" type="number" value={form.amount} onChange={e => up('amount', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Cheque Number" value={form.chequeNo} onChange={e => up('chequeNo', e.target.value)} />
              <Inp label="Bank" value={form.bank} onChange={e => up('bank', e.target.value)} placeholder="HDFC, SBI…" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Cheque Date" type="date" value={form.date} onChange={e => up('date', e.target.value)} />
              <Inp label="Due / Deposit Date" type="date" value={form.dueDate} onChange={e => up('dueDate', e.target.value)} />
            </div>
            <Inp label="Notes" value={form.notes} onChange={e => up('notes', e.target.value)} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={savePDC} disabled={!form.party || !form.amount}>Add Cheque</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── OUTSTANDING / RECEIVABLES MANAGEMENT ─────────────────────────────────────
export function OutstandingManager({ txns, fmt, fmtN, fmtD }) {
  const [tab, setTab] = useState('receivable');

  // Group pending transactions by party
  const pending = txns.filter(t => t.status === 'pending');
  const receivable = pending.filter(t => t.type === 'income');
  const payable = pending.filter(t => t.type === 'expense');

  const groupByParty = (items) => {
    const map = {};
    items.forEach(t => {
      const key = t.party || 'Unknown';
      if (!map[key]) map[key] = { party: key, total: 0, items: [], oldest: t.date };
      map[key].total += Number(t.amount);
      map[key].items.push(t);
      if (t.date < map[key].oldest) map[key].oldest = t.date;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  };

  const getAgeDays = (date) => Math.floor((Date.now() - new Date(date)) / 86400000);
  const getAgeColor = (days) => days > 90 ? T.rd : days > 30 ? T.am : T.gn;
  const getAgeLabel = (days) => days > 90 ? '90+ days' : days > 60 ? '60–90d' : days > 30 ? '30–60d' : '0–30d';

  const recGroups = groupByParty(receivable);
  const payGroups = groupByParty(payable);
  const groups = tab === 'receivable' ? recGroups : payGroups;

  const totalRec = receivable.reduce((s, t) => s + Number(t.amount), 0);
  const totalPay = payable.reduce((s, t) => s + Number(t.amount), 0);
  const over90Rec = receivable.filter(t => getAgeDays(t.date) > 90).reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div>
      <SHdr title="Outstanding Management" sub="Age-wise receivables and payables — FIFO tracking by party" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Total Receivable" value={fmt(totalRec)} sub={`${receivable.length} entries`} ac={T.gn} />
        <KPI label="Total Payable" value={fmt(totalPay)} sub={`${payable.length} entries`} ac={T.rd} />
        <KPI label="Over 90 Days (Rec)" value={fmt(over90Rec)} sub="high risk outstanding" ac={T.rd} />
        <KPI label="Net Outstanding" value={fmt(totalRec - totalPay)} sub="Rec − Pay" ac={T.am} />
      </div>
      <Tabs tabs={[{ id: 'receivable', label: `Receivable (${recGroups.length} parties)` }, { id: 'payable', label: `Payable (${payGroups.length} parties)` }]} active={tab} onChange={setTab} />
      {groups.length === 0 ? <InfoBox type="success">No pending {tab} entries. All dues are cleared.</InfoBox> :
        groups.map(g => {
          const days = getAgeDays(g.oldest);
          return (
            <Card key={g.party} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{g.party}</span>
                  <span style={{ fontSize: 11, color: T.t3, marginLeft: 10 }}>{g.items.length} invoice(s)</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Badge l={getAgeLabel(days)} col={days > 90 ? 'red' : days > 30 ? 'amber' : 'green'} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: tab === 'receivable' ? T.gn : T.rd }}>{fmtN(g.total)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {g.items.map(t => (
                  <div key={t.id} style={{ padding: '4px 10px', background: T.sf2, border: `1px solid ${T.bd}`, borderRadius: 4, fontSize: 11, fontFamily: mo }}>
                    {fmtN(t.amount)} · {fmtD(t.date)} · {getAgeDays(t.date)}d
                  </div>
                ))}
              </div>
            </Card>
          );
        })
      }
    </div>
  );
}

// ─── DEPRECIATION CHART ────────────────────────────────────────────────────────
export function DepreciationChart({ fmt, fmtN }) {
  const [assets, setAssets] = useState(() => load('depr_assets', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', cost: '', method: 'SLM', rate: '10', purchaseDate: today(), salvage: '0' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('depr_assets', v); setAssets(v); };

  const calcDepr = (asset) => {
    const cost = Number(asset.cost || 0);
    const salvage = Number(asset.salvage || 0);
    const rate = Number(asset.rate || 10) / 100;
    const years = Math.ceil((Date.now() - new Date(asset.purchaseDate)) / (365 * 86400000));
    const rows = [];
    let bookVal = cost;
    for (let y = 1; y <= Math.min(years + 2, 10); y++) {
      const depr = asset.method === 'SLM' ? (cost - salvage) * rate : bookVal * rate;
      const roundedDepr = Math.round(depr);
      bookVal = Math.max(salvage, bookVal - roundedDepr);
      rows.push({ year: y, depr: roundedDepr, bookVal });
      if (bookVal <= salvage) break;
    }
    return rows;
  };

  const addAsset = () => {
    if (!form.name || !form.cost) return;
    sv([{ id: uid(), ...form }, ...assets]);
    setShowAdd(false);
  };

  return (
    <div>
      <SHdr title="Depreciation Chart" sub="SLM and WDV depreciation schedules for all fixed assets"
        action={<BtnP onClick={() => setShowAdd(true)}>+ Add Asset</BtnP>} />
      {assets.length === 0 ? <InfoBox type="info">Add fixed assets to generate depreciation schedules. Supports Straight Line Method (SLM) and Written Down Value (WDV).</InfoBox> :
        assets.map(asset => {
          const rows = calcDepr(asset);
          const totalDepr = rows.reduce((s, r) => s + r.depr, 0);
          return (
            <Card key={asset.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{asset.name}</div>
                  <div style={{ fontSize: 11, color: T.t3, fontFamily: mo }}>
                    Cost: {fmtN(asset.cost)} · Method: {asset.method} · Rate: {asset.rate}% · From: {asset.purchaseDate}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: T.t3 }}>Current Book Value</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.am }}>{fmtN(rows[rows.length - 1]?.bookVal || asset.cost)}</div>
                  </div>
                  <BtnDanger small onClick={() => sv(assets.filter(a => a.id !== asset.id))}>Del</BtnDanger>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: T.sf2 }}>
                      {['Year', 'Opening Value', 'Depreciation', 'Closing Value'].map(h => (
                        <th key={h} style={{ padding: '6px 12px', textAlign: 'right', fontSize: 10, color: T.t3, fontFamily: mo, letterSpacing: 0.8, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.year} style={{ borderBottom: `1px solid ${T.sf2}` }}>
                        <td style={{ padding: '6px 12px', fontSize: 12, fontFamily: mo, color: T.t3, textAlign: 'right' }}>Year {r.year}</td>
                        <td style={{ padding: '6px 12px', fontSize: 12, textAlign: 'right', fontFamily: mo }}>{fmtN(i === 0 ? asset.cost : rows[i - 1].bookVal)}</td>
                        <td style={{ padding: '6px 12px', fontSize: 12, textAlign: 'right', fontFamily: mo, color: T.rd }}>{fmtN(r.depr)}</td>
                        <td style={{ padding: '6px 12px', fontSize: 12, textAlign: 'right', fontFamily: mo, fontWeight: 600 }}>{fmtN(r.bookVal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })
      }
      {showAdd && (
        <Modal title="Add Asset for Depreciation" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Asset Name *" value={form.name} onChange={e => up('name', e.target.value)} placeholder="MacBook Pro, CNC Machine, Office Building…" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Cost / Purchase Price (₹) *" type="number" value={form.cost} onChange={e => up('cost', e.target.value)} />
              <Inp label="Salvage / Residual Value (₹)" type="number" value={form.salvage} onChange={e => up('salvage', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Sel label="Method" value={form.method} onChange={e => up('method', e.target.value)} options={['SLM', 'WDV']} />
              <Inp label="Rate (%)" type="number" value={form.rate} onChange={e => up('rate', e.target.value)} placeholder="10, 15, 20…" />
              <Inp label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => up('purchaseDate', e.target.value)} />
            </div>
            <InfoBox type="info">SLM (Straight Line Method): Equal depreciation every year. WDV (Written Down Value): Declining balance — higher depreciation early years.</InfoBox>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addAsset} disabled={!form.name || !form.cost}>Add Asset</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── INDUSTRY-SPECIFIC MODULES ─────────────────────────────────────────────────

// PHARMACY specific
export function PharmacyModule({ co }) {
  const [tab, setTab] = useState('expiry');
  const [medicines, setMedicines] = useState(() => load('pharmacy_medicines', []));
  const [patients, setPatients] = useState(() => load('pharmacy_patients', []));
  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddPat, setShowAddPat] = useState(false);
  const [medForm, setMedForm] = useState({ name: '', generic: '', company: '', batch: '', qty: '', mrp: '', rate: '', expiry: '', hsnCode: '', schedule: 'OTC' });
  const [patForm, setPatForm] = useState({ name: '', phone: '', doctor: '', address: '', notes: '' });
  const upM = (k, v) => setMedForm(p => ({ ...p, [k]: v }));
  const upP = (k, v) => setPatForm(p => ({ ...p, [k]: v }));
  const svM = v => { save('pharmacy_medicines', v); setMedicines(v); };
  const svP = v => { save('pharmacy_patients', v); setPatients(v); };

  const today_ = new Date().toISOString().split('T')[0];
  const in90Days = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
  const expiring = medicines.filter(m => m.expiry && m.expiry <= in90Days && m.expiry > today_);
  const expired = medicines.filter(m => m.expiry && m.expiry <= today_);

  const addMed = () => {
    if (!medForm.name) return;
    svM([{ id: uid(), ...medForm }, ...medicines]);
    setShowAddMed(false);
    setMedForm({ name: '', generic: '', company: '', batch: '', qty: '', mrp: '', rate: '', expiry: '', hsnCode: '', schedule: 'OTC' });
  };

  const addPat = () => {
    if (!patForm.name) return;
    svP([{ id: uid(), ...patForm, lastVisit: today() }, ...patients]);
    setShowAddPat(false);
  };

  if (co.industry !== 'Healthcare / Clinic') {
    return (
      <div>
        <SHdr title="Pharmacy Module" sub="Specialized for medical/pharmacy businesses" />
        <InfoBox type="info">This module is optimized for Healthcare / Clinic businesses. You can still use it, but features like batch tracking and expiry management are specifically designed for pharmacies.</InfoBox>
        <div style={{ marginTop: 20 }}>{/* Still render the module */}</div>
      </div>
    );
  }

  return (
    <div>
      <SHdr title="Pharmacy Management" sub={`${medicines.length} medicines · ${expired.length} expired · ${expiring.length} expiring soon`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnG onClick={() => setShowAddPat(true)}>+ Patient</BtnG>
            <BtnP onClick={() => setShowAddMed(true)}>+ Medicine</BtnP>
          </div>
        } />
      {(expired.length > 0 || expiring.length > 0) && (
        <div style={{ marginBottom: 16 }}>
          {expired.length > 0 && <div style={{ marginBottom: 8 }}><InfoBox type="error">{expired.length} medicine batch(es) EXPIRED and must be removed from stock: {expired.map(m => m.name).join(', ')}</InfoBox></div>}
          {expiring.length > 0 && <InfoBox type="warning">{expiring.length} batch(es) expiring within 90 days: {expiring.map(m => `${m.name} (${m.expiry})`).join(', ')}</InfoBox>}
        </div>
      )}
      <Tabs tabs={[{ id: 'expiry', label: `Expiry Watch (${expired.length + expiring.length})` }, { id: 'stock', label: `Medicine Stock (${medicines.length})` }, { id: 'patients', label: `Patients (${patients.length})` }]} active={tab} onChange={setTab} />

      {tab === 'expiry' && (
        <div>
          {expired.map(m => (
            <Card key={m.id} style={{ marginBottom: 8, border: `1px solid ${T.rd}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.rd }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: T.t3, marginLeft: 8 }}>Batch: {m.batch} · Qty: {m.qty}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge l="EXPIRED" col="red" />
                  <span style={{ fontSize: 11, fontFamily: mo, color: T.rd }}>{m.expiry}</span>
                  <BtnDanger small onClick={() => svM(medicines.filter(x => x.id !== m.id))}>Remove</BtnDanger>
                </div>
              </div>
            </Card>
          ))}
          {expiring.map(m => {
            const days = Math.ceil((new Date(m.expiry) - new Date()) / 86400000);
            return (
              <Card key={m.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.tx }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: T.t3, marginLeft: 8 }}>Batch: {m.batch} · Qty: {m.qty}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge l={`${days} days`} col={days <= 30 ? 'red' : 'amber'} />
                    <span style={{ fontSize: 11, fontFamily: mo }}>{m.expiry}</span>
                  </div>
                </div>
              </Card>
            );
          })}
          {expired.length === 0 && expiring.length === 0 && <InfoBox type="success">No expiry issues. All medicines are within date.</InfoBox>}
        </div>
      )}

      {tab === 'stock' && (
        medicines.length === 0 ? <InfoBox type="info">No medicines added. Click "+ Medicine" to start tracking.</InfoBox> :
          <Table cols="1fr 120px 80px 80px 80px 80px 80px 80px">
            {[<TH key="h">Medicine</TH>, <TH key="h2">Company</TH>, <TH key="h3">Batch</TH>, <TH key="h4" right>Qty</TH>, <TH key="h5" right>MRP</TH>, <TH key="h6" right>Rate</TH>, <TH key="h7">Expiry</TH>, <TH key="h8">Type</TH>]}
            {medicines.map(m => {
              const isExp = m.expiry && m.expiry <= today_;
              const expSoon = m.expiry && m.expiry <= in90Days;
              return (
                <TRow key={m.id} cols="1fr 120px 80px 80px 80px 80px 80px 80px" highlight={isExp}>
                  <div>
                    <TD bold color={isExp ? T.rd : T.tx}>{m.name}</TD>
                    {m.generic && <div style={{ fontSize: 11, color: T.t3 }}>Generic: {m.generic}</div>}
                  </div>
                  <TD muted>{m.company || '—'}</TD>
                  <TD mono muted>{m.batch || '—'}</TD>
                  <TD right>{m.qty}</TD>
                  <TD right mono>{m.mrp ? '₹' + m.mrp : '—'}</TD>
                  <TD right mono>{m.rate ? '₹' + m.rate : '—'}</TD>
                  <div>
                    <TD mono muted>{m.expiry || '—'}</TD>
                    {isExp && <div style={{ fontSize: 9, color: T.rd, fontFamily: mo }}>EXPIRED</div>}
                    {!isExp && expSoon && <div style={{ fontSize: 9, color: T.am, fontFamily: mo }}>Soon</div>}
                  </div>
                  <Badge l={m.schedule} col={m.schedule === 'H' ? 'red' : m.schedule === 'OTC' ? 'green' : 'amber'} />
                </TRow>
              );
            })}
          </Table>
      )}

      {tab === 'patients' && (
        patients.length === 0 ? <InfoBox type="info">No patients recorded.</InfoBox> :
          <Table cols="1fr 100px 120px 100px 100px">
            {[<TH key="h">Patient</TH>, <TH key="h2">Phone</TH>, <TH key="h3">Doctor</TH>, <TH key="h4">Last Visit</TH>, <TH key="h5">Action</TH>]}
            {patients.map(p => (
              <TRow key={p.id} cols="1fr 100px 120px 100px 100px">
                <div><TD bold>{p.name}</TD>{p.notes && <div style={{ fontSize: 11, color: T.t3 }}>{p.notes}</div>}</div>
                <TD mono muted>{p.phone || '—'}</TD>
                <TD muted>{p.doctor || '—'}</TD>
                <TD mono muted>{p.lastVisit}</TD>
                <BtnDanger small onClick={() => svP(patients.filter(x => x.id !== p.id))}>Del</BtnDanger>
              </TRow>
            ))}
          </Table>
      )}

      {showAddMed && (
        <Modal title="Add Medicine / Batch" onClose={() => setShowAddMed(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Medicine Name *" value={medForm.name} onChange={e => upM('name', e.target.value)} placeholder="Paracetamol 500mg" />
              <Inp label="Generic Name" value={medForm.generic} onChange={e => upM('generic', e.target.value)} placeholder="Acetaminophen" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Company / Manufacturer" value={medForm.company} onChange={e => upM('company', e.target.value)} />
              <Inp label="Batch Number" value={medForm.batch} onChange={e => upM('batch', e.target.value)} />
              <Inp label="Quantity" type="number" value={medForm.qty} onChange={e => upM('qty', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <Inp label="MRP (₹)" type="number" value={medForm.mrp} onChange={e => upM('mrp', e.target.value)} />
              <Inp label="Purchase Rate (₹)" type="number" value={medForm.rate} onChange={e => upM('rate', e.target.value)} />
              <Inp label="Expiry Date" type="month" value={medForm.expiry} onChange={e => upM('expiry', e.target.value + '-01')} />
              <Sel label="Schedule" value={medForm.schedule} onChange={e => upM('schedule', e.target.value)} options={['OTC', 'Schedule H', 'Schedule H1', 'Schedule X', 'Schedule G']} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAddMed(false)}>Cancel</BtnG>
              <BtnP onClick={addMed} disabled={!medForm.name}>Add Medicine</BtnP>
            </div>
          </div>
        </Modal>
      )}
      {showAddPat && (
        <Modal title="Add Patient" onClose={() => setShowAddPat(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Patient Name *" value={patForm.name} onChange={e => upP('name', e.target.value)} />
              <Inp label="Phone" value={patForm.phone} onChange={e => upP('phone', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Doctor" value={patForm.doctor} onChange={e => upP('doctor', e.target.value)} />
              <Inp label="Address" value={patForm.address} onChange={e => upP('address', e.target.value)} />
            </div>
            <TextArea label="Medical Notes / Regular Medicines" value={patForm.notes} onChange={e => upP('notes', e.target.value)} rows={3} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAddPat(false)}>Cancel</BtnG>
              <BtnP onClick={addPat} disabled={!patForm.name}>Add Patient</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// JEWELLERY specific
export function JewelleryModule({ co }) {
  const [metals, setMetals] = useState(() => load('jewellery_metals', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'Gold', karat: '22K', weight: '', ratePerGram: '', making: '', touch: '', waste: '', party: '', date: today(), direction: 'in' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('jewellery_metals', v); setMetals(v); };

  const save_ = () => {
    if (!form.weight) return;
    const pureWeight = (Number(form.weight) * Number(form.touch || 100)) / 100;
    const wasteWt = (Number(form.weight) * Number(form.waste || 0)) / 100;
    sv([{ id: uid(), ...form, pureWeight, wasteWt, value: Math.round(Number(form.ratePerGram || 0) * pureWeight) }, ...metals]);
    setShowAdd(false);
  };

  const goldStock = metals.filter(m => m.type === 'Gold' && m.direction === 'in').reduce((s, m) => s + Number(m.weight), 0) - metals.filter(m => m.type === 'Gold' && m.direction === 'out').reduce((s, m) => s + Number(m.weight), 0);
  const silverStock = metals.filter(m => m.type === 'Silver' && m.direction === 'in').reduce((s, m) => s + Number(m.weight), 0) - metals.filter(m => m.type === 'Silver' && m.direction === 'out').reduce((s, m) => s + Number(m.weight), 0);

  return (
    <div>
      <SHdr title="Jewellery & Metal Ledger" sub="Gold, silver, and metal weight tracking with touch/waste calculations"
        action={<BtnP onClick={() => setShowAdd(true)}>+ Metal Entry</BtnP>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Gold Stock" value={`${goldStock.toFixed(3)}g`} sub="net gold balance" ac={T.am} />
        <KPI label="Silver Stock" value={`${silverStock.toFixed(3)}g`} sub="net silver balance" ac={T.t3} />
        <KPI label="Metal Entries" value={String(metals.length)} sub="total transactions" ac={T.bl} />
        <KPI label="Total Value" value={'₹' + Math.round(metals.filter(m => m.direction === 'in').reduce((s, m) => s + Number(m.value || 0), 0)).toLocaleString('en-IN')} sub="metal in value" ac={T.gn} />
      </div>
      {metals.length === 0 ? <InfoBox type="info">No metal entries yet. Track gold/silver in and out by weight, touch, and karat.</InfoBox> :
        <Table cols="80px 80px 80px 90px 90px 90px 90px 80px 1fr">
          {[<TH key="h">Date</TH>, <TH key="h2">Metal</TH>, <TH key="h3">Dir</TH>, <TH key="h4" right>Weight(g)</TH>, <TH key="h5">Karat</TH>, <TH key="h6">Touch%</TH>, <TH key="h7" right>Pure(g)</TH>, <TH key="h8" right>Value</TH>, <TH key="h9">Party</TH>]}
          {metals.map(m => (
            <TRow key={m.id} cols="80px 80px 80px 90px 90px 90px 90px 80px 1fr">
              <TD mono muted>{m.date}</TD>
              <TD bold>{m.type}</TD>
              <Badge l={m.direction === 'in' ? 'IN' : 'OUT'} col={m.direction === 'in' ? 'green' : 'red'} />
              <TD right mono>{Number(m.weight).toFixed(3)}</TD>
              <TD mono muted>{m.karat}</TD>
              <TD mono muted>{m.touch || 100}%</TD>
              <TD right mono bold>{Number(m.pureWeight || m.weight).toFixed(3)}</TD>
              <TD right>{'₹' + Math.round(m.value || 0).toLocaleString('en-IN')}</TD>
              <TD muted>{m.party || '—'}</TD>
            </TRow>
          ))}
        </Table>
      }
      {showAdd && (
        <Modal title="Metal Entry" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {['in', 'out'].map(d => (
                <button key={d} onClick={() => up('direction', d)}
                  style={{ flex: 1, padding: '9px', border: `1px solid ${T.bd}`, background: form.direction === d ? (d === 'in' ? T.gl : T.rl) : 'transparent', color: d === 'in' ? T.gn : T.rd, cursor: 'pointer', fontFamily: f, fontSize: 13, fontWeight: form.direction === d ? 700 : 400, borderRadius: d === 'in' ? '6px 0 0 6px' : '0 6px 6px 0' }}>
                  {d === 'in' ? '↓ Metal In (Purchase/Receipt)' : '↑ Metal Out (Sale/Issue)'}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Sel label="Metal Type" value={form.type} onChange={e => up('type', e.target.value)} options={['Gold', 'Silver', 'Platinum', 'Diamond', 'Other']} />
              <Sel label="Karat / Purity" value={form.karat} onChange={e => up('karat', e.target.value)} options={['24K (999)', '22K (916)', '18K (750)', '14K (585)', '999 Silver', '925 Silver', 'Other']} />
              <Inp label="Date" type="date" value={form.date} onChange={e => up('date', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Gross Weight (g) *" type="number" value={form.weight} onChange={e => up('weight', e.target.value)} />
              <Inp label="Touch %" type="number" value={form.touch} onChange={e => up('touch', e.target.value)} placeholder="91.6, 75…" />
              <Inp label="Waste %" type="number" value={form.waste} onChange={e => up('waste', e.target.value)} placeholder="0.5, 1…" />
              <Inp label="Rate / gram (₹)" type="number" value={form.ratePerGram} onChange={e => up('ratePerGram', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Party Name" value={form.party} onChange={e => up('party', e.target.value)} />
              <Inp label="Making Charges (₹)" type="number" value={form.making} onChange={e => up('making', e.target.value)} />
            </div>
            {form.weight && form.touch && (
              <InfoBox type="info">
                Pure weight: {((Number(form.weight) * Number(form.touch)) / 100).toFixed(3)}g · 
                Value: ₹{Math.round(Number(form.weight) * Number(form.touch) / 100 * Number(form.ratePerGram || 0)).toLocaleString('en-IN')}
              </InfoBox>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={save_} disabled={!form.weight}>Save Entry</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// NON-MOVING STOCK REPORT
export function NonMovingStock({ inv, txns, fmt }) {
  const DAYS = [30, 60, 90];
  const [threshold, setThreshold] = useState(60);
  const cutoff = new Date(Date.now() - threshold * 86400000).toISOString().split('T')[0];

  const movedItems = new Set(txns.filter(t => t.date >= cutoff && t.type === 'expense').map(t => t.note).filter(Boolean));

  const nonMoving = inv.filter(item => !movedItems.has(item.name) && Number(item.qty) > 0);
  const totalValue = nonMoving.reduce((s, i) => s + Number(i.qty || 0) * Number(i.rate || 0), 0);

  return (
    <div>
      <SHdr title="Non-Moving Stock Report" sub="Identify slow and dead stock to free up working capital" />
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: T.t2 }}>Show items not moved in:</span>
          {DAYS.map(d => (
            <button key={d} onClick={() => setThreshold(d)}
              style={{ padding: '6px 16px', background: threshold === d ? T.am : T.sf2, color: threshold === d ? '#FFF' : T.t2, border: `1px solid ${threshold === d ? T.am : T.bd}`, borderRadius: 5, cursor: 'pointer', fontSize: 12, fontFamily: f }}>
              {d} days
            </button>
          ))}
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Non-Moving Items" value={String(nonMoving.length)} sub={`of ${inv.length} total`} ac={T.rd} />
        <KPI label="Blocked Capital" value={fmt(totalValue)} sub="in non-moving stock" ac={T.am} />
        <KPI label="% of Inventory" value={inv.length > 0 ? `${Math.round(nonMoving.length / inv.length * 100)}%` : '—'} sub="items slow/dead" ac={T.bl} />
      </div>
      {nonMoving.length === 0 ? <InfoBox type="success">All inventory items have movement within the selected period.</InfoBox> :
        <Table cols="1fr 80px 80px 100px 80px 100px">
          {[<TH key="h">Item</TH>, <TH key="h2">Category</TH>, <TH key="h3" right>Stock</TH>, <TH key="h4" right>Unit Rate</TH>, <TH key="h5" right>Value</TH>, <TH key="h6">Action Needed</TH>]}
          {nonMoving.map(i => (
            <TRow key={i.id} cols="1fr 80px 80px 100px 80px 100px">
              <TD bold>{i.name}</TD>
              <TD muted>{i.cat || '—'}</TD>
              <TD right>{i.qty} {i.unit}</TD>
              <TD right mono>₹{i.rate || 0}</TD>
              <TD right bold color={T.rd}>{fmt(Number(i.qty) * Number(i.rate || 0))}</TD>
              <Badge l={Number(i.qty) > Number(i.reorder || 5) * 2 ? 'Discount / Clear' : 'Monitor'} col={Number(i.qty) > Number(i.reorder || 5) * 2 ? 'red' : 'amber'} />
            </TRow>
          ))}
        </Table>
      }
    </div>
  );
}
