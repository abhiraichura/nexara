// ── STORAGE HELPERS ────────────────────────────────────────────────
export const load = (key, def) => {
  try { const v = localStorage.getItem('nx_' + key); return v ? JSON.parse(v) : def; }
  catch { return def; }
};
export const save = (key, val) => {
  try { localStorage.setItem('nx_' + key, JSON.stringify(val)); } catch {}
};

// ── FORMATTERS ────────────────────────────────────────────────────
export const fmt = (n) => {
  const num = Number(n) || 0;
  if (Math.abs(num) >= 1e7) return '₹' + (num / 1e7).toFixed(2) + 'Cr';
  if (Math.abs(num) >= 1e5) return '₹' + (num / 1e5).toFixed(2) + 'L';
  return '₹' + num.toLocaleString('en-IN');
};
export const fmtN = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');
export const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const today = () => new Date().toISOString().split('T')[0];
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ── PAYROLL CALC ──────────────────────────────────────────────────
export const calcPay = (ctc) => {
  const c = Number(ctc) || 0;
  const monthly = c / 12;
  const basic = Math.round(monthly * 0.4);
  const hra = Math.round(monthly * 0.2);
  const spl = Math.round(monthly * 0.4);
  const pfEmp = Math.min(Math.round(basic * 0.12), 1800);
  const pfEr = Math.min(Math.round(basic * 0.12), 1800);
  const esic = basic + hra > 21000 ? 0 : Math.round(monthly * 0.0075);
  const esicEr = basic + hra > 21000 ? 0 : Math.round(monthly * 0.0325);
  const pt = monthly > 15000 ? 200 : monthly > 10000 ? 150 : 0;
  const tds = monthly > 83333 ? Math.round(monthly * 0.1) : 0;
  const gross = basic + hra + spl;
  const deductions = pfEmp + esic + pt + tds;
  const net = gross - deductions;
  return { basic, hra, spl, pfEmp, pfEr, esic, esicEr, pt, tds, gross, deductions, net, monthly: Math.round(monthly) };
};

// ── SEED DATA ─────────────────────────────────────────────────────
export const INDUSTRIES = [
  'Manufacturing', 'Trading / Distribution', 'Professional Services',
  'Retail', 'Healthcare / Clinic', 'Construction', 'Hospitality / Food',
  'IT / Technology', 'Finance / Accounting', 'Education', 'Logistics',
  'Real Estate', 'Other',
];
export const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Chandigarh','Other / Union Territory',
];
export const ROLES = ['Owner / Admin', 'Accountant', 'HR Manager', 'Sales Manager', 'Viewer'];
export const GST_RATES = ['0', '5', '12', '18', '28'];
export const TXN_CATS = ['Sales', 'Purchase', 'Salary', 'Rent', 'Utilities', 'Other Expense', 'Other Income'];
