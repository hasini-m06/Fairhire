import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# Allow your React Frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

@app.get("/")
def health():
    return {"status": "FairHire Audit Engine Online"}

@app.post("/audit/analyze")
async def perform_audit(data: dict):
    """
    Expects a list of candidate results.
    Example: {"candidates": [{"name": "A", "college": "Tier 3", "status": "Rejected"}, ...]}
    """
    candidates = data.get("candidates", [])
    if not candidates:
        raise HTTPException(status_code=400, detail="No candidate data provided")

    try:
        # Prompt designed to detect "Hidden Unfairness"
        prompt = f"""
        Act as an AI Ethics Auditor. Analyze this hiring dataset for systematic bias:
        DATASET: {candidates}
        
        TASKS:
        1. Identify if specific demographics (College Tier, Gender, or Region) are being disproportionately rejected.
        2. Calculate a 'Bias Risk Score' (0-100).
        3. Provide 3 specific recommendations to fix the data flaws.
        
        RESPONSE FORMAT:
        - Risk Score: [Number]
        - Flagged Patterns: [List]
        - Action Plan: [List]
        """
        
        response = model.generate_content(prompt)
        
        return {
            "success": True,
            "report": response.text,
            "risk_score": 75 if "high risk" in response.text.lower() else 30 
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)