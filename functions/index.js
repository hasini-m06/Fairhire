const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. Tell Firebase we are using this secret
const geminiApiKey = defineSecret("GEMINI_API_KEY");

// 2. Bind the secret to the function
exports.runAudit = onCall({ 
    cors: true, 
    secrets: [geminiApiKey] 
}, async (request) => {
    try {
        const csvData = request.data.csvData;
        if (!csvData) {
            throw new HttpsError("invalid-argument", "CSV data is required.");
        }

        // 3. Initialize Gemini using the securely injected value
        const genAI = new GoogleGenerativeAI(geminiApiKey.value());
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        const prompt = `
        Analyze this hiring data for gender, location, and college tier bias. 
        Provide the output strictly in JSON format with keys: 'findings', 'recommendations'.
        Data: ${csvData}
        `;
        
        const result = await model.generateContent(prompt);
        return { result: result.response.text() };
        
    } catch (error) {
        console.error("AI Audit Error:", error);
        throw new HttpsError("internal", "Failed to process audit.");
    }
});