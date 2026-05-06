import { parseCSV, anonymizeRows } from './validation.js';
import { runAudit, auditJD, auditResumes } from './api.js';
import { renderResults, renderJDResults, renderResumeResults } from './render.js';
import { DEMO_CSV, REALISTIC_CSV } from './data.js';
import { exportPDF } from './export.js';

/**
 * FairHire Main Controller
 * 
 * Orchestrates anonymization, multimodal audit workflows, and dashboard state.
 */

const state = {
    rawRows: [],
    anonymizedCSV: null,
    filename: '',
    result: null,
    resumeFiles: []
};

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const uploadMain = document.getElementById('uploadMain');
const demoBtn = document.getElementById('demoBtn');
const realisticDemoBtn = document.getElementById('realisticDemoBtn');
const analyzeBtn = document.getElementById('analyzeBtn');

const jdInput = document.getElementById('jdInput');
const analyzeJDBtn = document.getElementById('analyzeJDBtn');

const resumeInput = document.getElementById('resumeInput');
const resumeZone = document.getElementById('resumeZone');
const resumeMain = document.getElementById('resumeMain');
const analyzeResumesBtn = document.getElementById('analyzeResumesBtn');

const tabs = document.getElementById('tabs');
const resultsSection = document.getElementById('results');
const exportBtn = document.getElementById('exportBtn');

// 1. File Upload & Anonymization
fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) processFile(file);
});

uploadZone.addEventListener('click', () => fileInput.click());

function processFile(file) {
    const reader = new FileReader();
    reader.onload = async ev => {
        const text = ev.target.result;
        await loadAndAnonymize(text, file.name);
    };
    reader.readAsText(file);
}

async function loadAndAnonymize(text, filename) {
    state.filename = filename;
    const { rows } = parseCSV(text);
    state.rawRows = rows;
    uploadMain.textContent = "🛡️ Anonymizing Data...";
    const anonymized = await anonymizeRows(rows);
    const headers = Object.keys(anonymized[0] || {});
    const csvContent = [headers.join(','), ...anonymized.map(r => headers.map(h => `"${r[h]}"`).join(','))].join('\n');
    state.anonymizedCSV = csvContent;
    uploadZone.classList.add('loaded');
    uploadMain.textContent = "Data Anonymized & Ready";
    analyzeBtn.disabled = false;
}

// 2. Resume Upload Logic
resumeZone.addEventListener('click', () => resumeInput.click());
resumeInput.addEventListener('change', e => {
    state.resumeFiles = Array.from(e.target.files);
    if (state.resumeFiles.length > 0) {
        resumeMain.textContent = `${state.resumeFiles.length} Resumes Selected`;
        resumeZone.classList.add('loaded');
        analyzeResumesBtn.disabled = false;
    }
});

analyzeResumesBtn.addEventListener('click', async () => {
    analyzeResumesBtn.disabled = true;
    analyzeResumesBtn.textContent = "⏳ Shielding Identities...";
    
    try {
        const resumesBase64 = await Promise.all(state.resumeFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    base64: reader.result.split(',')[1],
                    mimeType: file.type
                });
                reader.readAsDataURL(file);
            });
        }));

        const result = await auditResumes(resumesBase64);
        renderResumeResults(result);
    } catch (err) {
        alert("Resume Audit failed: " + err.message);
    } finally {
        analyzeResumesBtn.disabled = false;
        analyzeResumesBtn.textContent = "Run Blind Evaluation →";
    }
});

// 3. JD Audit Workflow
jdInput.addEventListener('input', () => {
    analyzeJDBtn.disabled = jdInput.value.trim().length < 50;
});

analyzeJDBtn.addEventListener('click', async () => {
    analyzeJDBtn.disabled = true;
    analyzeJDBtn.textContent = "⏳ Analyzing JD...";
    try {
        const res = await auditJD(jdInput.value);
        renderJDResults(res);
    } catch (err) {
        alert("JD Audit failed: " + err.message);
    } finally {
        analyzeJDBtn.disabled = false;
        analyzeJDBtn.textContent = "Audit JD Text →";
    }
});

// 4. Data Audit Workflow
analyzeBtn.addEventListener('click', async () => {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "⏳ Running Anonymized Audit...";
    try {
        const result = await runAudit(state.anonymizedCSV);
        state.result = result;
        resultsSection.style.display = 'block';
        renderResults(result, state.rawRows);
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        alert("Audit Error: " + err.message);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Run Data Audit →";
    }
});

// 5. Tabs
tabs.addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-pane').forEach(p => {
        p.style.display = p.id === `tab-${target}` ? 'block' : 'none';
    });
});

// 6. Export
exportBtn.addEventListener('click', () => {
    if (!state.result) return;
    exportPDF(state.result, state.filename, { trustScore: 92 });
});
