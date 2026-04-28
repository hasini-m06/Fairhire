import { runAudit } from './api.js';

const auditBtn = document.getElementById('auditBtn');
const csvInput = document.getElementById('csvFile');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');

auditBtn.addEventListener('click', async () => {
    const file = csvInput.files[0];
    if (!file) return alert("System Error: No dataset provided.");
    
    loadingDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = await runAudit(e.target.result);
            resultsDiv.classList.remove('hidden');
            resultsDiv.innerHTML = `
                <div class="border-l-4 ${data.risk_level === 'CRITICAL' || data.risk_level === 'HIGH' ? 'border-red-500 bg-red-950/10' : 'border-emerald-500 bg-emerald-950/10'} p-6">
                    <h2 class="text-xs font-bold text-slate-500 uppercase">Risk_Assessment_Summary</h2>
                    <div class="text-3xl font-black mt-1 text-white">${data.risk_level} RISK</div>
                    <p class="mt-2 text-slate-400 leading-relaxed">${data.risk_summary}</p>
                </div>
                
                <div class="grid gap-4">
                    <h3 class="text-xs font-bold text-slate-500 uppercase">Detected_Bias_Findings</h3>
                    ${data.findings.map(f => `
                        <div class="bg-[#1e293b] p-4 border border-slate-800">
                            <span class="text-[10px] font-bold ${f.severity === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}">[${f.severity}]</span>
                            <h4 class="text-white font-bold inline ml-2">${f.title}</h4>
                            <p class="text-sm text-slate-400 mt-1">${f.detail}</p>
                        </div>
                    `).join('')}
                </div>`;
        } catch (err) {
            alert("AUDIT_FAILURE: check API connectivity.");
        } finally {
            loadingDiv.classList.add('hidden');
        }
    };
    reader.readAsText(file);
});