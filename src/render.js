import { renderHeatmap } from './heatmap.js';
import { computeDIR } from './validation.js';

/**
 * FairHire UI Orchestrator
 * 
 * Handles rendering for all Dashboard states, Simulators, and Blind Talent Pools.
 */

export function renderResults(result, rows) {
    renderRiskBanner(result);
    renderFindings(result.findings);
    renderHeatmap(rows);
    renderValidation(rows, result);
    renderSimulator(rows);
    renderRecommendations(result.recommendations);
}

function renderRiskBanner(result) {
    const wrap = document.getElementById('riskBannerWrap');
    if (!wrap) return;

    const colors = { HIGH: '#f85149', MEDIUM: '#d29922', LOW: '#3fb950', CRITICAL: '#f85149' };
    const color = colors[result.risk_level] || '#8b949e';

    wrap.innerHTML = `
        <div class="panel" style="border-top: 4px solid ${color}; text-align:center; padding: 3rem;">
            <div style="font-family:var(--font-mono); font-size:0.7rem; letter-spacing:0.2em; color:var(--text3); margin-bottom:0.5rem">AGGREGATE FAIRNESS RISK</div>
            <h2 style="font-size:3rem; color:${color}; font-family:var(--font-display)">${result.risk_level}</h2>
            <p class="step-desc" style="max-width:500px; margin: 1rem auto 0">${result.risk_summary}</p>
        </div>
    `;
}

function renderFindings(findings) {
    const grid = document.getElementById('findingsList');
    if (!grid) return;

    grid.innerHTML = findings.map(f => {
        const severity = f.severity.toLowerCase();
        const conf = f.confidence_score || 0;
        const confColor = conf > 80 ? 'var(--success)' : (conf > 50 ? 'var(--warning)' : 'var(--danger)');

        return `
            <div class="finding-item ${severity}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem">
                    <span class="pill">${f.severity} SEVERITY</span>
                    <span style="font-size:0.65rem; font-family:var(--font-mono); color:${confColor}">CONFIDENCE: ${conf}%</span>
                </div>
                <h3 style="font-size:1.1rem; margin-bottom:0.5rem">${f.title}</h3>
                <p style="font-size:0.85rem; color:var(--text2)">${f.detail}</p>
            </div>
        `;
    }).join('');
}

function renderValidation(rows, result) {
    const list = document.getElementById('validationList');
    const scoreVal = document.getElementById('trustScoreVal');
    if (!list) return;

    const fields = ['gender', 'college_tier', 'location'];
    const results = fields.map(f => computeDIR(rows, f)).filter(Boolean);

    list.innerHTML = results.map(r => `
        <div style="padding: 1rem; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 1rem; background: #0d1117">
            <div style="display:flex; justify-content:space-between; align-items:center">
                <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text3)">FIELD: ${r.field.toUpperCase()}</span>
                <span class="pill" style="border-color:${r.passes80Rule ? 'var(--success)' : 'var(--danger)'}; color:${r.passes80Rule ? 'var(--success)' : 'var(--danger)'}">
                    ${r.riskLabel}
                </span>
            </div>
            <div style="margin-top:0.75rem; font-family:var(--font-display); font-size:1.5rem">DIR: ${r.dirPct}%</div>
            <div style="font-size:0.75rem; color:var(--text2); margin-top:0.25rem">
                ${r.advantaged.name} (${r.advantaged.hireRatePct}%) vs ${r.disadvantaged.name} (${r.disadvantaged.hireRatePct}%)
            </div>
        </div>
    `).join('');

    const highRiskMath = results.some(r => r.riskLevel === 'HIGH');
    const highRiskAI = result.risk_level === 'HIGH' || result.risk_level === 'CRITICAL';
    const trust = highRiskMath === highRiskAI ? 92 : 45; 
    scoreVal.textContent = `${trust}%`;
}

function renderSimulator(rows) {
    const controls = document.getElementById('simulatorControls');
    if (!controls) return;

    const data = computeDIR(rows, 'gender'); 
    if (!data) return;

    const advantaged = data.advantaged;
    const disadvantaged = data.disadvantaged;

    controls.innerHTML = `
        <div class="sim-control">
            <div class="sim-label">
                <span>Improve Hire Rate for <strong>${disadvantaged.name}</strong></span>
                <span id="simValText">${disadvantaged.hireRatePct}%</span>
            </div>
            <input type="range" class="sim-range" id="simRange" min="${disadvantaged.hireRatePct}" max="100" value="${disadvantaged.hireRatePct}">
        </div>
        <div style="font-size:0.8rem; color:var(--text3)">Targeting ${advantaged.name} rate: ${advantaged.hireRatePct}%</div>
    `;

    const range = document.getElementById('simRange');
    const resWrap = document.getElementById('simulatorResult');

    const updateSim = (val) => {
        const newRate = val / 100;
        const newDir = newRate / advantaged.hireRate;
        const newDirPct = Math.round(newDir * 100);
        const passes = newDir >= 0.8;

        document.getElementById('simValText').textContent = `${val}%`;
        resWrap.innerHTML = `
            <div style="padding:1.5rem; border-radius:8px; background:${passes ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)'}; border:1px solid ${passes ? 'var(--success)' : 'var(--danger)'}">
                <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text2)">PROJECTED IMPACT</div>
                <div style="font-size:2rem; font-family:var(--font-display); color:${passes ? 'var(--success)' : 'var(--danger)'}">${newDirPct}% DIR</div>
                <div style="font-size:0.9rem; font-weight:600; margin-top:0.5rem">
                    ${passes ? '✅ PROJECTION PASSES 80% RULE' : '❌ PROJECTION STILL DISCRIMINATORY'}
                </div>
            </div>
        `;
    };

    range.addEventListener('input', (e) => updateSim(e.target.value));
    updateSim(disadvantaged.hireRatePct);
}

function renderRecommendations(recs) {
    const grid = document.getElementById('recsList');
    if (!grid) return;

    grid.innerHTML = recs.map(r => `
        <div class="panel" style="margin-bottom:1.5rem">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem">
                <span class="pill" style="border-color:var(--accent); color:var(--accent)">${r.sdg}</span>
            </div>
            <h3 style="font-size:1.1rem; margin-bottom:0.75rem">${r.title}</h3>
            <p style="font-size:0.9rem; color:var(--text2); margin-bottom:1rem">${r.description}</p>
        </div>
    `).join('');
}

export function renderJDResults(result) {
    const wrap = document.getElementById('jdResults');
    const content = document.getElementById('jdResultContent');
    if (!wrap || !content) return;

    wrap.style.display = 'block';
    content.innerHTML = `
        <div style="display:flex; gap:2rem; align-items:center; border-bottom:1px solid var(--border); padding-bottom:1.5rem; margin-bottom:1.5rem">
            <div style="flex:1">
                <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text3)">JD BIAS SCORE</div>
                <div style="font-size:3rem; font-family:var(--font-display); color:${result.bias_score > 50 ? 'var(--danger)' : 'var(--success)'}">${result.bias_score}</div>
            </div>
            <div style="flex:2; font-size:0.9rem; color:var(--text2)">${result.overall_verdict}</div>
        </div>
        <h4>Biased Phrases & Alternatives</h4>
        <div style="margin-top:1rem">
            ${result.biased_phrases.map(p => `
                <div style="margin-bottom:1rem; padding:1rem; background:#0d1117; border-radius:8px">
                    <div style="color:var(--danger); font-weight:700">"${p.phrase}"</div>
                    <div style="font-size:0.8rem; color:var(--text3); margin:0.25rem 0">${p.reason}</div>
                    <div style="color:var(--success); font-size:0.85rem">Suggestion: ${p.suggestion}</div>
                </div>
            `).join('')}
        </div>
    `;
    wrap.scrollIntoView({ behavior: 'smooth' });
}

export function renderResumeResults(result) {
    const wrap = document.getElementById('jdResults'); // Reusing the same display section for simplicity
    const content = document.getElementById('jdResultContent');
    if (!wrap || !content) return;

    wrap.style.display = 'block';
    content.innerHTML = `
        <h2 style="font-family:var(--font-display); margin-bottom:1.5rem">Blind Talent Pool</h2>
        <p class="step-desc">Identities have been shielded. Gemini extracted the following skill-based profiles.</p>
        
        <div class="res-pool mt-6" style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem">
            ${result.candidates.map(c => `
                <div class="panel" style="background:#0d1117">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
                        <span class="pill pill--secure">${c.blind_id}</span>
                        <span class="pill">${c.college_tier}</span>
                    </div>
                    <div style="font-weight:700; color:var(--accent); margin-bottom:0.5rem">${c.exp_years} Years Exp</div>
                    <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:1rem">
                        ${c.skills.map(s => `<span style="font-size:0.6rem; padding:2px 6px; background:#161b22; border-radius:4px">${s}</span>`).join('')}
                    </div>
                    <p style="font-size:0.8rem; color:var(--text2)">${c.highlights}</p>
                    <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border); font-size:0.75rem; font-style:italic; color:var(--text3)">
                        ${c.bias_neutral_assessment}
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="panel mt-8" style="background:rgba(88, 166, 255, 0.05); border-color:var(--accent)">
            <h4 style="color:var(--accent)">Batch Fairness Summary</h4>
            <p style="font-size:0.85rem; color:var(--text2); margin-top:0.5rem">${result.batch_fairness_summary}</p>
        </div>
    `;
    wrap.scrollIntoView({ behavior: 'smooth' });
}