// ── DOM Rendering ─────────────────────────────────────────

function renderPreview(headers, rows, note) {
  // Column tags — highlight the 'hired' target column
  document.getElementById('colTags').innerHTML = headers.map(h =>
    `<span class="col-tag ${h === 'hired' ? 'target' : ''}">${h}${h === 'hired' ? ' ←target' : ''}</span>`
  ).join('');

  // Table (first 6 rows)
  const table = document.getElementById('previewTable');
  const ths = headers.map(h => `<th>${h}</th>`).join('');
  const trs = rows.slice(0, 6).map(row => {
    const tds = headers.map(h => {
      const val = row[h] || '';
      let cls = '';
      if (h === 'hired') cls = val.toLowerCase() === 'yes' ? 'hired-yes' : 'hired-no';
      return `<td class="${cls}">${val}</td>`;
    }).join('');
    return `<tr>${tds}</tr>`;
  }).join('');

  table.innerHTML = `<thead><tr>${ths}</tr></thead><tbody>${trs}</tbody>`;

  if (note) {
    document.getElementById('dataNote').textContent = note;
  }

  document.getElementById('stepPreview').style.display = 'flex';
}

function renderRiskBanner(result) {
  document.getElementById('riskBanner').innerHTML = `
    <div class="risk-banner ${result.risk_level}">
      <div class="risk-glow"></div>
      <div>
        <p class="risk-badge-label">FAIRNESS RISK LEVEL</p>
        <p class="risk-badge-val">${result.risk_level}</p>
      </div>
      <div class="risk-divider"></div>
      <p class="risk-summary-text">${result.risk_summary}</p>
    </div>`;
}

function renderFindings(findings) {
  document.getElementById('tab-findings').innerHTML = findings.map((f, i) => `
    <div class="finding">
      <span class="finding-idx">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <p class="finding-title">${f.title}</p>
        <p class="finding-detail">${f.detail}</p>
        <span class="risk-chip ${f.risk}">${f.risk} RISK</span>
      </div>
    </div>`).join('');
}

function renderCorrelations(correlations) {
  const rows = correlations.map(c => `
    <tr>
      <td>${c.feature}</td>
      <td><span class="strength-badge ${c.strength}">${c.strength}</span></td>
      <td class="obs">${c.observation}</td>
    </tr>`).join('');

  document.getElementById('tab-correlations').innerHTML = `
    <p class="corr-label">FEATURE → OUTCOME CORRELATION ANALYSIS</p>
    <table class="corr-table">
      <thead><tr><th>Feature</th><th>Strength</th><th>Observation</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderRecommendations(recs) {
  document.getElementById('tab-recs').innerHTML = recs.map(r => `
    <div class="rec">
      <p class="rec-title">${r.title}</p>
      <p class="rec-body">${r.body}</p>
      <p class="rec-action">→ ${r.action}</p>
    </div>`).join('');
}

function renderAnalysis(text) {
  document.getElementById('tab-analysis').innerHTML = `<p class="raw-text">${text}</p>`;
}

function renderValidation(validation, aiResult) {
  const { comparisons, trustScore, matchCount, total } = validation;

  const trustColor = trustScore >= 80 ? 'var(--green)'
    : trustScore >= 50 ? 'var(--amber)' : 'var(--red)';

  const trustLabel = trustScore >= 80 ? 'AI findings confirmed by statistics'
    : trustScore >= 50 ? 'Partial confirmation — review AI findings carefully'
    : 'AI findings diverge from statistics — treat with caution';

  const rows = comparisons.map(c => {
    const dirColor = c.riskLevel === 'HIGH' ? 'var(--red)'
      : c.riskLevel === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
    const matchIcon = c.match ? '✓' : '✗';
    const matchColor = c.match ? 'var(--green)' : 'var(--red)';
    const bar = c.dirPct !== null
      ? `<div class="dir-bar-wrap">
           <div class="dir-bar" style="width:${Math.min(c.dirPct, 100)}%;background:${dirColor}"></div>
           <span class="dir-bar-label">${c.dirPct}%</span>
         </div>`
      : '<span style="color:var(--text3)">—</span>';

    return `
      <tr class="val-row">
        <td class="val-field">${c.field}</td>
        <td>
          <span style="color:${dirColor};font-weight:600">${c.dir !== null ? c.dir.toFixed(2) : '—'}</span>
          <span class="val-sub">${c.riskLabel}</span>
        </td>
        <td>${bar}</td>
        <td><span class="risk-chip ${c.riskLevel}" style="font-size:0.65rem">${c.riskLevel}</span></td>
        <td><span class="risk-chip ${c.aiRiskLevel}" style="font-size:0.65rem">${c.aiRiskLevel}</span></td>
        <td style="color:${matchColor};font-weight:700;font-size:1rem;text-align:center">${matchIcon}</td>
      </tr>
      <tr class="val-groups-row">
        <td colspan="6">
          <div class="val-groups">
            ${c.allGroups.map(g => `
              <div class="val-group">
                <span class="val-group-name">${g.name}</span>
                <div class="val-group-bar-wrap">
                  <div class="val-group-bar" style="width:${g.hireRatePct}%;background:${g.hireRatePct >= 60 ? 'var(--green)' : g.hireRatePct >= 35 ? 'var(--amber)' : 'var(--red)'}"></div>
                </div>
                <span class="val-group-pct">${g.hireRatePct}% hired (${g.hired}/${g.total})</span>
              </div>`).join('')}
          </div>
        </td>
      </tr>`;
  }).join('');

  document.getElementById('tab-validation').innerHTML = `
    <div class="val-header">
      <div class="val-trust">
        <p class="val-trust-label">AI TRUST SCORE</p>
        <p class="val-trust-val" style="color:${trustColor}">${trustScore}%</p>
        <p class="val-trust-sub">${matchCount}/${total} findings confirmed by math</p>
      </div>
      <div class="val-trust-detail">
        <p class="val-method-label">METHOD</p>
        <p class="val-method-name">Disparate Impact Ratio (DIR)</p>
        <p class="val-method-desc">The 80% Rule from EEOC Uniform Guidelines (1978). DIR = hire rate of disadvantaged group ÷ hire rate of advantaged group. DIR &lt; 0.8 is legally considered discriminatory. This is computed purely from your CSV data — no AI involved.</p>
        <p class="val-verdict" style="color:${trustColor}">→ ${trustLabel}</p>
      </div>
    </div>

    <div class="val-legend">
      <span class="val-legend-item"><span style="color:var(--green)">✓</span> AI finding confirmed by DIR</span>
      <span class="val-legend-item"><span style="color:var(--red)">✗</span> AI finding not confirmed — verify manually</span>
      <span class="val-legend-item">DIR &lt; 0.80 = fails legal threshold</span>
    </div>

    <div class="table-scroll">
      <table class="val-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>DIR Score</th>
            <th>Visual</th>
            <th>Math says</th>
            <th>AI says</th>
            <th>Match</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="val-footnote">
      <p>DIR is computed directly from your CSV — zero AI involvement. A score of 1.0 = perfect equality. The 0.80 threshold is the internationally recognised standard for adverse impact in hiring (EEOC, 1978; used in EU AI Act Article 10 fairness assessments).</p>
    </div>`;
}

function renderResults(result, rows) {
  renderRiskBanner(result);
  renderFindings(result.findings);
  renderCorrelations(result.correlations);
  renderRecommendations(result.recommendations);
  renderAnalysis(result.raw_analysis);
  renderHeatmap(rows);

  // Compute DIR-based validation and render
  const validation = computeValidation(rows, result);
  renderValidation(validation, result);

  const el = document.getElementById('results');
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
