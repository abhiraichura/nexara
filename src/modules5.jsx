import React, { useState } from 'react';
import { T, f, mo, Badge, KPI, Inp, Sel, TextArea, BtnP, BtnG, BtnDanger, SHdr, Tabs, Table, TRow, TH, TD, Modal, InfoBox, StatRow, Card, CardHdr, ProgressBar } from './components';
import { uid, today, fmt, fmtN, fmtD, load, save } from './data';

// ─── 7. BILL OF MATERIALS (BOM) ───────────────────────────────────────────────
export function BOMManager({ inv, co }) {
  const [boms, setBoms] = useState(() => load('boms', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ product: '', outputQty: '1', unit: 'pcs', components: [], labourHours: '', labourRate: '', overheadPct: '10' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('boms', v); setBoms(v); };

  const addComp = () => setForm(p => ({ ...p, components: [...p.components, { itemId: '', itemName: '', qty: '', unit: 'pcs' }] }));
  const updComp = (i, k, v) => setForm(p => ({ ...p, components: p.components.map((c, idx) => idx === i ? { ...c, [k]: v } : c) }));
  const delComp = i => setForm(p => ({ ...p, components: p.components.filter((_, idx) => idx !== i) }));

  const calcBOMCost = (bom) => {
    const matCost = bom.components.reduce((s, c) => {
      const item = inv.find(i => i.id === c.itemId);
      return s + Number(c.qty) * Number(item?.rate || 0);
    }, 0);
    const labourCost = Number(bom.labourHours || 0) * Number(bom.labourRate || 0);
    const overhead = (matCost + labourCost) * Number(bom.overheadPct || 0) / 100;
    return { matCost, labourCost, overhead, total: matCost + labourCost + overhead };
  };

  const canProduce = (bom, qty = 1) => {
    return bom.components.every(c => {
      const item = inv.find(i => i.id === c.itemId);
      return item && Number(item.qty) >= Number(c.qty) * qty;
    });
  };

  const saveBOM = () => {
    if (!form.product || form.components.length === 0) return;
    sv([{ id: uid(), ...form }, ...boms]);
    setShowAdd(false);
    setForm({ product: '', outputQty: '1', unit: 'pcs', components: [], labourHours: '', labourRate: '', overheadPct: '10' });
  };

  return (
    <div>
      <SHdr title="Bill of Materials (BOM)"
        sub={`${boms.length} products defined · Raw material + labour + overhead costing`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ New BOM</BtnP>} />

      {boms.length === 0 ? <InfoBox type="info">No BOMs defined yet. A BOM lists every raw material, component, and labour required to manufacture one unit of your product.</InfoBox> :
        boms.map(bom => {
          const cost = calcBOMCost(bom);
          const canMake = canProduce(bom);
          return (
            <Card key={bom.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.tx }}>{bom.product}</span>
                    <Badge l={`Output: ${bom.outputQty} ${bom.unit}`} col="blue" />
                    <Badge l={canMake ? 'Stock OK' : 'Insufficient Stock'} col={canMake ? 'green' : 'red'} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.am }}>{fmtN(Math.round(cost.total))}</div>
                  <div style={{ fontSize: 10, color: T.t3 }}>per {bom.outputQty} {bom.unit}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>COMPONENTS</div>
                  {bom.components.map((c, i) => {
                    const item = inv.find(it => it.id === c.itemId);
                    const sufficient = item && Number(item.qty) >= Number(c.qty);
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${T.sf2}` }}>
                        <span style={{ fontSize: 12, color: T.t2 }}>{c.itemName || item?.name || 'Unknown'}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontFamily: mo }}>{c.qty} {c.unit}</span>
                          <span style={{ fontSize: 12, color: T.t3 }}>{item?.rate ? fmtN(Number(c.qty)*Number(item.rate)) : '—'}</span>
                          {!sufficient && <Badge l="Low" col="red" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: T.t3, fontFamily: mo, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>COST BREAKDOWN</div>
                  <StatRow label="Materials" value={fmtN(Math.round(cost.matCost))} />
                  <StatRow label="Labour" value={fmtN(Math.round(cost.labourCost))} />
                  <StatRow label={`Overhead (${bom.overheadPct}%)`} value={fmtN(Math.round(cost.overhead))} />
                  <StatRow label="TOTAL COST" value={fmtN(Math.round(cost.total))} highlight />
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <BtnDanger small onClick={() => sv(boms.filter(b => b.id !== bom.id))}>Delete BOM</BtnDanger>
              </div>
            </Card>
          );
        })
      }

      {showAdd && (
        <Modal title="New Bill of Materials" onClose={() => setShowAdd(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
              <Inp label="Finished Product Name *" value={form.product} onChange={e => up('product', e.target.value)} placeholder="Steel Frame Type-A" />
              <Inp label="Output Quantity" type="number" value={form.outputQty} onChange={e => up('outputQty', e.target.value)} />
              <Sel label="Unit" value={form.unit} onChange={e => up('unit', e.target.value)} options={['pcs','kg','meter','litre','box','set']} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: T.t3, fontFamily: mo, fontWeight: 600, letterSpacing: 1 }}>RAW MATERIALS / COMPONENTS *</span>
                <BtnG small onClick={addComp}>+ Add Component</BtnG>
              </div>
              {form.components.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 28px', gap: 8, marginBottom: 8 }}>
                  <Sel value={c.itemId} onChange={e => {
                    const item = inv.find(it => it.id === e.target.value);
                    updComp(i, 'itemId', e.target.value);
                    if (item) updComp(i, 'itemName', item.name);
                  }} options={['', ...inv.map(it => it.id)]} />
                  <Inp type="number" value={c.qty} onChange={e => updComp(i, 'qty', e.target.value)} placeholder="Qty" />
                  <Sel value={c.unit} onChange={e => updComp(i, 'unit', e.target.value)} options={['pcs','kg','meter','litre','gram','ton']} />
                  <button onClick={() => delComp(i)} style={{ width: 28, height: 34, background: T.rl, border: `1px solid ${T.rd}44`, borderRadius: 5, cursor: 'pointer', color: T.rd }}>×</button>
                </div>
              ))}
              {form.components.length === 0 && <div style={{ color: T.t4, fontSize: 12, fontFamily: mo, textAlign: 'center', padding: '12px 0' }}>Click "+ Add Component" to add raw materials</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Labour Hours" type="number" value={form.labourHours} onChange={e => up('labourHours', e.target.value)} />
              <Inp label="Labour Rate (₹/hr)" type="number" value={form.labourRate} onChange={e => up('labourRate', e.target.value)} />
              <Inp label="Overhead %" type="number" value={form.overheadPct} onChange={e => up('overheadPct', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={saveBOM} disabled={!form.product || form.components.length === 0}>Save BOM</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── 8. MRP — MATERIAL REQUIREMENTS PLANNING ─────────────────────────────────
export function MRPPlanner({ inv, boms, saveInv, co }) {
  const [orders, setOrders] = useState(() => load('mrp_orders', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ product: '', qty: '', dueDate: '', priority: 'Normal' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('mrp_orders', v); setOrders(v); };

  const calcRequirements = (bomId, qty) => {
    const bom = boms.find(b => b.id === bomId);
    if (!bom) return [];
    return bom.components.map(c => {
      const item = inv.find(i => i.id === c.itemId);
      const required = Number(c.qty) * Number(qty);
      const available = Number(item?.qty || 0);
      const shortage = Math.max(0, required - available);
      return { ...c, itemName: item?.name || c.itemName, required, available, shortage, item };
    });
  };

  const addOrder = () => {
    if (!form.product || !form.qty) return;
    const bom = boms.find(b => b.product === form.product);
    const requirements = bom ? calcRequirements(bom.id, form.qty) : [];
    sv([{ id: uid(), ...form, bomId: bom?.id, requirements, status: 'Planned', createdAt: today() }, ...orders]);
    setShowAdd(false);
  };

  const releaseOrder = (id) => {
    const order = orders.find(o => o.id === id);
    if (!order || !order.requirements) return;
    const hasShortage = order.requirements.some(r => r.shortage > 0);
    if (hasShortage) { alert('Cannot release — stock shortage. Raise purchase orders for shortfall items first.'); return; }
    sv(orders.map(o => o.id === id ? { ...o, status: 'Released' } : o));
  };

  return (
    <div>
      <SHdr title="Material Requirements Planning (MRP)"
        sub="Production orders → auto-calculate raw material needs → identify shortages"
        action={<BtnP onClick={() => setShowAdd(true)}>+ Production Order</BtnP>} />

      {orders.length === 0 ? (
        <div>
          <InfoBox type="info">MRP takes your production orders and automatically calculates what raw materials you need, checks your current stock, and flags shortages. Define BOMs first, then create production orders here.</InfoBox>
          {boms.length === 0 && <div style={{ marginTop: 12 }}><InfoBox type="warning">No BOMs defined. Go to Bill of Materials module first to define your product recipes.</InfoBox></div>}
        </div>
      ) : orders.map(order => {
        const hasShortage = order.requirements?.some(r => r.shortage > 0);
        return (
          <Card key={order.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.tx }}>{order.product}</span>
                  <Badge l={`${order.qty} units`} col="blue" />
                  <Badge l={order.status} col={order.status==='Released'?'green':order.status==='Completed'?'neutral':'amber'} />
                  {hasShortage && <Badge l="STOCK SHORTAGE" col="red" />}
                </div>
                <div style={{ fontSize: 11, color: T.t3 }}>Due: {order.dueDate || 'Not set'} · Created: {order.createdAt}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {order.status === 'Planned' && <BtnP small onClick={() => releaseOrder(order.id)} disabled={hasShortage}>Release</BtnP>}
                <BtnDanger small onClick={() => sv(orders.filter(o => o.id !== order.id))}>Del</BtnDanger>
              </div>
            </div>
            {order.requirements?.length > 0 && (
              <Table cols="1fr 80px 80px 80px 80px">
                {[<TH key="h">Material</TH>, <TH key="h2" right>Required</TH>, <TH key="h3" right>Available</TH>, <TH key="h4" right>Shortage</TH>, <TH key="h5">Status</TH>]}
                {order.requirements.map((r, i) => (
                  <TRow key={i} cols="1fr 80px 80px 80px 80px" highlight={r.shortage > 0}>
                    <TD bold>{r.itemName}</TD>
                    <TD right mono>{r.required} {r.unit}</TD>
                    <TD right mono color={r.available >= r.required ? T.gn : T.rd}>{r.available}</TD>
                    <TD right mono bold color={r.shortage > 0 ? T.rd : T.gn}>{r.shortage > 0 ? r.shortage : '✓'}</TD>
                    <Badge l={r.shortage > 0 ? 'Order Needed' : 'Sufficient'} col={r.shortage > 0 ? 'red' : 'green'} />
                  </TRow>
                ))}
              </Table>
            )}
          </Card>
        );
      })}

      {showAdd && (
        <Modal title="New Production Order" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            {boms.length === 0
              ? <InfoBox type="warning">No BOMs defined. Please create a BOM first.</InfoBox>
              : <>
                <Sel label="Product (from BOM) *" value={form.product} onChange={e => up('product', e.target.value)} options={['', ...boms.map(b => b.product)]} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <Inp label="Quantity *" type="number" value={form.qty} onChange={e => up('qty', e.target.value)} />
                  <Inp label="Due Date" type="date" value={form.dueDate} onChange={e => up('dueDate', e.target.value)} />
                  <Sel label="Priority" value={form.priority} onChange={e => up('priority', e.target.value)} options={['Normal','High','Urgent']} />
                </div>
                {form.product && form.qty && (() => {
                  const bom = boms.find(b => b.product === form.product);
                  if (!bom) return null;
                  const reqs = calcRequirements(bom.id, form.qty);
                  const hasShortage = reqs.some(r => r.shortage > 0);
                  return (
                    <div>
                      {hasShortage
                        ? <InfoBox type="error">Stock shortage detected for {reqs.filter(r=>r.shortage>0).map(r=>r.itemName).join(', ')}. You will need to raise purchase orders.</InfoBox>
                        : <InfoBox type="success">All materials available. Ready to produce {form.qty} units.</InfoBox>
                      }
                    </div>
                  );
                })()}
              </>
            }
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addOrder} disabled={!form.product || !form.qty}>Create Order</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── 9. QUALITY CONTROL ───────────────────────────────────────────────────────
export function QualityControl({ inv, vendors, co }) {
  const [inspections, setInspections] = useState(() => load('qc_inspections', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'Inward', item: '', vendor: '', batch: '', qty: '', sampleQty: '', defects: '0', result: 'Pass', checklist: '', notes: '', date: today() });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const sv = v => { save('qc_inspections', v); setInspections(v); };

  const addInsp = () => {
    if (!form.item) return;
    const defectPct = form.sampleQty > 0 ? (Number(form.defects) / Number(form.sampleQty) * 100).toFixed(1) : 0;
    sv([{ id: uid(), ...form, defectPct }, ...inspections]);
    setShowAdd(false);
  };

  const passed = inspections.filter(i => i.result === 'Pass').length;
  const failed = inspections.filter(i => i.result === 'Fail').length;
  const avgDefect = inspections.length > 0 ? (inspections.reduce((s, i) => s + Number(i.defectPct || 0), 0) / inspections.length).toFixed(1) : 0;

  return (
    <div>
      <SHdr title="Quality Control"
        sub={`${inspections.length} inspections · ${passed} passed · ${failed} failed · Avg defect rate: ${avgDefect}%`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ Log Inspection</BtnP>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Pass Rate" value={inspections.length > 0 ? `${Math.round(passed/inspections.length*100)}%` : '—'} sub="of all inspections" ac={T.gn} />
        <KPI label="Failed" value={String(failed)} sub="rejected batches" ac={T.rd} />
        <KPI label="Avg Defect Rate" value={`${avgDefect}%`} sub="defects per sample" ac={T.am} />
        <KPI label="Total Inspected" value={String(inspections.length)} sub="inspections logged" ac={T.bl} />
      </div>

      {inspections.length === 0 ? <InfoBox type="info">No QC inspections logged. Record inward goods inspections (from suppliers) and outward dispatch checks.</InfoBox> :
        <Table cols="80px 100px 1fr 80px 80px 80px 70px 80px">
          {[<TH key="h">Date</TH>, <TH key="h2">Type</TH>, <TH key="h3">Item / Batch</TH>, <TH key="h4">Vendor</TH>, <TH key="h5" right>Qty</TH>, <TH key="h6" right>Defects</TH>, <TH key="h7">Defect%</TH>, <TH key="h8">Result</TH>]}
          {inspections.map(i => (
            <TRow key={i.id} cols="80px 100px 1fr 80px 80px 80px 70px 80px" highlight={i.result === 'Fail'}>
              <TD mono muted>{i.date}</TD>
              <Badge l={i.type} col={i.type==='Inward'?'blue':'amber'} />
              <div>
                <TD bold>{i.item}</TD>
                {i.batch && <div style={{fontSize:11,color:T.t3}}>Batch: {i.batch}</div>}
              </div>
              <TD muted>{i.vendor || '—'}</TD>
              <TD right mono>{i.qty}</TD>
              <TD right mono color={Number(i.defects)>0?T.rd:T.gn}>{i.defects}</TD>
              <TD mono color={Number(i.defectPct)>5?T.rd:Number(i.defectPct)>2?T.am:T.gn}>{i.defectPct}%</TD>
              <Badge l={i.result} col={i.result==='Pass'?'green':'red'} />
            </TRow>
          ))}
        </Table>
      }

      {showAdd && (
        <Modal title="Log QC Inspection" onClose={() => setShowAdd(false)} wide>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Sel label="Inspection Type" value={form.type} onChange={e => up('type', e.target.value)} options={['Inward','Outward','In-Process','Final']} />
              <Inp label="Date" type="date" value={form.date} onChange={e => up('date', e.target.value)} />
              <Sel label="Result *" value={form.result} onChange={e => up('result', e.target.value)} options={['Pass','Fail','Conditional Pass']} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Item Name *" value={form.item} onChange={e => up('item', e.target.value)} placeholder="Steel Rods 10mm" />
              <Inp label="Batch / Lot Number" value={form.batch} onChange={e => up('batch', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Total Qty" type="number" value={form.qty} onChange={e => up('qty', e.target.value)} />
              <Inp label="Sample Qty" type="number" value={form.sampleQty} onChange={e => up('sampleQty', e.target.value)} />
              <Inp label="Defects Found" type="number" value={form.defects} onChange={e => up('defects', e.target.value)} />
              <Inp label="Vendor" value={form.vendor} onChange={e => up('vendor', e.target.value)} />
            </div>
            <TextArea label="Inspection Checklist / Findings" value={form.checklist} onChange={e => up('checklist', e.target.value)} rows={3} placeholder="Dimensions checked ✓, Surface finish ✓, Weight verified ✓…" />
            <TextArea label="Notes / Disposition" value={form.notes} onChange={e => up('notes', e.target.value)} rows={2} placeholder="Return to supplier, Accept with deviation, Quarantine…" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addInsp} disabled={!form.item}>Save Inspection</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── 10. FIELD SALES & BEAT PLANNING ─────────────────────────────────────────
export function FieldSales({ emps, leads, co }) {
  const [beats, setBeats] = useState(() => load('beats', []));
  const [visits, setVisits] = useState(() => load('beat_visits', []));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', area: '', rep: '', clients: '', freq: 'Weekly', day: 'Monday' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const svB = v => { save('beats', v); setBeats(v); };
  const svV = v => { save('beat_visits', v); setVisits(v); };

  const addBeat = () => {
    if (!form.name || !form.rep) return;
    svB([{ id: uid(), ...form, createdAt: today() }, ...beats]);
    setShowAdd(false);
    setForm({ name: '', area: '', rep: '', clients: '', freq: 'Weekly', day: 'Monday' });
  };

  const logVisit = (beatId) => {
    svV([{ id: uid(), beatId, date: today(), status: 'Visited', orders: 0, notes: '' }, ...visits]);
  };

  const todayVisits = visits.filter(v => v.date === today()).length;
  const thisWeek = visits.filter(v => {
    const d = new Date(v.date);
    const now = new Date();
    const diff = (now - d) / 86400000;
    return diff <= 7;
  }).length;

  return (
    <div>
      <SHdr title="Field Sales & Beat Planning"
        sub={`${beats.length} beats · ${todayVisits} visits today · ${thisWeek} this week`}
        action={<BtnP onClick={() => setShowAdd(true)}>+ New Beat</BtnP>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Total Beats" value={String(beats.length)} sub="routes defined" ac={T.bl} />
        <KPI label="Visits Today" value={String(todayVisits)} sub="logged today" ac={T.gn} />
        <KPI label="This Week" value={String(thisWeek)} sub="total visits" ac={T.am} />
        <KPI label="Sales Reps" value={String([...new Set(beats.map(b=>b.rep))].filter(Boolean).length)} sub="in the field" ac={T.rd} />
      </div>

      {beats.length === 0 ? <InfoBox type="info">No beats defined. A beat is a scheduled route — assign sales reps to visit specific clients in a specific area on a recurring schedule.</InfoBox> :
        beats.map(b => {
          const beatVisits = visits.filter(v => v.beatId === b.id);
          const lastVisit = beatVisits[0]?.date;
          return (
            <Card key={b.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{b.name}</span>
                    <Badge l={b.area || 'Area'} col="blue" />
                    <Badge l={b.freq} col="neutral" />
                  </div>
                  <div style={{ fontSize: 12, color: T.t2 }}>Rep: <strong>{b.rep}</strong> · Day: {b.day}</div>
                  {b.clients && <div style={{ fontSize: 11, color: T.t3, marginTop: 3 }}>Clients: {b.clients}</div>}
                  {lastVisit && <div style={{ fontSize: 10, color: T.t4, fontFamily: mo, marginTop: 3 }}>Last visit: {fmtD(lastVisit)}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: T.t3 }}>{beatVisits.length} visits</span>
                  <BtnP small onClick={() => logVisit(b.id)}>✓ Log Visit</BtnP>
                  <BtnDanger small onClick={() => svB(beats.filter(x => x.id !== b.id))}>Del</BtnDanger>
                </div>
              </div>
            </Card>
          );
        })
      }

      {showAdd && (
        <Modal title="New Beat / Route" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Beat Name *" value={form.name} onChange={e => up('name', e.target.value)} placeholder="North Zone Beat 1" />
              <Inp label="Area / Location" value={form.area} onChange={e => up('area', e.target.value)} placeholder="Andheri North, Surat East…" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Inp label="Sales Rep *" value={form.rep} onChange={e => up('rep', e.target.value)} placeholder="Rajesh Kumar" />
              <Sel label="Frequency" value={form.freq} onChange={e => up('freq', e.target.value)} options={['Daily','Weekly','Fortnightly','Monthly']} />
              <Sel label="Day" value={form.day} onChange={e => up('day', e.target.value)} options={['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']} />
            </div>
            <TextArea label="Clients to Visit" value={form.clients} onChange={e => up('clients', e.target.value)} rows={3} placeholder="Mehta Traders, Shah Brothers, Patel Store…" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <BtnG onClick={() => setShowAdd(false)}>Cancel</BtnG>
              <BtnP onClick={addBeat} disabled={!form.name||!form.rep}>Create Beat</BtnP>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
