import React from 'react';

// ── THEME ──────────────────────────────────────────────────────────
export const T = {
  bg:  '#F5F3EF',   // warm parchment
  sf:  '#FFFFFF',   // card surface
  sf2: '#FAFAF8',   // subtle surface
  bd:  '#E8E4DC',   // border
  bd2: '#D4CFC7',   // strong border

  tx:  '#1A1714',   // primary text
  t2:  '#4A4540',   // secondary text
  t3:  '#8C8580',   // muted text
  t4:  '#B8B3AE',   // placeholder

  am:  '#C2590A',   // amber accent (buttons, active)
  aml: '#FEF3E9',   // amber light bg
  amm: '#E87010',   // amber mid

  bl:  '#1D4ED8',   // blue
  bll: '#EFF6FF',   // blue light bg
  gn:  '#166534',   // green
  gl:  '#F0FDF4',   // green light bg
  rd:  '#B91C1C',   // red
  rl:  '#FFF1F1',   // red light bg
  ac:  '#92400E',   // amber text on light
  sl:  '#334155',   // slate

  sb:  '#16120E',   // sidebar bg
  sbh: '#2A231D',   // sidebar hover
  sba: '#3D3028',   // sidebar active
};

export const f  = "'Inter', 'Segoe UI', system-ui, sans-serif";
export const fs = "'Georgia', 'Times New Roman', serif";
export const mo = "'JetBrains Mono', 'Courier New', monospace";

// ── BADGE ──────────────────────────────────────────────────────────
export const Badge = ({ l, col = 'neutral' }) => {
  const m = {
    green:   { bg: T.gl,  c: T.gn,  b: '#BBF7D0' },
    red:     { bg: T.rl,  c: T.rd,  b: '#FECACA' },
    amber:   { bg: T.aml, c: T.ac,  b: '#FED7AA' },
    blue:    { bg: T.bll, c: T.bl,  b: '#BFDBFE' },
    neutral: { bg: '#F1F5F9', c: '#475569', b: '#CBD5E1' },
  };
  const s = m[col] || m.neutral;
  return (
    <span style={{
      fontSize: 10, padding: '3px 8px', borderRadius: 3,
      fontFamily: mo, letterSpacing: 0.5, fontWeight: 600,
      background: s.bg, color: s.c, border: `1px solid ${s.b}`,
      whiteSpace: 'nowrap', display: 'inline-block', lineHeight: 1.4,
    }}>{l}</span>
  );
};

// ── KPI CARD ───────────────────────────────────────────────────────
export const KPI = ({ label, value, sub, ac }) => (
  <div style={{
    background: T.sf, border: `1px solid ${T.bd}`, borderRadius: 8,
    padding: '18px 20px', borderTop: `3px solid ${ac}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }}>
    <div style={{ fontSize: 10, color: T.t3, letterSpacing: 1.5, fontFamily: mo, marginBottom: 9, textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{ fontSize: 24, color: T.tx, fontWeight: 600, fontFamily: f, marginBottom: 4, letterSpacing: -0.5 }}>
      {value}
    </div>
    <div style={{ fontSize: 11, color: T.t3, fontFamily: mo }}>{sub}</div>
  </div>
);

// ── INPUTS ─────────────────────────────────────────────────────────
const inputBase = {
  width: '100%', padding: '9px 12px', background: T.sf,
  border: `1px solid ${T.bd}`, borderRadius: 6,
  color: T.tx, fontSize: 14, outline: 'none',
  boxSizing: 'border-box', fontFamily: f,
  transition: 'border-color 0.15s',
};

export const Inp = ({ label, value, onChange, placeholder, type = 'text', readOnly }) => (
  <div>
    {label && (
      <label style={{ fontSize: 11, color: T.t3, letterSpacing: 0.8, fontFamily: mo, display: 'block', marginBottom: 5, fontWeight: 500 }}>
        {label}
      </label>
    )}
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} readOnly={readOnly}
      style={{
        ...inputBase,
        background: readOnly ? T.sf2 : T.sf,
        cursor: readOnly ? 'default' : 'text',
      }}
      onFocus={e => { if (!readOnly) e.target.style.borderColor = T.am; }}
      onBlur={e => { e.target.style.borderColor = T.bd; }}
    />
  </div>
);

export const Sel = ({ label, value, onChange, options }) => (
  <div>
    {label && (
      <label style={{ fontSize: 11, color: T.t3, letterSpacing: 0.8, fontFamily: mo, display: 'block', marginBottom: 5, fontWeight: 500 }}>
        {label}
      </label>
    )}
    <select value={value} onChange={onChange}
      style={{
        ...inputBase,
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238C8580' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: 34,
      }}
      onFocus={e => e.target.style.borderColor = T.am}
      onBlur={e => e.target.style.borderColor = T.bd}
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

export const TextArea = ({ label, value, onChange, placeholder, rows = 4 }) => (
  <div>
    {label && (
      <label style={{ fontSize: 11, color: T.t3, letterSpacing: 0.8, fontFamily: mo, display: 'block', marginBottom: 5, fontWeight: 500 }}>
        {label}
      </label>
    )}
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{
        ...inputBase, resize: 'vertical', lineHeight: 1.6,
        fontFamily: mo, fontSize: 12,
      }}
      onFocus={e => e.target.style.borderColor = T.am}
      onBlur={e => e.target.style.borderColor = T.bd}
    />
  </div>
);

// ── BUTTONS ────────────────────────────────────────────────────────
export const BtnP = ({ children, onClick, disabled, small }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      padding: small ? '6px 14px' : '9px 20px',
      background: disabled ? T.bd2 : T.am,
      color: disabled ? T.t3 : '#FFF',
      border: 'none', borderRadius: 6,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: small ? 12 : 13, fontFamily: f, fontWeight: 600,
      letterSpacing: 0.1, transition: 'background 0.15s',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => { if (!disabled) e.target.style.background = T.amm; }}
    onMouseLeave={e => { if (!disabled) e.target.style.background = T.am; }}
  >
    {children}
  </button>
);

export const BtnG = ({ children, onClick, small }) => (
  <button onClick={onClick}
    style={{
      padding: small ? '6px 14px' : '9px 18px',
      background: 'transparent', color: T.t2,
      border: `1px solid ${T.bd}`, borderRadius: 6,
      cursor: 'pointer', fontSize: small ? 12 : 13, fontFamily: f,
      transition: 'border-color 0.15s, color 0.15s',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = T.bd2}
    onMouseLeave={e => e.currentTarget.style.borderColor = T.bd}
  >
    {children}
  </button>
);

export const BtnDanger = ({ children, onClick, small }) => (
  <button onClick={onClick}
    style={{
      padding: small ? '5px 10px' : '8px 16px',
      background: 'transparent', color: T.rd,
      border: `1px solid ${T.rd}55`, borderRadius: 5,
      cursor: 'pointer', fontSize: small ? 11 : 13, fontFamily: f,
    }}
  >{children}</button>
);

// ── SECTION HEADER ─────────────────────────────────────────────────
export const SHdr = ({ title, sub, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: T.tx, fontFamily: f, letterSpacing: -0.4, marginBottom: 3 }}>
        {title}
      </h2>
      {sub && <p style={{ color: T.t3, fontSize: 12, fontFamily: mo }}>{sub}</p>}
    </div>
    {action}
  </div>
);

// ── TABS ───────────────────────────────────────────────────────────
export const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', marginBottom: 20, borderBottom: `1px solid ${T.bd}`, gap: 2 }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        style={{
          padding: '9px 18px', border: 'none', background: 'transparent',
          cursor: 'pointer', color: active === t.id ? T.am : T.t3,
          fontSize: 13, fontFamily: f, fontWeight: active === t.id ? 600 : 400,
          borderBottom: active === t.id ? `2px solid ${T.am}` : '2px solid transparent',
          marginBottom: -1, transition: 'all 0.15s',
        }}
      >{t.label}</button>
    ))}
  </div>
);

// ── TABLE COMPONENTS ───────────────────────────────────────────────
export const Table = ({ cols, children }) => (
  <div style={{ background: T.sf, border: `1px solid ${T.bd}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <div style={{
      display: 'grid', gridTemplateColumns: cols,
      padding: '10px 18px', background: T.sf2,
      borderBottom: `1px solid ${T.bd}`,
      fontSize: 10, color: T.t3, letterSpacing: 1.2, fontFamily: mo, fontWeight: 600,
      textTransform: 'uppercase',
    }}>
      {children[0]}
    </div>
    <div>{children.slice(1)}</div>
  </div>
);

export const TRow = ({ cols, onClick, highlight, children }) => (
  <div onClick={onClick}
    style={{
      display: 'grid', gridTemplateColumns: cols,
      padding: '12px 18px', borderBottom: `1px solid ${T.sf2}`,
      alignItems: 'center', cursor: onClick ? 'pointer' : 'default',
      background: highlight ? '#FFF8F5' : 'transparent',
      transition: 'background 0.1s',
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = T.sf2; }}
    onMouseLeave={e => { e.currentTarget.style.background = highlight ? '#FFF8F5' : 'transparent'; }}
  >{children}</div>
);

export const TH = ({ children, right }) => (
  <span style={{ textAlign: right ? 'right' : 'left' }}>{children}</span>
);

export const TD = ({ children, mono, right, muted, color, bold }) => (
  <span style={{
    fontSize: 13, color: color || (muted ? T.t3 : T.t2),
    fontFamily: mono ? mo : f, textAlign: right ? 'right' : 'left',
    fontWeight: bold ? 600 : 400,
  }}>{children}</span>
);

// ── MODAL ──────────────────────────────────────────────────────────
export const Modal = ({ title, children, onClose, wide }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(22,18,14,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 400, backdropFilter: 'blur(3px)',
  }}>
    <div style={{
      background: T.sf, border: `1px solid ${T.bd}`, borderRadius: 10,
      padding: '28px 28px 24px', width: wide ? 640 : 520,
      maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.tx, fontFamily: f }}>{title}</h3>
        <button onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: '50%', background: T.sf2,
            border: `1px solid ${T.bd}`, color: T.t3, cursor: 'pointer',
            fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// ── INFO BOX ───────────────────────────────────────────────────────
export const InfoBox = ({ children, type = 'info' }) => {
  const styles = {
    info:    { bg: T.bll, border: '#BFDBFE', color: T.bl },
    warning: { bg: T.aml, border: '#FED7AA', color: T.ac },
    error:   { bg: T.rl,  border: '#FECACA', color: T.rd },
    success: { bg: T.gl,  border: '#BBF7D0', color: T.gn },
  };
  const s = styles[type];
  return (
    <div style={{
      padding: '10px 14px', background: s.bg,
      border: `1px solid ${s.border}`, borderRadius: 6,
      fontSize: 12, color: s.color, fontFamily: mo, lineHeight: 1.6,
    }}>{children}</div>
  );
};

// ── STAT ROW ───────────────────────────────────────────────────────
export const StatRow = ({ label, value, highlight, color }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: `1px solid ${T.sf2}`,
    background: highlight ? T.aml : 'transparent',
  }}>
    <span style={{ fontSize: 13, color: T.t2 }}>{label}</span>
    <span style={{ fontSize: 14, color: color || (highlight ? T.ac : T.tx), fontWeight: highlight ? 600 : 400 }}>
      {value}
    </span>
  </div>
);

// ── CARD ───────────────────────────────────────────────────────────
export const Card = ({ children, pad = 18, style = {} }) => (
  <div style={{
    background: T.sf, border: `1px solid ${T.bd}`,
    borderRadius: 8, padding: pad,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    ...style,
  }}>{children}</div>
);

export const CardHdr = ({ children, action }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 12, marginBottom: 14, borderBottom: `1px solid ${T.bd}`,
  }}>
    <span style={{ fontSize: 11, color: T.t3, letterSpacing: 1.5, fontFamily: mo, fontWeight: 600, textTransform: 'uppercase' }}>
      {children}
    </span>
    {action}
  </div>
);

// ── PROGRESS BAR ───────────────────────────────────────────────────
export const ProgressBar = ({ value, max, color }) => {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  return (
    <div>
      <div style={{ width: '100%', height: 5, background: T.bd, borderRadius: 3 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color || T.am, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
};

// ── SPARKLINE ──────────────────────────────────────────────────────
export const Sparkline = ({ vals, color, h = 44 }) => {
  if (!vals || vals.length < 2) return null;
  const max = Math.max(...vals), min = Math.min(...vals);
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * 100},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(' ');
  return (
    <svg viewBox={`0 0 100 ${h}`} style={{ width: '100%', height: h, display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} 100,${h}`} fill={`url(#sg-${color})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
