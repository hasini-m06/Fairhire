/**
 * FairHire Heatmap Renderer
 * 
 * Visualizes the intersection of Bias across different dimensions.
 */

export function renderHeatmap(rows, rowField = 'gender', colField = 'college_tier') {
    const wrap = document.getElementById('heatmapWrap');
    if (!wrap) return;

    // 1. Compute the matrix
    const matrix = computeHireMatrix(rows, rowField, colField);

    // 2. Get unique row/col values
    const rowValues = [...new Set(rows.map(r => r[rowField]))].filter(Boolean).sort();
    const colValues = [...new Set(rows.map(r => r[colField]))].filter(Boolean).sort();

    if (rowValues.length === 0 || colValues.length === 0) {
        wrap.innerHTML = '<p class="text3" style="font-size:0.8rem">Insufficient data for heatmap visualization. Please ensure your CSV contains ' + rowField + ' and ' + colField + ' columns.</p>';
        return;
    }

    // Build lookup
    const lookup = {};
    matrix.forEach(cell => { lookup[`${cell.row}||${cell.col}`] = cell; });

    // Color scale
    function rateToColor(rate) {
        if (rate === null || rate === undefined) return 'rgba(255,255,255,0.04)';
        if (rate < 20) return 'rgba(255, 60, 80, 0.75)';
        if (rate < 50) return 'rgba(255, 150, 40, 0.60)';
        if (rate < 80) return 'rgba(100, 220, 140, 0.55)';
        return 'rgba(79, 255, 176, 0.65)';
    }

    // Build Grid
    let html = `<div class="heatmap-grid" style="grid-template-columns: 120px ${colValues.map(() => '1fr').join(' ')}">`;

    // Headers
    html += `<div class="heatmap-header">${rowField.toUpperCase()} ↓</div>`;
    colValues.forEach(cv => {
        html += `<div class="heatmap-header">${cv}</div>`;
    });

    // Rows
    rowValues.forEach(rv => {
        html += `<div class="heatmap-header" style="justify-content: flex-start;">${rv}</div>`;
        colValues.forEach(cv => {
            const cell = lookup[`${rv}||${cv}`];
            const rate = cell ? cell.hireRate : 0;
            const count = cell ? cell.count : 0;
            const bg = rateToColor(rate);
            
            html += `
                <div class="heatmap-cell" style="background:${bg}">
                    <div class="heatmap-cell-val">${rate}%</div>
                    <div class="heatmap-cell-sub">n=${count}</div>
                </div>`;
        });
    });

    html += '</div>';
    wrap.innerHTML = html;
}

/**
 * Internal helper to compute the hire rate matrix
 */
function computeHireMatrix(rows, rowField, colField) {
    const matrix = {};
    rows.forEach(row => {
        const r = row[rowField] || 'Unknown';
        const c = row[colField] || 'Unknown';
        const hired = (row['hired'] || '').toLowerCase() === 'yes' || (row['hired'] || '').toLowerCase() === 'true';
        const key = `${r}||${c}`;
        if (!matrix[key]) matrix[key] = { row: r, col: c, yes: 0, total: 0 };
        matrix[key].total++;
        if (hired) matrix[key].yes++;
    });

    return Object.values(matrix).map(cell => ({
        row: cell.row,
        col: cell.col,
        hireRate: cell.total > 0 ? Math.round((cell.yes / cell.total) * 100) : 0,
        count: cell.total
    }));
}
