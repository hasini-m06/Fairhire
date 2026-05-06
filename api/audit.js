import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Vercel Serverless Function: runAudit
 * 
 * Securely handles Gemini 1.5 Pro calls with Confidence Scoring.
 */

export default async function handler(req, res) {
    // 0. Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { csvData } = req.body;
        if (!csvData) return res.status(400).json({ error: 'CSV data is required.' });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'API Key not configured.' });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        const prompt = `
        Audit this hiring dataset for bias. Focus on Gender, College Tier, and Location patterns.
        DATA (Anonymized):
        ${csvData}
        
        CRITICAL: Provide a "confidence_score" (0-100) for each finding based on data density.
        
        RETURN ONLY JSON:
        {
          "risk_level": "HIGH | MEDIUM | LOW",
          "risk_summary": "One sentence verdict",
          "findings": [
            {
              "title": "Finding name",
              "detail": "Data-backed observation",
              "severity": "HIGH | MEDIUM | LOW",
              "confidence_score": 85
            }
          ],
          "recommendations": [
            {
              "title": "Action item",
              "sdg": "SDG 8 or SDG 10",
              "description": "Concrete step"
            }
          ]
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = JSON.parse(responseText.replace(/```json|```/gi, "").trim());
        
        return res.status(200).json(cleanJson);

    } catch (error) {
        console.error("Audit Error:", error);
        return res.status(500).json({ error: 'Audit failed: ' + error.message });
    }
}
