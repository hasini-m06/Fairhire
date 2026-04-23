# FairHire — AI Hiring Bias Auditor
> Solution Challenge 2026 · Built with Vanilla JS + Anthropic API

Detects gender, college tier, and geographic bias in hiring datasets using AI. Upload a CSV, get a plain-English fairness audit in seconds.

---

## Project structure

```
fairhire/
├── index.html          # Entry point + markup
├── src/
│   ├── style.css       # All styles (design tokens, components)
│   ├── data.js         # CSV parser + demo dataset
│   ├── api.js          # Anthropic API call (Prompts A, B, C)
│   ├── render.js       # DOM rendering functions
│   └── main.js         # Event listeners + app state
└── README.md
```

## Running locally

No build step needed. Just open `index.html` in a browser — or use Live Server in VS Code:

1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

> The Anthropic API key is handled by the claude.ai proxy when running inside the artifact. For standalone deployment, add your key to `api.js` — see note below.

## Deploying to Firebase

```bash
npm install -g firebase-tools
firebase login
firebase init hosting        # set public directory to "." (root)
firebase deploy
```

## Adding your Anthropic API key (standalone)

In `src/api.js`, update the fetch headers:

```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_API_KEY_HERE',       // add this line
  'anthropic-version': '2023-06-01'        // add this line
}
```

> Never commit your API key. Use an environment variable or a backend proxy for production.

## SDG alignment

- **SDG 8** — Decent Work and Economic Growth  
- **SDG 10** — Reduced Inequalities

## Tech stack

- Vanilla HTML / CSS / JS (no framework, no build tool)
- Anthropic Claude API (`claude-sonnet-4-20250514`)
- Google Fonts (DM Sans, DM Mono, Fraunces)
