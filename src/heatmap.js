// ── Bias Heatmap ──────────────────────────────────────────
//
//  Renders a Gender × College Tier hire-rate matrix.
//  This is the visual that no other team will have.
//
//  Color encoding:
//    Dark red  → very low hire rate (high bias risk)
//    Amber     → medium hire rate
//    Green     → high hire rate (low bias risk)

function renderHeatmap(rows) {
  const wrap = document.getElementById('heatmapWrap');
  if (!wrap) return;

  // Compute the matrix
  const matrix = computeHireMatrix(rows, 'gender', 'college_tier');

  // Get unique row/col values in a sensible order
  const genders = [...new Set(rows.map(r => r.gender))].filter(Boolean).sort();
  const tiers   = ['Tier 1', 'Tier 2', 'Tier 3'].filter(t =>
    rows.some(r => r.college_tier === t)
  );

  if (genders.length === 0 || tiers.length === 0) {
    wrap.innerHTML = '<p style="color:var(--text3);font-size:0.82rem">Not enough data to render heatmap. Make sure your CSV has gender and college_tier columns.</p>';
    return;
  }

  // Build lookup
  const lookup = {};
  matrix.forEach(cell => { lookup[`${cell.row}||${cell.col}`] = cell; });

  // Color scale: 0% = deep red, 50% = amber, 100% = green
  function rateToColor(rate) {
    if (rate === null || rate === undefined) return 'rgba(255,255,255,0.04)';
    if (rate < 20)  return 'rgba(255, 60,  80,  0.75)';
    if (rate < 35)  return 'rgba(255, 90,  60,  0.65)';
    if (rate < 50)  return 'rgba(255, 150, 40,  0.60)';
    if (rate < 65)  return 'rgba(255, 190, 40,  0.55)';
    if (rate < 80)  return 'rgba(100, 220, 140, 0.55)';
    return                  'rgba(79,  255, 176, 0.65)';
  }

  // Build grid HTML
  // Layout: [empty corner] [tier headers...] then per gender row
  const cols = tiers.length + 1; // +1 for row label

  let html = `<div class="heatmap-grid" style="grid-template-columns: 100px ${tiers.map(() => '1fr').join(' ')}">`;

  // Corner cell
  html += `<div class="heatmap-header" style="padding:0.5rem;font-size:0.65rem;color:var(--text3)">Gender ↓ / Tier →</div>`;

  // Column headers
  tiers.forEach(tier => {
    html += `<div class="heatmap-header" style="padding:0.5rem;text-align:center">${tier}</div>`;
  });

  // Data rows
  genders.forEach(gender => {
    // Row label
    html += `<div class="heatmap-header" style="padding:0.5rem;justify-content:flex-start">${gender}</div>`;

    // Data cells
    tiers.forEach(tier => {
      const cell = lookup[`${gender}||${tier}`];
      const rate  = cell ? cell.hireRate : null;
      const count = cell ? cell.count : 0;
      const bg    = rateToColor(rate);
      const label = rate !== null ? `${rate}%` : '—';

      html += `
        <div class="heatmap-cell" style="background:${bg}">
          <div class="heatmap-cell-label">${gender} · ${tier}</div>
          <div class="heatmap-cell-val">${label}</div>
          <div class="heatmap-cell-sub">hire rate · n=${count}</div>
        </div>`;
    });
  });

  html += '</div>';

  // Legend
  html += `
    <div style="display:flex;align-items:center;gap:12px;margin-top:1.25rem;flex-wrap:wrap">
      <span style="font-size:0.72rem;color:var(--text3);font-family:var(--font-mono)">BIAS RISK:</span>
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:14px;height:14px;border-radius:3px;background:rgba(255,60,80,0.75)"></div>
        <span style="font-size:0.72rem;color:var(--text3)">High (&lt;20% hire rate)</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:14px;height:14px;border-radius:3px;background:rgba(255,190,40,0.55)"></div>
        <span style="font-size:0.72rem;color:var(--text3)">Medium (50–65%)</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:14px;height:14px;border-radius:3px;background:rgba(79,255,176,0.65)"></div>
        <span style="font-size:0.72rem;color:var(--text3)">Low (&gt;80% hire rate)</span>
      </div>
    </div>`;

  wrap.innerHTML = html;
}
