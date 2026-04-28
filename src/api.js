/**
 * FairHire | Advanced Algorithmic Forensic Engine
 * Implements: EEOC Four-Fifths Rule & Disparate Impact Analysis
 */

const GEMINI_MODEL = 'gemini-1.5-pro';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function getApiKey() {
    return window.GEMINI_KEY || import.meta.env.VITE_GEMINI_KEY;
}

function buildAuditPrompt(csvData) {
    return `You are a Senior AI Ethics Auditor. You are performing a formal forensic audit on a hiring algorithm's output.

DATASET:
${csvData}

AUDIT PROTOCOL:
1. CALCULATE DISPARATE IMPACT RATIO (DIR): 
   - Identify the majority group (highest hire rate).
   - Identify protected groups (Gender, Tier-3 Colleges, Rural Locations).
   - If (Protected Group Hire Rate / Majority Group Hire Rate) < 0.8, flag as VIOLATION of the Four-Fifths Rule.

2. PROXY BIAS ANALYSIS:
   - Check if 'Years of Experience' is being used to mask 'Ageism'.
   - Check if 'Candidate Address' is a proxy for 'Socioeconomic Status'.

3. QUALITATIVE ETHICS:
   - Cross-reference findings with SDG 10.2 (Promote social, economic, and political inclusion).

OUTPUT STRUCTURE (Strict JSON):
{
    "risk_score": 0-100,
    "dir_stats": "Detailed math showing the hire rates per group.",
    "violations": [{"group": "string", "ratio": "number", "status": "FAIL/PASS"}],
    "findings": [{"title": "string", "impact": "HIGH/MED", "analysis": "string"}],
    "mitigation": "Technical strategy to de-bias the weights."
}`;
}

export async function runAudit(csvData) {
    const apiKey = getApiKey();
    const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: buildAuditPrompt(csvData) }] }],
            generationConfig: { 
                temperature: 0.1, 
                responseMimeType: "application/json" 
            }
        })
    });

    if (!response.ok) throw new Error("Auditor Offline - Check API Key");

    const result = await response.json();
    return JSON.parse(result.candidates[0].content.parts[0].text);
}