// ── PDF GENERATOR (uses jsPDF) ─────────────────────────────────────────────
// Called from Reports, Payslip, Invoice, etc.
// Returns nothing — triggers browser download directly.

export async function generatePDF(type, data) {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, M = 18; // page width, margin
  let y = 0;

  // ── helpers ──────────────────────────────────────────────────────
  const line = (x1, y1, x2, y2, color = [220, 215, 205]) => {
    doc.setDrawColor(...color); doc.line(x1, y1, x2, y2);
  };
  const rect = (x, yy, w, h, fill) => {
    if (fill) doc.setFillColor(...fill);
    doc.rect(x, yy, w, h, fill ? 'F' : 'S');
  };
  const text = (str, x, yy, opts = {}) => {
    doc.setFontSize(opts.size || 10);
    doc.setFont('helvetica', opts.bold ? 'bold' : opts.italic ? 'italic' : 'normal');
    doc.setTextColor(...(opts.color || [30, 25, 20]));
    doc.text(String(str || ''), x, yy, { align: opts.align || 'left', maxWidth: opts.maxWidth });
  };
  const fmtN = n => '₹' + (Number(n) || 0).toLocaleString('en-IN');
  const fmtD = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const newPage = () => { doc.addPage(); y = 20; };

  // ── header band ───────────────────────────────────────────────────
  const header = (co, title) => {
    rect(0, 0, W, 28, [22, 18, 14]);
    text('NEXARA', M, 10, { size: 8, bold: true, color: [180, 130, 80] });
    text(co.name || 'Company', M, 17, { size: 14, bold: true, color: [255, 255, 255] });
    const sub = [co.gstin ? 'GSTIN: ' + co.gstin : '', co.city, co.state].filter(Boolean).join('  ·  ');
    text(sub, M, 23, { size: 8, color: [160, 145, 130] });
    text(title, W - M, 17, { size: 14, bold: true, color: [194, 89, 10], align: 'right' });
    text('Generated: ' + new Date().toLocaleDateString('en-IN'), W - M, 23, { size: 8, color: [160, 145, 130], align: 'right' });
    y = 36;
  };

  // ── section title ─────────────────────────────────────────────────
  const section = (title) => {
    if (y > 260) newPage();
    rect(M, y, W - M * 2, 7, [244, 241, 236]);
    text(title.toUpperCase(), M + 3, y + 5, { size: 8, bold: true, color: [140, 133, 128] });
    y += 10;
  };

  // ── two-col row ───────────────────────────────────────────────────
  const row = (label, value, highlight = false) => {
    if (y > 270) newPage();
    if (highlight) rect(M, y - 1, W - M * 2, 7, [254, 243, 233]);
    text(label, M + 2, y + 4, { size: 9, color: highlight ? [92, 40, 14] : [74, 69, 64] });
    text(value, W - M - 2, y + 4, { size: 9, bold: highlight, align: 'right', color: highlight ? [92, 40, 14] : [30, 25, 20] });
    line(M, y + 6, W - M, y + 6);
    y += 8;
  };

  // ── table ─────────────────────────────────────────────────────────
  const table = (cols, rows) => {
    const totalW = W - M * 2;
    // Header
    rect(M, y, totalW, 7, [22, 18, 14]);
    let cx = M;
    cols.forEach(c => {
      text(c.label.toUpperCase(), cx + 2, y + 5, { size: 7, bold: true, color: [180, 130, 80] });
      cx += c.w * totalW;
    });
    y += 8;
    // Rows
    rows.forEach((r, i) => {
      if (y > 270) newPage();
      if (i % 2 === 0) rect(M, y - 1, totalW, 7, [250, 249, 246]);
      cx = M;
      r.forEach((cell, ci) => {
        const col = cols[ci];
        text(cell, col.align === 'right' ? cx + col.w * totalW - 2 : cx + 2, y + 4,
          { size: 8, align: col.align || 'left', color: [30, 25, 20] });
        cx += col.w * totalW;
      });
      line(M, y + 6, W - M, y + 6, [235, 230, 222]);
      y += 8;
    });
    y += 4;
  };

  // ── footer ────────────────────────────────────────────────────────
  const footer = (co) => {
    const pages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      line(M, 284, W - M, 284, [220, 215, 205]);
      text(`${co.name} · Confidential · Page ${p} of ${pages}`, W / 2, 289, { size: 7, color: [160, 145, 130], align: 'center' });
    }
  };

  // ────────────────────────────────────────────────────────────────
  // DOCUMENT TYPES
  // ────────────────────────────────────────────────────────────────

  if (type === 'pl') {
    const { co, txns } = data;
    header(co, 'Profit & Loss Statement');
    const sales = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const exp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const gstOut = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount) * Number(t.gst || 0) / 100, 0);

    section('Income');
    const incomeCats = [...new Set(txns.filter(t => t.type === 'income').map(t => t.cat))];
    incomeCats.forEach(c => {
      const amt = txns.filter(t => t.type === 'income' && t.cat === c).reduce((s, t) => s + Number(t.amount), 0);
      row(c, fmtN(amt));
    });
    row('TOTAL INCOME', fmtN(sales), true);
    y += 4;

    section('Expenses');
    const expCats = [...new Set(txns.filter(t => t.type === 'expense').map(t => t.cat))];
    expCats.forEach(c => {
      const amt = txns.filter(t => t.type === 'expense' && t.cat === c).reduce((s, t) => s + Number(t.amount), 0);
      row(c, fmtN(amt));
    });
    row('TOTAL EXPENSES', fmtN(exp), true);
    y += 4;

    section('Summary');
    row('Gross Profit / (Loss)', fmtN(sales - exp), true);
    row('Profit Margin', sales > 0 ? ((sales - exp) / sales * 100).toFixed(1) + '%' : '—');
    row('GST Collected (Output)', fmtN(gstOut));
    row('Financial Year', co.fy || '2024–25');

    footer(co);
    doc.save(`PL_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  else if (type === 'payslip') {
    const { co, emp, pay } = data;
    header(co, 'Salary Payslip');
    y += 2;

    section('Employee Details');
    row('Employee Name', emp.name);
    row('Designation', emp.role || '—');
    row('Department', emp.dept || '—');
    row('Date of Joining', fmtD(emp.doj));
    row('Pay Period', new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
    y += 4;

    section('Earnings');
    row('Basic Salary', fmtN(pay.basic));
    row('House Rent Allowance (HRA)', fmtN(pay.hra));
    row('Special Allowance', fmtN(pay.spl));
    row('GROSS SALARY', fmtN(pay.gross), true);
    y += 4;

    section('Deductions');
    row('Provident Fund (Employee 12%)', fmtN(pay.pfEmp));
    row('ESIC (Employee 0.75%)', fmtN(pay.esic));
    row('Professional Tax', fmtN(pay.pt));
    row('TDS (Income Tax)', fmtN(pay.tds));
    row('TOTAL DEDUCTIONS', fmtN(pay.deductions), true);
    y += 4;

    section('Net Pay');
    row('NET TAKE-HOME SALARY', fmtN(pay.net), true);
    row('Annual CTC', fmtN(emp.ctc));
    y += 8;

    text('This is a computer-generated payslip and does not require a signature.', M, y,
      { size: 7, italic: true, color: [160, 145, 130] });

    footer(co);
    doc.save(`Payslip_${emp.name.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  else if (type === 'invoice') {
    const { co, inv } = data;
    header(co, 'Tax Invoice');
    y += 2;

    section('Invoice Details');
    row('Invoice Number', inv.number || 'INV-' + Date.now().toString().slice(-6));
    row('Invoice Date', fmtD(inv.date || new Date().toISOString()));
    row('Due Date', inv.dueDate ? fmtD(inv.dueDate) : '30 days from invoice date');
    row('Bill To', inv.billTo || '—');
    if (inv.gstin) row('Customer GSTIN', inv.gstin);
    y += 4;

    section('Line Items');
    table(
      [{ label: 'Description', w: 0.45 }, { label: 'HSN', w: 0.12 }, { label: 'Qty', w: 0.08 }, { label: 'Rate', w: 0.15, align: 'right' }, { label: 'GST%', w: 0.08 }, { label: 'Amount', w: 0.12, align: 'right' }],
      (inv.items || []).map(item => [
        item.desc || '', item.hsn || '', String(item.qty || 1),
        fmtN(item.rate), item.gst + '%', fmtN(Number(item.qty || 1) * Number(item.rate || 0))
      ])
    );

    const subtotal = (inv.items || []).reduce((s, i) => s + Number(i.qty || 1) * Number(i.rate || 0), 0);
    const gstAmt = (inv.items || []).reduce((s, i) => s + Number(i.qty || 1) * Number(i.rate || 0) * Number(i.gst || 0) / 100, 0);

    row('Subtotal (before GST)', fmtN(subtotal));
    row('GST Amount', fmtN(gstAmt));
    row('TOTAL AMOUNT', fmtN(subtotal + gstAmt), true);
    y += 8;

    section('Payment & Terms');
    row('Bank Name', co.bank || 'As per agreement');
    row('Account Number', co.account || '—');
    row('IFSC Code', co.ifsc || '—');

    footer(co);
    doc.save(`Invoice_${inv.number || 'INV'}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  else if (type === 'gst') {
    const { co, txns } = data;
    header(co, 'GST Summary Report');
    const gstOut = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount) * Number(t.gst || 0) / 100, 0);
    const gstIn = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount) * Number(t.gst || 0) / 100, 0);
    const sales = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const exp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

    section('GSTR-3B Summary');
    row('3.1 — Outward Taxable Supplies', fmtN(sales));
    row('Output GST Collected', fmtN(gstOut));
    row('2A — Inward Supplies (Purchases)', fmtN(exp));
    row('Input Tax Credit (ITC)', fmtN(gstIn));
    row('NET GST PAYABLE', fmtN(gstOut - gstIn), true);
    y += 6;

    section('GST by Rate Slab');
    ['0', '5', '12', '18', '28'].forEach(rate => {
      const out = txns.filter(t => t.type === 'income' && t.gst === rate).reduce((s, t) => s + Number(t.amount) * Number(rate) / 100, 0);
      const inn = txns.filter(t => t.type === 'expense' && t.gst === rate).reduce((s, t) => s + Number(t.amount) * Number(rate) / 100, 0);
      if (out > 0 || inn > 0) {
        row(`${rate}% — Output`, fmtN(out));
        row(`${rate}% — Input`, fmtN(inn));
        row(`${rate}% — Net`, fmtN(out - inn), true);
        y += 2;
      }
    });

    footer(co);
    doc.save(`GST_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  else if (type === 'payroll_register') {
    const { co, emps, calcPay } = data;
    header(co, 'Payroll Register');
    section(`${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} — All Employees`);
    table(
      [{ label: 'Employee', w: 0.28 }, { label: 'Role', w: 0.18 }, { label: 'Gross', w: 0.13, align: 'right' }, { label: 'PF', w: 0.1, align: 'right' }, { label: 'ESIC', w: 0.1, align: 'right' }, { label: 'TDS', w: 0.1, align: 'right' }, { label: 'Net Pay', w: 0.11, align: 'right' }],
      emps.map(e => {
        const p = calcPay(e.ctc);
        return [e.name, e.role || '—', fmtN(p.gross), fmtN(p.pfEmp), fmtN(p.esic), fmtN(p.tds), fmtN(p.net)];
      })
    );
    const total = emps.reduce((s, e) => s + calcPay(e.ctc).net, 0);
    row('TOTAL NET PAYROLL', fmtN(total), true);
    row('Total Employees', String(emps.length));
    footer(co);
    doc.save(`Payroll_Register_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  else if (type === 'inventory') {
    const { co, inv } = data;
    header(co, 'Inventory Valuation Report');
    section('Stock List');
    table(
      [{ label: 'Item', w: 0.35 }, { label: 'SKU', w: 0.15 }, { label: 'Category', w: 0.15 }, { label: 'Qty', w: 0.1, align: 'right' }, { label: 'Unit', w: 0.08 }, { label: 'Rate', w: 0.1, align: 'right' }, { label: 'Value', w: 0.07, align: 'right' }],
      inv.map(i => [i.name, i.sku || '—', i.cat || '—', String(i.qty), i.unit || 'pcs', fmtN(i.rate || 0), fmtN(Number(i.qty) * Number(i.rate || 0))])
    );
    const totalVal = inv.reduce((s, i) => s + Number(i.qty || 0) * Number(i.rate || 0), 0);
    row('TOTAL INVENTORY VALUE', fmtN(totalVal), true);
    row('Total SKUs', String(inv.length));
    const low = inv.filter(i => Number(i.qty) <= Number(i.reorder || 5));
    if (low.length > 0) {
      y += 6; section('Low Stock Alerts');
      low.forEach(i => row(i.name, `${i.qty} ${i.unit || 'pcs'} remaining (reorder at ${i.reorder || 5})`));
    }
    footer(co);
    doc.save(`Inventory_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  else if (type === 'vendor_outstanding') {
    const { co, vendors } = data;
    header(co, 'Vendor Outstanding Report');
    section('Vendor Dues');
    table(
      [{ label: 'Vendor', w: 0.35 }, { label: 'GSTIN', w: 0.25 }, { label: 'Category', w: 0.2 }, { label: 'Outstanding', w: 0.2, align: 'right' }],
      vendors.map(v => [v.name, v.gstin || '—', v.cat || '—', fmtN(v.outstanding || 0)])
    );
    row('TOTAL OUTSTANDING', fmtN(vendors.reduce((s, v) => s + Number(v.outstanding || 0), 0)), true);
    footer(co);
    doc.save(`Vendor_Outstanding_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  else if (type === 'board_report') {
    const { co, txns, emps, inv, leads } = data;
    header(co, 'Board Report');
    const sales = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const exp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const wonVal = leads.filter(l => l.stage === 'Won').reduce((s, l) => s + Number(l.val || 0), 0);

    section('Financial Performance');
    row('Total Revenue', fmtN(sales));
    row('Total Expenses', fmtN(exp));
    row('Net Profit / (Loss)', fmtN(sales - exp), true);
    row('Profit Margin', sales > 0 ? ((sales - exp) / sales * 100).toFixed(1) + '%' : '—');
    y += 4;

    section('Operations');
    row('Total Headcount', String(emps.length));
    row('Total Annual CTC', fmtN(emps.reduce((s, e) => s + Number(e.ctc || 0), 0)));
    row('Inventory SKUs Tracked', String(inv.length));
    row('Inventory Value', fmtN(inv.reduce((s, i) => s + Number(i.qty || 0) * Number(i.rate || 0), 0)));
    y += 4;

    section('Sales Pipeline');
    row('Total Leads', String(leads.length));
    row('Active Pipeline Value', fmtN(leads.filter(l => !['Won', 'Lost'].includes(l.stage)).reduce((s, l) => s + Number(l.val || 0), 0)));
    row('Revenue from Won Deals', fmtN(wonVal));
    row('Win Rate', leads.filter(l => ['Won', 'Lost'].includes(l.stage)).length > 0
      ? Math.round(leads.filter(l => l.stage === 'Won').length / leads.filter(l => ['Won', 'Lost'].includes(l.stage)).length * 100) + '%' : '—');

    footer(co);
    doc.save(`Board_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
