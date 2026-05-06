# FairHire: The Multimodal Fairness Infrastructure ⚖️

**Google Solution Challenge 2026 | UN SDGs 8 & 10**

FairHire is an enterprise-grade infrastructure solution designed to eliminate systemic bias from the global hiring pipeline. Unlike simple audit dashboards, FairHire provides a **Live Fairness Ledger** that combines Multimodal AI, Cryptographic Privacy, and Statistical Rigor to ensure every candidate is evaluated strictly on merit.

---

## 🚀 Core Features (v2.3 Production)

### 1. 🔍 Multimodal Resume Auditor (Blind Hiring)
Utilizing **Gemini 1.5 Pro’s Vision capabilities**, FairHire performs real-time identity redaction on PDF resumes. It extracts skills, experience, and projects while shielding PII (Personally Identifiable Information) to create a **Blind Talent Pool**.

### 2. 📊 Global Fairness Ledger (PostgreSQL)
Powered by **Firebase Data Connect**, our decentralized benchmarking system allows companies to compare their **Disparate Impact Ratio (DIR)** against anonymized industry averages. It’s not just an audit; it’s a global transparency standard.

### 3. 🛡️ AI Security & Sanitization
The first hiring tool to implement **Pre-flight AI Sanitization**. Every dataset and resume is pre-scanned by **Gemini 1.5 Flash** to detect and block "Prompt Injection" attacks, ensuring the auditor cannot be manipulated.

### 4. 📉 Statistical Rigor (Wilson Score)
We don't just report percentages. FairHire calculates **Statistical Certainty**. If an audit sample is too small (N < 5), the system flags it as "Unreliable," preventing false conclusions based on insufficient data.

---

## 🛠️ Technical Architecture

| Component | Technology |
| :--- | :--- |
| **Intelligence** | Gemini 1.5 Pro (Multimodal) & 1.5 Flash |
| **Persistence** | Firebase Data Connect (Cloud SQL for PostgreSQL) |
| **Backend** | Vercel Serverless Functions (Node.js) |
| **Security** | SHA-256 Client-side Hashing & AI Sanitization |
| **UI/UX** | Premium Glassmorphism (Syne & DM Sans Typography) |

---

## 🌍 UN SDG Impact

- **SDG 8 (Decent Work)**: Promoting merit-based access to productive employment.
- **SDG 10 (Reduced Inequalities)**: Identifying and correcting institutional bias in hiring.

---

## 🔮 Future Roadmap (The "Elite Tier" Vision)

While the current version provides a complete auditing ecosystem, our roadmap for the next 12 months includes:

*   **Verified Skill Integration**: Pulling live ratings from **Codeforces & LeetCode** to objectively validate technical claims.
*   **GitHub Activity Verification**: Cross-referencing experience against real repository contributions and commit history.
*   **Automated Scheduling**: Allowing recruiters to book interviews with top-ranked, anonymized candidates directly from the portal.
*   **Deepfake Detection**: Implementing AI to verify the authenticity of portfolio media and video introductions.
*   **Multi-platform Scraper**: Extending verification to Kaggle, Dev.to, and Stack Overflow.

---

## 🏗️ Getting Started

1. Clone the repo: `git clone https://github.com/hasini-m06/Fairhire.git`
2. Install dependencies: `npm install`
3. Setup environment variables: Create a `.env` with `GEMINI_API_KEY`.
4. Deploy to Vercel: `vercel`
5. Provision PostgreSQL: `firebase init dataconnect`

**Developed for the 2026 Google Solution Challenge.**