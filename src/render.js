import { runAudit } from './api.js';

const auditBtn = document.getElementById('auditBtn');
const csvInput = document.getElementById('csvFile');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');

function csvToHtmlTable(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return '';
    
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1, 6).map(line => line.split(',').map(c => c.trim())); // Max 5 rows
    const extraRows = lines.length > 6 ? lines.length - 6 : 0;
    
    let html = `
    <div class="border border-slate-800 bg-[#1e293b]">
        <div class="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 class="text-xs font-bold text-slate-500 uppercase">Dataset_Preview</h3>
            <span class="text-[10px] text-slate-500">${lines.length - 1} total records</span>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-400 font-mono">
                <thead class="text-[10px] uppercase bg-slate-800 text-slate-500">
                    <tr>${headers.map(h => `<th class="px-4 py-2">${h}</th>`).join('')}</tr>
                </thead>
                <tbody class="divide-y divide-slate-800/50">
                    ${rows.map(row => `
                        <tr class="hover:bg-slate-800/30 transition-colors">
                            ${row.map(cell => `<td class="px-4 py-2 whitespace-nowrap">${cell}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${extraRows > 0 ? `<div class="px-4 py-2 text-center text-[10px] text-slate-600 italic bg-slate-900/30">+ ${extraRows} more rows omitted for preview</div>` : ''}
        </div>
    </div>`;
    return html;
}

auditBtn.addEventListener('click', async () => {
    const file = csvInput.files[0];
    if (!file) return alert("System Error: No dataset provided.");
    
    loadingDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const rawCsv = e.target.result;
            const tableHtml = csvToHtmlTable(rawCsv);
            const data = await runAudit(rawCsv);
            
            resultsDiv.classList.remove('hidden');
            resultsDiv.innerHTML = `
                ${tableHtml}
                
                <div class="border-l-4 ${data.risk_level === 'CRITICAL' || data.risk_level === 'HIGH' ? 'border-red-500 bg-red-950/10' : 'border-emerald-500 bg-emerald-950/10'} p-6 mt-6">
                    <h2 class="text-xs font-bold text-slate-500 uppercase">Risk_Assessment_Summary</h2>
                    <div class="text-3xl font-black mt-1 text-white">${data.risk_level} RISK</div>
                    <p class="mt-2 text-slate-400 leading-relaxed">${data.risk_summary}</p>
                </div>
                
                <div class="grid gap-4 mt-6">
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
            console.error("DEBUG ERROR:", err);
            alert("AUDIT_FAILURE: " + err.message);
        } finally {
            loadingDiv.classList.add('hidden');
        }
    };
    reader.readAsText(file);
});