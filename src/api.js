const GEMINI_MODEL = 'gemini-flash-latest'; // Switch to Flash latest for 100% compatibility
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function getApiKey() {
    return import.meta.env.VITE_GEMINI_KEY || window.GEMINI_KEY || ""; 
}

function buildAuditPrompt(csvData) {
    return `Audit this hiring dataset for bias. Return ONLY JSON.
    DATA: ${csvData}
    FORMAT: {
      "risk_level": "HIGH | MEDIUM | LOW",
      "risk_summary": "Short verdict on fairness",
      "findings": [
        {
          "title": "Finding name",
          "detail": "Data-backed observation",
          "severity": "HIGH | MEDIUM | LOW"
        }
      ]
    }`;
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
        const errorMsg = errData?.error?.message || `API_ERROR: ${response.status}`;
        throw new Error(errorMsg);
    }

    const result = await response.json();
    const rawText = result.candidates[0]?.content?.parts[0]?.text;
    
    if (!rawText) {
        console.error("No text in response:", result);
        throw new Error("Invalid API Response format");
    }

    console.log("Raw Gemini Response:", rawText);
    
    // Fail-safe JSON cleaning
    const cleanJson = rawText.replace(/```json|```/gi, "").trim();
    let parsedData;
    try {
        parsedData = JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Error. Cleaned text:", cleanJson);
        throw new Error("Failed to parse Gemini output as JSON");
    }

    if (!Array.isArray(parsedData.findings)) {
        parsedData.findings = [];
    }
    
    return parsedData;
}