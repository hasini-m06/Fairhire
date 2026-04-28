// ── Validation ────────────────────────────────────────────
//
//  The DIR (Disparate Impact Ratio) validation functions
//  computeDIR() and computeValidation() live in data.js
//  because they operate directly on parsed CSV rows.
//
//  render.js calls: computeValidation(rows, result)
//  which is defined in data.js and available globally
//  because index.html loads data.js before render.js.
//
//  This file is intentionally a no-op placeholder.
//  No changes needed here.