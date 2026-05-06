const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Define secret for the API Key
const geminiApiKey = defineSecret("GEMINI_API_KEY");

exports.runAudit = onCall({ 
    cors: true, 
    secrets: [geminiApiKey] 
}, async (request) => {
    try {
        const csvData = request.data.csvData;
        if (!csvData) {
            throw new HttpsError("invalid-argument", "CSV data is required.");
        }

        // Initialize Gemini 1.5 Pro (as per README commitment)
        const genAI = new GoogleGenerativeAI(geminiApiKey.value());
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
        
        // Ensure we return a clean JSON object
        return JSON.parse(responseText.replace(/```json|```/gi, "").trim());
        
    } catch (error) {
        console.error("AI Audit Error:", error);
        throw new HttpsError("internal", "Audit failed: " + error.message);
    }
});