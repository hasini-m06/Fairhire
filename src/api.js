const GEMINI_MODEL = 'gemini-1.5-flash'; // Switch to Flash for 100% compatibility
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function getApiKey() {
    return window.GEMINI_KEY || ""; 
}

function buildAuditPrompt(csvData) {
    return `Audit this hiring dataset for bias. Return ONLY JSON.
    DATA: ${csvData}
    FORMAT: {"risk_score": 0, "dir_stats": "string", "violations": [], "findings": [], "mitigation": "string"}`;
}

export async function runAudit(csvData) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("MISSING_KEY: Check index.html");

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

    if (!response.ok) {
        const errData = await response.json();
        console.error("API ERROR:", errData);
        throw new Error(`API_ERROR: ${response.status}`);
    }

    const result = await response.json();
    const rawText = result.candidates[0].content.parts[0].text;
    
    // Fail-safe JSON cleaning
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
}