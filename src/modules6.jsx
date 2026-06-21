import React, { useState } from 'react';
import { T, f, mo, Badge, KPI, Inp, Sel, TextArea, BtnP, BtnG, BtnDanger, SHdr, Tabs, Table, TRow, TH, TD, Modal, InfoBox, StatRow, Card, CardHdr, ProgressBar, Sparkline } from './components';
import { uid, today, fmt, fmtN, fmtD, load, save } from './data';
import { generate } from './AIStatus';

// ─── 11. CASH FLOW FORECASTING ────────────────────────────────────────────────
export function CashFlowForecast({ txns, emps, co }) {
  const [horizon, setHorizon] = useState(30);

  const calcPay = (ctc) => {
    const monthly = Number(ctc) / 12;
    return Math.round(monthly * 0.88); // approx net after deductions
  };

  // Build 90-day forecast
  const buildForecast = () => {
    const today_ = new Date();
    const days = [];

    for (let i = 1; i <= horizon; i++) {
      const d = new Date(today_);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfMonth = d.getDate();
      const month = d.getMonth();

      const inflows = [];
      const outflows = [];

      // Pending receivables due
      txns.filter(t => t.status === 'pending' && t.type === 'income' && t.date <= dateStr).forEach(t => {
        inflows.push({ label: `Receivable: ${t.party || 'Party'}`, amount: Number(t.amount), date: t.date });
      });

      // Payroll (15th of month)
      if (dayOfMonth === 15) {
        const totalPayroll = emps.reduce((s, e) => s + calcPay(e.ctc), 0);
        if (totalPayroll > 0) outflows.push({ label: 'Payroll disbursement', amount: totalPayroll });
      }

      // PF/ESIC challan (15th)
      if (dayOfMonth === 15) {
        const pf = emps.reduce((s, e) => s + Math.min(Math.round(Number(e.ctc)/12*0.4*0.24), 3600), 0);
        if (pf > 0) outflows.push({ label: 'PF + ESIC challan', amount: pf });
      }

      // GST payment (20th)
      if (dayOfMonth === 20) {
        const gstNet = txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount)*Number(t.gst||0)/100,0) -
                       txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount)*Number(t.gst||0)/100,0);
        if (gstNet > 0) outflows.push({ label: 'GST GSTR-3B payment', amount: Math.round(gstNet) });
      }

      // Pending payables
      txns.filter(t => t.status === 'pending' && t.type === 'expense' && t.date <= dateStr).slice(0, 3).forEach(t => {
        outflows.push({ label: `Payable: ${t.party || 'Party'}`, amount: Number(t.amount), date: t.date });
      });

      const dayInflow = inflows.reduce((s, i) => s + i.amount, 0);
      const dayOutflow = outflows.reduce((s, o) => s + o.amount, 0);

      if (dayInflow > 0 || dayOutflow > 0) {
        days.push({ date: dateStr, day: i, inflows, outflows, net: dayInflow - dayOutflow, dayInflow, dayOutflow });
      }
    }
    return days;
  };

  const forecast = buildForecast();
  const totalIn = forecast.reduce((s, d) => s + d.dayInflow, 0);
  const totalOut = forecast.reduce((s, d) => s + d.dayOutflow, 0);
  const netForecast = totalIn - totalOut;
  const criticalDays = forecast.filter(d => d.net < 0);

  // Running balance chart data
  const chartVals = [0];
  let running = 0;
  forecast.forEach(d => { running += d.net; chartVals.push(running); });

  return (
    <div>
      <SHdr title="Cash Flow Forecast"
        sub={`${horizon}-day forward view · Net position: ${fmt(netForecast)} · ${criticalDays.length} stress days`} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[7, 30, 60, 90].map(h => (
          <button key={h} onClick={() => setHorizon(h)}
            style={{ padding: '6px 16px', background: horizon===h ? T.am : T.sf2, color: horizon===h ? '#FFF' : T.t2, border: `1px solid ${horizon===h ? T.am : T.bd}`, borderRadius: 5, cursor: 'pointer', fontSize: 12, fontFamily: f }}>
            {h} Days
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Expected Inflows" value={fmt(totalIn)} sub={`next ${horizon} days`} ac={T.gn} />
        <KPI label="Expected Outflows" value={fmt(totalOut)} sub="payroll, GST, payables" ac={T.rd} />
        <KPI label="Net Position" value={fmt(netForecast)} sub="forecast surplus/deficit" ac={netForecast >= 0 ? T.gn : T.rd} />
        <KPI label="Stress Days" value={String(criticalDays.length)} sub="days with negative flow" ac={criticalDays.length > 0 ? T.rd : T.gn} />
      </div>

      {criticalDays.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <InfoBox type="error">
            Cash flow stress detected on {criticalDays.length} day(s): {criticalDays.slice(0, 3).map(d => `${d.date} (${fmt(d.net)})`).join(', ')}{criticalDays.length > 3 ? ` +${criticalDays.length-3} more` : ''}. Consider delaying payables or accelerating collections.
          </InfoBox>
        </div>
      )}

      {chartVals.length > 1 && (
        <Card style={{ marginBottom: 20 }}>
          <CardHdr>Running Cash Balance Forecast</CardHdr>
          <Sparkline vals={chartVals} color={netForecast >= 0 ? T.gn : T.rd} h={80} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.t4, fontFamily: mo, marginTop: 4 }}>
            <span>Today</span><span>{horizon} days</span>
          </div>
        </Card>
      )}

      {forecast.length === 0
        ? <InfoBox type="info">No forecasted cash events in this period. Add pending transactions (receivables/payables) and ensure employee records are complete for payroll forecasting.</InfoBox>
        : forecast.map(d => (
          <Card key={d.date} style={{ marginBottom: 8, border: d.net < 0 ? `1px solid ${T.rd}` : `1px solid ${T.bd}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: d.inflows.length + d.outflows.length > 0 ? 8 : 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.tx, fontFamily: mo }}>{fmtD(d.date)}</span>
              <div style={{ display: 'flex', gap: 16 }}>
                {d.dayInflow > 0 && <span style={{ fontSize: 12, color: T.gn }}>+{fmtN(d.dayInflow)}</span>}
                {d.dayOutflow > 0 && <span style={{ fontSize: 12, color: T.rd }}>−{fmtN(d.dayOutflow)}</span>}
                <span style={{ fontSize: 13, fontWeight: 700, color: d.net >= 0 ? T.gn : T.rd }}>{d.net >= 0 ? '+' : ''}{fmtN(d.net)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {d.inflows.map((inf, i) => <span key={i} style={{ fontSize: 10, padding: '2px 8px', background: T.gl, border: `1px solid #BBF7D0`, borderRadius: 3, color: T.gn, fontFamily: mo }}>{inf.label}: {fmtN(inf.amount)}</span>)}
              {d.outflows.map((out, i) => <span key={i} style={{ fontSize: 10, padding: '2px 8px', background: T.rl, border: `1px solid #FECACA`, borderRadius: 3, color: T.rd, fontFamily: mo }}>{out.label}: {fmtN(out.amount)}</span>)}
            </div>
          </Card>
        ))
      }
    </div>
  );
}

// ─── 12. PROFITABILITY BY CUSTOMER / PRODUCT ──────────────────────────────────
export function ProfitabilityAnalysis({ txns, inv, co }) {
  const [tab, setTab] = useState('customer');

  // By Customer
  const byCustomer = () => {
    const map = {};
    txns.filter(t => t.type === 'income' && t.party).forEach(t => {
      if (!map[t.party]) map[t.party] = { party: t.party, revenue: 0, count: 0, gst: 0 };
      map[t.party].revenue += Number(t.amount);
      map[t.party].gst += Number(t.amount) * Number(t.gst || 0) / 100;
      map[t.party].count++;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  };

  // By Category
  const byCategory = () => {
    const map = {};
    txns.filter(t => t.type === 'income').forEach(t => {
      const cat = t.cat || 'Uncategorised';
      if (!map[cat]) map[cat] = { cat, revenue: 0, count: 0 };
      map[cat].revenue += Number(t.amount);
      map[cat].count++;
    });
    const expMap = {};
    txns.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.cat || 'Uncategorised';
      if (!expMap[cat]) expMap[cat] = { exp: 0 };
      expMap[cat].exp += Number(t.amount);
    });
    return Object.values(map).map(c => ({ ...c, expenses: expMap[c.cat]?.exp || 0, margin: c.revenue > 0 ? ((c.revenue - (expMap[c.cat]?.exp || 0)) / c.revenue * 100).toFixed(1) : 0 })).sort((a, b) => b.revenue - a.revenue);
  };

  const totalRev = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const customers = byCustomer();
  const categories = byCategory();
  const maxRev = Math.max(...customers.map(c => c.revenue), 1);

  return (
    <div>
      <SHdr title="Profitability Analysis"
        sub="True margin per customer, product, and category — management accounting" />

      <Tabs tabs={[{ id: 'customer', label: 'By Customer' }, { id: 'category', label: 'By Category' }, { id: 'concentration', label: 'Revenue Concentration' }]} active={tab} onChange={setTab} />

      {tab === 'customer' && (
        customers.length === 0 ? <InfoBox type="info">No customer data yet. Add income transactions with party names to see customer profitability.</InfoBox> :
          <div>
            {customers.map((c, i) => {
              const pct = Math.round(c.revenue / totalRev * 100);
              return (
                <Card key={c.party} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontFamily: mo, color: T.t4, width: 20 }}>#{i+1}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.tx }}>{c.party}</span>
                      <Badge l={`${c.count} invoices`} col="neutral" />
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: T.t3 }}>{pct}% of revenue</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: T.gn }}>{fmtN(c.revenue)}</span>
                    </div>
                  </div>
                  <ProgressBar value={c.revenue} max={maxRev} color={i === 0 ? T.gn : i < 3 ? T.am : T.bl} />
                </Card>
              );
            })}
          </div>
      )}

      {tab === 'category' && (
        categories.length === 0 ? <InfoBox type="info">No categorised transactions yet.</InfoBox> :
          <Table cols="1fr 100px 100px 80px 80px">
            {[<TH key="h">Category</TH>, <TH key="h2" right>Revenue</TH>, <TH key="h3" right>Expenses</TH>, <TH key="h4" right>Margin</TH>, <TH key="h5">Txns</TH>]}
            {categories.map(c => (
              <TRow key={c.cat} cols="1fr 100px 100px 80px 80px">
                <TD bold>{c.cat}</TD>
                <TD right color={T.gn} bold>{fmtN(c.revenue)}</TD>
                <TD right color={T.rd}>{c.expenses > 0 ? fmtN(c.expenses) : '—'}</TD>
                <TD right bold color={Number(c.margin) > 0 ? T.gn : T.rd}>{c.margin}%</TD>
                <TD mono muted>{c.count}</TD>
              </TRow>
            ))}
          </Table>
      )}

      {tab === 'concentration' && (
        <div>
          <InfoBox type={customers.slice(0,3).reduce((s,c)=>s+c.revenue,0)/totalRev > 0.7 ? 'warning' : 'success'}>
            {customers.length > 0
              ? `Top 3 customers = ${Math.round(customers.slice(0,3).reduce((s,c)=>s+c.revenue,0)/totalRev*100)}% of revenue. ${customers.slice(0,3).reduce((s,c)=>s+c.revenue,0)/totalRev > 0.7 ? 'HIGH CONCENTRATION RISK — overdependence on few customers.' : 'Healthy diversification.'}`
              : 'No customer data yet.'}
          </InfoBox>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Card>
              <CardHdr>Revenue Concentration</CardHdr>
              {[1, 3, 5, 10].map(n => {
                const topN = customers.slice(0, n);
                const pct = totalRev > 0 ? Math.round(topN.reduce((s,c)=>s+c.revenue,0)/totalRev*100) : 0;
                return <StatRow key={n} label={`Top ${n} customer${n>1?'s':''}`} value={`${pct}% of revenue`} color={pct > 80 ? T.rd : pct > 60 ? T.am : T.gn} />;
              })}
            </Card>
            <Card>
              <CardHdr>Business Risk Indicators</CardHdr>
              <StatRow label="Unique customers" value={String(customers.length)} />
              <StatRow label="Avg revenue per customer" value={customers.length > 0 ? fmtN(Math.round(totalRev/customers.length)) : '—'} />
              <StatRow label="Highest single customer" value={customers[0] ? `${Math.round(customers[0].revenue/totalRev*100)}%` : '—'} />
              <StatRow label="Customer concentration risk" value={customers[0]?.revenue/totalRev > 0.5 ? 'HIGH' : customers[0]?.revenue/totalRev > 0.3 ? 'MEDIUM' : 'LOW'} color={customers[0]?.revenue/totalRev > 0.5 ? T.rd : T.gn} />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 13. SMART REORDER INTELLIGENCE ──────────────────────────────────────────
export function SmartReorder({ inv, saveInv, vendors, txns, co }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(() => load('reorder_suggestions', []));

  const calcVelocity = (item) => {
    // Sales velocity from expense transactions mentioning this item
    const recentSales = txns.filter(t =>
      t.type === 'expense' && t.cat === 'Purchase' &&
      (t.party?.toLowerCase().includes(item.name.toLowerCase()) || t.note?.toLowerCase().includes(item.name.toLowerCase()))
    );
    if (recentSales.length === 0) return 0;
    const totalQty = recentSales.reduce((s, t) => s + Number(t.amount) / Number(item.rate || 1), 0);
    return Math.round(totalQty / Math.max(recentSales.length, 1));
  };

  const generateSuggestions = async () => {
    setLoading(true);
    const lowItems = inv.filter(i => Number(i.qty) <= Number(i.reorder || 5) * 1.5);

    if (lowItems.length === 0) {
      setSuggestions([{ type: 'info', message: 'All stock levels are healthy. No reorders needed now.' }]);
      save('reorder_suggestions', []);
      setLoading(false);
      return;
    }

    const suggestions = lowItems.map(item => {
      const velocity = calcVelocity(item);
      const daysOfStock = velocity > 0 ? Math.floor(Number(item.qty) / velocity) : 999;
      const suggestedQty = Math.max(Number(item.reorder || 10) * 3, velocity * 30);
      const bestVendor = vendors.find(v => v.cat === item.cat) || vendors[0];
      return {
        id: item.id,
        item: item.name,
        currentQty: item.qty,
        unit: item.unit || 'pcs',
        daysOfStock,
        suggestedQty: Math.round(suggestedQty),
        vendor: bestVendor?.name || 'Any vendor',
        estimatedCost: Math.round(suggestedQty * Number(item.rate || 0)),
        urgency: daysOfStock < 7 ? 'Critical' : daysOfStock < 14 ? 'High' : 'Normal',
      };
    }).sort((a, b) => a.daysOfStock - b.daysOfStock);

    setSuggestions(suggestions);
    save('reorder_suggestions', suggestions);
    setLoading(false);
  };

  const urgencyColor = u => u === 'Critical' ? T.rd : u === 'High' ? T.am : T.gn;
  const urgencyCol = u => u === 'Critical' ? 'red' : u === 'High' ? 'amber' : 'green';

  return (
    <div>
      <SHdr title="Smart Reorder Intelligence"
        sub="AI-driven reorder suggestions based on stock levels and consumption patterns"
        action={<BtnP onClick={generateSuggestions} disabled={loading}>{loading ? 'Analysing…' : '⟳ Analyse & Suggest'}</BtnP>} />

      {suggestions.length === 0 ? (
        <InfoBox type="info">Click "Analyse & Suggest" to get intelligent reorder recommendations based on your current stock levels and transaction history.</InfoBox>
      ) : suggestions[0]?.type === 'info' ? (
        <InfoBox type="success">{suggestions[0].message}</InfoBox>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            <KPI label="Items to Reorder" value={String(suggestions.length)} sub="below healthy levels" ac={T.rd} />
            <KPI label="Critical" value={String(suggestions.filter(s=>s.urgency==='Critical').length)} sub="reorder immediately" ac={T.rd} />
            <KPI label="Total Est. Cost" value={fmt(suggestions.reduce((s,sg)=>s+sg.estimatedCost,0))} sub="to restock all items" ac={T.am} />
          </div>
          {suggestions.map(sg => (
            <Card key={sg.id} style={{ marginBottom: 10, border: sg.urgency === 'Critical' ? `1px solid ${T.rd}` : `1px solid ${T.bd}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{sg.item}</span>
                    <Badge l={sg.urgency} col={urgencyCol(sg.urgency)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, fontSize: 11 }}>
                    <div><div style={{ color: T.t4, marginBottom: 2 }}>Current Stock</div><div style={{ fontWeight: 600, color: urgencyColor(sg.urgency) }}>{sg.currentQty} {sg.unit}</div></div>
                    <div><div style={{ color: T.t4, marginBottom: 2 }}>Days Remaining</div><div style={{ fontWeight: 600, color: urgencyColor(sg.urgency) }}>{sg.daysOfStock === 999 ? 'Unknown' : sg.daysOfStock + ' days'}</div></div>
                    <div><div style={{ color: T.t4, marginBottom: 2 }}>Suggested Order</div><div style={{ fontWeight: 600, color: T.tx }}>{sg.suggestedQty} {sg.unit}</div></div>
                    <div><div style={{ color: T.t4, marginBottom: 2 }}>Best Vendor</div><div style={{ fontWeight: 600, color: T.tx }}>{sg.vendor}</div></div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.am }}>{fmtN(sg.estimatedCost)}</div>
                  <div style={{ fontSize: 10, color: T.t3 }}>estimated cost</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
