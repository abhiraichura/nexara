import React from 'react';

export const T = {
  bg:"#F4F1EC",sf:"#FEFCF8",bd:"#E2DDD6",bd2:"#D4CFC7",
  tx:"#1C1917",t2:"#57534E",t3:"#A8A29E",
  ac:"#92400E",al:"#FEF3C7",am:"#D97706",
  bl:"#1E40AF",bll:"#EFF6FF",gn:"#15803D",gl:"#F0FDF4",
  rd:"#B91C1C",rl:"#FEF2F2",sl:"#334155",sb:"#1C1917"
};

export const f = '"Georgia",serif';
export const mo = '"Courier New",monospace';

export const Badge = ({ l, col = 'neutral' }) => {
  const m = {
    green:{bg:T.gl,c:T.gn}, red:{bg:T.rl,c:T.rd},
    amber:{bg:T.al,c:T.ac}, blue:{bg:T.bll,c:T.bl},
    neutral:{bg:'#F1F5F9',c:'#334155'}
  };
  const s = m[col] || m.neutral;
  return (
    <span style={{fontSize:10,padding:'2px 8px',borderRadius:2,fontFamily:mo,
      letterSpacing:1,background:s.bg,color:s.c,fontWeight:600,whiteSpace:'nowrap'}}>
      {l}
    </span>
  );
};

export const KPI = ({ label, value, sub, ac }) => (
  <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:6,
    padding:'16px 18px',borderTop:`3px solid ${ac}`}}>
    <div style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,marginBottom:7}}>
      {label.toUpperCase()}
    </div>
    <div style={{fontSize:22,color:T.tx,fontWeight:400,fontFamily:f,marginBottom:3,letterSpacing:-0.5}}>
      {value}
    </div>
    <div style={{fontSize:11,color:T.t3,fontFamily:mo}}>{sub}</div>
  </div>
);

export const Inp = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,display:'block',marginBottom:4}}>
      {label}
    </label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{width:'100%',padding:'8px 10px',background:T.bg,border:`1px solid ${T.bd}`,
        borderRadius:4,color:T.tx,fontSize:13,outline:'none',boxSizing:'border-box',fontFamily:f}}/>
  </div>
);

export const Sel = ({ label, value, onChange, options }) => (
  <div>
    <label style={{fontSize:10,color:T.t3,letterSpacing:2,fontFamily:mo,display:'block',marginBottom:4}}>
      {label}
    </label>
    <select value={value} onChange={onChange}
      style={{width:'100%',padding:'8px 10px',background:T.bg,border:`1px solid ${T.bd}`,
        borderRadius:4,color:T.tx,fontSize:13,outline:'none',fontFamily:f}}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

export const BtnP = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{padding:'8px 18px',background:disabled?T.bd:T.tx,color:disabled?T.t3:T.bg,
      border:'none',borderRadius:4,cursor:disabled?'not-allowed':'pointer',
      fontSize:13,fontFamily:f,fontWeight:600}}>
    {children}
  </button>
);

export const BtnG = ({ children, onClick }) => (
  <button onClick={onClick}
    style={{padding:'8px 14px',background:'transparent',color:T.t2,
      border:`1px solid ${T.bd}`,borderRadius:4,cursor:'pointer',fontSize:13,fontFamily:f}}>
    {children}
  </button>
);

export const SHdr = ({ title, sub, action }) => (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
    <div>
      <h2 style={{fontSize:18,fontWeight:400,color:T.tx,fontFamily:f,letterSpacing:-0.3,marginBottom:2}}>
        {title}
      </h2>
      {sub && <p style={{color:T.t3,fontSize:11,fontFamily:mo}}>{sub}</p>}
    </div>
    {action}
  </div>
);

export const Tabs = ({ tabs, active, onChange }) => (
  <div style={{display:'flex',marginBottom:18,borderBottom:`1px solid ${T.bd}`}}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        style={{padding:'7px 16px',border:'none',background:'transparent',cursor:'pointer',
          color:active===t.id?T.tx:T.t3,fontSize:12,fontFamily:f,
          borderBottom:active===t.id?`2px solid ${T.ac}`:'2px solid transparent',marginBottom:-1}}>
        {t.label}
      </button>
    ))}
  </div>
);

export const Modal = ({ title, children, onClose }) => (
  <div style={{position:'fixed',inset:0,background:'rgba(28,25,23,0.5)',display:'flex',
    alignItems:'center',justifyContent:'center',zIndex:300,backdropFilter:'blur(2px)'}}>
    <div style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:8,padding:26,
      width:480,maxWidth:'94vw',maxHeight:'90vh',overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <h3 style={{fontSize:15,fontWeight:400,color:T.tx,fontFamily:f}}>{title}</h3>
        <button onClick={onClose}
          style={{background:'none',border:'none',color:T.t3,cursor:'pointer',fontSize:20,lineHeight:1}}>
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);
