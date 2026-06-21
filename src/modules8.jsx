import React, { useState, useRef } from 'react';
import { T, f, mo, Badge, KPI, Inp, Sel, TextArea, BtnP, BtnG, BtnDanger, SHdr, Tabs, Table, TRow, TH, TD, Modal, InfoBox, StatRow, Card, CardHdr, ProgressBar } from './components';
import { uid, today, fmt, fmtN, fmtD, load, save } from './data';
import { generate } from './AIStatus';

// ─── 18. DOCUMENT AUTO-CLASSIFICATION ────────────────────────────────────────
export function DocAutoClassify({ co }) {
  const [docs, setDocs] = useState(() => load('auto_docs', []));
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef(null);
  const sv = v => { save('auto_docs', v); setDocs(v); };

  const processFile = async (file) => {
    setProcessing(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target.result.slice(0, 3000);
      let classification = 'General Document';
      let extractedFields = {};
      let targetModule = 'documents';

      try {
        const result = await generate(
          `You are a document classifier for ${co.name} (${co.industry} business). Analyse this document content and respond ONLY with a JSON object (no other text):
{
  "type": "Invoice|Contract|Bank Statement|Legal Notice|Purchase Order|Quotation|Payslip|Tax Document|HR Document|Other",
  "module": "accounting|contracts|banking|hr|legal|vendors|taxation|documents",
  "party": "extracted party/company name or empty string",
  "amount": "extracted amount as number or 0",
  "date": "extracted date as YYYY-MM-DD or empty string",
  "summary": "one sentence summary of this document"
}

Document content:
${content}`
        );

        try {
          const clean = result.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(clean);
          classification = parsed.type || 'Document';
          extractedFields = parsed;
          targetModule = parsed.module || 'documents';
        } catch {
          classification = content.toLowerCase().includes('invoice') ? 'Invoice'
            : content.toLowerCase().includes('contract') ? 'Contract'
            : content.toLowerCase().includes('salary') ? 'Payslip'
            : 'General Document';
        }
      } catch {}

      const doc = {
        id: uid(), name: file.name, type: file.type, size: Math.round(file.size/1024) + 'KB',
        classification, targetModule, content,
        party: extractedFields.party || '',
        amount: extractedFields.amount || 0,
        date: extractedFields.date || today(),
        summary: extractedFields.summary || 'Document uploaded',
        processedAt: today(),
      };
      sv([doc, ...docs]);
      setProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(f => processFile(f));
  };

  const del = id => sv(docs.filter(d => d.id !== id));

  const typeColor = t => {
    const m = { Invoice: 'green', Contract: 'blue', 'Bank Statement': 'amber', 'Legal Notice': 'red', 'Purchase Order': 'blue', Payslip: 'green', 'Tax Document': 'amber' };
    return m[t] || 'neutral';
  };

  return (
    <div>
      <SHdr title="Document Auto-Classification"
        sub="Upload any document — AI reads, classifies, and routes it to the right module automatically"
        action={
          <>
            <input ref={fileRef} type="file" multiple accept=".txt,.csv,.md,.json" onChange={handleUpload} style={{ display: 'none' }} />
            <BtnP onClick={() => fileRef.current.click()} disabled={processing}>
              {processing ? 'Processing…' : '↑ Upload & Auto-Classify'}
            </BtnP>
          </>
        } />

      <InfoBox type="info">Upload text-based documents (.txt, .csv, .md, .json). AI reads each one, identifies the document type, extracts key fields (party, amount, date), and routes it to the right module.</InfoBox>

      {docs.length === 0
        ? <div style={{ textAlign: 'center', padding: '40px 0', color: T.t4, fontFamily: mo, fontSize: 12 }}>No documents classified yet. Upload files to get started.</div>
        : <div style={{ marginTop: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {['Invoice','Contract','Bank Statement','Other'].map(type => (
                <KPI key={type} label={type} value={String(docs.filter(d=>d.classification===type||(!['Invoice','Contract','Bank Statement'].includes(d.classification)&&type==='Other')).length)} sub="documents" ac={T.am} />
              ))}
            </div>
            <Table cols="1fr 120px 120px 100px 80px 100px 60px">
              {[<TH key="h">Document</TH>, <TH key="h2">Type</TH>, <TH key="h3">Party</TH>, <TH key="h4" right>Amount</TH>, <TH key="h5">Date</TH>, <TH key="h6">Routes To</TH>, <TH key="h7">Del</TH>]}
              {docs.map(d => (
                <TRow key={d.id} cols="1fr 120px 120px 100px 80px 100px 60px">
                  <div>
                    <TD bold>{d.name}</TD>
                    <div style={{ fontSize: 10, color: T.t3, marginTop: 2 }}>{d.summary}</div>
                  </div>
                  <Badge l={d.classification} col={typeColor(d.classification)} />
                  <TD muted>{d.party || '—'}</TD>
                  <TD right mono>{d.amount > 0 ? fmtN(d.amount) : '—'}</TD>
                  <TD mono muted>{d.date || '—'}</TD>
                  <Badge l={d.targetModule} col="blue" />
                  <BtnDanger small onClick={() => del(d.id)}>×</BtnDanger>
                </TRow>
              ))}
            </Table>
          </div>
      }
    </div>
  );
}

// ─── 19. SALARY BENCHMARKING ──────────────────────────────────────────────────
export function SalaryBenchmark({ emps, co }) {
  const [role, setRole] = useState('');
  const [city, setCity] = useState(co.city || 'Mumbai');
  const [exp, setExp] = useState('3');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const benchmark = async () => {
    if (!role.trim()) return;
    setLoading(true); setResult(null);
    try {
      const txt = await generate(
        `Provide salary benchmarking data for the following role in India. Respond ONLY with a JSON object (no other text, no markdown):
{
  "role": "${role}",
  "city": "${city}",
  "experience": "${exp} years",
  "minSalary": <annual CTC in INR as number>,
  "medianSalary": <annual CTC in INR as number>,
  "maxSalary": <annual CTC in INR as number>,
  "industryNote": "one sentence about this role in ${co.industry} industry",
  "keySkills": ["skill1", "skill2", "skill3"],
  "hiringAdvice": "one practical hiring tip"
}
Use realistic 2024-25 Indian salary data for ${city}.`
      );
      try {
        const clean = txt.replace(/```json|```/g, '').trim();
        setResult(JSON.parse(clean));
      } catch { setResult({ error: txt }); }
    } catch (e) { setResult({ error: 'AI not ready: ' + e.message }); }
    setLoading(false);
  };

  const existingRoles = [...new Set(emps.map(e => e.role).filter(Boolean))];

  return (
    <div>
      <SHdr title="Salary Benchmarking" sub="AI-powered salary guidance for any role in any Indian city" />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        <Card>
          <CardHdr>Check Salary Range</CardHdr>
          <div style={{ display: 'grid', gap: 12 }}>
            <Inp label="Role / Designation" value={role} onChange={e => setRole(e.target.value)} placeholder="Senior Accountant, Sales Manager…" />
            {existingRoles.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, marginBottom: 6 }}>QUICK SELECT FROM YOUR TEAM</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {existingRoles.map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      style={{ fontSize: 10, padding: '3px 8px', background: T.aml, border: `1px solid #FED7AA`, borderRadius: 3, cursor: 'pointer', color: T.ac }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Inp label="City" value={city} onChange={e => setCity(e.target.value)} placeholder="Mumbai, Bengaluru, Surat…" />
            <Sel label="Experience Level" value={exp} onChange={e => setExp(e.target.value)} options={['0','1','2','3','5','7','10','15']} />
            <BtnP onClick={benchmark} disabled={loading || !role.trim()}>{loading ? 'Checking…' : 'Get Salary Range'}</BtnP>
          </div>
        </Card>

        <Card>
          {result ? (
            result.error ? <InfoBox type="warning">{result.error}</InfoBox> : (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.tx, marginBottom: 4 }}>{result.role} in {result.city}</div>
                  <div style={{ fontSize: 12, color: T.t3 }}>{result.experience} experience · {co.industry} industry</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ padding: 14, background: T.sf2, borderRadius: 6, textAlign: 'center', border: `1px solid ${T.bd}` }}>
                    <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, marginBottom: 6 }}>MINIMUM</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.t2 }}>{fmtN(result.minSalary)}</div>
                    <div style={{ fontSize: 9, color: T.t4, fontFamily: mo }}>Annual CTC</div>
                  </div>
                  <div style={{ padding: 14, background: T.aml, borderRadius: 6, textAlign: 'center', border: `1px solid #FED7AA` }}>
                    <div style={{ fontSize: 10, color: T.ac, fontFamily: mo, marginBottom: 6 }}>MEDIAN</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: T.am }}>{fmtN(result.medianSalary)}</div>
                    <div style={{ fontSize: 9, color: T.ac, fontFamily: mo }}>Annual CTC</div>
                  </div>
                  <div style={{ padding: 14, background: T.sf2, borderRadius: 6, textAlign: 'center', border: `1px solid ${T.bd}` }}>
                    <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, marginBottom: 6 }}>MAXIMUM</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.bl }}>{fmtN(result.maxSalary)}</div>
                    <div style={{ fontSize: 9, color: T.t4, fontFamily: mo }}>Annual CTC</div>
                  </div>
                </div>
                {result.industryNote && <InfoBox type="info">{result.industryNote}</InfoBox>}
                {result.keySkills?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>KEY SKILLS TO LOOK FOR</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {result.keySkills.map(s => <Badge key={s} l={s} col="blue" />)}
                    </div>
                  </div>
                )}
                {result.hiringAdvice && <div style={{ marginTop: 12, padding: 12, background: T.gl, borderRadius: 5, fontSize: 12, color: T.gn }}>💡 {result.hiringAdvice}</div>}
                {emps.length > 0 && (() => {
                  const similar = emps.filter(e => e.role?.toLowerCase().includes(role.toLowerCase().split(' ')[0]));
                  if (similar.length === 0) return null;
                  return (
                    <div style={{ marginTop: 12, padding: 12, background: T.sf2, borderRadius: 5 }}>
                      <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>YOUR TEAM COMPARISON</div>
                      {similar.map(e => {
                        const diff = Number(e.ctc) - result.medianSalary;
                        return (
                          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12 }}>
                            <span style={{ color: T.t2 }}>{e.name} ({e.role})</span>
                            <span style={{ color: diff > 0 ? T.rd : T.gn, fontFamily: mo }}>{diff > 0 ? '+' : ''}{fmtN(Math.abs(diff))} vs median</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )
          ) : (
            <div style={{ color: T.t4, textAlign: 'center', padding: '60px 20px', fontSize: 12, fontFamily: mo }}>
              {loading ? 'AI is looking up salary data for India…' : 'Enter a role and city to get real salary benchmarks'}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── 20. VENDOR PORTAL (SHAREABLE) ───────────────────────────────────────────
export function VendorPortal({ vendors, txns, co, fmtN, fmtD }) {
  const [selected, setSelected] = useState(null);

  const getVendorTxns = (vendorName) => txns.filter(t => t.party?.toLowerCase() === vendorName?.toLowerCase());

  const generatePortal = (vendor) => {
    const vtxns = getVendorTxns(vendor.name);
    const outstanding = vtxns.filter(t => t.status === 'pending' && t.type === 'expense').reduce((s,t) => s+Number(t.amount), 0);
    const paid = vtxns.filter(t => t.status === 'cleared' && t.type === 'expense').reduce((s,t) => s+Number(t.amount), 0);

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Vendor Statement — ${vendor.name}</title>
<style>
  body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; color: #1A1714; background: #F5F3EF; padding: 20px; }
  .header { background: #16120E; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; }
  .logo { font-size: 22px; font-weight: 700; color: #C2590A; margin-bottom: 4px; }
  .sub { font-size: 12px; color: #9A8674; }
  .card { background: white; padding: 20px; border-radius: 6px; border: 1px solid #E8E4DC; margin-bottom: 16px; }
  .kpi { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .kpi-box { background: #FAFAF8; padding: 16px; border-radius: 5px; text-align: center; }
  .kpi-val { font-size: 22px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #16120E; color: #9A8674; padding: 8px 12px; text-align: left; font-size: 11px; letter-spacing: 1px; }
  td { padding: 8px 12px; border-bottom: 1px solid #F0EDE8; font-size: 12px; }
  .green { color: #166534; } .red { color: #B91C1C; } .amber { color: #92400E; }
  .footer { margin-top: 24px; font-size: 11px; color: #8C8580; text-align: center; }
</style>
</head>
<body>
<div class="header">
  <div class="logo">${co.name}</div>
  <div class="sub">Vendor Statement · Generated ${new Date().toLocaleDateString('en-IN')}</div>
</div>
<div class="card">
  <h3 style="margin:0 0 16px;font-size:16px">Statement for: ${vendor.name}</h3>
  ${vendor.gstin ? `<p style="font-size:12px;color:#8C8580">GSTIN: ${vendor.gstin}</p>` : ''}
  <div class="kpi">
    <div class="kpi-box"><div style="font-size:11px;color:#8C8580;margin-bottom:6px">OUTSTANDING</div><div class="kpi-val red">₹${outstanding.toLocaleString('en-IN')}</div></div>
    <div class="kpi-box"><div style="font-size:11px;color:#8C8580;margin-bottom:6px">PAID TO DATE</div><div class="kpi-val green">₹${paid.toLocaleString('en-IN')}</div></div>
  </div>
</div>
${vtxns.length > 0 ? `
<div class="card">
  <h3 style="margin:0 0 14px;font-size:14px">Transaction History</h3>
  <table>
    <thead><tr><th>DATE</th><th>REFERENCE</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
    <tbody>
      ${vtxns.map(t => `<tr><td>${t.date}</td><td>${t.note||t.cat||'—'}</td><td>₹${Number(t.amount).toLocaleString('en-IN')}</td><td class="${t.status==='cleared'?'green':'amber'}">${t.status?.toUpperCase()}</td></tr>`).join('')}
    </tbody>
  </table>
</div>` : ''}
<div class="footer">${co.name} · ${co.city}, ${co.state}${co.gstin ? ` · GSTIN: ${co.gstin}` : ''}<br>This is a computer-generated statement. Please contact us for any discrepancies.</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor_statement_${vendor.name.replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SHdr title="Vendor Portal Statements"
        sub="Generate shareable account statements for each vendor — no login needed on their end" />

      <InfoBox type="info">Each vendor gets a clean HTML statement showing their outstanding, payment history, and transaction details. Send it via email or WhatsApp — they just open it in a browser, no login required.</InfoBox>

      {vendors.length === 0 ? (
        <div style={{ marginTop: 20 }}><InfoBox type="warning">No vendors added yet. Go to Vendors module to add your suppliers first.</InfoBox></div>
      ) : (
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {vendors.map(v => {
            const vtxns = getVendorTxns(v.name);
            const outstanding = vtxns.filter(t => t.status==='pending'&&t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
            return (
              <Card key={v.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.tx, marginBottom: 3 }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: T.t3 }}>{v.cat || '—'} · {vtxns.length} transactions</div>
                    {v.gstin && <div style={{ fontSize: 10, color: T.t4, fontFamily: mo, marginTop: 2 }}>{v.gstin}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {outstanding > 0 && <div style={{ fontSize: 14, fontWeight: 700, color: T.rd }}>{fmtN(outstanding)}</div>}
                    {outstanding > 0 && <div style={{ fontSize: 10, color: T.t3 }}>outstanding</div>}
                  </div>
                </div>
                <BtnP small onClick={() => generatePortal(v)}>↓ Generate Statement</BtnP>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 21. LEAVE MANAGEMENT (HR Manager view) ──────────────────────────────────
export function LeaveManagement({ emps, co }) {
  const [leaveReqs, setLeaveReqs] = useState(() => load('leave_requests', []));
  const [tab, setTab] = useState('pending');
  const sv = v => { save('leave_requests', v); setLeaveReqs(v); };

  const approve = (id) => sv(leaveReqs.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
  const reject = (id) => sv(leaveReqs.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));

  const pending = leaveReqs.filter(l => l.status === 'Pending');
  const approved = leaveReqs.filter(l => l.status === 'Approved');
  const list = tab === 'pending' ? pending : tab === 'approved' ? approved : leaveReqs.filter(l=>l.status==='Rejected');

  return (
    <div>
      <SHdr title="Leave Management"
        sub={`${pending.length} pending approvals · ${approved.length} approved`} />

      <Tabs tabs={[{id:'pending',label:`Pending (${pending.length})`},{id:'approved',label:`Approved (${approved.length})`},{id:'rejected',label:'Rejected'}]} active={tab} onChange={setTab} />

      {list.length === 0 ? <InfoBox type="info">No {tab} leave requests.</InfoBox> :
        list.map(l => (
          <Card key={l.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{l.empName}</span>
                  <Badge l={l.type} col="blue" />
                  <Badge l={l.status} col={l.status==='Approved'?'green':l.status==='Rejected'?'red':'amber'} />
                </div>
                <div style={{ fontSize: 12, color: T.t2 }}>{l.from} to {l.to}</div>
                <div style={{ fontSize: 11, color: T.t3, marginTop: 3 }}>Reason: {l.reason}</div>
                <div style={{ fontSize: 10, color: T.t4, fontFamily: mo, marginTop: 2 }}>Applied: {l.submittedAt}</div>
              </div>
              {l.status === 'Pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <BtnP small onClick={() => approve(l.id)}>✓ Approve</BtnP>
                  <BtnDanger small onClick={() => reject(l.id)}>✕ Reject</BtnDanger>
                </div>
              )}
            </div>
          </Card>
        ))
      }
    </div>
  );
}
