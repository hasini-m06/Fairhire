import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Vercel Serverless Function: runAudit
 * 
 * Securely handles Gemini 1.5 Pro calls using environment variables.
 */

export default async function handler(req, res) {
    // 0. Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // In production, replace with your github.io URL
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 1. Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { csvData } = req.body;
        
        if (!csvData) {
            return res.status(400).json({ error: 'CSV data is required.' });
        }

        // 2. Get API Key from environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API Key not configured on Vercel.' });
        }

        // 3. Initialize Gemini
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
        
        DATA:
        ${csvData}
        
        RETURN ONLY JSON in this format:
        {
          "risk_level": "HIGH | MEDIUM | LOW",
          "risk_summary": "One sentence verdict on fairness",
          "findings": [
            {
              "title": "Finding name",
              "detail": "Data-backed observation",
              "severity": "HIGH | MEDIUM | LOW"
            }
          ],
          "recommendations": [
            {
              "title": "Action item",
              "sdg": "SDG 8 or SDG 10",
              "description": "Concrete step for HR"
            }
          ]
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean and parse
        const cleanJson = JSON.parse(responseText.replace(/```json|```/gi, "").trim());
        
        return res.status(200).json(cleanJson);

    } catch (error) {
        console.error("Vercel Audit Error:", error);
        return res.status(500).json({ error: 'Audit failed: ' + error.message });
    }
}
