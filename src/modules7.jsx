import React, { useState, useRef } from 'react';
import { T, f, mo, Badge, KPI, Inp, Sel, TextArea, BtnP, BtnG, BtnDanger, SHdr, Tabs, Table, TRow, TH, TD, Modal, InfoBox, StatRow, Card, CardHdr, ProgressBar } from './components';
import { uid, today, fmt, fmtN, fmtD, load, save } from './data';
import { generate } from './AIStatus';
import { generatePDF } from './pdf';

// ─── 14. CA EXPORT + TALLY COMPATIBLE OUTPUT ─────────────────────────────────
export function CAExport({ txns, emps, inv, vendors, co, calcPay }) {
  const [tab, setTab] = useState('export');
  const [generating, setGenerating] = useState(false);

  const exportTallyXML = () => {
    const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<ENVELOPE>', '<HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>', '<BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC><REQUESTDATA>'];
    txns.forEach(t => {
      lines.push(`<TALLYMESSAGE xmlns:UDF="TallyUDF">`);
      lines.push(`<VOUCHER VCHTYPE="${t.type === 'income' ? 'Sales' : 'Purchase'}" ACTION="Create">`);
      lines.push(`<DATE>${(t.date || '').replace(/-/g, '')}</DATE>`);
      lines.push(`<PARTYLEDGERNAME>${t.party || 'Cash'}</PARTYLEDGERNAME>`);
      lines.push(`<AMOUNT>${t.type === 'income' ? -Number(t.amount) : Number(t.amount)}</AMOUNT>`);
      lines.push(`<NARRATION>${t.note || t.cat || ''}</NARRATION>`);
      lines.push(`</VOUCHER></TALLYMESSAGE>`);
    });
    lines.push('</REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>');
    const xml = lines.join('\n');
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexara_tally_${new Date().toISOString().split('T')[0]}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCAPackage = async () => {
    setGenerating(true);
    // Generate all PDFs
    await generatePDF('pl', { co, txns });
    await generatePDF('gst', { co, txns });
    await generatePDF('payroll_register', { co, emps, calcPay });
    await generatePDF('vendor_outstanding', { co, vendors });
    await generatePDF('inventory', { co, inv });
    setGenerating(false);
  };

  const exportCSV = () => {
    const rows = [['Date', 'Type', 'Party', 'Category', 'Amount', 'GST%', 'GST Amount', 'HSN', 'Status', 'Note']];
    txns.forEach(t => {
      rows.push([t.date, t.type, t.party||'', t.cat||'', t.amount, t.gst||'0', Math.round(Number(t.amount)*Number(t.gst||0)/100), t.hsn||'', t.status||'cleared', t.note||'']);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexara_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SHdr title="CA Export & Audit Package"
        sub="Export your books in formats your CA can directly use — Tally XML, CSV, PDF package" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <Card>
          <CardHdr>Tally XML Export</CardHdr>
          <p style={{ fontSize: 12, color: T.t2, lineHeight: 1.7, marginBottom: 14 }}>
            Export all transactions in Tally-compatible XML format. Your CA can import this directly into Tally Prime or Tally ERP 9 — no manual data entry, no errors.
          </p>
          <div style={{ marginBottom: 12 }}>
            <StatRow label="Transactions to export" value={String(txns.length)} />
            <StatRow label="Date range" value={txns.length > 0 ? `${txns[txns.length-1]?.date} to ${txns[0]?.date}` : '—'} />
          </div>
          <BtnP onClick={exportTallyXML} disabled={txns.length === 0}>↓ Export Tally XML</BtnP>
        </Card>

        <Card>
          <CardHdr>Full CA Package (5 PDFs)</CardHdr>
          <p style={{ fontSize: 12, color: T.t2, lineHeight: 1.7, marginBottom: 14 }}>
            Generates P&L Statement, GST Summary, Payroll Register, Vendor Outstanding, and Inventory Valuation — all as formatted PDFs ready for CA review.
          </p>
          <div style={{ marginBottom: 12 }}>
            <StatRow label="P&L Statement" value="PDF" />
            <StatRow label="GST Summary (GSTR-3B draft)" value="PDF" />
            <StatRow label="Payroll Register" value="PDF" />
            <StatRow label="Vendor Outstanding" value="PDF" />
            <StatRow label="Inventory Valuation" value="PDF" />
          </div>
          <BtnP onClick={exportCAPackage} disabled={generating}>{generating ? 'Generating PDFs…' : '↓ Generate All PDFs'}</BtnP>
        </Card>
      </div>

      <Card>
        <CardHdr>Raw Data CSV Export</CardHdr>
        <p style={{ fontSize: 12, color: T.t2, lineHeight: 1.7, marginBottom: 14 }}>
          Export all transactions as a CSV file. Works with Excel, Google Sheets, or any accounting software. Includes all fields: date, party, category, amount, GST, HSN, status.
        </p>
        <BtnG onClick={exportCSV} disabled={txns.length === 0}>↓ Export Transactions CSV</BtnG>
      </Card>
    </div>
  );
}

// ─── 15. BOARD REPORT AUTO-GENERATION ────────────────────────────────────────
export function BoardReports({ txns, emps, inv, leads, contracts, co, calcPay, fmt, fmtN }) {
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState('');

  const sales = txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0);
  const expenses = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
  const profit = sales - expenses;
  const margin = sales > 0 ? (profit/sales*100).toFixed(1) : 0;
  const wonVal = leads.filter(l=>l.stage==='Won').reduce((s,l)=>s+Number(l.val||0),0);
  const pipeline = leads.filter(l=>!['Won','Lost'].includes(l.stage)).reduce((s,l)=>s+Number(l.val||0),0);
  const totalPayroll = emps.reduce((s,e)=>s+calcPay(e.ctc).net,0);
  const expiring = contracts.filter(c=>{
    if (!c.end) return false;
    return Math.ceil((new Date(c.end)-new Date())/86400000) <= 60;
  });

  const generateNarrative = async () => {
    setLoading(true);
    try {
      const txt = await generate(
        `Write a professional 4-paragraph board report narrative for ${co.name} (${co.industry}) with these metrics:
Revenue: ${fmtN(sales)}, Expenses: ${fmtN(expenses)}, Net Profit: ${fmtN(profit)}, Margin: ${margin}%
Employees: ${emps.length}, Monthly payroll: ${fmtN(totalPayroll)}
Pipeline value: ${fmtN(pipeline)}, Won deals: ${fmtN(wonVal)}
Inventory items: ${inv.length}, Contracts expiring: ${expiring.length}
Write as if presenting to the board/investors. Highlight positives, address risks, give 2 forward-looking recommendations. Professional, concise tone.`
      );
      setNarrative(txt);
    } catch (e) { setNarrative('AI not ready. Generate the PDF report directly instead.'); }
    setLoading(false);
  };

  return (
    <div>
      <SHdr title="Board & Investor Reports"
        sub="Auto-generated executive summary — ready to share with board or investors" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Revenue" value={fmt(sales)} sub="total income" ac={T.gn} />
        <KPI label="Net Profit" value={fmt(profit)} sub={`${margin}% margin`} ac={profit >= 0 ? T.gn : T.rd} />
        <KPI label="Pipeline" value={fmt(pipeline)} sub="active opportunities" ac={T.bl} />
        <KPI label="Headcount" value={String(emps.length)} sub="employees" ac={T.am} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <CardHdr>Board Metrics Snapshot</CardHdr>
          <StatRow label="Total Revenue" value={fmtN(sales)} color={T.gn} />
          <StatRow label="Total Expenses" value={fmtN(expenses)} color={T.rd} />
          <StatRow label="Net Profit" value={fmtN(profit)} highlight color={profit>=0?T.gn:T.rd} />
          <StatRow label="Profit Margin" value={`${margin}%`} />
          <StatRow label="Monthly Payroll" value={fmtN(totalPayroll)} />
          <StatRow label="Headcount" value={String(emps.length)} />
          <StatRow label="Pipeline Value" value={fmtN(pipeline)} />
          <StatRow label="Won Deals" value={fmtN(wonVal)} />
          <StatRow label="Active Contracts" value={String(contracts.filter(c=>c.status==='Active').length)} />
          <StatRow label="Contracts Expiring (60d)" value={String(expiring.length)} color={expiring.length>0?T.rd:T.gn} />
          <StatRow label="Inventory SKUs" value={String(inv.length)} />
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <BtnP onClick={() => generatePDF('board_report', { co, txns, emps, inv, leads })}>↓ PDF Report</BtnP>
            <BtnG onClick={generateNarrative} disabled={loading}>{loading ? 'Writing…' : '✦ AI Narrative'}</BtnG>
          </div>
        </Card>

        <Card>
          <CardHdr>AI Executive Narrative</CardHdr>
          {narrative ? (
            <div>
              <div style={{ fontSize: 12, color: T.t2, lineHeight: 1.9, whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto' }}>{narrative}</div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <BtnP small onClick={() => navigator.clipboard.writeText(narrative)}>Copy</BtnP>
                <BtnG small onClick={() => setNarrative('')}>Clear</BtnG>
              </div>
            </div>
          ) : (
            <div style={{ color: T.t4, textAlign: 'center', padding: '40px 20px', fontSize: 12, fontFamily: mo }}>
              {loading ? 'AI is writing your board narrative…' : 'Click "AI Narrative" to generate a professional executive summary for board meetings or investor updates'}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── 16. EMPLOYEE SELF-SERVICE ────────────────────────────────────────────────
export function EmployeeSelfService({ emps, co, calcPay }) {
  const [pin, setPin] = useState('');
  const [loggedIn, setLoggedIn] = useState(null);
  const [tab, setTab] = useState('payslip');
  const [leaveReqs, setLeaveReqs] = useState(() => load('leave_requests', []));
  const [leaveForm, setLeaveForm] = useState({ from: today(), to: today(), reason: '', type: 'Casual Leave' });
  const up = (k, v) => setLeaveForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('leave_requests', v); setLeaveReqs(v); };

  const tryLogin = () => {
    const emp = emps.find(e => e.phone?.slice(-4) === pin || e.empPin === pin);
    if (emp) setLoggedIn(emp);
    else { alert('PIN not found. Use last 4 digits of your phone number or ask HR for your PIN.'); setPin(''); }
  };

  const submitLeave = () => {
    if (!leaveForm.reason || !loggedIn) return;
    sv([{ id: uid(), empId: loggedIn.id, empName: loggedIn.name, ...leaveForm, status: 'Pending', submittedAt: today() }, ...leaveReqs]);
    setLeaveForm({ from: today(), to: today(), reason: '', type: 'Casual Leave' });
    alert('Leave request submitted. HR will review it.');
  };

  if (!loggedIn) {
    return (
      <div>
        <SHdr title="Employee Self-Service" sub="Employees can view payslips, apply for leave, and check attendance" />
        <div style={{ maxWidth: 360, margin: '40px auto' }}>
          <Card>
            <CardHdr>Employee Login</CardHdr>
            <div style={{ display: 'grid', gap: 14 }}>
              <InfoBox type="info">Enter your 4-digit PIN (last 4 digits of your registered phone number).</InfoBox>
              <Inp label="4-Digit PIN" type="password" value={pin} onChange={e => setPin(e.target.value.slice(0,4))} placeholder="••••" />
              <BtnP onClick={tryLogin} disabled={pin.length < 4}>Login</BtnP>
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: T.t3, textAlign: 'center' }}>
              {emps.length} employees registered · Contact HR if you don't know your PIN
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const pay = calcPay(loggedIn.ctc);
  const myLeaves = leaveReqs.filter(l => l.empId === loggedIn.id);

  return (
    <div>
      <SHdr title={`Welcome, ${loggedIn.name}`}
        sub={`${loggedIn.role} · ${loggedIn.dept || 'General'} · Self-service portal`}
        action={<BtnG onClick={() => setLoggedIn(null)}>Logout</BtnG>} />

      <Tabs tabs={[{ id: 'payslip', label: 'My Payslip' }, { id: 'leave', label: `Leave (${myLeaves.length})` }, { id: 'profile', label: 'My Profile' }]} active={tab} onChange={setTab} />

      {tab === 'payslip' && (
        <div style={{ maxWidth: 560 }}>
          <Card>
            <CardHdr>Payslip — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</CardHdr>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <div>
                <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>EARNINGS</div>
                {[['Basic Salary', pay.basic], ['HRA', pay.hra], ['Special Allowance', pay.spl]].map(([l,v]) => <StatRow key={l} label={l} value={fmtN(v)} />)}
                <StatRow label="GROSS" value={fmtN(pay.gross)} highlight />
              </div>
              <div style={{ paddingLeft: 20, borderLeft: `1px solid ${T.bd}` }}>
                <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>DEDUCTIONS</div>
                {[['PF (12%)', pay.pfEmp], ['ESIC', pay.esic], ['Professional Tax', pay.pt], ['TDS', pay.tds]].map(([l,v]) => <StatRow key={l} label={l} value={fmtN(v)} color={T.rd} />)}
                <StatRow label="TOTAL DEDUCTIONS" value={fmtN(pay.deductions)} highlight color={T.rd} />
              </div>
            </div>
            <div style={{ marginTop: 12, padding: 12, background: T.aml, borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: T.tx }}>NET TAKE-HOME</span>
              <span style={{ fontWeight: 700, color: T.gn, fontSize: 18 }}>{fmtN(pay.net)}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <BtnP onClick={() => generatePDF('payslip', { co, emp: loggedIn, pay })}>↓ Download PDF</BtnP>
            </div>
          </Card>
        </div>
      )}

      {tab === 'leave' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card>
            <CardHdr>Apply for Leave</CardHdr>
            <div style={{ display: 'grid', gap: 12 }}>
              <Sel label="Leave Type" value={leaveForm.type} onChange={e => up('type', e.target.value)} options={['Casual Leave','Sick Leave','Earned Leave','Maternity Leave','LOP']} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Inp label="From" type="date" value={leaveForm.from} onChange={e => up('from', e.target.value)} />
                <Inp label="To" type="date" value={leaveForm.to} onChange={e => up('to', e.target.value)} />
              </div>
              <TextArea label="Reason *" value={leaveForm.reason} onChange={e => up('reason', e.target.value)} rows={3} />
              <BtnP onClick={submitLeave} disabled={!leaveForm.reason}>Submit Request</BtnP>
            </div>
          </Card>
          <Card>
            <CardHdr>My Leave History</CardHdr>
            {myLeaves.length === 0 ? <div style={{ color: T.t4, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No leave requests yet.</div> :
              myLeaves.map(l => (
                <div key={l.id} style={{ padding: '8px 0', borderBottom: `1px solid ${T.sf2}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.tx }}>{l.type}</div>
                      <div style={{ fontSize: 10, color: T.t3, fontFamily: mo }}>{l.from} to {l.to}</div>
                    </div>
                    <Badge l={l.status} col={l.status==='Approved'?'green':l.status==='Rejected'?'red':'amber'} />
                  </div>
                </div>
              ))
            }
          </Card>
        </div>
      )}

      {tab === 'profile' && (
        <div style={{ maxWidth: 400 }}>
          <Card>
            <CardHdr>My Profile</CardHdr>
            <StatRow label="Name" value={loggedIn.name} />
            <StatRow label="Role" value={loggedIn.role || '—'} />
            <StatRow label="Department" value={loggedIn.dept || '—'} />
            <StatRow label="Date of Joining" value={fmtD(loggedIn.doj)} />
            <StatRow label="Email" value={loggedIn.email || '—'} />
            <StatRow label="Phone" value={loggedIn.phone || '—'} />
            <StatRow label="Status" value={loggedIn.status || 'Active'} color={T.gn} />
            <StatRow label="Annual CTC" value={fmtN(loggedIn.ctc)} />
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── 17. WHATSAPP-READY DOCUMENTS ────────────────────────────────────────────
export function WhatsAppDocs({ txns, leads, vendors, co, fmtN, fmt }) {
  const [selected, setSelected] = useState('invoice');
  const [party, setParty] = useState('');
  const [amount, setAmount] = useState('');
  const [preview, setPreview] = useState('');

  const templates = {
    invoice: (p, a) => `*${co.name}*\n📋 *INVOICE*\n\nDear ${p || 'Customer'},\n\nPlease find your invoice details below:\n\n💰 Amount: *${fmtN(a)}*\n📅 Date: ${new Date().toLocaleDateString('en-IN')}\n🏢 From: ${co.name}\n\n_Please make payment at your earliest convenience._\n\n📞 Contact: ${co.phone || 'N/A'}\n\n_${co.name} | ${co.city}, ${co.state}_`,

    payment_reminder: (p, a) => `*${co.name}*\n⚠️ *PAYMENT REMINDER*\n\nDear ${p || 'Customer'},\n\nThis is a friendly reminder regarding your outstanding payment of *${fmtN(a)}*.\n\n📅 Due Date: Immediate\n💰 Amount Due: *${fmtN(a)}*\n\nKindly arrange the payment at the earliest to avoid any inconvenience.\n\n📞 Contact us: ${co.phone || 'N/A'}\n\nThank you for your business! 🙏\n\n_${co.name}_`,

    quotation: (p, a) => `*${co.name}*\n📝 *QUOTATION*\n\nDear ${p || 'Customer'},\n\nThank you for your enquiry. Please find our quotation below:\n\n💰 Quoted Amount: *${fmtN(a)}*\n✅ Includes: GST as applicable\n📅 Valid For: 7 days\n🚚 Delivery: As discussed\n\nWe look forward to your confirmation.\n\n📞 ${co.phone || 'N/A'}\n📧 ${co.email || 'N/A'}\n\n_${co.name} | ${co.city}_`,

    dispatch: (p, a) => `*${co.name}*\n🚚 *DISPATCH INTIMATION*\n\nDear ${p || 'Customer'},\n\nYour order has been dispatched! 📦\n\n📋 Order Value: *${fmtN(a)}*\n📅 Dispatch Date: ${new Date().toLocaleDateString('en-IN')}\n🚚 Status: *In Transit*\n\nPlease arrange to receive the goods at your end.\n\n📞 For queries: ${co.phone || 'N/A'}\n\n_${co.name}_`,

    po: (p, a) => `*${co.name}*\n📋 *PURCHASE ORDER*\n\nDear ${p || 'Supplier'},\n\nPlease find our Purchase Order below:\n\n💰 PO Value: *${fmtN(a)}*\n📅 Order Date: ${new Date().toLocaleDateString('en-IN')}\n⏰ Delivery: Within 14 days\n💳 Payment: Net 30 days\n\nKindly confirm receipt of this PO and expected delivery date.\n\n📞 ${co.phone || 'N/A'}\n\n_${co.name} | GSTIN: ${co.gstin || 'N/A'}_`,
  };

  const generate_ = () => {
    const tpl = templates[selected];
    if (tpl) setPreview(tpl(party, amount));
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(preview);
    window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div>
      <SHdr title="WhatsApp-Ready Documents"
        sub="Professional business messages formatted for WhatsApp — one click to send" />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        <div>
          <Card>
            <CardHdr>Select Template</CardHdr>
            {[
              { id: 'invoice', label: '📋 Invoice' },
              { id: 'payment_reminder', label: '⚠️ Payment Reminder' },
              { id: 'quotation', label: '📝 Quotation' },
              { id: 'dispatch', label: '🚚 Dispatch Notice' },
              { id: 'po', label: '📦 Purchase Order' },
            ].map(t => (
              <button key={t.id} onClick={() => { setSelected(t.id); setPreview(''); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: selected===t.id ? T.aml : 'transparent', border: `1px solid ${selected===t.id ? '#FED7AA' : T.bd}`, borderRadius: 5, marginBottom: 6, cursor: 'pointer', fontSize: 12, color: selected===t.id ? T.ac : T.t2, fontFamily: f, borderLeft: `3px solid ${selected===t.id ? T.am : 'transparent'}` }}>
                {t.label}
              </button>
            ))}
          </Card>
          <Card style={{ marginTop: 12 }}>
            <CardHdr>Details</CardHdr>
            <div style={{ display: 'grid', gap: 10 }}>
              <Inp label="Party Name" value={party} onChange={e => setParty(e.target.value)} placeholder="Mehta Industries" />
              <Inp label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              <BtnP onClick={generate_}>Generate Message</BtnP>
            </div>
          </Card>
        </div>

        <Card>
          {preview ? (
            <div>
              <CardHdr action={
                <div style={{ display: 'flex', gap: 8 }}>
                  <BtnG small onClick={() => navigator.clipboard.writeText(preview)}>Copy</BtnG>
                  <BtnP small onClick={openWhatsApp}>Open WhatsApp Web ↗</BtnP>
                </div>
              }>Preview</CardHdr>
              <div style={{ background: '#DCF8C6', padding: 16, borderRadius: 8, fontFamily: f, fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', maxWidth: 400, border: `1px solid #B7E4A0` }}>
                {preview}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: T.t3 }}>
                ↑ This is exactly how it will appear in WhatsApp. Copy or open WhatsApp Web to send.
              </div>
            </div>
          ) : (
            <div style={{ color: T.t4, textAlign: 'center', padding: '60px 20px', fontSize: 12, fontFamily: mo }}>
              Select a template, enter party name and amount, then click "Generate Message"
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
