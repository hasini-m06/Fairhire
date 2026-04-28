const GEMINI_MODEL = 'gemini-1.5-pro';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function getApiKey() {
    return window.GEMINI_KEY || null; 
}

function buildAuditPrompt(csvData) {
    return `You are the World-Class AI Bias Auditor. 
    Your mission: Scrutinize the provided dataset for systemic discrimination and hidden algorithmic bias.

    DATASET FOR AUDIT:
    ${csvData}

    AUDIT PARAMETERS:
    1. DISPARATE IMPACT: Apply the 80% Rule (Four-Fifths Rule). Flag any protected group (Gender, Ethnicity, Age, Socioeconomic background) receiving favorable outcomes at a rate less than 80% of the highest group.
    2. PROXY DETECTION: Identify 'Neutral' variables acting as proxies for protected classes (e.g., Zip Code as a proxy for Race).
    3. GLOBAL STANDARDS: Audit based on UN Human Rights principles and SDG 10 (Reduced Inequalities).
    
    OUTPUT REQUIREMENTS:
    Return ONLY a JSON object. Clinical tone. No fluff.
    {
        "risk_level": "CRITICAL | HIGH | MEDIUM | LOW",
        "risk_summary": "High-level summary of the ethical integrity of this system.",
        "findings": [{"title": "Finding Name", "detail": "Statistical evidence of bias.", "severity": "HIGH/LOW"}],
        "recommendations": [{"title": "Mitigation Strategy", "body": "How to de-bias this model.", "action": "Immediate technical fix."}],
        "raw_analysis": "Deep-dive technical breakdown of correlation coefficients and bias vectors."
    }`;
}

export async function runAudit(csvData) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key Missing! Update index.html.");
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
    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(raw);
}