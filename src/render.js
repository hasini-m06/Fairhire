import { renderHeatmap } from './heatmap.js';
import { computeDIR } from './validation.js';

/**
 * FairHire UI Orchestrator (v2.2)
 * 
 * Handles rendering for all Dashboard states, Simulators, Blind Talent Pools, 
 * and Industry Benchmarks.
 */

export function renderResults(result, rows) {
    renderRiskBanner(result);
    renderFindings(result.findings);
    renderHeatmap(rows);
    renderValidation(rows, result);
    renderSimulator(rows);
    renderBenchmark(rows);
    renderRecommendations(result.recommendations);
}

function renderRiskBanner(result) {
    const wrap = document.getElementById('riskBannerWrap');
    if (!wrap) return;

    const colors = { HIGH: '#f85149', MEDIUM: '#d29922', LOW: '#3fb950', CRITICAL: '#f85149' };
    const color = colors[result.risk_level] || '#8b949e';

    wrap.innerHTML = `
        <div style="text-align:center; padding: 2rem 0;">
            <div style="font-family:var(--font-mono); font-size:0.7rem; letter-spacing:0.3em; color:var(--text3); margin-bottom:1rem">AGGREGATE FAIRNESS RISK</div>
            <h2 style="font-size:4rem; color:${color}; font-family:var(--font-display); letter-spacing:-0.05em">${result.risk_level}</h2>
            <p class="hero-sub" style="font-size:1rem; margin-top: 1rem">${result.risk_summary}</p>
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
            <div class="finding-item ${severity}" style="padding:2rem; background:rgba(255,255,255,0.02); border-radius:16px; border:1px solid var(--border); margin-bottom:1.5rem">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
                    <span class="pill">${f.severity}</span>
                    <span style="font-size:0.65rem; font-family:var(--font-mono); color:${confColor}">CONFIDENCE: ${conf}%</span>
                </div>
                <h3 style="font-size:1.25rem; margin-bottom:0.5rem; font-family:var(--font-display)">${f.title}</h3>
                <p style="font-size:0.95rem; color:var(--text2)">${f.detail}</p>
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
        <div style="padding: 2rem; border: 1px solid var(--border); border-radius: 16px; margin-bottom: 1.5rem; background: rgba(0,0,0,0.2)">
            <div style="display:flex; justify-content:space-between; align-items:center">
                <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text3)">${r.field.toUpperCase()} ANALYSIS</span>
                <span class="pill" style="border-color:${r.passes80Rule ? 'var(--success)' : 'var(--danger)'}; color:${r.passes80Rule ? 'var(--success)' : 'var(--danger)'}">
                    ${r.riskLabel}
                </span>
            </div>
            <div style="margin-top:1rem; font-family:var(--font-display); font-size:2.5rem; font-weight:800">${r.dirPct}% <span style="font-size:1rem; color:var(--text3); font-weight:400">DIR</span></div>
            <div style="font-size:0.85rem; color:var(--text2); margin-top:0.5rem">
                Top Group: ${r.advantaged.name} (${r.advantaged.hireRatePct}%) • Min Group: ${r.disadvantaged.name} (${r.disadvantaged.hireRatePct}%)
            </div>
        </div>
    `).join('');

    const highRiskMath = results.some(r => r.riskLevel === 'HIGH');
    const highRiskAI = result.risk_level === 'HIGH' || result.risk_level === 'CRITICAL';
    const trust = highRiskMath === highRiskAI ? 92 : 45; 
    scoreVal.textContent = `${trust}%`;
}

/**
 * Global Benchmark: Compares audit data with Industry Standard
 */
function renderBenchmark(rows) {
    const statGrid = document.getElementById('benchmarkStat');
    if (!statGrid) return;

    const genderData = computeDIR(rows, 'gender');
    const tierData = computeDIR(rows, 'college_tier');

    // Industry Averages (Mocked from Global Ledger)
    const industryGenderAvg = 82;
    const industryTierAvg = 65;

    const userGender = genderData ? genderData.dirPct : 0;
    const userTier = tierData ? tierData.dirPct : 0;

    const genderDelta = userGender - industryGenderAvg;
    const tierDelta = userTier - industryTierAvg;

    statGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Gender Fairness vs Industry</div>
            <div class="stat-val" style="color:${genderDelta >= 0 ? 'var(--success)' : 'var(--danger)'}">
                ${genderDelta >= 0 ? '+' : ''}${genderDelta}%
            </div>
            <div style="font-size:0.7rem; color:var(--text2)">Avg: ${industryGenderAvg}% DIR</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Meritocracy vs Industry</div>
            <div class="stat-val" style="color:${tierDelta >= 0 ? 'var(--success)' : 'var(--danger)'}">
                ${tierDelta >= 0 ? '+' : ''}${tierDelta}%
            </div>
            <div style="font-size:0.7rem; color:var(--text2)">Avg: ${industryTierAvg}% DIR</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Global Percentile</div>
            <div class="stat-val">${Math.round(75 + (genderDelta + tierDelta)/2)}th</div>
            <div style="font-size:0.7rem; color:var(--text2)">Top 25% for Transparency</div>
        </div>
    `;
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
        <div style="font-size:0.8rem; color:var(--text3)">Current Baseline: ${advantaged.name} at ${advantaged.hireRatePct}%</div>
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
            <div style="padding:2rem; border-radius:16px; background:${passes ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)'}; border:1px solid ${passes ? 'var(--success)' : 'var(--danger)'}; text-align:center">
                <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text2); letter-spacing:0.1em">PROJECTED IMPACT</div>
                <div style="font-size:4rem; font-family:var(--font-display); font-weight:800; color:${passes ? 'var(--success)' : 'var(--danger)'}">${newDirPct}% <span style="font-size:1rem">DIR</span></div>
                <div style="font-size:1.1rem; font-weight:700; margin-top:0.5rem">
                    ${passes ? '✅ PROJECTION PASSES 80% RULE' : '❌ PROJECTION BELOW STANDARD'}
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
        <div class="panel" style="margin-bottom:2rem; padding:2rem">
            <div style="display:flex; justify-content:space-between; margin-bottom:1rem">
                <span class="pill" style="border-color:var(--secondary); color:var(--secondary); background:rgba(var(--secondary-rgb), 0.1)">${r.sdg} Strategy</span>
            </div>
            <h3 style="font-size:1.5rem; margin-bottom:1rem; font-family:var(--font-display)">${r.title}</h3>
            <p style="font-size:1rem; color:var(--text2); margin-bottom:1rem">${r.description}</p>
        </div>
    `).join('');
}

export function renderJDResults(result) {
    const wrap = document.getElementById('jdResults');
    const content = document.getElementById('jdResultContent');
    if (!wrap || !content) return;

    wrap.style.display = 'block';
    content.innerHTML = `
        <div style="display:flex; gap:3rem; align-items:center; border-bottom:1px solid var(--border); padding-bottom:2.5rem; margin-bottom:2rem">
            <div style="flex:1">
                <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text3); letter-spacing:0.2em">JD BIAS INDEX</div>
                <div style="font-size:5rem; font-family:var(--font-display); font-weight:800; color:${result.bias_score > 50 ? 'var(--danger)' : 'var(--success)'}">${result.bias_score}</div>
            </div>
            <div style="flex:2; font-size:1.1rem; color:var(--text2); line-height:1.4">${result.overall_verdict}</div>
        </div>
        
        <h4 style="font-family:var(--font-display); margin-bottom:1.5rem">Bias Corrections</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem">
            ${result.biased_phrases.map(p => `
                <div style="padding:1.5rem; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:16px">
                    <div style="color:var(--danger); font-weight:800; font-family:var(--font-mono); margin-bottom:0.5rem">"${p.phrase}"</div>
                    <div style="font-size:0.85rem; color:var(--text2); margin-bottom:1rem">${p.reason}</div>
                    <div style="color:var(--success); font-size:0.9rem; font-weight:700">Alternative: ${p.suggestion}</div>
                </div>
            `).join('')}
        </div>
    `;
    wrap.scrollIntoView({ behavior: 'smooth' });
}

export function renderResumeResults(result) {
    const wrap = document.getElementById('jdResults');
    const content = document.getElementById('jdResultContent');
    if (!wrap || !content) return;

    wrap.style.display = 'block';
    content.innerHTML = `
        <div style="margin-bottom:3rem">
            <h2 style="font-family:var(--font-display); font-size:3rem; margin-bottom:1rem">Blind Talent Pool</h2>
            <p class="hero-sub" style="font-size:1rem">Identity-shielded screening mode active. Candidates evaluated strictly on technical projects and competencies.</p>
        </div>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:1.5rem">
            ${result.candidates.map(c => `
                <div class="panel" style="background:rgba(255,255,255,0.02); border-color:var(--border); padding:2rem">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem">
                        <span class="pill pill--secure">${c.blind_id}</span>
                        <span class="pill">${c.college_tier}</span>
                    </div>
                    <div style="font-size:1.5rem; font-family:var(--font-display); font-weight:800; color:var(--accent); margin-bottom:0.5rem">${c.exp_years}y Exp</div>
                    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:1.5rem">
                        ${c.skills.map(s => `<span style="font-size:0.65rem; padding:4px 10px; background:rgba(88,166,255,0.1); color:var(--accent); border-radius:100px; font-weight:600">${s}</span>`).join('')}
                    </div>
                    <p style="font-size:0.9rem; color:var(--text2); line-height:1.5">${c.highlights}</p>
                    <div style="margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid var(--border); font-size:0.8rem; font-style:italic; color:var(--text3); line-height:1.4">
                        ${c.bias_neutral_assessment}
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="panel mt-8" style="background:rgba(var(--accent-rgb), 0.05); border-color:rgba(var(--accent-rgb), 0.3); text-align:center">
            <h4 style="color:var(--accent); font-family:var(--font-display)">Aggregate Batch Verdict</h4>
            <p style="font-size:1rem; color:var(--text2); margin-top:0.5rem">${result.batch_fairness_summary}</p>
        </div>
    `;
    wrap.scrollIntoView({ behavior: 'smooth' });
}