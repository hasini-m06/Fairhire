import { defineConfig } from 'vite';

// ── Vite config for FairHire ──────────────────────────────
//
//  No proxy needed — Gemini API is called directly from
//  the browser using window.GEMINI_KEY set in index.html.
//
//  Firebase Functions proxy has been removed entirely.
//  Gemini 1.5 Pro supports browser-direct calls.

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});