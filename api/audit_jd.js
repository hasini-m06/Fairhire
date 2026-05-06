import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Vercel Serverless Function: auditJD
 * 
 * Analyzes Job Descriptions for exclusionary or biased language.
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { jdText } = req.body;
        if (!jdText) return res.status(400).json({ error: 'JD text is required.' });

        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
        Analyze this Job Description for bias, gendered language, and exclusionary requirements (e.g., unnecessarily high degree requirements that exclude diverse talent).
        
        JOB DESCRIPTION:
        ${jdText}
        
        RETURN ONLY JSON:
        {
          "bias_score": 0-100 (high means high bias),
          "biased_phrases": [
            { "phrase": "example", "reason": "why it is biased", "suggestion": "better alternative" }
          ],
          "accessibility_score": 0-100,
          "overall_verdict": "string"
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = JSON.parse(responseText.replace(/```json|```/gi, "").trim());
        
        return res.status(200).json(cleanJson);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
