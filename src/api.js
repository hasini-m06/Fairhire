// ── FairHire Audit Engine ─────────────────────────────────
//
//  Three-stage audit matching the 6-step guide:
//
//  Prompt A  →  Bias Detection (patterns in data)
//  Prompt B  →  Fairness Label (risk level + findings)
//  Prompt C  →  Recommendations (concrete HR actions)
//
//  All three are composed into one structured call so Gemini
//  returns a single JSON object the UI renders directly.

async function runAudit(csvText) {
  const { headers, rows } = parseCSV(csvText);

  // Use up to 20 rows — enough to detect patterns without token bloat
  const sample = rows.slice(0, 20);
  const sampleCSV = [
    headers.join(','),
    ...sample.map(r => headers.map(h => r[h]).join(','))
  ].join('\n');

  // ── Prompt A: Bias Detection ──────────────────────────────
  // Identifies which features correlate with rejection outcomes
  const promptA = `
You are a senior hiring fairness researcher specializing in Indian tech company bias.
Analyze this candidate dataset for systemic discrimination patterns.

Dataset (${sample.length} candidates):
${sampleCSV}

Pay close attention to:
1. Gender × hired outcome correlation
2. college_tier × hired outcome (Tier 1 = IIT/IISc/NIT, Tier 2 = state colleges, Tier 3 = private/lesser-known)
3. location bias (metros like Bangalore/Mumbai/Delhi vs smaller cities)
4. Whether years_exp actually predicts hiring or if protected characteristics override it
`;

  // ── Prompt B: Fairness Label ──────────────────────────────
  // Produces a structured risk assessment with named bias patterns
  const promptB = `
Based on the analysis above, generate a Fairness Risk Level (LOW / MEDIUM / HIGH).
Identify the 3 most critical bias patterns in plain English that a non-technical HR manager
in an Indian company would immediately understand and recognize.

Each finding must name the specific bias pattern (e.g. "Prestige Trap", "Metro Privilege"),
explain what data supports it, and state the real-world harm it causes.
`;

  // ── Prompt C: Recommendations ────────────────────────────
  // Concrete, India-specific HR interventions
  const promptC = `
Recommend 3 concrete interventions this company can implement within 30 days.
Each must be:
- Specific to the Indian hiring context
- Actionable by an HR team without technical resources
- Tied directly to one of the bias patterns identified above
`;

  // ── Combined structured prompt ────────────────────────────
  const fullPrompt = `${promptA}

${promptB}

${promptC}

Respond ONLY with a valid JSON object. No markdown fences, no preamble, no trailing text.
Follow this exact schema:

{
  "risk_level": "HIGH",
  "risk_summary": "One sentence describing the single biggest fairness risk in this dataset",
  "findings": [
    {
      "title": "Pattern name (e.g. Prestige Trap)",
      "detail": "2-3 sentences explaining the pattern and its real-world harm",
      "risk": "HIGH"
    },
    { "title": "...", "detail": "...", "risk": "MEDIUM" },
    { "title": "...", "detail": "...", "risk": "LOW" }
  ],
  "correlations": [
    {
      "feature": "column name",
      "strength": "VeryHigh",
      "observation": "specific pattern observed in the data"
    },
    { "feature": "...", "strength": "High", "observation": "..." },
    { "feature": "...", "strength": "Medium", "observation": "..." },
    { "feature": "...", "strength": "Variable", "observation": "..." }
  ],
  "recommendations": [
    {
      "title": "Action name",
      "body": "Why this intervention addresses the bias found",
      "action": "Specific implementation step the HR team takes this week"
    },
    { "title": "...", "body": "...", "action": "..." },
    { "title": "...", "body": "...", "action": "..." }
  ],
  "raw_analysis": "3 paragraphs of detailed technical analysis covering statistical patterns, root causes, and systemic risks"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: fullPrompt }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API ${response.status}: ${err}`);
  }

  const data = await response.json();
  const rawText = data.content.map(b => b.text || '').join('');
  const clean = rawText.replace(/```json\s*|```\s*/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error('Failed to parse API response:', clean);
    throw new Error('Could not parse Gemini response. Check console.');
  }
}
