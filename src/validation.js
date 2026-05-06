/**
 * FairHire Validation & Privacy Engine
 * 
 * Implements DIR math and client-side PII anonymization.
 */

/**
 * Parses CSV text into headers and rows.
 * Hardened to handle various delimiters (comma, semicolon, tab).
 */
export function parseCSV(text) {
    if (!text) return { headers: [], rows: [] };
    
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return { headers: [], rows: [] };
    
    // Detect delimiter
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes(';')) delimiter = ';';
    else if (firstLine.includes('\t')) delimiter = '\t';

    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim());
        const row = {};
        headers.forEach((h, i) => { 
            row[h] = values[i] || ''; 
        });
        return row;
    });
    return { headers, rows };
}

/**
 * Anonymizes rows by hashing PII (Name, Email, etc.)
 * Ensures the AI never sees real candidate names.
 */
export async function anonymizeRows(rows) {
    const piiFields = ['name', 'email', 'phone', 'address', 'candidate_id'];
    
    // Using a simple hash function for browser compatibility without external libs
    const hash = async (str) => {
        if (!str) return 'Anonymous';
        const msgBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return 'ID_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);
    };

    const anonymized = [];
    for (const row of rows) {
        const newRow = { ...row };
        for (const field of piiFields) {
            if (newRow[field]) {
                newRow[field] = await hash(newRow[field]);
            }
        }
        anonymized.push(newRow);
    }
    return anonymized;
}

/**
 * Computes Disparate Impact Ratio for a specific field.
 */
export function computeDIR(rows, field) {
    const normalizedField = field.toLowerCase();
    
    const groups = {};
    rows.forEach(row => {
        const val = row[normalizedField] || 'Unknown';
        const hired = (row['hired'] || '').toLowerCase() === 'yes' || (row['hired'] || '').toLowerCase() === 'true';
        if (!groups[val]) groups[val] = { yes: 0, total: 0 };
        groups[val].total++;
        if (hired) groups[val].yes++;
    });

    const valid = Object.entries(groups)
        .filter(([, g]) => g.total >= 1)
        .map(([name, g]) => ({
            name,
            hireRate: g.yes / g.total,
            hired: g.yes,
            total: g.total
        }));

    if (valid.length < 2) return null;

    valid.sort((a, b) => b.hireRate - a.hireRate);
    const advantaged = valid[0];
    const disadvantaged = valid[valid.length - 1];

    const dir = advantaged.hireRate > 0
        ? disadvantaged.hireRate / advantaged.hireRate
        : null;

    let riskLevel, riskLabel;
    if (dir === null) { riskLevel = 'UNKNOWN'; riskLabel = 'Insufficient data'; }
    else if (dir < 0.5) { riskLevel = 'HIGH'; riskLabel = 'Severe disparity'; }
    else if (dir < 0.8) { riskLevel = 'HIGH'; riskLabel = 'Fails 80% rule (Discriminatory)'; }
    else if (dir < 0.9) { riskLevel = 'MEDIUM'; riskLabel = 'Borderline disparity'; }
    else { riskLevel = 'LOW'; riskLabel = 'Passes 80% rule'; }

    return {
        field,
        dir: dir !== null ? Math.round(dir * 100) / 100 : null,
        dirPct: dir !== null ? Math.round(dir * 100) : null,
        riskLevel,
        riskLabel,
        advantaged: { ...advantaged, hireRatePct: Math.round(advantaged.hireRate * 100) },
        disadvantaged: { ...disadvantaged, hireRatePct: Math.round(disadvantaged.hireRate * 100) },
        allGroups: valid.map(g => ({ ...g, hireRatePct: Math.round(g.hireRate * 100) })),
        passes80Rule: dir !== null && dir >= 0.8
    };
}

/**
 * Cross-checks AI findings against DIR math results.
 */
export function computeValidation(rows, aiResult) {
    const fields = ['gender', 'college_tier', 'location'];
    const dirResults = fields
        .map(f => computeDIR(rows, f))
        .filter(Boolean);

    if (dirResults.length === 0) return { dirResults: [], trustScore: 0 };

    const comparisons = dirResults.map(dir => {
        const aiRiskLevel = aiResult.risk_level || 'UNKNOWN';
        const mathHigh = dir.riskLevel === 'HIGH';
        const aiHigh = aiRiskLevel === 'HIGH' || aiRiskLevel === 'CRITICAL';
        const match = (mathHigh === aiHigh) ||
                      (dir.riskLevel === 'MEDIUM' && aiRiskLevel !== 'LOW') ||
                      (dir.riskLevel === 'LOW' && aiRiskLevel === 'LOW');

        return { ...dir, aiRiskLevel, match };
    });

    const matchCount = comparisons.filter(c => c.match).length;
    const trustScore = Math.round((matchCount / comparisons.length) * 100);

    return { dirResults, comparisons, trustScore, matchCount, total: comparisons.length };
}