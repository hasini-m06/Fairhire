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

function renderResults(result, rows) {
  renderRiskBanner(result);
  renderFindings(result.findings);
  renderCorrelations(result.correlations);
  renderRecommendations(result.recommendations);
  renderAnalysis(result.raw_analysis);

  // Render heatmap from actual CSV data
  renderHeatmap(rows);

  const el = document.getElementById('results');
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
