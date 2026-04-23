// ── Render helpers ────────────────────────────────────────

function renderPreview(headers, rows) {
  // Column tags
  document.getElementById('colTags').innerHTML =
    headers.map(h => `<span class="col-tag">${h}</span>`).join('');

  // Table (first 5 rows)
  const table = document.getElementById('previewTable');
  const headerRow = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const bodyRows = rows.slice(0, 5).map(
    row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`
  ).join('');
  table.innerHTML = headerRow + bodyRows;

  document.getElementById('previewCard').style.display = 'block';
}

function renderRiskBanner(result) {
  document.getElementById('riskBannerEl').innerHTML = `
    <div class="risk-banner ${result.risk_level}">
      <div class="risk-dot"></div>
      <div>
        <p class="risk-label">FAIRNESS RISK LEVEL</p>
        <p class="risk-val">${result.risk_level}</p>
      </div>
      <p class="risk-summary">${result.risk_summary}</p>
    </div>`;
}

function renderFindings(findings) {
  document.getElementById('tab-findings').innerHTML = findings.map((f, i) => `
    <div class="finding">
      <span class="find-num">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <p class="find-title">${f.title}</p>
        <p class="find-detail">${f.detail}</p>
        <span class="find-risk ${f.risk}">${f.risk} RISK</span>
      </div>
    </div>`).join('');
}

function renderCorrelations(correlations) {
  const rows = correlations.map(c => `
    <tr>
      <td>${c.feature}</td>
      <td><span class="strength ${c.strength}">${c.strength}</span></td>
      <td class="obs">${c.observation}</td>
    </tr>`).join('');

  document.getElementById('tab-correlations').innerHTML = `
    <p class="section-divider">FEATURE CORRELATION ANALYSIS</p>
    <table class="corr-table">
      <thead><tr><th>Feature</th><th>Strength</th><th>Observation</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderRecommendations(recs) {
  document.getElementById('tab-recs').innerHTML = recs.map(rec => `
    <div class="rec">
      <p class="rec-title">${rec.title}</p>
      <p class="rec-body">${rec.body}</p>
      <p class="rec-action">→ ${rec.action}</p>
    </div>`).join('');
}

function renderRawAnalysis(text) {
  document.getElementById('tab-raw').innerHTML =
    `<p class="raw-text">${text}</p>`;
}

function renderResults(result) {
  renderRiskBanner(result);
  renderFindings(result.findings);
  renderCorrelations(result.correlations);
  renderRecommendations(result.recommendations);
  renderRawAnalysis(result.raw_analysis);

  const resultsArea = document.getElementById('resultsArea');
  resultsArea.style.display = 'block';
  resultsArea.scrollIntoView({ behavior: 'smooth' });
}
