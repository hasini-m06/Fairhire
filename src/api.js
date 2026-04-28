// ── FairHire — Gemini 1.5 Pro Audit Engine ───────────────
//
//  All three audit stages run as a single Gemini Pro call.
//  Returns a structured JSON object that render.js consumes
//  directly — no transformation needed.
//
//  Model:     gemini-1.5-pro
//  Free tier: 2 requests/min · 50 requests/day (Google AI Studio)
//             Enough for demo + judging. Zero cost.
//
//  API key setup:
//    Option A (Vite dev): add VITE_GEMINI_KEY=your_key to .env
//    Option B (deployed static site): set window.GEMINI_KEY
//      in a <script> tag before this file loads, e.g.:
//      <script>window.GEMINI_KEY = 'AIza...';</script>
//
//  Get a free key at: https://aistudio.google.com/app/apikey

const GEMINI_MODEL = 'gemini-1.5-pro';
const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta/models';

// ── Resolve API key ───────────────────────────────────────
//  Works in both Vite (import.meta.env) and plain <script> contexts.
//  index.html loads scripts as plain tags, so we use window.GEMINI_KEY.
function getApiKey() {
  if (typeof window !== 'undefined' && window.GEMINI_KEY) {
    return window.GEMINI_KEY;
  }
  return null;
}

// ── Build the 3-stage audit prompt ───────────────────────
//
//  Stage A → Detect bias signals in the raw data
//  Stage B → Label each finding with a risk level
//  Stage C → Produce actionable SDG-aligned recommendations
//
//  Response must be pure JSON — no markdown, no backticks.

function buildAuditPrompt(csvData) {
  return `You are FairHire, an expert AI auditor specialising in detecting bias and discrimination in hiring data. You help Indian HR teams comply with fair hiring standards aligned with SDG 8 (Decent Work) and SDG 10 (Reduced Inequalities).

Analyse the following hiring dataset CSV and produce a complete hiring fairness audit.

CSV DATA:
${csvData}

INSTRUCTIONS:
- Look for bias across: gender, college_tier, location, years_exp vs the hired column (Yes/No).
- Mentally compute approximate hire rates per group and flag disparities.
- Apply the EEOC 80% Rule: if a group's hire rate is less than 80% of the highest-hired group, that is legally considered discriminatory.
- Consider India-specific patterns: IIT/state college preference, metro city bias, gender bias in tech screening.
- All recommendations must reference SDG 8 or SDG 10 explicitly.

RESPONSE FORMAT:
You MUST respond with ONLY valid JSON. No markdown fences. No explanation text. No backticks. Start your response with { and end with }.

{
  "risk_level": "HIGH",
  "risk_summary": "One sentence overall fairness verdict for this dataset.",
  "findings": [
    {
      "title": "Short descriptive title of the bias finding",
      "detail": "2-3 sentences: what bias was found, which groups, what the data shows.",
      "risk": "HIGH"
    }
  ],
  "correlations": [
    {
      "feature": "gender",
      "strength": "STRONG",
      "observation": "One sentence on how this feature correlates with hiring outcomes."
    }
  ],
  "recommendations": [
    {
      "title": "Short recommendation title",
      "body": "2-3 sentences: what to do, why it reduces bias, which SDG it addresses.",
      "action": "One concrete immediate next step for the HR team."
    }
  ],
  "raw_analysis": "Detailed 200-300 word technical analysis covering all bias patterns, specific groups, approximate hire rates, EEOC 80% rule assessment, and statistical observations."
}

Rules:
- risk_level, findings[].risk must be exactly: HIGH, MEDIUM, or LOW
- correlations[].strength must be exactly: STRONG, MODERATE, or WEAK
- Minimum: 3 findings, 4 correlations, 3 recommendations
- Be specific to the actual data rows — not generic advice
- risk_level must reflect the worst finding present`;
}

// ── Call Gemini 1.5 Pro ───────────────────────────────────
async function callGemini(prompt) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      'Gemini API key not found. ' +
      'Set window.GEMINI_KEY before api.js loads, or add it to index.html. ' +
      'Get a free key at: https://aistudio.google.com/app/apikey'
    );
  }

  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature: 0.2,       // Low = consistent, factual, structured output
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${response.status}`;
    if (response.status === 400) throw new Error(`Bad request to Gemini: ${msg}`);
    if (response.status === 403) throw new Error(
      'API key rejected. Make sure the Gemini API is enabled at aistudio.google.com and the key is correct.'
    );
    if (response.status === 429) throw new Error(
      'Rate limit hit. Gemini 1.5 Pro free tier allows 2 requests/min. Wait 30 seconds and try again.'
    );
    if (response.status === 503) throw new Error(
      'Gemini API temporarily unavailable. Try again in a few seconds.'
    );
    throw new Error(`Gemini API error (${response.status}): ${msg}`);
  }

  const data = await response.json();

  // Check for safety or token blocks
  const finishReason = data?.candidates?.[0]?.finishReason;
  if (finishReason === 'SAFETY') {
    throw new Error('Gemini blocked this response for safety reasons. Try with a different dataset.');
  }
  if (finishReason === 'MAX_TOKENS') {
    throw new Error('Gemini response was cut off. Dataset may be too large — try with fewer rows.');
  }

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Gemini returned an empty response. Please try again.');

  return raw;
}

// ── Parse and validate JSON response ─────────────────────
function parseAuditResponse(raw) {
  // Strip markdown fences if Gemini adds them despite instructions
  let cleaned = raw
    .replace(/^```json[\r\n]*/i, '')
    .replace(/^```[\r\n]*/,      '')
    .replace(/```[\r\n]*$/,      '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (_) {
    // Last resort: extract outermost JSON object from the text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { parsed = JSON.parse(match[0]); }
      catch { throw new Error('Could not parse Gemini response as JSON. Try running the audit again.'); }
    } else {
      throw new Error('Gemini did not return valid JSON. Try running the audit again.');
    }
  }

  // Validate every field that render.js will access
  const required = ['risk_level', 'risk_summary', 'findings', 'correlations', 'recommendations', 'raw_analysis'];
  for (const field of required) {
    if (parsed[field] === undefined || parsed[field] === null) {
      throw new Error(`Gemini response is missing the "${field}" field. Try running the audit again.`);
    }
  }

  // Normalise risk_level
  parsed.risk_level = String(parsed.risk_level).toUpperCase();
  if (!['HIGH', 'MEDIUM', 'LOW'].includes(parsed.risk_level)) parsed.risk_level = 'MEDIUM';

  // Ensure arrays
  if (!Array.isArray(parsed.findings))        parsed.findings        = [];
  if (!Array.isArray(parsed.correlations))    parsed.correlations    = [];
  if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];

  // Normalise each finding
  parsed.findings = parsed.findings.map(f => ({
    title:  f.title  || 'Untitled finding',
    detail: f.detail || '',
    risk:   (['HIGH','MEDIUM','LOW'].includes(String(f.risk).toUpperCase()))
              ? String(f.risk).toUpperCase() : 'MEDIUM'
  }));

  // Normalise each correlation
  parsed.correlations = parsed.correlations.map(c => ({
    feature:     c.feature     || 'unknown',
    strength:    (['STRONG','MODERATE','WEAK'].includes(String(c.strength).toUpperCase()))
                   ? String(c.strength).toUpperCase() : 'MODERATE',
    observation: c.observation || ''
  }));

  // Normalise each recommendation
  parsed.recommendations = parsed.recommendations.map(r => ({
    title:  r.title  || 'Recommendation',
    body:   r.body   || '',
    action: r.action || ''
  }));

  return parsed;
}

// ── runAudit ──────────────────────────────────────────────
//  Called by main.js: const result = await runAudit(state.csvText)
//  Returns the parsed audit object → renderResults(result, rows)

async function runAudit(csvData) {
  if (!csvData || !csvData.trim()) {
    throw new Error('No CSV data provided.');
  }

  // Trim very large files — keeps prompts fast and within free tier
  const MAX_CHARS = 15000;
  const csv = csvData.length > MAX_CHARS
    ? csvData.slice(0, MAX_CHARS) + '\n[Dataset trimmed to first 15,000 characters]'
    : csvData;

  const prompt = buildAuditPrompt(csv);
  const raw    = await callGemini(prompt);
  const result = parseAuditResponse(raw);

  return result;
}