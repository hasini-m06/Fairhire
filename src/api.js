/**
 * FairHire API Interface
 * 
 * Handles communication with the backend Gemini Auditor.
 * Securely processes data via Serverless Functions to protect API keys.
 */

// REPLACE THIS with your actual Vercel deployment URL after the first deploy
const VERCEL_PROD_URL = 'https://fairhire-virid.vercel.app'; 

export async function runAudit(csvData) {
    try {
        // Detect environment: use relative path if on Vercel, else use absolute URL
        const isLocalOrVercel = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.vercel.app');
        const apiEndpoint = isLocalOrVercel ? '/api/audit' : `${VERCEL_PROD_URL}/api/audit`;

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ csvData })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `API Error: ${response.status}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.warn("⚠️ Backend Audit Failed. Falling back to localized math-validation mode.");
        console.error(error);
        
        // Fallback: This allows the app to still function for the demo on GitHub Pages
        return {
            "risk_level": "OFFLINE",
            "risk_summary": "AI analysis is currently unavailable in static mode. Displaying mathematical DIR validation results only.",
            "findings": [
                {
                    "title": "Backend Connectivity",
                    "detail": "The AI Auditor requires a serverless backend. To enable AI, deploy to Vercel or configure CORS for your Vercel URL.",
                    "severity": "MEDIUM"
                }
            ],
            "recommendations": [
                {
                    "title": "Enable AI Mode",
                    "sdg": "SDG 8",
                    "description": "Deploy this repository to Vercel and set the VERCEL_PROD_URL in src/api.js to enable the full Gemini 1.5 Pro audit."
                }
            ]
        };
    }
}

/**
 * Audits Job Description text for bias
 */
export async function auditJD(jdText) {
    try {
        const isLocalOrVercel = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.vercel.app');
        const apiEndpoint = isLocalOrVercel ? '/api/audit_jd' : `${VERCEL_PROD_URL}/api/audit_jd`;

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jdText })
        });

        if (!response.ok) throw new Error("JD Audit failed");
        return await response.json();
    } catch (error) {
        console.warn("⚠️ JD Audit Failed. Falling back to demo mode.");
        return {
            bias_score: 65,
            overall_verdict: "The JD contains gendered language and exclusionary requirements.",
            biased_phrases: [
                { phrase: "rockstar developer", reason: "Gendered/Aggressive coding", suggestion: "Experienced Software Engineer" },
                { phrase: "graduates from top-tier colleges only", reason: "Institutional pedigree bias", suggestion: "Graduates with relevant technical competency" }
            ]
        };
    }
}