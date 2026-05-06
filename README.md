# FairHire — AI Hiring Bias Auditor

> Google Solution Challenge 2026 · BMSIT&M · Team Hashes  
> **SDG 8 — Decent Work and Economic Growth** | **SDG 10 — Reduced Inequalities**

FairHire is an AI-powered hiring fairness auditor built for Indian companies. It detects gender, college tier, and geographic bias hidden inside historical hiring data — using Google Gemini to surface the patterns that cause qualified candidates to be rejected before they're ever seen.

🔗 **Live Demo (Vercel):** [fairhire-virid.vercel.app](https://fairhire-virid.vercel.app/)  
🔗 **Live Demo (GitHub Pages):** [hasini-m06.github.io/Fairhire](https://hasini-m06.github.io/Fairhire/)

---

## The Problem

Hiring bias in India is systemic and largely invisible to the people perpetuating it:

- **Systemic Pedigree Bias**: Representation from Tier 3 colleges remains as low as 18% in traditional elite tech and finance firms, despite high technical competency ([Blind Talent Survey 2024](https://www.teamblind.com/)).
- **The Screening Bottleneck**: While 73% of recruiters claim to prioritize skills, institutional "brand tags" (IIT/NIT) remain the primary heuristic used to filter the initial 90% of applicants ([Unstop Talent Report 2025](https://unstop.com/talent-report-2025)).
- **Gender 'Culture Fit' Bias**: Gender disparity is most pronounced at the final interview stages, often masked as "culture fit," making it the hardest stage to audit without data.
- **Geographic Echo Chambers**: Referral-heavy hiring in metro hubs (Bangalore/NCR) creates demographic silos that exclude talented candidates from Tier 2/3 cities.

HR teams rarely have the tools to detect these patterns in their own data. FairHire changes that.

---

## What Makes This Different

| Feature | Typical approach | FairHire |
|---|---|---|
| AI analysis | Single generic prompt | 3-stage audit: Detect → Label → Recommend |
| Bias validation | Trust the AI blindly | DIR math cross-checks every AI finding |
| Visualization | Table of results | Live bias heatmap (Gender × College Tier) |
| Output | Text on screen | Downloadable PDF audit report |
| Dataset focus | Generic / global | India-specific (IIT/state college/metro bias) |
| SDG alignment | Mentioned in passing | Embedded in every recommendation |

---

## How It Works

Upload a CSV of your hiring data. FairHire runs a 3-stage pipeline:

```
CSV Upload
    │
    ▼
Data Layer — parseCSV() + computeDIR() (pure math, no AI)
    │
    ▼
AI Engine — Google Gemini 1.5 Pro (3-stage audit prompt)
    │
    ▼
Validation — DIR math cross-checks every Gemini finding
    │
    ▼
Output — 6-tab results dashboard + downloadable PDF report
```

### The 3-Stage Gemini Audit

1. **Detect** — Identify statistical anomalies across gender, college tier, location, and experience
2. **Label** — Classify each anomaly by bias type and severity (High / Medium / Low risk)
3. **Recommend** — Generate SDG-aligned, plain-language steps HR teams can act on immediately

### The Validation Layer (DIR)

FairHire does not trust AI output blindly. Every Gemini finding is cross-checked against the **Disparate Impact Ratio (DIR)** — computed directly from your CSV:

- `DIR = hire_rate(disadvantaged group) ÷ hire_rate(advantaged group)`
- `DIR < 0.80` → fails the EEOC 80% Rule (considered legally discriminatory)
- `DIR < 0.50` → severe disparity

An **AI Trust Score** shows how many of Gemini's findings are confirmed by the math.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| AI | Google Gemini 1.5 Pro | Via Google AI Studio API |
| Hosting | GitHub Pages | Free, zero config |
| Frontend | HTML + CSS + Vanilla JS | No framework needed |
| PDF Export | jsPDF 2.5 | Client-side PDF generation |
| Fonts | Google Fonts (Syne, DM Sans, DM Mono) | |

**Total infrastructure cost: $0**

---

## Project Structure

```
fairhire/
├── index.html        # Production Dashboard
├── src/
│   ├── style.css     # Design System & UI Components
│   ├── data.js       # Demo Datasets
│   ├── api.js        # Backend Proxy (calls Firebase)
│   ├── validation.js # DIR Math Engine (80% Rule Validation)
│   ├── heatmap.js    # Bias Heatmap Component
│   ├── render.js     # UI Orchestrator
│   ├── export.js     # PDF Export Engine
│   └── main.js       # App State & Controller
├── functions/        # Secure Backend (Firebase Cloud Functions)
└── README.md
```

---

## Running Locally

No build step required.

**Option A — VS Code Live Server:**
1. Install the Live Server extension in VS Code
2. Right-click `index.html` → Open with Live Server

**Option B — Python simple server:**
```bash
python -m http.server 8000
# Open http://localhost:8000
```

### Option C — Vercel Deployment (Recommended)

1. **Push to GitHub**: Push your code to a GitHub repository.
2. **Import to Vercel**: Connect your repo to [Vercel](https://vercel.com/).
3. **Set Environment Variables**: 
   - Go to Project Settings → Environment Variables.
   - Add `GEMINI_API_KEY` with your key from [AI Studio](https://aistudio.google.com/app/apikey).
4. **Deploy**: Vercel will automatically detect Vite and the `/api` directory.

### API Key Setup

1. Get a free Gemini API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)  
2. For local development, create a `.env` file in the root:
```env
GEMINI_API_KEY=your_key_here
```
3. For production, set the key as an environment variable in your hosting provider (Vercel/Firebase).

---

## SDG Alignment

**SDG 8 — Decent Work and Economic Growth**  
Biased hiring directly reduces economic opportunity for qualified candidates from non-elite colleges and underrepresented groups. FairHire gives HR teams the evidence they need to build more merit-based pipelines.

**SDG 10 — Reduced Inequalities**  
The college tier divide in Indian hiring (IIT vs. state colleges) and persistent gender gaps at the screening stage perpetuate structural inequality. FairHire makes these patterns visible and actionable.

---

## Future Scope

The current version audits historical hiring data via CSV. The roadmap includes:

- **Real-time resume parsing** — Upload candidate resumes directly; Gemini extracts skills and flags PII for anonymization before scoring
- **Codeforces & LeetCode integration** — Pull verified competitive programming ratings to objectively validate technical skill claims
- **GitHub activity verification** — Cross-reference claimed experience against real repository contributions and commit history
- **Automated interview scheduling** — Let recruiters book interviews with top-ranked, anonymized candidates directly from the dashboard
- **Bias trend reports** — Track how a company's diversity and merit-based hiring metrics improve over time
- **Deepfake & profile authenticity detection** — Verify submitted media and portfolio links are genuine
- **Multi-platform developer scraper** — Extend skill verification to Kaggle, Dev.to, Stack Overflow, and regional contest platforms
- **Cloud deployment** — Migrate from GitHub Pages to a scalable backend (GCP Cloud Run) to support enterprise-scale data volumes and secure multi-user access

---

## Team

**Team Hashes** · BMSIT&M, Bengaluru  
Team Leader: Hasini M  
Google Solution Challenge 2026

---

## License

MIT