// ── OFFLINE AI MODULE ──────────────────────────────────────────────────────────
// Routes ALL AI calls to local Ollama instance.
// Zero internet. Zero data leaves the machine. Ever.

const OLLAMA_URL = 'http://127.0.0.1:11434';
const MODEL = 'phi3.5';  // bundled with the app

let _status = 'unknown'; // 'ready' | 'loading' | 'unavailable'
let _statusListeners = [];

export function onAIStatus(cb) { _statusListeners.push(cb); return () => { _statusListeners = _statusListeners.filter(l => l !== cb); }; }
function setStatus(s) { _status = s; _statusListeners.forEach(l => l(s)); }
export function getAIStatus() { return _status; }

// ── Health check — called on app start ────────────────────────────────────────
export async function checkAI() {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      const data = await r.json();
      const hasModel = data.models?.some(m => m.name.startsWith('phi3'));
      if (hasModel) { setStatus('ready'); return 'ready'; }
      else { setStatus('loading'); return 'loading'; }
    }
  } catch {}
  setStatus('unavailable');
  return 'unavailable';
}

// ── Core generate function ────────────────────────────────────────────────────
export async function aiGenerate(prompt, systemPrompt = '', onChunk = null) {
  const body = {
    model: MODEL,
    prompt: systemPrompt ? `<|system|>${systemPrompt}<|end|>\n<|user|>${prompt}<|end|>\n<|assistant|>` : prompt,
    stream: !!onChunk,
    options: { temperature: 0.7, num_predict: 800 },
  };

  const r = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });

  if (!r.ok) throw new Error('Ollama error: ' + r.status);

  if (!onChunk) {
    const data = await r.json();
    return data.response || '';
  }

  // Streaming
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = dec.decode(value);
    const lines = chunk.split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const j = JSON.parse(line);
        if (j.response) { full += j.response; onChunk(full); }
        if (j.done) return full;
      } catch {}
    }
  }
  return full;
}

// ── Prebuilt prompts for each module ─────────────────────────────────────────
export const AI_PROMPTS = {
  advisor: (co, context, question) =>
    `You are a private business advisor for ${co.name} (${co.industry} in ${co.city}, ${co.state}). Context: ${context}. Answer concisely and practically. Question: ${question}`,

  proposal: (co, lead) =>
    `Write a professional 3-paragraph business proposal letter from ${co.name} (${co.industry}, ${co.city}) to ${lead.co}${lead.contact ? ', Attn: ' + lead.contact : ''}. Deal value: ${lead.val ? '₹' + Number(lead.val).toLocaleString('en-IN') : 'to be discussed'}. Be formal, specific, and end with a clear call to action. No subject line needed.`,

  communication: (co, type, context) => {
    const templates = {
      payment: `Write a professional payment reminder letter from ${co.name} to a client with overdue payment. Context: ${context}. Polite but firm. 3 paragraphs.`,
      vendor: `Write a vendor negotiation email from ${co.name} requesting better pricing/terms. Context: ${context}. Professional and collaborative.`,
      po: `Write a formal purchase order email from ${co.name}. Include standard terms: 30-day payment, GST invoice required, delivery within 14 days. Context: ${context}`,
      appt: `Write a formal appointment/offer letter from ${co.name} to a new employee. Include: 3-month probation, confidentiality clause. Context: ${context}`,
      dispute: `Write a formal dispute resolution letter from ${co.name}. Be assertive but professional. Request resolution within 7 business days. Context: ${context}`,
      debt: `Write a debt recovery letter from ${co.name}. Context: ${context}. Tone should match the number of previous attempts.`,
    };
    return templates[type] || `Write a professional business letter from ${co.name}. Context: ${context}`;
  },

  regulatory: (co, question) =>
    `You are a regulatory compliance advisor specialising in Indian business law. Company: ${co.name}, ${co.industry} in ${co.state}. Answer this compliance question with specific rules, thresholds, and deadlines. Always end with: verify with your CA before acting. Question: ${question}`,

  training: (co, topic, role) =>
    `Create a structured training guide for ${co.name} (${co.industry}) on: "${topic}". Audience: ${role}. Include: 1) Objectives 2) Key concepts with examples 3) Step-by-step process 4) Common mistakes 5) Quick reference checklist. Be practical and specific.`,

  insurance: (co, policy) =>
    `Analyse this insurance policy for ${co.name} (${co.industry}): Type: ${policy.type}, Insurer: ${policy.insurer}, Sum Insured: ₹${policy.sumInsured}, Coverage: ${policy.coverage}, Exclusions: ${policy.exclusions}. Provide: 1) Coverage adequacy 2) Risks NOT covered 3) Recommended additions 4) Red flags.`,

  document: (docs, question) =>
    `Based on these documents:\n\n${docs.map(d => `[${d.name}]\n${d.content || ''}`).join('\n\n---\n\n').slice(0, 5000)}\n\nAnswer: ${question}\nCite which document your answer comes from.`,

  tender: (co, details) =>
    `Write a professional tender/RFP response from ${co.name} (${co.industry}, ${co.city}) for: "${details.project}". Scope: ${details.scope}. Budget: ${details.budget ? '₹' + details.budget : 'as quoted'}. Structure: introduction, scope understanding, our approach, timeline, call to action.`,

  debtRecovery: (co, details) =>
    `Write a debt recovery letter from ${co.name} to ${details.party}. Amount: ₹${Number(details.amount).toLocaleString('en-IN')}. Overdue: ${details.overdueBy} days. Previous attempts: ${details.pastAttempts}. ${details.pastAttempts.includes('3') ? 'Final notice — mention legal action clearly.' : 'Professional but firm.'} Sign off as ${co.name} accounts team.`,
};
