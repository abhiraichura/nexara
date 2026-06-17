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
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 700, messages: [{ role: 'user', content: prompt }] }),
      });
      const d = await r.json();
      setDraft(d.content?.[0]?.text || 'Could not generate.');
    } catch { setDraft('Generation failed. Check internet connection.'); }
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

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setMaterial('');
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 1200,
          messages: [{ role: 'user', content: `Create a structured training guide for ${co.name} (${co.industry} company) on the topic: "${topic}". Target audience: ${role}. Include: 1) Learning Objectives, 2) Key Concepts (with examples), 3) Step-by-step process, 4) Common mistakes to avoid, 5) Quick reference checklist. Keep it practical and specific to a ${co.industry} business context.` }],
        }),
      });
      const d = await r.json();
      setMaterial(d.content?.[0]?.text || 'Could not generate.');
    } catch { setMaterial('Generation failed. Check internet.'); }
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
              <BtnP onClick={generate} disabled={loading || !topic.trim()}>
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
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 800,
          system: `You are a regulatory compliance advisor for Indian businesses. The user's company is ${co.name}, a ${co.industry} business in ${co.state}. Answer their compliance question clearly, citing specific rules, thresholds, and deadlines where applicable. Always end with: "Verify with your CA or legal advisor before acting on this." Be specific and practical.`,
          messages: [{ role: 'user', content: finalQ }],
        }),
      });
      const d = await r.json();
      const ans = d.content?.[0]?.text || 'Could not generate answer.';
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
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 600,
          messages: [{ role: 'user', content: `Analyse this insurance policy for ${co.name} (${co.industry}):\nType: ${policy.type}\nInsurer: ${policy.insurer}\nSum Insured: ₹${policy.sumInsured}\nCoverage: ${policy.coverage}\nExclusions: ${policy.exclusions}\n\nProvide: 1) Coverage adequacy for a ${co.industry} business, 2) Key risks NOT covered by this policy, 3) Recommended additional coverage, 4) Red flags or concerns. Be specific and practical.` }],
        }),
      });
      const d = await r.json();
      const analysis = d.content?.[0]?.text || 'Could not analyse.';
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
