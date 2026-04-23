// ── Gemini Audit Prompts (Steps A, B, C from the guide) ────
//
//  Prompt A  →  bias detection + correlation analysis
//  Prompt B  →  fairness risk label + findings
//  Prompt C  →  actionable recommendations
//
//  All three are combined into one structured API call so Gemini
//  returns a single JSON object the UI can render directly.

async function runGeminiAudit(csvText) {
  const { headers, rows } = parseCSV(csvText);

  // Limit to 15 rows for the API call (enough to detect patterns)
  const sample = rows.slice(0, 15);
  const sampleText = [
    headers.join(','),
    ...sample.map(r => headers.map(h => r[h]).join(','))
  ].join('\n');

  // ── PROMPT A: Bias Detection ──────────────────────────────
  const promptA = `You are a hiring fairness auditor. Analyze this candidate dataset for systemic bias.

Dataset:
${sampleText}

Focus on: gender bias, college tier bias, geographic bias, and how these features
correlate with hiring outcomes (the "hired" column).`;

  // ── PROMPT B: Fairness Label ──────────────────────────────
  const promptB = `Based on your analysis, assign a Fairness Risk Level: LOW / MEDIUM / HIGH.
Identify the top 3 bias findings in plain English that a non-technical HR manager can act on.`;

  // ── PROMPT C: Recommendations ────────────────────────────
  const promptC = `Suggest 3 concrete, actionable changes this company can make to reduce the bias found.
Each recommendation must include a specific implementation step.`;

  // ── Combined structured prompt ────────────────────────────
  const fullPrompt = `${promptA}

${promptB}

${promptC}

Respond ONLY with a valid JSON object. No markdown, no backticks, no extra text.
Use exactly this structure:
{
  "risk_level": "HIGH",
  "risk_summary": "One sentence summary of the biggest fairness risk",
  "findings": [
    { "title": "short bias name", "detail": "plain English explanation", "risk": "HIGH" },
    { "title": "...", "detail": "...", "risk": "MEDIUM" },
    { "title": "...", "detail": "...", "risk": "LOW" }
  ],
  "correlations": [
    { "feature": "column name", "strength": "High", "observation": "pattern found" },
    { "feature": "...", "strength": "Medium", "observation": "..." },
    { "feature": "...", "strength": "Variable", "observation": "..." },
    { "feature": "...", "strength": "VeryHigh", "observation": "..." }
  ],
  "recommendations": [
    { "title": "action name", "body": "why this helps", "action": "specific step to take" },
    { "title": "...", "body": "...", "action": "..." },
    { "title": "...", "body": "...", "action": "..." }
  ],
  "raw_analysis": "2-3 paragraphs of detailed technical analysis of the patterns found"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      messages: [{ role: 'user', content: fullPrompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content.map(block => block.text || '').join('');
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
