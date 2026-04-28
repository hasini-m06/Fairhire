# FairHire 2.0 — AI Hiring Bias Auditor
> Google Solution Challenge 2026 · BMSIT&M · SDG 8 + SDG 10

AI-powered hiring fairness auditor for Indian companies. Detects gender, college tier, and geographic bias using Gemini 1.5 Pro. Built to expose the hidden patterns that cause qualified candidates to be rejected before they're ever seen.

---

## What makes this different

| Feature | Most teams | FairHire |
|---------|-----------|----------|
| AI analysis | Generic API call | 3-stage audit (Detect → Label → Recommend) |
| Visualization | Table of results | Live bias heatmap (Gender × College Tier) |
| Output | Text on screen | Downloadable PDF audit report |
| Dataset | Generic CSV | India-specific (IIT/state college/metro bias) |
| SDG alignment | Mentioned | Directly addressed in every recommendation |

---

## Project structure

```
fairhire/
├── index.html          # Semantic markup, zero inline styles
├── src/
│   ├── style.css       # Design tokens + all components
│   ├── data.js         # India hiring dataset + CSV parser + heatmap math
│   ├── api.js          # Gemini audit engine (Prompts A, B, C)
│   ├── heatmap.js      # Bias heatmap renderer
│   ├── render.js       # All DOM rendering functions
│   ├── export.js       # PDF report generator (jsPDF)
│   └── main.js         # App state + event listeners
└── README.md
```

## Running locally

No build step needed.

1. Install **Live Server** extension in VS Code
2. Right-click `index.html` → Open with Live Server

## Deploying to Firebase

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# set public directory to "." when prompted
# say No to single-page app rewrite
firebase deploy
```

Your app will be live at `https://your-project.web.app`

## API & Backend Setup
FairHire uses a dedicated Python/FastAPI backend to securely handle Google Gemini API calls, preventing frontend key exposure.
For your own Firebase deployment, add your key in `src/api.js`:

> Never commit API keys to GitHub. Use Firebase environment config or a backend proxy.

## Tech stack

| Layer | Tech |
|-------|------|
| AI | Gemini 1.5 Pro (Anthropic API) |
| Visualization | Vanilla JS heatmap (no library needed) |
| PDF export | jsPDF 2.5 |
| Hosting | Firebase Hosting |
| Frontend | HTML + CSS + Vanilla JS (no framework) |
| Fonts | Syne (display) · DM Sans (body) · DM Mono (code) |

## SDG alignment

**SDG 8 — Decent Work and Economic Growth**
Biased hiring directly reduces economic opportunity for qualified candidates from non-elite backgrounds.

**SDG 10 — Reduced Inequalities**
College tier and gender bias in Indian hiring perpetuates structural inequality between IIT graduates and state college graduates, and between male and female candidates.

## The bias problem in India

- 73% of Indian recruiters admit college name influences shortlisting decisions
- Candidates from Tier 3 colleges are 2.4× more likely to be rejected at the same experience level
- Gender bias is most pronounced at the "culture fit" stage of interviews
- Referral-heavy hiring creates demographic echo chambers

FairHire audits these exact patterns and gives HR teams plain-language, actionable steps to fix them.
