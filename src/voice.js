// ── NEXARA VOICE ENGINE ────────────────────────────────────────────────────────
// 100% offline. Uses Web Speech API (macOS built-in) for STT.
// Uses rule-based parsing + Ollama fallback for NLU.
// Uses Web Speech Synthesis for TTS feedback.

// ── TEXT TO SPEECH ────────────────────────────────────────────────────────────
export function speak(text, rate = 0.95) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = rate;
  utt.pitch = 1;
  utt.volume = 0.85;
  // Prefer a natural voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel') || v.lang === 'en-IN') || voices[0];
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

// ── SPEECH RECOGNITION ────────────────────────────────────────────────────────
export function createRecognizer() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = 'en-IN'; // Indian English — handles "lakh", "crore", "rupees"
  rec.maxAlternatives = 3;
  return rec;
}

export function isVoiceSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// ── NUMBER PARSER — handles Indian number words ───────────────────────────────
export function parseAmount(str) {
  if (!str) return 0;
  const s = str.toLowerCase().trim();

  // Direct number
  const direct = parseFloat(s.replace(/,/g, ''));
  if (!isNaN(direct) && s.match(/^\d/)) return direct;

  // Indian words
  let val = 0;
  const croreMatch = s.match(/(\d+(?:\.\d+)?)\s*crore/);
  const lakhMatch  = s.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/);
  const thousandMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k)/);
  const hundredMatch = s.match(/(\d+(?:\.\d+)?)\s*hundred/);

  if (croreMatch)   val += parseFloat(croreMatch[1])   * 1e7;
  if (lakhMatch)    val += parseFloat(lakhMatch[1])    * 1e5;
  if (thousandMatch) val += parseFloat(thousandMatch[1]) * 1e3;
  if (hundredMatch) val += parseFloat(hundredMatch[1]) * 100;

  // Standalone number at end
  const trailer = s.replace(/\d+(?:\.\d+)?\s*(?:crore|lakh|lac|thousand|k|hundred)/g, '').trim();
  const trailNum = parseFloat(trailer);
  if (!isNaN(trailNum)) val += trailNum;

  return val || 0;
}

// ── DATE PARSER ───────────────────────────────────────────────────────────────
export function parseDate(str) {
  if (!str) return null;
  const s = str.toLowerCase();
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];

  if (s.includes('today') || s.includes('now'))    return fmt(today);
  if (s.includes('tomorrow')) { today.setDate(today.getDate() + 1); return fmt(today); }
  if (s.includes('yesterday')) { today.setDate(today.getDate() - 1); return fmt(today); }

  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  for (const [i, d] of days.entries()) {
    if (s.includes(d)) {
      const cur = today.getDay();
      const diff = (i - cur + 7) % 7 || 7;
      today.setDate(today.getDate() + (s.includes('last') ? -(7 - diff) : diff));
      return fmt(today);
    }
  }

  // Try direct date parse
  const parsed = new Date(str);
  if (!isNaN(parsed)) return fmt(parsed);
  return fmt(new Date()); // fallback to today
}

// ── COMMAND PARSER ────────────────────────────────────────────────────────────
// Returns { intent, entities, confidence, rawText }
export function parseCommand(text) {
  const t = text.toLowerCase().trim();
  const raw = text.trim();

  // ── INVOICE ──
  if (/create|make|generate|new|add/.test(t) && /invoice|bill/.test(t)) {
    const partyMatch = t.match(/(?:for|to)\s+([a-z][a-z\s&.'-]{2,40}?)(?:\s+(?:worth|of|amount|for|rs|rupee|₹|\d|one|two|three|four|five|six|seven|eight|nine|ten|lakh|crore))/i)
      || t.match(/(?:for|to)\s+([a-z][a-z\s&.'-]{2,40})$/i);
    const amtPart = t.match(/(?:worth|of|amount|for|rs|rupee|₹)\s*(.+?)(?:\s+(?:with|on|date|due|today|tomorrow|$))/i) || t.match(/(\d[\d,.\s]*(?:lakh|crore|thousand|k)?)\s*(?:rupee|rs|₹)?/i);
    const datePart = t.match(/(?:with\s+)?(?:date|dated|on)\s+(.+?)(?:\s|$)/i) || t.match(/(today|tomorrow|yesterday)/i);

    return {
      intent: 'create_invoice',
      entities: {
        party: partyMatch ? partyMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : '',
        amount: amtPart ? parseAmount(amtPart[1]) : 0,
        date: datePart ? parseDate(datePart[1]) : parseDate('today'),
      },
      confidence: partyMatch && amtPart ? 'high' : 'medium',
      rawText: raw,
    };
  }

  // ── TRANSACTION / EXPENSE / INCOME ──
  if (/add|record|enter|log/.test(t) && /expense|payment|paid|purchase/.test(t)) {
    const partyMatch = t.match(/(?:to|for|from)\s+([a-z][a-z\s&.'-]{2,30}?)(?:\s+(?:worth|of|amount|rs|\d|lakh|crore))/i);
    const amtMatch = t.match(/(?:of|worth|rs|rupee|₹|amount)?\s*(\d[\d,.\s]*(?:lakh|crore|thousand|k)?)/i);
    const noteMatch = t.match(/(?:for|as)\s+([a-z\s]{3,30})(?:\s|$)/i);
    return {
      intent: 'add_expense',
      entities: {
        party: partyMatch ? partyMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : '',
        amount: amtMatch ? parseAmount(amtMatch[1]) : 0,
        note: noteMatch ? noteMatch[1].trim() : '',
        date: parseDate('today'),
        type: 'expense',
      },
      confidence: amtMatch ? 'high' : 'medium',
      rawText: raw,
    };
  }

  if (/add|record|enter|log/.test(t) && /income|received|sale|sales|receipt/.test(t)) {
    const partyMatch = t.match(/(?:from|by)\s+([a-z][a-z\s&.'-]{2,30}?)(?:\s+(?:worth|of|amount|rs|\d|lakh|crore))/i);
    const amtMatch = t.match(/(\d[\d,.\s]*(?:lakh|crore|thousand|k)?)\s*(?:rupee|rs|₹)?/i);
    return {
      intent: 'add_income',
      entities: {
        party: partyMatch ? partyMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : '',
        amount: amtMatch ? parseAmount(amtMatch[1]) : 0,
        date: parseDate('today'),
        type: 'income',
      },
      confidence: amtMatch ? 'high' : 'medium',
      rawText: raw,
    };
  }

  // ── TASK ──
  if (/create|add|make|set|remind/.test(t) && /task|todo|reminder|follow.?up/.test(t)) {
    const titleMatch = t.match(/(?:task|todo|reminder)\s+(?:to\s+)?(.{5,60})(?:\s+(?:by|due|on|priority)|$)/i)
      || t.match(/(?:remind\s+me\s+to\s+)(.{5,60})(?:\s+(?:by|due|on)|$)/i);
    const dateMatch = t.match(/(?:by|due|on)\s+(.+?)(?:\s|$)/i) || t.match(/(today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday)/i);
    const priorityMatch = t.match(/\b(urgent|high|low|medium)\b/i);
    return {
      intent: 'create_task',
      entities: {
        title: titleMatch ? titleMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : raw,
        dueDate: dateMatch ? parseDate(dateMatch[1]) : parseDate('today'),
        priority: priorityMatch ? (priorityMatch[1].charAt(0).toUpperCase() + priorityMatch[1].slice(1).toLowerCase()) : 'Medium',
      },
      confidence: titleMatch ? 'high' : 'medium',
      rawText: raw,
    };
  }

  // ── LEAD / CRM ──
  if (/add|create|new/.test(t) && /lead|prospect|client|deal/.test(t)) {
    const partyMatch = t.match(/(?:lead|prospect|client|deal|for|from)\s+(?:for\s+)?([a-z][a-z\s&.'-]{2,40}?)(?:\s+(?:worth|of|amount|rs|\d)|$)/i);
    const amtMatch = t.match(/(?:worth|of|value|amount)\s*(\d[\d,.\s]*(?:lakh|crore|thousand|k)?)/i);
    return {
      intent: 'add_lead',
      entities: {
        company: partyMatch ? partyMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : '',
        value: amtMatch ? parseAmount(amtMatch[1]) : 0,
        stage: 'Prospect',
      },
      confidence: partyMatch ? 'high' : 'medium',
      rawText: raw,
    };
  }

  // ── INVENTORY ──
  if (/add|stock|create|new/.test(t) && /item|stock|inventory|product|material/.test(t)) {
    const nameMatch = t.match(/(?:item|product|stock|material)\s+([a-z][a-z\s0-9-]{2,30}?)(?:\s+(?:\d|qty|quantity|rate|price|rs|₹)|$)/i);
    const qtyMatch = t.match(/(\d+)\s*(?:units?|pcs?|kg|litre|meter|qty|quantity)/i);
    const rateMatch = t.match(/(?:rate|price|rs|rupee|₹|at)\s*(\d[\d,.\s]*(?:lakh|crore|k)?)/i);
    return {
      intent: 'add_inventory',
      entities: {
        name: nameMatch ? nameMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : '',
        qty: qtyMatch ? qtyMatch[1] : '',
        rate: rateMatch ? parseAmount(rateMatch[1]) : 0,
        unit: qtyMatch ? (qtyMatch[0].match(/pcs?|kg|litre|meter|units?/i)?.[0] || 'pcs') : 'pcs',
      },
      confidence: nameMatch && qtyMatch ? 'high' : 'medium',
      rawText: raw,
    };
  }

  // ── EMPLOYEE ──
  if (/add|create|new/.test(t) && /employee|staff|hire|joining/.test(t)) {
    const nameMatch = t.match(/(?:employee|staff)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
      || t.match(/(?:add|hire)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const salaryMatch = t.match(/(?:salary|ctc|package|pay)\s*(?:of\s*)?(\d[\d,.\s]*(?:lakh|crore|thousand|k)?)/i);
    const roleMatch = t.match(/(?:as|role|designation)\s+([a-z][a-z\s]{3,30}?)(?:\s+(?:salary|ctc|\d)|$)/i);
    return {
      intent: 'add_employee',
      entities: {
        name: nameMatch ? nameMatch[1].trim() : '',
        ctc: salaryMatch ? parseAmount(salaryMatch[1]) : 0,
        role: roleMatch ? roleMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : '',
        doj: parseDate('today'),
      },
      confidence: nameMatch ? 'high' : 'medium',
      rawText: raw,
    };
  }

  // ── NAVIGATION ──
  const navMap = {
    'dashboard': 'dashboard', 'home': 'dashboard',
    'accounting': 'accounting', 'ledger': 'accounting', 'accounts': 'accounting',
    'tax': 'taxation', 'gst': 'taxation', 'taxation': 'taxation',
    'hr': 'hr', 'payroll': 'hr', 'employees': 'hr',
    'inventory': 'inventory', 'stock': 'inventory',
    'crm': 'crm', 'leads': 'crm', 'pipeline': 'crm',
    'vendors': 'vendors', 'suppliers': 'vendors',
    'tasks': 'tasks', 'todo': 'tasks',
    'reports': 'reports', 'analytics': 'analytics',
    'invoices': 'invoices', 'invoice': 'invoices',
    'cash flow': 'cashforecast', 'cashflow': 'cashforecast',
    'projects': 'projects', 'timesheets': 'projects',
    'settings': 'settings', 'profile': 'settings',
  };

  if (/(?:go to|open|show|navigate to|take me to)\s+(.+)/i.test(t) || /^(?:open|show)\s+\w/i.test(t)) {
    const dest = t.replace(/(?:go to|open|show|navigate to|take me to)\s*/i, '').trim();
    for (const [key, mod] of Object.entries(navMap)) {
      if (dest.includes(key)) {
        return { intent: 'navigate', entities: { module: mod, label: key }, confidence: 'high', rawText: raw };
      }
    }
  }

  // ── QUERY ──
  if (/what|how much|show|tell me|display|check/.test(t)) {
    if (/profit|margin|earning/.test(t))        return { intent: 'query', entities: { metric: 'profit' }, confidence: 'high', rawText: raw };
    if (/gst|tax payable|tax due/.test(t))       return { intent: 'query', entities: { metric: 'gst' }, confidence: 'high', rawText: raw };
    if (/revenue|sales|income/.test(t))          return { intent: 'query', entities: { metric: 'sales' }, confidence: 'high', rawText: raw };
    if (/expense|expenses|cost/.test(t))         return { intent: 'query', entities: { metric: 'expenses' }, confidence: 'high', rawText: raw };
    if (/employee|staff|headcount/.test(t))      return { intent: 'query', entities: { metric: 'employees' }, confidence: 'high', rawText: raw };
    if (/stock|inventory|item/.test(t))          return { intent: 'query', entities: { metric: 'inventory' }, confidence: 'high', rawText: raw };
    if (/task|pending|due today/.test(t))        return { intent: 'query', entities: { metric: 'tasks' }, confidence: 'high', rawText: raw };
    if (/lead|pipeline|deal/.test(t))            return { intent: 'query', entities: { metric: 'pipeline' }, confidence: 'high', rawText: raw };
  }

  // ── UNKNOWN — will go to Ollama ──
  return { intent: 'unknown', entities: {}, confidence: 'low', rawText: raw };
}

// ── QUERY RESPONDER ───────────────────────────────────────────────────────────
export function answerQuery(metric, { txns, emps, inv, leads, tasks, fmt, fmtN }) {
  const sales = txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0);
  const expenses = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
  const gstOut = txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount)*Number(t.gst||0)/100,0);
  const gstIn = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount)*Number(t.gst||0)/100,0);

  const answers = {
    profit:    `Your net profit is ${fmtN(sales - expenses)}. Revenue is ${fmtN(sales)} and expenses are ${fmtN(expenses)}.`,
    gst:       `GST payable is ${fmtN(Math.max(0, gstOut - gstIn))}. Output GST collected: ${fmtN(gstOut)}, Input tax credit: ${fmtN(gstIn)}.`,
    sales:     `Total revenue is ${fmtN(sales)} from ${txns.filter(t=>t.type==='income').length} transactions.`,
    expenses:  `Total expenses are ${fmtN(expenses)} across ${txns.filter(t=>t.type==='expense').length} entries.`,
    employees: `You have ${emps.length} employee${emps.length !== 1 ? 's' : ''} on record.`,
    inventory: `Inventory has ${inv.length} items. ${inv.filter(i=>Number(i.qty)<=Number(i.reorder||5)).length} items are below reorder level.`,
    tasks:     `You have ${(tasks||[]).filter(t=>t.status!=='Done'&&t.dueDate===new Date().toISOString().split('T')[0]).length} tasks due today.`,
    pipeline:  `Active pipeline has ${leads.filter(l=>!['Won','Lost'].includes(l.stage)).length} leads worth ${fmtN(leads.filter(l=>!['Won','Lost'].includes(l.stage)).reduce((s,l)=>s+Number(l.val||0),0))}.`,
  };
  return answers[metric] || 'I could not find that information.';
}
