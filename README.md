# FairHire — AI Hiring Bias Auditor ⚖️

> Google Solution Challenge 2026 · BMSIT&M · Team Hashes  
> **SDG 8 — Decent Work and Economic Growth** | **SDG 10 — Reduced Inequalities**

FairHire is an enterprise-grade hiring fairness infrastructure built to eliminate systemic bias from the global hiring pipeline. It detects gender, college tier, and geographic bias hidden inside both structured (CSV) and unstructured (PDF) data — using **Google Gemini 1.5 Pro** and **Firebase Data Connect** to ensure every candidate is evaluated strictly on merit.

🔗 **Live Demo (Vercel):** [fairhire-virid.vercel.app](https://fairhire-virid.vercel.app/)  
🔗 **Live Demo (GitHub Pages):** [hasini-m06.github.io/Fairhire](https://hasini-m06.github.io/Fairhire/)

---

## 🛑 The Problem

Hiring bias in India is systemic and largely invisible to the people perpetuating it:

- **Systemic Pedigree Bias**: Representation from Tier 3 colleges remains as low as 18% in traditional elite tech and finance firms, despite high technical competency ([Blind Talent Survey 2024](https://www.teamblind.com/)).
- **The Screening Bottleneck**: While 73% of recruiters claim to prioritize skills, institutional "brand tags" (IIT/NIT) remain the primary heuristic used to filter the initial 90% of applicants ([Unstop Talent Report 2025](https://unstop.com/talent-report-2025)).
- **Gender 'Culture Fit' Bias**: Gender disparity is most pronounced at the final interview stages, often masked as "culture fit," making it the hardest stage to audit without data.
- **Geographic Echo Chambers**: Referral-heavy hiring in metro hubs (Bangalore/NCR) creates demographic silos that exclude talented candidates from Tier 2/3 cities.

---

## 🚀 Key Features (v2.3 Production)

### 1. 🔍 Multimodal Resume Auditor (Blind Hiring)
Utilizing **Gemini 1.5 Pro’s native Vision capabilities**, FairHire performs real-time identity redaction on PDF resumes. It extracts skills, experience, and projects while shielding PII (Personally Identifiable Information) to create a **Blind Talent Pool** where candidates are judged solely on competency.

### 2. 📊 Global Fairness Ledger (PostgreSQL)
Powered by **Firebase Data Connect (Cloud SQL)**, our decentralized benchmarking system allows companies to compare their **Disparate Impact Ratio (DIR)** against anonymized industry averages. This transforms fairness from a "checkbox" into a measurable global standard.

### 3. 🛡️ AI Security & Sanitization
The first hiring tool to implement **Pre-flight AI Sanitization**. Every dataset and resume is pre-scanned by **Gemini 1.5 Flash** to detect and block "Prompt Injection" attacks, ensuring candidates cannot bypass the audit using malicious hidden instructions.

### 4. 📉 Statistical Rigor (Wilson Score)
We don't just trust AI blindly. FairHire calculates **Statistical Certainty**. If an audit sample is too small (N < 5), the system flags it as "Unreliable," ensuring that data-driven decisions are made on statistically significant samples.

---

## 🛠️ How It Works

FairHire runs a secure 3-stage pipeline:

```
Data Input (CSV / PDF Resumes)
    │
    ▼
Security Layer — Gemini 1.5 Flash Sanitization (Anti-Prompt Injection)
    │
    ▼
Anonymization — Client-side SHA-256 Cryptographic Hashing
    │
    ▼
AI Engine — Gemini 1.5 Pro (Multimodal Audit & Skills Extraction)
    │
    ▼
Validation — DIR Math (80% Rule) + Wilson Score (Certainty Check)
    │
    ▼
Output — 7-tab results dashboard + Live Industry Benchmarking
```

### The Validation Layer (DIR)
FairHire cross-checks every Gemini finding against the **Disparate Impact Ratio (DIR)**:
- `DIR = hire_rate(disadvantaged group) ÷ hire_rate(advantaged group)`
- `DIR < 0.80` → Fails the EEOC 80% Rule (Legally Discriminatory).
- `DIR < 0.50` → Severe Disparity detected.

---

## 💻 Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **AI Intelligence** | Google Gemini 1.5 Pro & Flash | Vision, Multimodal, & Sanitization |
| **Persistence** | Firebase Data Connect | PostgreSQL on Cloud SQL |
| **Hosting** | Vercel | Scalable Serverless Backend |
| **Security** | Crypto Subtle API | Client-side SHA-256 Hashing |
| **UI/UX** | Vanilla JS + Glassmorphism | Syne & DM Sans Typography |

---

## 🏗️ Running Locally

1. **Clone the repo**:
   ```bash
   git clone https://github.com/hasini-m06/Fairhire.git
   ```
2. **Setup Environment**: Create a `.env` file with your `GEMINI_API_KEY`.
3. **Provision Data Connect**:
   ```bash
   firebase init dataconnect
   firebase deploy --only dataconnect
   ```
4. **Deploy Backend**: Connect the repo to Vercel and map the API key.

---

## 🔮 Future Roadmap (The Vision)

*   **Verified Skill Integration**: Pulling live ratings from **Codeforces & LeetCode** to objectively validate technical claims.
*   **GitHub Activity Verification**: Cross-referencing experience against real repository contributions and commit history.
*   **Automated Scheduling**: Allowing recruiters to book interviews with top-ranked, anonymized candidates directly from the portal.
*   **Deepfake Detection**: Implementing AI to verify the authenticity of portfolio media and video introductions.

---

## 🌍 SDG Alignment

**SDG 8 — Decent Work and Economic Growth**  
Biased hiring reduces opportunity for qualified candidates from non-elite colleges. FairHire gives HR teams the evidence needed to build merit-based pipelines.

**SDG 10 — Reduced Inequalities**  
The college tier divide (IIT vs. state colleges) perpetuates structural inequality. FairHire makes these patterns visible and actionable.

---

## 👥 Team
**Team Hashes** · BMSIT&M, Bengaluru  
Team Leader: Hasini M  
Google Solution Challenge 2026