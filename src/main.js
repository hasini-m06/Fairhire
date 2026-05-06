import { parseCSV, computeDIR, computeValidation } from './validation.js';
import { runAudit } from './api.js';
import { renderPreview, renderResults } from './render.js';
import { DEMO_CSV, DEMO_NOTE, REALISTIC_CSV, REALISTIC_NOTE } from './data.js';
import { exportPDF } from './export.js';

/**
 * FairHire Main Controller
 * 
 * Manages application state, file uploads, and event orchestration.
 */

const state = {
    csvText: null,
    rows: [],
    filename: '',
    result: null
};

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const uploadMain = document.getElementById('uploadMain');
const uploadHint = document.getElementById('uploadHint');
const demoBtn = document.getElementById('demoBtn');
const realisticDemoBtn = document.getElementById('realisticDemoBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const dataNote = document.getElementById('dataNote');
const tabs = document.getElementById('tabs');
const resultsSection = document.getElementById('results');
const exportBtn = document.getElementById('exportBtn');

// 1. File Upload Logic
fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
});

uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('drag');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag');
});

uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
        processFile(file);
    }
});

function processFile(file) {
    const reader = new FileReader();
    reader.onload = ev => loadCSV(ev.target.result, file.name);
    reader.readAsText(file);
}

// 2. Load and Parse
function loadCSV(text, filename) {
    state.csvText = text;
    state.filename = filename;
    
    const { headers, rows } = parseCSV(text);
    state.rows = rows;
    
    // UI Feedback
    uploadZone.classList.add('loaded');
    uploadMain.textContent = filename;
    uploadHint.textContent = `${rows.length} candidates · ${headers.length} columns identified`;
    dataNote.textContent = filename.includes('demo') ? DEMO_NOTE : `Loaded ${filename}`;
    
    // Enable audit
    analyzeBtn.disabled = false;
    
    // Hide stale results
    resultsSection.style.display = 'none';
}

// 3. Demo Datasets
demoBtn.addEventListener('click', () => {
    loadCSV(DEMO_CSV, 'india_hiring_demo.csv');
});

realisticDemoBtn.addEventListener('click', () => {
    loadCSV(REALISTIC_CSV, 'realistic_messy_data.csv');
});

// 4. Audit Execution
analyzeBtn.addEventListener('click', async () => {
    if (!state.csvText) return;
    
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('loading');
    analyzeBtn.textContent = '⏳ Analyzing Bias Vectors...';
    
    try {
        const result = await runAudit(state.csvText);
        state.result = result;
        
        renderResults(result, state.rows);
        
        analyzeBtn.textContent = 'Re-audit Dataset →';
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        console.error("Audit Failed:", err);
        alert("Audit Error: " + err.message);
        analyzeBtn.textContent = 'Retry Audit →';
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('loading');
    }
});

// 5. Tab Switching
tabs.addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    
    const targetTab = btn.dataset.tab;
    
    // Update tabs UI
    tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    
    // Update panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = pane.id === `tab-${targetTab}` ? 'block' : 'none';
    });
});

// 6. Export Report
exportBtn.addEventListener('click', () => {
    if (!state.result || !state.rows) return;
    const validation = computeValidation(state.rows, state.result);
    exportPDF(state.result, state.filename, validation);
});
