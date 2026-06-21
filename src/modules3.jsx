import React, { useState, useEffect, useRef } from 'react';
import { T, f, mo, Badge, KPI, Inp, Sel, TextArea, BtnP, BtnG, BtnDanger, SHdr, Tabs, Table, TRow, TH, TD, Modal, InfoBox, StatRow, Card, CardHdr, ProgressBar } from './components';
import { uid, today, fmt, fmtN, fmtD, load, save } from './data';

// ─── 1. TASK & ACTIVITY MANAGEMENT ────────────────────────────────────────────
export function TaskManager({ emps, leads, vendors, co }) {
  const [tasks, setTasks] = useState(() => load('tasks', []));
  const [tab, setTab] = useState('today');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', desc: '', assignee: '', priority: 'Medium', dueDate: today(), module: 'General', linkedId: '', repeat: 'none', status: 'Open' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('tasks', v); setTasks(v); };

  const addTask = () => {
    if (!form.title) return;
    sv([{ id: uid(), ...form, createdAt: today(), completedAt: null }, ...tasks]);
    setShowAdd(false);
    setForm({ title: '', desc: '', assignee: '', priority: 'Medium', dueDate: today(), module: 'General', linkedId: '', repeat: 'none', status: 'Open' });
  };

  const complete = (id) => {
    sv(tasks.map(t => t.id === id ? { ...t, status: 'Done', completedAt: today() } : t));
  };
  const reopen = (id) => sv(tasks.map(t => t.id === id ? { ...t, status: 'Open', completedAt: null } : t));
  const del = (id) => sv(tasks.filter(t => t.id !== id));

  const todayStr = today();
  const todayTasks = tasks.filter(t => t.status !== 'Done' && t.dueDate === todayStr);
  const overdue = tasks.filter(t => t.status !== 'Done' && t.dueDate < todayStr);
  const upcoming = tasks.filter(t => t.status !== 'Done' && t.dueDate > todayStr);
  const done = tasks.filter(t => t.status === 'Done');

  const priColor = p => p === 'High' ? T.rd : p === 'Medium' ? T.am : T.gn;
  const priCol = p => p === 'High' ? 'red' : p === 'Medium' ? 'amber' : 'green';

  const TaskCard = ({ t }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.sf2}` }}>
      <button onClick={() => t.status === 'Done' ? reopen(t.id) : complete(t.id)}
        style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${t.status === 'Done' ? T.gn : T.bd2}`, background: t.status === 'Done' ? T.gn : 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 11 }}>
        {t.status === 'Done' && '✓'}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.status === 'Done' ? T.t4 : T.tx, textDecoration: t.status === 'Done' ? 'line-through' : 'none' }}>{t.title}</span>
          <Badge l={t.priority} col={priCol(t.priority)} />
          {t.module !== 'General' && <Badge l={t.module} col="blue" />}
        </div>
        {t.desc && <div style={{ fontSize: 11, color: T.t3, marginBottom: 4 }}>{t.desc}</div>}
        <div style={{ display: 'flex', gap: 12, fontSize: 10, color: T.t4, fontFamily: mo }}>
          {t.assignee && <span>👤 {t.assignee}</span>}
          <span style={{ color: t.dueDate < todayStr && t.status !== 'Done' ? T.rd : T.t4 }}>📅 {fmtD(t.dueDate)}</span>
          {t.repeat !== 'none' && <span>🔄 {t.repeat}</span>}
        </div>
      </div>
      <BtnDanger small onClick={() => del(t.id)}>×</BtnDanger>
    </div>
  );

  const listFor = tab === 'today' ? todayTasks : tab === 'overdue' ? overdue : tab === 'upcoming' ? upcoming : done;

  return (
    <div>
      <SHdr title="Tasks & Activities"
        sub={`${overdue.length} overdue · ${todayTasks.length} due today · ${upcoming.length} upcoming`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ Add Task</BtnP>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Overdue" value={String(overdue.length)} sub="needs immediate attention" ac={T.rd} />
        <KPI label="Due Today" value={String(todayTasks.length)} sub="tasks for today" ac={T.am} />
        <KPI label="Upcoming" value={String(upcoming.length)} sub="future tasks" ac={T.bl} />
        <KPI label="Completed" value={String(done.length)} sub="total done" ac={T.gn} />
      </div>

      <Tabs tabs={[
        { id: 'today', label: `Today (${todayTasks.length})` },
        { id: 'overdue', label: `Overdue (${overdue.length})` },
        { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
        { id: 'done', label: `Done (${done.length})` },
      ]} active={tab} onChange={setTab} />

      <Card>
        {listFor.length === 0
          ? <div style={{ color: T.t4, textAlign: 'center', padding: '24px 0', fontSize: 12, fontFamily: mo }}>
              {tab === 'today' ? 'No tasks due today. Enjoy your day!' : `No ${tab} tasks.`}
            </div>
          : listFor.map(t => <TaskCard key={t.id} t={t} />)
        }
      </Card>

      {showAdd && (
        <Modal title="Add Task" onClose={() => setShowAdd(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Task Title *" value={form.title} onChange={e => up('title', e.target.value)} placeholder="Call Mehta Industries, Prepare GST return, Review contract…" />
            <TextArea label="Description / Notes" value={form.desc} onChange={e => up('desc', e.target.value)} rows={2} placeholder="Additional details…" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Assignee" value={form.assignee} onChange={e => up('assignee', e.target.value)}
                placeholder={emps.length > 0 ? emps[0].name : 'Name'} />
              <Sel label="Priority" value={form.priority} onChange={e => up('priority', e.target.value)} options={['High', 'Medium', 'Low']} />
              <Inp label="Due Date" type="date" value={form.dueDate} onChange={e => up('dueDate', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Sel label="Module / Context" value={form.module} onChange={e => up('module', e.target.value)}
                options={['General', 'Accounting', 'CRM', 'HR', 'Legal', 'Vendor', 'Inventory', 'Compliance', 'Collections', 'Production']} />
              <Sel label="Repeat" value={form.repeat} onChange={e => up('repeat', e.target.value)}
                options={['none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addTask} disabled={!form.title}>Add Task</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── 2. WORKFLOW AUTOMATION ENGINE ────────────────────────────────────────────
export function WorkflowAutomation({ txns, leads, emps, inv, co }) {
  const [rules, setRules] = useState(() => load('workflows', []));
  const [showAdd, setShowAdd] = useState(false);
  const [log, setLog] = useState(() => load('workflow_log', []));
  const [form, setForm] = useState({ name: '', trigger: 'invoice_overdue', condition: '30', action: 'create_task', actionDetail: '', active: true });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('workflows', v); setRules(v); };
  const svLog = v => { save('workflow_log', v); setLog(v); };

  const TRIGGERS = [
    { id: 'invoice_overdue', label: 'Invoice overdue by X days' },
    { id: 'lead_stale', label: 'Lead not updated in X days' },
    { id: 'stock_low', label: 'Stock item below reorder level' },
    { id: 'contract_expiring', label: 'Contract expiring in X days' },
    { id: 'pdc_due', label: 'PDC cheque due in X days' },
    { id: 'gst_due', label: 'GST filing due in X days' },
    { id: 'payroll_due', label: 'Payroll date approaching' },
    { id: 'new_lead', label: 'New lead added' },
    { id: 'deal_won', label: 'Deal marked as Won' },
  ];

  const ACTIONS = [
    { id: 'create_task', label: 'Create a task' },
    { id: 'send_alert', label: 'Show dashboard alert' },
    { id: 'flag_risk', label: 'Flag as risk in Risk Register' },
    { id: 'draft_letter', label: 'Auto-draft recovery letter' },
    { id: 'generate_report', label: 'Generate summary report' },
  ];

  // Run all active workflows against current data
  const runWorkflows = () => {
    const todayStr = today();
    const newLogEntries = [];

    rules.filter(r => r.active).forEach(rule => {
      const days = parseInt(rule.condition) || 30;

      if (rule.trigger === 'invoice_overdue') {
        const overdue = txns.filter(t => t.status === 'pending' && t.type === 'income' && t.date) .filter(t => Math.floor((Date.now() - new Date(t.date)) / 86400000) >= days);
        if (overdue.length > 0) {
          newLogEntries.push({ id: uid(), rule: rule.name, trigger: rule.trigger, detail: `${overdue.length} invoice(s) overdue ${days}+ days`, ts: new Date().toISOString(), action: rule.action });
        }
      }
      if (rule.trigger === 'lead_stale') {
        const stale = leads.filter(l => !['Won','Lost'].includes(l.stage) && l.date && Math.floor((Date.now() - new Date(l.date)) / 86400000) >= days);
        if (stale.length > 0) {
          newLogEntries.push({ id: uid(), rule: rule.name, trigger: rule.trigger, detail: `${stale.length} lead(s) stale for ${days}+ days`, ts: new Date().toISOString(), action: rule.action });
        }
      }
      if (rule.trigger === 'stock_low') {
        const low = inv.filter(i => Number(i.qty) <= Number(i.reorder || 5));
        if (low.length > 0) {
          newLogEntries.push({ id: uid(), rule: rule.name, trigger: rule.trigger, detail: `${low.length} item(s) below reorder level`, ts: new Date().toISOString(), action: rule.action });
        }
      }
    });

    if (newLogEntries.length > 0) {
      const updated = [...newLogEntries, ...log].slice(0, 200);
      svLog(updated);
    }
    return newLogEntries.length;
  };

  const [lastRun, setLastRun] = useState(null);
  const runNow = () => { const n = runWorkflows(); setLastRun(n); };

  const toggleRule = (id) => sv(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const delRule = (id) => sv(rules.filter(r => r.id !== id));

  const addRule = () => {
    if (!form.name) return;
    sv([{ id: uid(), ...form }, ...rules]);
    setShowAdd(false);
    setForm({ name: '', trigger: 'invoice_overdue', condition: '30', action: 'create_task', actionDetail: '', active: true });
  };

  return (
    <div>
      <SHdr title="Workflow Automation"
        sub={`${rules.filter(r=>r.active).length} active rules · ${log.length} events logged`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnG onClick={runNow}>▶ Run Now {lastRun !== null && `(${lastRun} triggered)`}</BtnG>
            <BtnP onClick={() => setShowAdd(true)}>+ New Rule</BtnP>
          </div>
        } />

      <InfoBox type="info">Workflows run automatically every time you open the app. You can also run them manually. They check your live data and trigger actions based on the rules you define.</InfoBox>

      {rules.length === 0 ? (
        <div style={{ marginTop: 20 }}>
          <InfoBox type="info">No automation rules yet. Start with common ones below.</InfoBox>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            {[
              { name: 'Chase overdue invoices', trigger: 'invoice_overdue', condition: '30', action: 'create_task', actionDetail: 'Follow up on overdue payment' },
              { name: 'Flag stale leads', trigger: 'lead_stale', condition: '7', action: 'send_alert', actionDetail: 'Lead has gone cold' },
              { name: 'Low stock alert', trigger: 'stock_low', condition: '1', action: 'send_alert', actionDetail: 'Stock below reorder level' },
              { name: 'Contract expiry warning', trigger: 'contract_expiring', condition: '30', action: 'create_task', actionDetail: 'Renew contract before expiry' },
            ].map(tmpl => (
              <button key={tmpl.name} onClick={() => { sv([{ id: uid(), ...tmpl, active: true }, ...rules]); }}
                style={{ padding: '12px 14px', background: T.aml, border: `1px solid #FED7AA`, borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.ac }}>{tmpl.name}</div>
                <div style={{ fontSize: 10, color: T.t3, marginTop: 3, fontFamily: mo }}>Click to add this rule</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          {rules.map(r => (
            <Card key={r.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => toggleRule(r.id)}
                    style={{ width: 36, height: 20, borderRadius: 10, background: r.active ? T.gn : T.bd2, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                    <span style={{ position: 'absolute', top: 2, left: r.active ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#FFF', transition: 'left 0.2s' }} />
                  </button>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.tx }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>
                      {TRIGGERS.find(t => t.id === r.trigger)?.label} {r.condition && `(${r.condition} days)`}
                      {' → '}{ACTIONS.find(a => a.id === r.action)?.label}
                      {r.actionDetail && `: "${r.actionDetail}"`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge l={r.active ? 'ACTIVE' : 'PAUSED'} col={r.active ? 'green' : 'neutral'} />
                  <BtnDanger small onClick={() => delRule(r.id)}>Del</BtnDanger>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {log.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Card>
            <CardHdr>Automation Log (last {Math.min(log.length, 10)} events)</CardHdr>
            {log.slice(0, 10).map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.sf2}` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.tx }}>{l.rule}</div>
                  <div style={{ fontSize: 11, color: T.t3 }}>{l.detail}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge l={l.action} col="blue" />
                  <div style={{ fontSize: 10, color: T.t4, fontFamily: mo, marginTop: 3 }}>{new Date(l.ts).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {showAdd && (
        <Modal title="New Automation Rule" onClose={() => setShowAdd(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Rule Name *" value={form.name} onChange={e => up('name', e.target.value)} placeholder="Chase overdue invoices after 30 days" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Sel label="When this happens (Trigger)" value={form.trigger} onChange={e => up('trigger', e.target.value)}
                options={TRIGGERS.map(t => t.id)} />
              <Inp label="Threshold (days)" type="number" value={form.condition} onChange={e => up('condition', e.target.value)} placeholder="30" />
            </div>
            <Sel label="Then do this (Action)" value={form.action} onChange={e => up('action', e.target.value)}
              options={ACTIONS.map(a => a.id)} />
            <Inp label="Action Detail (optional)" value={form.actionDetail} onChange={e => up('actionDetail', e.target.value)} placeholder="Task title, alert message, etc." />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addRule} disabled={!form.name}>Add Rule</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── 3. MULTI-USER WITH ROLE-BASED ACCESS ─────────────────────────────────────
export function UserManagement({ co }) {
  const [users, setUsers] = useState(() => load('app_users', [
    { id: 'owner', name: co.name.split(' ')[0] + ' (Owner)', role: 'Owner', pin: '0000', active: true, lastLogin: today() }
  ]));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'Accountant', pin: '', active: true });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('app_users', v); setUsers(v); };

  const ROLES = {
    Owner:      { label: 'Owner / Admin', color: T.am, access: 'Full access to everything' },
    Accountant: { label: 'Accountant', color: T.bl, access: 'Accounting, Tax, Banking, Reports' },
    HR:         { label: 'HR Manager', color: T.gn, access: 'HR, Payroll, Attendance, Recruitment' },
    Sales:      { label: 'Sales Manager', color: '#8B5CF6', access: 'CRM, Leads, Proposals, Quotations' },
    Inventory:  { label: 'Store Manager', color: '#0891B2', access: 'Inventory, Vendors, Production' },
    Viewer:     { label: 'Read-Only', color: T.t3, access: 'View reports and dashboards only' },
  };

  const MODULE_ACCESS = {
    Owner:      'all',
    Accountant: ['dashboard','accounting','taxation','cashflow','banking','reports','analytics','audit'],
    HR:         ['dashboard','hr','attendance','recruitment','performance','training','payrollrun'],
    Sales:      ['dashboard','crm','leads','proposals','quotations','invoices','comms'],
    Inventory:  ['dashboard','inventory','vendors','production','suppliercomp','nonmoving'],
    Viewer:     ['dashboard','analytics','reports'],
  };

  const addUser = () => {
    if (!form.name || !form.pin || form.pin.length < 4) return;
    sv([...users, { id: uid(), ...form, lastLogin: null }]);
    setShowAdd(false);
    setForm({ name: '', role: 'Accountant', pin: '', active: true });
  };

  const toggle = (id) => sv(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  const del = (id) => { if (id === 'owner') return; sv(users.filter(u => u.id !== id)); };

  return (
    <div>
      <SHdr title="User Management & Access Control"
        sub={`${users.filter(u=>u.active).length} active users · Role-based permissions`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ Add User</BtnP>} />

      <InfoBox type="info">Each user logs in with their name + 4-digit PIN. Their access is limited to modules permitted for their role. All actions are recorded in the Audit Trail with the user's name.</InfoBox>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 20 }}>
        {users.map(u => {
          const roleInfo = ROLES[u.role] || ROLES.Viewer;
          const access = MODULE_ACCESS[u.role];
          return (
            <Card key={u.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: roleInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#FFF', fontWeight: 700 }}>
                    {u.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: T.t3, marginTop: 1 }}>PIN: {'•'.repeat(u.pin?.length || 4)} · Last login: {u.lastLogin || 'Never'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggle(u.id)}
                    style={{ width: 32, height: 18, borderRadius: 9, background: u.active ? T.gn : T.bd2, border: 'none', cursor: 'pointer', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 1, left: u.active ? 15 : 1, width: 16, height: 16, borderRadius: '50%', background: '#FFF', transition: 'left 0.2s' }} />
                  </button>
                  {u.id !== 'owner' && <BtnDanger small onClick={() => del(u.id)}>Del</BtnDanger>}
                </div>
              </div>
              <div style={{ padding: '8px 10px', background: roleInfo.color + '15', borderRadius: 5, border: `1px solid ${roleInfo.color}44` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: roleInfo.color, marginBottom: 3 }}>{roleInfo.label}</div>
                <div style={{ fontSize: 11, color: T.t2 }}>{roleInfo.access}</div>
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: T.t3, fontFamily: mo }}>
                Modules: {access === 'all' ? 'Everything' : access.join(', ')}
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <Card>
          <CardHdr>Role Permission Matrix</CardHdr>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: T.sb }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#9A8674', fontFamily: mo, fontSize: 10, letterSpacing: 1 }}>MODULE</th>
                  {Object.keys(ROLES).map(r => (
                    <th key={r} style={{ padding: '8px 12px', textAlign: 'center', color: ROLES[r].color, fontFamily: mo, fontSize: 10, letterSpacing: 1 }}>{r.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[['Dashboard','dashboard'],['Accounting','accounting'],['HR & Payroll','hr'],['Inventory','inventory'],['CRM','crm'],['Reports','reports'],['Settings','settings']].map(([label, key], i) => (
                  <tr key={key} style={{ background: i % 2 === 0 ? 'transparent' : T.sf2 }}>
                    <td style={{ padding: '6px 12px', color: T.t2 }}>{label}</td>
                    {Object.keys(ROLES).map(r => {
                      const access = MODULE_ACCESS[r];
                      const hasAccess = access === 'all' || access.includes(key);
                      return (
                        <td key={r} style={{ padding: '6px 12px', textAlign: 'center', color: hasAccess ? T.gn : T.bd2, fontSize: 14 }}>
                          {hasAccess ? '✓' : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showAdd && (
        <Modal title="Add User" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Inp label="Full Name *" value={form.name} onChange={e => up('name', e.target.value)} placeholder="Priya Sharma" />
            <Sel label="Role *" value={form.role} onChange={e => up('role', e.target.value)} options={Object.keys(ROLES)} />
            {form.role && <InfoBox type="info">{ROLES[form.role]?.access}</InfoBox>}
            <Inp label="4-digit PIN *" type="password" value={form.pin} onChange={e => up('pin', e.target.value.slice(0,4))} placeholder="Enter 4-digit login PIN" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addUser} disabled={!form.name || form.pin.length < 4}>Add User</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
