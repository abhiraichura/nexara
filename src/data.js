export const SD_TXN = [
  {id:1,date:"2026-05-28",party:"Ramesh Steel Suppliers",type:"Purchase",amount:245000,gst:44100,status:"paid",category:"Raw Material",hsn:"7208"},
  {id:2,date:"2026-05-27",party:"Anand Exports Ltd",type:"Sale",amount:580000,gst:104400,status:"paid",category:"Finished Goods",hsn:"8431"},
  {id:3,date:"2026-05-25",party:"Kumar Logistics",type:"Expense",amount:32000,gst:5760,status:"paid",category:"Freight",hsn:"9965"},
  {id:4,date:"2026-05-24",party:"Mehta Components",type:"Purchase",amount:128000,gst:23040,status:"pending",category:"Raw Material",hsn:"7326"},
  {id:5,date:"2026-05-22",party:"Global Trade Co.",type:"Sale",amount:920000,gst:165600,status:"overdue",category:"Finished Goods",hsn:"8431"},
  {id:6,date:"2026-05-20",party:"Office Rent",type:"Expense",amount:45000,gst:0,status:"paid",category:"Overhead",hsn:""},
  {id:7,date:"2026-05-18",party:"Tata Power",type:"Expense",amount:18500,gst:3330,status:"paid",category:"Utilities",hsn:""},
  {id:8,date:"2026-05-15",party:"Patel Distributors",type:"Sale",amount:340000,gst:61200,status:"paid",category:"Finished Goods",hsn:"8431"},
];

export const SD_EMP = [
  {id:1,name:"Rajesh Kumar",designation:"Production Manager",dept:"Operations",basic:45000,hra:18000,special:7000,doj:"2021-03-15",pan:"ABCPK1234D",pf:true,esic:false,pt:200},
  {id:2,name:"Priya Sharma",designation:"Accountant",dept:"Finance",basic:35000,hra:14000,special:5000,doj:"2022-07-01",pan:"BCDPS5678E",pf:true,esic:true,pt:200},
  {id:3,name:"Amit Singh",designation:"Floor Supervisor",dept:"Operations",basic:22000,hra:8800,special:2200,doj:"2023-01-10",pan:"CDEAC9012F",pf:true,esic:true,pt:150},
  {id:4,name:"Sunita Patel",designation:"HR Executive",dept:"HR",basic:28000,hra:11200,special:3800,doj:"2022-11-20",pan:"DEFSP3456G",pf:true,esic:true,pt:200},
  {id:5,name:"Vikram Mehta",designation:"Sales Executive",dept:"Sales",basic:30000,hra:12000,special:8000,doj:"2023-06-05",pan:"EFGVM7890H",pf:true,esic:false,pt:200},
];

export const SD_INV = [
  {id:1,sku:"RM-001",name:"Steel Rods (MS)",category:"Raw Material",qty:450,unit:"kg",costPrice:85,reorderAt:100,supplier:"Ramesh Steel"},
  {id:2,sku:"RM-002",name:"Aluminum Sheets",category:"Raw Material",qty:18,unit:"sheet",costPrice:680,reorderAt:30,supplier:"Mehta Components"},
  {id:3,sku:"FG-001",name:"Heavy Bracket Assembly",category:"Finished Goods",qty:85,unit:"pcs",costPrice:1200,reorderAt:20,supplier:"—"},
  {id:4,sku:"FG-002",name:"Conveyor Frame Unit",category:"Finished Goods",qty:4,unit:"pcs",costPrice:8500,reorderAt:5,supplier:"—"},
  {id:5,sku:"PM-001",name:"Packaging Boxes L",category:"Packaging",qty:320,unit:"pcs",costPrice:45,reorderAt:50,supplier:"Kumar Logistics"},
];

export const SD_VENDORS = [
  {id:1,name:"Ramesh Steel Suppliers",gstin:"27AABCR1234F1Z5",contact:"9876543210",city:"Mumbai",category:"Raw Material",outstanding:245000,lastOrder:"2026-05-28",rating:4},
  {id:2,name:"Mehta Components",gstin:"24AABCM5678G1Z3",contact:"9765432109",city:"Ahmedabad",category:"Components",outstanding:128000,lastOrder:"2026-05-24",rating:5},
  {id:3,name:"Kumar Logistics",gstin:"29AABCK9012H1Z1",contact:"9654321098",city:"Bangalore",category:"Freight",outstanding:0,lastOrder:"2026-05-25",rating:3},
];

export const SD_LEADS = [
  {id:1,company:"Apex Industries",contact:"Rakesh Gupta",value:580000,stage:"Proposal Sent",source:"Referral",lastTouch:"2026-05-28",notes:"Needs custom specs"},
  {id:2,company:"Delta Fabricators",contact:"Meena Shah",value:320000,stage:"Negotiation",source:"Trade Show",lastTouch:"2026-05-26",notes:"Offer 5% discount"},
  {id:3,company:"Horizon Exports",contact:"Suresh Nair",value:950000,stage:"Discovery",source:"Website",lastTouch:"2026-05-24",notes:"Large order Q3"},
  {id:4,company:"Prism Engineering",contact:"Kavita Rathi",value:145000,stage:"Closed Won",source:"LinkedIn",lastTouch:"2026-05-20",notes:"PO received"},
];

export const COMPLIANCE = [
  {id:1,title:"GSTR-3B Filing",due:"20 Jun 2026",authority:"GST Council",status:"Pending",category:"GST"},
  {id:2,title:"GSTR-1 Filing",due:"11 Jun 2026",authority:"GST Council",status:"Pending",category:"GST"},
  {id:3,title:"TDS Deposit",due:"07 Jun 2026",authority:"Income Tax",status:"Due Soon",category:"TDS"},
  {id:4,title:"PF ECR Challan",due:"15 Jun 2026",authority:"EPFO",status:"Pending",category:"Labour"},
  {id:5,title:"ESIC Challan",due:"15 Jun 2026",authority:"ESIC",status:"Pending",category:"Labour"},
  {id:6,title:"Advance Tax Q1",due:"15 Jun 2026",authority:"Income Tax",status:"Upcoming",category:"Tax"},
  {id:7,title:"ROC Annual Return",due:"30 Sep 2026",authority:"MCA",status:"Upcoming",category:"MCA"},
];

export const STATES = ["Maharashtra","Delhi","Karnataka","Tamil Nadu","Gujarat","Rajasthan","Uttar Pradesh","West Bengal","Telangana","Punjab","Andhra Pradesh","Kerala","Other"];

export const MODS = [
  {id:"dashboard",label:"Dashboard",icon:"◈",cat:"core"},
  {id:"accounting",label:"Accounting",icon:"₹",cat:"finance"},
  {id:"taxation",label:"Taxation & GST",icon:"§",cat:"finance"},
  {id:"cashflow",label:"Cash Flow",icon:"↻",cat:"finance"},
  {id:"banking",label:"Banking",icon:"⊞",cat:"finance"},
  {id:"hr",label:"HR & Payroll",icon:"◉",cat:"people"},
  {id:"attendance",label:"Attendance",icon:"◷",cat:"people"},
  {id:"recruitment",label:"Recruitment",icon:"⊕",cat:"people"},
  {id:"inventory",label:"Inventory",icon:"▦",cat:"ops"},
  {id:"vendors",label:"Vendors",icon:"⊗",cat:"ops"},
  {id:"production",label:"Production",icon:"⚙",cat:"ops"},
  {id:"crm",label:"CRM & Sales",icon:"⊳",cat:"growth"},
  {id:"leads",label:"Leads",icon:"◎",cat:"growth"},
  {id:"proposals",label:"Proposals",icon:"✦",cat:"growth"},
  {id:"legal",label:"Legal & Compliance",icon:"⚖",cat:"comply"},
  {id:"contracts",label:"Contracts",icon:"⊟",cat:"comply"},
  {id:"audit",label:"Audit Trail",icon:"◫",cat:"comply"},
  {id:"analytics",label:"Analytics",icon:"≋",cat:"intel"},
  {id:"reports",label:"Reports",icon:"≡",cat:"intel"},
  {id:"comms",label:"Communications",icon:"◌",cat:"intel"},
  {id:"documents",label:"Document Brain",icon:"◧",cat:"intel"},
  {id:"settings",label:"Settings",icon:"⚭",cat:"intel"},
];

export const CATS = {
  core:{l:"Core"},finance:{l:"Finance"},people:{l:"People"},
  ops:{l:"Operations"},growth:{l:"Growth"},comply:{l:"Compliance"},intel:{l:"Intelligence"}
};

export const calcPay = (e) => {
  const g = e.basic + e.hra + e.special;
  const pE = e.pf ? Math.min(e.basic * 0.12, 1800) : 0;
  const pR = e.pf ? Math.min(e.basic * 0.12, 1800) : 0;
  const eE = e.esic && g <= 21000 ? Math.round(g * 0.0075) : 0;
  const eR = e.esic && g <= 21000 ? Math.round(g * 0.0325) : 0;
  const pt = e.pt || 0;
  const tds = g > 50000 ? Math.round((g - 50000) * 0.1 / 12) : 0;
  const ded = pE + eE + pt + tds;
  return { g, pE, pR, eE, eR, pt, tds, ded, net: g - ded, ctc: g + pR + eR };
};

export const fmt = (n) => `₹${Math.abs(n).toLocaleString('en-IN')}`;
export const fmtK = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;

export const DB = {
  get: (k, fb) => { try { const v = localStorage.getItem('nx_' + k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem('nx_' + k, JSON.stringify(v)); } catch {} },
};
