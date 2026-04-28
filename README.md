# FairHire 2.0 — AI Hiring Bias Auditor
> Google Solution Challenge 2026 · BMSIT&M · SDG 8 + SDG 10

AI-powered hiring fairness auditor for Indian companies. Detects gender, college tier, and geographic bias using **Gemini 1.5 Pro**. Built to expose the hidden patterns that cause qualified candidates to be rejected before they're ever seen.

---

## What makes this different

| Feature | Most teams | FairHire |
|---------|-----------|----------|
| AI analysis | Generic API call | 3-stage audit (Detect → Label → Recommend) |
| Visualization | Table of results | Live bias heatmap (Gender × College Tier) |
| Output | Text on screen | Downloadable PDF audit report |
| Dataset | Generic CSV | India-specific (IIT/state college/metro bias) |
| Validation | Trust the AI blindly | DIR math cross-checks every AI finding |
| SDG alignment | Mentioned | Directly addressed in every recommendation |

---

## Tech stack

| Layer | Tech | Cost |
|-------|------|------|
| AI | Gemini 1.5 Pro (Google AI Studio) | Free — 2 req/min · 50 req/day |
| Hosting | Firebase Hosting (Google) | Free — Spark plan |
| Frontend | HTML + CSS + Vanilla JS | Free |
| PDF export | jsPDF 2.5 | Free |
| Fonts | Google Fonts (Syne, DM Sans, DM Mono) | Free |
| Charts | Chart.js | Free |

**Total infrastructure cost: $0**

---

## Project structure

```
fairhire/
├── index.html          # App shell — set window.GEMINI_KEY here
├── src/
│   ├── style.css       # Design tokens + all components
│   ├── data.js         # India hiring dataset + CSV parser + DIR math
│   ├── api.js          # Gemini 1.5 Pro audit engine
│   ├── heatmap.js      # Bias heatmap renderer
│   ├── render.js       # All DOM rendering functions
│   ├── export.js       # PDF report generator (jsPDF)
│   └── main.js         # App state + event listeners
├── firebase.json       # Firebase Hosting config
├── vite.config.js      # Vite build config
└── package.json
```

---

## Setup

### 1. Get a free Gemini API key
Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and create a key.
Free tier: **2 requests/min · 50 requests/day · $0**.

### 2. Add your key to index.html
Open `index.html` and find this line:
```html
<script>
  window.GEMINI_KEY = 'YOUR_GEMINI_API_KEY_HERE';
</script>
```
Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key.

> ⚠️ Never commit a real API key to GitHub. For production, use Firebase environment config or inject the key at deploy time via your CI/CD pipeline.

### 3. Run locally
No build step needed for development.

```bash
# Option A: VS Code Live Server
# Right-click index.html → Open with Live Server

# Option B: Vite dev server
npm install
npm run dev
```

### 4. Deploy to Firebase Hosting (Google)
```bash
npm install -g firebase-tools
firebase login
npm run build        # builds to /dist
firebase deploy
```

Your app will be live at `https://fairhire-23ab7.web.app`

---

## How the audit works

```
CSV upload
    │
    ▼
data.js — parseCSV() + computeDIR() (pure math, no AI)
    │
    ▼
api.js — buildAuditPrompt() → Gemini 1.5 Pro
    │
    ▼
parseAuditResponse() — validates + normalises JSON
    │
    ▼
render.js — renderResults() → 6 tabs of output
    │
    ├── Bias findings (Gemini)
    ├── Bias heatmap (Gender × College Tier)
    ├── Correlations (Gemini)
    ├── Recommendations (Gemini, SDG-aligned)
    ├── Full analysis (Gemini)
    └── Validation (DIR math cross-checks AI findings)
    │
    ▼
export.js — PDF report download (jsPDF)
```

### Validation layer (DIR)
FairHire does not trust AI blindly. Every Gemini finding is cross-checked against the **Disparate Impact Ratio (DIR)** computed purely from your CSV data:

- `DIR = hire_rate(disadvantaged group) ÷ hire_rate(advantaged group)`
- `DIR < 0.80` → fails the EEOC 80% Rule (legally discriminatory)
- `DIR < 0.50` → severe disparity

An **AI Trust Score** shows how many Gemini findings are confirmed by the math.

---

## SDG alignment

**SDG 8 — Decent Work and Economic Growth**
Biased hiring directly reduces economic opportunity for qualified candidates from non-elite backgrounds.

**SDG 10 — Reduced Inequalities**
College tier and gender bias in Indian hiring perpetuates structural inequality between IIT graduates and state college graduates, and between male and female candidates.

---

## The bias problem in India

- 73% of Indian recruiters admit college name influences shortlisting decisions
- Candidates from Tier 3 colleges are 2.4× more likely to be rejected at the same experience level
- Gender bias is most pronounced at the "culture fit" stage of interviews
- Referral-heavy hiring creates demographic echo chambers

FairHire audits these exact patterns and gives HR teams plain-language, actionable steps to fix them.