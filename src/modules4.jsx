import React, { useState } from 'react';
import { T, f, mo, Badge, KPI, Inp, Sel, TextArea, BtnP, BtnG, BtnDanger, SHdr, Tabs, Table, TRow, TH, TD, Modal, InfoBox, StatRow, Card, CardHdr, ProgressBar } from './components';
import { uid, today, fmt, fmtN, fmtD, load, save } from './data';
import { generate } from './AIStatus';

// ─── 4. PROJECT MANAGEMENT + TIMESHEETS ───────────────────────────────────────
export function Projects({ emps, co }) {
  const [projects, setProjects] = useState(() => load('projects', []));
  const [timesheets, setTimesheets] = useState(() => load('timesheets', []));
  const [tab, setTab] = useState('projects');
  const [showAdd, setShowAdd] = useState(false);
  const [showLog, setShowLog] = useState(null);
  const [form, setForm] = useState({ name: '', client: '', budget: '', startDate: today(), endDate: '', status: 'Active', desc: '', billable: true });
  const [tsForm, setTsForm] = useState({ projectId: '', task: '', hours: '', date: today(), person: '', billable: true, rate: '1000' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const upT = (k, v) => setTsForm(p => ({ ...p, [k]: v }));
  const svP = v => { save('projects', v); setProjects(v); };
  const svT = v => { save('timesheets', v); setTimesheets(v); };

  const addProject = () => {
    if (!form.name) return;
    svP([{ id: uid(), ...form, tasks: [], createdAt: today() }, ...projects]);
    setShowAdd(false);
    setForm({ name: '', client: '', budget: '', startDate: today(), endDate: '', status: 'Active', desc: '', billable: true });
  };

  const logTime = () => {
    if (!tsForm.projectId || !tsForm.hours) return;
    svT([{ id: uid(), ...tsForm }, ...timesheets]);
    setShowLog(null);
    setTsForm({ projectId: '', task: '', hours: '', date: today(), person: '', billable: true, rate: '1000' });
  };

  const del = id => svP(projects.filter(p => p.id !== id));

  const getProjectHours = (pid) => timesheets.filter(t => t.projectId === pid).reduce((s, t) => s + Number(t.hours), 0);
  const getProjectRevenue = (pid) => timesheets.filter(t => t.projectId === pid && t.billable).reduce((s, t) => s + Number(t.hours) * Number(t.rate), 0);

  const totalBillable = timesheets.filter(t => t.billable).reduce((s, t) => s + Number(t.hours) * Number(t.rate), 0);
  const totalHours = timesheets.reduce((s, t) => s + Number(t.hours), 0);

  return (
    <div>
      <SHdr title="Project Management & Timesheets"
        sub={`${projects.length} projects · ${totalHours}h logged · Billable value: ${fmt(totalBillable)}`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnG onClick={() => setShowLog({})}>+ Log Time</BtnG>
            <BtnP onClick={() => setShowAdd(true)}>+ New Project</BtnP>
          </div>
        } />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Active Projects" value={String(projects.filter(p=>p.status==='Active').length)} sub="in progress" ac={T.bl} />
        <KPI label="Total Hours" value={`${totalHours}h`} sub="all projects" ac={T.am} />
        <KPI label="Billable Value" value={fmt(totalBillable)} sub="invoiceable amount" ac={T.gn} />
        <KPI label="Avg Rate" value={timesheets.length > 0 ? fmtN(Math.round(totalBillable / totalHours)) + '/hr' : '—'} sub="blended rate" ac={T.rd} />
      </div>

      <Tabs tabs={[{ id: 'projects', label: `Projects (${projects.length})` }, { id: 'timesheets', label: `Timesheets (${timesheets.length})` }]} active={tab} onChange={setTab} />

      {tab === 'projects' && (
        projects.length === 0 ? <InfoBox type="info">No projects yet. Create your first project to track time and billing.</InfoBox> :
          projects.map(p => {
            const hours = getProjectHours(p.id);
            const revenue = getProjectRevenue(p.id);
            const pct = p.budget ? Math.min(100, Math.round(revenue / Number(p.budget) * 100)) : 0;
            return (
              <Card key={p.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{p.name}</span>
                      <Badge l={p.status} col={p.status==='Active'?'green':p.status==='On Hold'?'amber':'neutral'} />
                      {p.client && <Badge l={p.client} col="blue" />}
                    </div>
                    {p.desc && <div style={{ fontSize: 11, color: T.t3 }}>{p.desc}</div>}
                    <div style={{ fontSize: 10, color: T.t4, fontFamily: mo, marginTop: 4 }}>
                      {p.startDate} → {p.endDate || 'Ongoing'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.am }}>{hours}h</div>
                    <div style={{ fontSize: 11, color: T.gn, fontFamily: mo }}>{fmtN(revenue)}</div>
                    {p.budget && <div style={{ fontSize: 10, color: T.t3 }}>of {fmtN(p.budget)} budget</div>}
                  </div>
                </div>
                {p.budget && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.t3, marginBottom: 3 }}>
                      <span>Budget utilisation</span><span>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} max={100} color={pct > 90 ? T.rd : pct > 70 ? T.am : T.gn} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <BtnG small onClick={() => { setTsForm(f => ({ ...f, projectId: p.id })); setShowLog(p); }}>+ Log Time</BtnG>
                  <BtnDanger small onClick={() => del(p.id)}>Del</BtnDanger>
                </div>
              </Card>
            );
          })
      )}

      {tab === 'timesheets' && (
        timesheets.length === 0 ? <InfoBox type="info">No time logged yet.</InfoBox> :
          <Table cols="100px 1fr 1fr 60px 80px 80px 80px">
            {[<TH key="h">Date</TH>, <TH key="h2">Project</TH>, <TH key="h3">Task</TH>, <TH key="h4" right>Hours</TH>, <TH key="h5">Person</TH>, <TH key="h6" right>Value</TH>, <TH key="h7">Type</TH>]}
            {timesheets.map(t => {
              const proj = projects.find(p => p.id === t.projectId);
              return (
                <TRow key={t.id} cols="100px 1fr 1fr 60px 80px 80px 80px">
                  <TD mono muted>{t.date}</TD>
                  <TD bold>{proj?.name || '—'}</TD>
                  <TD muted>{t.task || '—'}</TD>
                  <TD right mono bold>{t.hours}h</TD>
                  <TD muted>{t.person || '—'}</TD>
                  <TD right color={T.gn}>{t.billable ? fmtN(Number(t.hours)*Number(t.rate)) : '—'}</TD>
                  <Badge l={t.billable ? 'Billable' : 'Internal'} col={t.billable ? 'green' : 'neutral'} />
                </TRow>
              );
            })}
          </Table>
      )}

      {showAdd && (
        <Modal title="New Project" onClose={() => setShowAdd(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Project Name *" value={form.name} onChange={e => up('name', e.target.value)} placeholder="Website Redesign, Audit FY25…" />
              <Inp label="Client" value={form.client} onChange={e => up('client', e.target.value)} placeholder="Client company name" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Budget (₹)" type="number" value={form.budget} onChange={e => up('budget', e.target.value)} />
              <Inp label="Start Date" type="date" value={form.startDate} onChange={e => up('startDate', e.target.value)} />
              <Inp label="End Date" type="date" value={form.endDate} onChange={e => up('endDate', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Sel label="Status" value={form.status} onChange={e => up('status', e.target.value)} options={['Active', 'On Hold', 'Completed', 'Cancelled']} />
            </div>
            <TextArea label="Description" value={form.desc} onChange={e => up('desc', e.target.value)} rows={2} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addProject} disabled={!form.name}>Create Project</BtnP>
            </div>
          </div>
        </Modal>
      )}

      {showLog && (
        <Modal title="Log Time" onClose={() => setShowLog(null)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Sel label="Project *" value={tsForm.projectId} onChange={e => upT('projectId', e.target.value)}
              options={['', ...projects.map(p => p.id)]} />
            {tsForm.projectId && <div style={{ fontSize: 12, color: T.t3 }}>{projects.find(p=>p.id===tsForm.projectId)?.name}</div>}
            <Inp label="Task Description" value={tsForm.task} onChange={e => upT('task', e.target.value)} placeholder="Meeting with client, Development, Review…" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Hours *" type="number" value={tsForm.hours} onChange={e => upT('hours', e.target.value)} placeholder="2.5" />
              <Inp label="Date" type="date" value={tsForm.date} onChange={e => upT('date', e.target.value)} />
              <Inp label="Person" value={tsForm.person} onChange={e => upT('person', e.target.value)} placeholder="Your name" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Billing Rate (₹/hr)" type="number" value={tsForm.rate} onChange={e => upT('rate', e.target.value)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                <input type="checkbox" checked={tsForm.billable} onChange={e => upT('billable', e.target.checked)} style={{ accentColor: T.am }} />
                <label style={{ fontSize: 13, color: T.t2 }}>Billable to client</label>
              </div>
            </div>
            {tsForm.hours && tsForm.billable && <InfoBox type="info">Billable amount: {fmtN(Number(tsForm.hours)*Number(tsForm.rate))}</InfoBox>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowLog(null)}>Cancel</BtnG>
              <BtnP onClick={logTime} disabled={!tsForm.projectId||!tsForm.hours}>Log Time</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── 5. SERVICE JOB CARDS ─────────────────────────────────────────────────────
export function ServiceJobCards({ inv, co }) {
  const [jobs, setJobs] = useState(() => load('service_jobs', []));
  const [showAdd, setShowAdd] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const [form, setForm] = useState({ customer: '', phone: '', vehicle: '', model: '', regNo: '', complaint: '', engineer: '', priority: 'Normal', status: 'Received', estimatedCost: '', parts: [] });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('service_jobs', v); setJobs(v); };

  const addJob = () => {
    if (!form.customer || !form.complaint) return;
    const jobNo = 'JC-' + new Date().getFullYear() + '-' + String(jobs.length + 1).padStart(4, '0');
    sv([{ id: uid(), jobNo, ...form, openedAt: today(), closedAt: null }, ...jobs]);
    setShowAdd(false);
    setForm({ customer: '', phone: '', vehicle: '', model: '', regNo: '', complaint: '', engineer: '', priority: 'Normal', status: 'Received', estimatedCost: '', parts: [] });
  };

  const updateStatus = (id, status) => sv(jobs.map(j => j.id === id ? { ...j, status, closedAt: status === 'Delivered' ? today() : j.closedAt } : j));

  const statusFlow = ['Received', 'Diagnosed', 'In Progress', 'Awaiting Parts', 'Ready', 'Delivered'];

  return (
    <div>
      <SHdr title="Service Job Cards"
        sub={`${jobs.filter(j=>j.status!=='Delivered').length} open · ${jobs.filter(j=>j.status==='Ready').length} ready for delivery`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ New Job Card</BtnP>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Open Jobs" value={String(jobs.filter(j=>!['Delivered'].includes(j.status)).length)} sub="in service" ac={T.bl} />
        <KPI label="Ready for Pickup" value={String(jobs.filter(j=>j.status==='Ready').length)} sub="customer to collect" ac={T.gn} />
        <KPI label="Awaiting Parts" value={String(jobs.filter(j=>j.status==='Awaiting Parts').length)} sub="on hold" ac={T.am} />
        <KPI label="Delivered Today" value={String(jobs.filter(j=>j.status==='Delivered'&&j.closedAt===today()).length)} sub="completed" ac={T.rd} />
      </div>

      {jobs.length === 0 ? <InfoBox type="info">No service jobs yet. Create a job card for each customer repair/service.</InfoBox> :
        jobs.map(j => (
          <Card key={j.id} style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setViewJob(j)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontFamily: mo, fontWeight: 700, color: T.am }}>{j.jobNo}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.tx }}>{j.customer}</span>
                  <Badge l={j.status} col={j.status==='Ready'?'green':j.status==='Delivered'?'neutral':j.status==='Awaiting Parts'?'amber':'blue'} />
                  {j.priority === 'Urgent' && <Badge l="URGENT" col="red" />}
                </div>
                <div style={{ fontSize: 12, color: T.t2, marginBottom: 2 }}>{j.complaint.slice(0, 80)}{j.complaint.length > 80 ? '…' : ''}</div>
                <div style={{ fontSize: 10, color: T.t4, fontFamily: mo }}>
                  {j.vehicle && `${j.vehicle} ${j.model || ''} ${j.regNo || ''} · `}{j.phone} · Opened: {j.openedAt}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {j.estimatedCost && <div style={{ fontSize: 16, fontWeight: 700, color: T.am }}>{fmtN(j.estimatedCost)}</div>}
                {j.engineer && <div style={{ fontSize: 11, color: T.t3 }}>{j.engineer}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {statusFlow.filter(s => s !== j.status).slice(0, 3).map(s => (
                <button key={s} onClick={e => { e.stopPropagation(); updateStatus(j.id, s); }}
                  style={{ fontSize: 10, padding: '3px 8px', background: T.sf2, border: `1px solid ${T.bd}`, borderRadius: 3, cursor: 'pointer', color: T.t2 }}>
                  → {s}
                </button>
              ))}
            </div>
          </Card>
        ))
      }

      {showAdd && (
        <Modal title="New Service Job Card" onClose={() => setShowAdd(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Customer Name *" value={form.customer} onChange={e => up('customer', e.target.value)} />
              <Inp label="Phone" value={form.phone} onChange={e => up('phone', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Vehicle / Device" value={form.vehicle} onChange={e => up('vehicle', e.target.value)} placeholder="Car, Bike, AC, Laptop…" />
              <Inp label="Make / Model" value={form.model} onChange={e => up('model', e.target.value)} placeholder="Honda City, Dell Inspiron…" />
              <Inp label="Reg. No / Serial No" value={form.regNo} onChange={e => up('regNo', e.target.value)} />
            </div>
            <TextArea label="Customer Complaint *" value={form.complaint} onChange={e => up('complaint', e.target.value)} rows={3} placeholder="Describe what the customer reported…" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Assigned Engineer" value={form.engineer} onChange={e => up('engineer', e.target.value)} />
              <Sel label="Priority" value={form.priority} onChange={e => up('priority', e.target.value)} options={['Normal', 'High', 'Urgent']} />
              <Inp label="Estimated Cost (₹)" type="number" value={form.estimatedCost} onChange={e => up('estimatedCost', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addJob} disabled={!form.customer||!form.complaint}>Create Job Card</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── 6. SUBSCRIPTION & RECURRING BILLING ──────────────────────────────────────
export function SubscriptionBilling({ co, fmtN, fmt }) {
  const [subs, setSubs] = useState(() => load('subscriptions', []));
  const [invoices, setInvoices] = useState(() => load('sub_invoices', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ client: '', plan: '', amount: '', freq: 'Monthly', startDate: today(), nextBill: '', status: 'Active', desc: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const svS = v => { save('subscriptions', v); setSubs(v); };
  const svI = v => { save('sub_invoices', v); setInvoices(v); };

  const calcNext = (start, freq) => {
    const d = new Date(start);
    if (freq === 'Monthly') d.setMonth(d.getMonth() + 1);
    else if (freq === 'Quarterly') d.setMonth(d.getMonth() + 3);
    else if (freq === 'Yearly') d.setFullYear(d.getFullYear() + 1);
    else if (freq === 'Weekly') d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const addSub = () => {
    if (!form.client || !form.amount) return;
    const nextBill = calcNext(form.startDate, form.freq);
    svS([{ id: uid(), ...form, nextBill }, ...subs]);
    setShowAdd(false);
  };

  const generateInvoice = (sub) => {
    const inv = { id: uid(), subId: sub.id, client: sub.client, amount: sub.amount, date: today(), status: 'Pending', period: sub.nextBill };
    svI([inv, ...invoices]);
    svS(subs.map(s => s.id === sub.id ? { ...s, nextBill: calcNext(sub.nextBill, sub.freq) } : s));
  };

  const mrr = subs.filter(s => s.status === 'Active').reduce((sum, s) => {
    const m = { Monthly: 1, Quarterly: 1/3, Yearly: 1/12, Weekly: 4 };
    return sum + Number(s.amount) * (m[s.freq] || 1);
  }, 0);

  const dueSoon = subs.filter(s => s.status === 'Active' && s.nextBill <= new Date(Date.now() + 7*86400000).toISOString().split('T')[0]);

  return (
    <div>
      <SHdr title="Subscription & Recurring Billing"
        sub={`${subs.filter(s=>s.status==='Active').length} active subscriptions · MRR: ${fmt(mrr)}`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ Add Subscription</BtnP>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Monthly Recurring Revenue" value={fmt(mrr)} sub="MRR" ac={T.gn} />
        <KPI label="Annual Run Rate" value={fmt(mrr * 12)} sub="ARR" ac={T.am} />
        <KPI label="Active Clients" value={String(subs.filter(s=>s.status==='Active').length)} sub="subscriptions" ac={T.bl} />
        <KPI label="Due This Week" value={String(dueSoon.length)} sub="invoices to generate" ac={T.rd} />
      </div>

      {dueSoon.length > 0 && <div style={{ marginBottom: 14 }}><InfoBox type="warning">{dueSoon.length} subscription(s) due for billing this week: {dueSoon.map(s=>s.client).join(', ')}</InfoBox></div>}

      {subs.length === 0 ? <InfoBox type="info">No subscriptions yet. Add recurring billing for retainer clients, AMC contracts, memberships.</InfoBox> :
        <Table cols="1fr 80px 100px 90px 100px 80px 140px">
          {[<TH key="h">Client</TH>, <TH key="h2">Freq</TH>, <TH key="h3" right>Amount</TH>, <TH key="h4">Next Bill</TH>, <TH key="h5">Status</TH>, <TH key="h6">Invoices</TH>, <TH key="h7">Action</TH>]}
          {subs.map(s => {
            const due = s.nextBill <= today();
            return (
              <TRow key={s.id} cols="1fr 80px 100px 90px 100px 80px 140px" highlight={due}>
                <div><TD bold>{s.client}</TD>{s.desc && <div style={{fontSize:11,color:T.t3}}>{s.desc}</div>}</div>
                <Badge l={s.freq} col="blue" />
                <TD right bold color={T.gn}>{fmtN(s.amount)}</TD>
                <div>
                  <TD mono muted>{s.nextBill}</TD>
                  {due && <div style={{fontSize:9,color:T.rd,fontFamily:mo}}>OVERDUE</div>}
                </div>
                <Badge l={s.status} col={s.status==='Active'?'green':'neutral'} />
                <TD>{invoices.filter(i=>i.subId===s.id).length}</TD>
                <div style={{ display: 'flex', gap: 4 }}>
                  <BtnP small onClick={() => generateInvoice(s)}>Bill Now</BtnP>
                  <BtnDanger small onClick={() => svS(subs.filter(x=>x.id!==s.id))}>Del</BtnDanger>
                </div>
              </TRow>
            );
          })}
        </Table>
      }

      {showAdd && (
        <Modal title="Add Subscription" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Client Name *" value={form.client} onChange={e => up('client', e.target.value)} placeholder="Mehta Industries — Annual AMC" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Amount (₹) *" type="number" value={form.amount} onChange={e => up('amount', e.target.value)} />
              <Sel label="Billing Frequency" value={form.freq} onChange={e => up('freq', e.target.value)} options={['Weekly','Monthly','Quarterly','Yearly']} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Start Date" type="date" value={form.startDate} onChange={e => up('startDate', e.target.value)} />
              <Sel label="Status" value={form.status} onChange={e => up('status', e.target.value)} options={['Active','Paused','Cancelled']} />
            </div>
            <Inp label="Plan / Description" value={form.desc} onChange={e => up('desc', e.target.value)} placeholder="Annual maintenance contract, Monthly retainer…" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addSub} disabled={!form.client||!form.amount}>Add Subscription</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
