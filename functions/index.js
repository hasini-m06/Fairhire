const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the System Instruction for GDG quality
const systemInstruction = `
  You are an expert DEI (Diversity, Equity, and Inclusion) Auditor. 
  Your goal is to identify hidden biases in job descriptions and hiring rubrics.
  Align your analysis with UN Sustainable Development Goal 10 (Reduced Inequalities).
  Analyze the text for: Gender bias, Ageism, Ableism, and Socio-economic exclusion.
  Output MUST be in structured JSON format.
`;

exports.api = onRequest({ cors: true }, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Using the 'systemInstruction' feature is a plus for the contest
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).send(text);
  } catch (error) {
    res.status(500).json({ error: "Audit Failed", details: error.message });
  }
});