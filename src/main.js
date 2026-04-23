// ── App state ─────────────────────────────────────────────
let csvData = null;

// ── DOM refs ──────────────────────────────────────────────
const uploadZone  = document.getElementById('uploadZone');
const fileInput   = document.getElementById('fileInput');
const uploadTitle = document.getElementById('uploadTitle');
const uploadSub   = document.getElementById('uploadSub');
const analyzeBtn  = document.getElementById('analyzeBtn');
const demoBtn     = document.getElementById('demoBtn');
const tabsEl      = document.getElementById('tabsEl');

// ── File upload ───────────────────────────────────────────
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => processCSV(ev.target.result, file.name);
  reader.readAsText(file);
});

// Drag and drop
uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (!file || !file.name.endsWith('.csv')) return;
  const reader = new FileReader();
  reader.onload = ev => processCSV(ev.target.result, file.name);
  reader.readAsText(file);
});

// ── Demo dataset ──────────────────────────────────────────
demoBtn.addEventListener('click', () => {
  processCSV(DEMO_CSV, 'demo_candidates.csv');
});

// ── Process CSV ───────────────────────────────────────────
function processCSV(text, filename) {
  csvData = text;
  const { headers, rows } = parseCSV(text);

  // Update upload zone UI
  uploadZone.classList.add('has-file');
  uploadTitle.textContent = filename;
  uploadSub.textContent = `${rows.length} candidates · ${headers.length} columns`;

  // Render preview table
  renderPreview(headers, rows);

  // Enable analyze button
  analyzeBtn.disabled = false;

  // Hide previous results
  document.getElementById('resultsArea').style.display = 'none';
}

// ── Run audit ─────────────────────────────────────────────
analyzeBtn.addEventListener('click', async () => {
  if (!csvData) return;

  analyzeBtn.disabled = true;
  analyzeBtn.classList.add('loading');
  analyzeBtn.textContent = '⏳ Auditing with Gemini...';

  try {
    const result = await runGeminiAudit(csvData);
    renderResults(result);
    analyzeBtn.textContent = 'Re-analyze →';
  } catch (err) {
    console.error('Audit failed:', err);
    analyzeBtn.textContent = 'Error — check console and try again';
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.classList.remove('loading');
  }
});

// ── Tab switching ─────────────────────────────────────────
tabsEl.addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (!btn) return;

  const tabName = btn.dataset.tab;

  // Update active tab button
  tabsEl.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // Show correct panel
  ['findings', 'correlations', 'recs', 'raw'].forEach(name => {
    const el = document.getElementById(`tab-${name}`);
    el.style.display = name === tabName ? 'block' : 'none';
  });
});
