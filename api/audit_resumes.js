import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Vercel Serverless Function: auditResumes
 * 
 * Uses Gemini 1.5 Pro (Multimodal) to perform "Blind" resume analysis.
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { resumes } = req.body; // Array of { base64: string, mimeType: string }
        
        if (!resumes || !Array.isArray(resumes)) {
            return res.status(400).json({ error: 'Resumes array is required.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Prepare the multimodal prompt
        const prompt = `
        You are a Blind Hiring Auditor. Analyze these resumes and extract a skills-based profile for each.
        
        RULES:
        1. DO NOT extract Names, Photos, Gender, or Contact Info.
        2. Assign a 'Blind ID' to each (Candidate 1, 2, etc).
        3. Extract: Skills, Years of Exp, Highest Degree, and College Tier (1, 2, or 3).
        4. Detect potential bias indicators (e.g., career gaps that might be maternity leave).
        
        RETURN ONLY JSON:
        {
          "candidates": [
            {
              "blind_id": "Candidate 1",
              "skills": ["A", "B"],
              "exp_years": 5,
              "college_tier": "Tier 1",
              "highlights": "string",
              "bias_neutral_assessment": "string"
            }
          ],
          "batch_fairness_summary": "string"
        }
        `;

        // Convert base64 to Gemini-compatible parts
        const parts = resumes.map(r => ({
            inlineData: {
                data: r.base64,
                mimeType: r.mimeType || "application/pdf"
            }
        }));

        const result = await model.generateContent([prompt, ...parts]);
        const responseText = result.response.text();
        const cleanJson = JSON.parse(responseText.replace(/```json|```/gi, "").trim());
        
        return res.status(200).json(cleanJson);

    } catch (error) {
        console.error("Resume Audit Error:", error);
        return res.status(500).json({ error: 'Resume Audit failed: ' + error.message });
    }
}
