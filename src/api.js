const GEMINI_MODEL = 'gemini-1.5-pro';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function getApiKey() {
    // This looks for the key in your index.html script tag
    return window.GEMINI_KEY || ""; 
}

function buildAuditPrompt(csvData) {
    return `Audit this hiring dataset for bias. Return ONLY JSON.
    DATA: ${csvData}
    FORMAT: {"risk_score": 0, "dir_stats": "", "violations": [], "findings": [], "mitigation": ""}`;
}

export async function runAudit(csvData) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("MISSING_KEY: Paste your API key in index.html");

    const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: buildAuditPrompt(csvData) }] }],
            generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
        })
    });

    if (!response.ok) {
        const errData = await response.json();
        console.error("Gemini API Error:", errData); // THIS HELPS US DEBUG
        throw new Error(`API_ERROR: ${response.status}`);
    }

    const result = await response.json();
    const rawText = result.candidates[0].content.parts[0].text;
    return JSON.parse(rawText.replace(/```json|```/g, "").trim());
}