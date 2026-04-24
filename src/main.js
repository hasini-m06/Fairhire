// ── App state ─────────────────────────────────────────────
const state = {
  csvText: null,
  rows: [],
  filename: '',
  result: null
};

// ── DOM refs ──────────────────────────────────────────────
const uploadZone  = document.getElementById('uploadZone');
const fileInput   = document.getElementById('fileInput');
const uploadMain  = document.getElementById('uploadMain');
const uploadHint  = document.getElementById('uploadHint');
const analyzeBtn  = document.getElementById('analyzeBtn');
const demoBtn     = document.getElementById('demoBtn');
const exportBtn   = document.getElementById('exportBtn');
const tabsEl      = document.getElementById('tabs');

// ── File upload ───────────────────────────────────────────
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => loadCSV(ev.target.result, file.name);
  reader.readAsText(file);
});

// Drag and drop
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
  if (!file || !file.name.endsWith('.csv')) return;
  const reader = new FileReader();
  reader.onload = ev => loadCSV(ev.target.result, file.name);
  reader.readAsText(file);
});

// ── Demo dataset ──────────────────────────────────────────
demoBtn.addEventListener('click', () => {
  loadCSV(DEMO_CSV, 'india_hiring_demo.csv');
});

// ── Load and parse CSV ────────────────────────────────────
function loadCSV(text, filename) {
  state.csvText = text;
  state.filename = filename;

  const { headers, rows } = parseCSV(text);
  state.rows = rows;

  // Update upload zone
  uploadZone.classList.add('loaded');
  uploadMain.textContent = filename;
  uploadHint.textContent = `${rows.length} candidates · ${headers.length} columns loaded`;

  // Render preview
  const note = filename.includes('demo') ? DEMO_NOTE : '';
  renderPreview(headers, rows, note);

  // Enable audit button
  analyzeBtn.disabled = false;

  // Hide stale results
  document.getElementById('results').style.display = 'none';
}

// ── Run audit ─────────────────────────────────────────────
analyzeBtn.addEventListener('click', async () => {
  if (!state.csvText) return;

  analyzeBtn.disabled = true;
  analyzeBtn.classList.add('loading');
  analyzeBtn.textContent = '⏳ Auditing with Gemini...';

  try {
    const result = await runAudit(state.csvText);
    state.result = result;

    // Wire up export before rendering
    setExportData(result, state.filename);

    renderResults(result, state.rows);

    analyzeBtn.textContent = 'Re-analyze →';
  } catch (err) {
    console.error('Audit error:', err);
    analyzeBtn.textContent = `Error: ${err.message}`;
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

  tabsEl.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  ['findings', 'heatmap', 'correlations', 'recs', 'analysis', 'validation'].forEach(name => {
    const el = document.getElementById(`tab-${name}`);
    if (el) el.style.display = name === tabName ? 'block' : 'none';
  });
});

// ── PDF Export ────────────────────────────────────────────
exportBtn.addEventListener('click', () => {
  if (!state.result) return;
  exportPDF();
});
