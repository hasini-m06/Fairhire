import { computeValidation, computeDIR } from './validation.js';
import { renderHeatmap } from './heatmap.js';

/**
 * FairHire UI Renderer
 * 
 * Orchestrates the rendering of audit results, bias heatmaps, 
 * and DIR validation components.
 */

export function renderPreview(headers, rows, note = '') {
    const tableWrap = document.createElement('div');
    tableWrap.className = 'panel mt-6';
    
    let html = `
        <div class="col-tags">
            ${headers.map(h => `<span class="col-tag ${['gender', 'college_tier', 'location', 'hired'].includes(h.toLowerCase()) ? 'target' : ''}">${h}</span>`).join('')}
        </div>
        <div class="table-scroll">
            <table class="data-table">
                <thead>
                    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${rows.slice(0, 5).map(row => `
                        <tr>
                            ${headers.map(h => {
                                const val = row[h] || '';
                                const isHired = h.toLowerCase() === 'hired';
                                const cls = isHired ? (val.toLowerCase() === 'yes' ? 'hired-yes' : 'hired-no') : '';
                                return `<td class="${cls}">${val}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="data-note">${note || `${rows.length} candidates parsed for analysis`}</div>
    `;
    
    const results = document.getElementById('tab-findings'); // Default place for preview before audit
    // Actually, we should probably have a separate preview area or just append to findings
    // For now, let's just make sure main.js can use it.
}

export function renderResults(result, rows) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';

    // 1. Risk Banner
    const riskBannerWrap = document.getElementById('riskBannerWrap');
    riskBannerWrap.innerHTML = `
        <div class="risk-banner ${result.risk_level}">
            <div class="risk-glow"></div>
            <div>
                <div class="risk-badge-label">AGGREGATE RISK</div>
                <div class="risk-badge-val">${result.risk_level}</div>
            </div>
            <div class="risk-divider"></div>
            <div class="risk-summary-text">${result.risk_summary}</div>
        </div>
    `;

    // 2. Findings
    const findingsList = document.getElementById('findingsList');
    findingsList.innerHTML = (result.findings || []).map((f, i) => `
        <div class="finding">
            <div class="finding-idx">${(i + 1).toString().padStart(2, '0')}</div>
            <div>
                <div class="finding-title">${f.title} <span class="risk-chip ${f.severity}">${f.severity}</span></div>
                <div class="finding-detail">${f.detail}</div>
            </div>
        </div>
    `).join('') || '<p class="text2">No significant bias vectors detected by AI.</p>';

    // 3. DIR Validation & Trust Score
    const validation = computeValidation(rows, result);
    const trustScoreVal = document.getElementById('trustScoreVal');
    trustScoreVal.textContent = `${validation.trustScore}%`;
    trustScoreVal.style.color = validation.trustScore > 70 ? 'var(--green)' : (validation.trustScore > 40 ? 'var(--amber)' : 'var(--red)');

    const validationList = document.getElementById('validationList');
    validationList.innerHTML = validation.dirResults.map(dir => `
        <div class="finding" style="border-left: 2px solid ${dir.passes80Rule ? 'var(--green)' : 'var(--red)'}; padding-left: 1rem; margin-bottom: 1rem;">
            <div>
                <div class="finding-title">
                    ${dir.field.toUpperCase()} Factor
                    <span class="risk-chip ${dir.riskLevel}">${dir.riskLabel}</span>
                </div>
                <div class="finding-detail">
                    DIR: <strong>${dir.dir || 'N/A'}</strong> (${dir.dirPct || 0}%)<br>
                    Advantaged: ${dir.advantaged.name} (${dir.advantaged.hireRatePct}% hire rate)<br>
                    Disadvantaged: ${dir.disadvantaged.name} (${dir.disadvantaged.hireRatePct}% hire rate)
                </div>
            </div>
        </div>
    `).join('');

    // 4. Heatmap
    renderHeatmap(rows, 'gender', 'college_tier');

    // 5. Recommendations
    const recsList = document.getElementById('recsList');
    recsList.innerHTML = (result.recommendations || []).map(r => `
        <div class="rec">
            <div class="rec-title">${r.title} <span class="pill" style="font-size: 0.6rem; vertical-align: middle;">${r.sdg}</span></div>
            <div class="rec-body">${r.description}</div>
            <div class="rec-action">Priority: High</div>
        </div>
    `).join('') || '<p class="text2">AI is still generating recommendations based on the findings...</p>';
}