// ── Synthetic India hiring dataset ────────────────────────
// Modeled on real Bangalore/Mumbai tech hiring patterns.
// Reflects documented biases: IIT preference, metro bias,
// male-dominated shortlisting in early-stage startups.

const DEMO_CSV = `name,gender,college_tier,location,years_exp,hired
Rahul Sharma,Male,Tier 1,Bangalore,3,Yes
Priya Nair,Female,Tier 2,Mysore,4,No
Arjun Mehta,Male,Tier 1,Mumbai,2,Yes
Sneha Reddy,Female,Tier 3,Hyderabad,5,No
Vikram Singh,Male,Tier 2,Delhi,3,Yes
Anjali Kumar,Female,Tier 1,Pune,3,Yes
Rohan Das,Male,Tier 3,Kolkata,6,No
Divya Menon,Female,Tier 2,Chennai,2,No
Amit Patel,Male,Tier 1,Ahmedabad,4,Yes
Kavitha Rao,Female,Tier 3,Bangalore,7,No
Suresh Iyer,Male,Tier 2,Bangalore,2,Yes
Meena Joshi,Female,Tier 1,Mumbai,5,Yes
Deepak Gupta,Male,Tier 3,Jaipur,3,No
Lakshmi Pillai,Female,Tier 2,Kochi,4,No
Nikhil Bose,Male,Tier 1,Kolkata,1,Yes
Ritu Verma,Female,Tier 3,Pune,6,No
Sanjay Krishnan,Male,Tier 2,Hyderabad,4,Yes
Pooja Agarwal,Female,Tier 1,Delhi,2,Yes
Karan Malhotra,Male,Tier 3,Mysore,5,No
Nandita Roy,Female,Tier 2,Bangalore,3,No`;

const DEMO_NOTE = 'Synthetic dataset · 20 candidates · reflects documented IIT/metro preference patterns in Indian tech hiring';

// ── CSV parser ─────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
  return { headers, rows };
}

// ── Disparate Impact Ratio (DIR) Engine ───────────────────
//
//  The 80% Rule (EEOC Uniform Guidelines, 1978):
//  DIR = hire_rate(disadvantaged) / hire_rate(advantaged)
//  DIR < 0.8 → legally considered discriminatory
//  DIR < 0.5 → severe disparity
//
//  This gives FairHire a MATH-BASED ground truth to validate
//  against Gemini's AI findings — so we never trust AI blindly.

function computeDIR(rows, field) {
  // Build hire rates per group value
  const groups = {};
  rows.forEach(row => {
    const val = row[field] || 'Unknown';
    const hired = (row['hired'] || '').toLowerCase() === 'yes';
    if (!groups[val]) groups[val] = { yes: 0, total: 0 };
    groups[val].total++;
    if (hired) groups[val].yes++;
  });

  // Only keep groups with at least 2 candidates (avoid noise)
  const valid = Object.entries(groups)
    .filter(([, g]) => g.total >= 2)
    .map(([name, g]) => ({
      name,
      hireRate: g.yes / g.total,
      hired: g.yes,
      total: g.total
    }));

  if (valid.length < 2) return null;

  // Advantaged group = highest hire rate
  valid.sort((a, b) => b.hireRate - a.hireRate);
  const advantaged    = valid[0];
  const disadvantaged = valid[valid.length - 1];

  const dir = advantaged.hireRate > 0
    ? disadvantaged.hireRate / advantaged.hireRate
    : null;

  // Risk level from DIR
  let riskLevel, riskLabel;
  if (dir === null)  { riskLevel = 'UNKNOWN'; riskLabel = 'Insufficient data'; }
  else if (dir < 0.5) { riskLevel = 'HIGH';   riskLabel = 'Severe disparity'; }
  else if (dir < 0.8) { riskLevel = 'HIGH';   riskLabel = 'Fails 80% rule (legally discriminatory)'; }
  else if (dir < 0.9) { riskLevel = 'MEDIUM'; riskLabel = 'Borderline — monitor closely'; }
  else               { riskLevel = 'LOW';    riskLabel = 'Passes 80% rule'; }

  return {
    field,
    dir: dir !== null ? Math.round(dir * 100) / 100 : null,
    dirPct: dir !== null ? Math.round(dir * 100) : null,
    riskLevel,
    riskLabel,
    advantaged:    { ...advantaged,    hireRatePct: Math.round(advantaged.hireRate * 100) },
    disadvantaged: { ...disadvantaged, hireRatePct: Math.round(disadvantaged.hireRate * 100) },
    allGroups: valid.map(g => ({ ...g, hireRatePct: Math.round(g.hireRate * 100) })),
    passes80Rule: dir !== null && dir >= 0.8
  };
}

// Run DIR across all relevant fields and compare to AI findings
function computeValidation(rows, aiResult) {
  const fields = ['gender', 'college_tier', 'location'];
  const dirResults = fields
    .map(f => computeDIR(rows, f))
    .filter(Boolean);

  // Match each DIR result to the AI's risk_level
  // A "match" means both point in the same direction
  const comparisons = dirResults.map(dir => {
    // Find relevant AI finding if any
    const aiRiskLevel = aiResult.risk_level; // overall level
    const mathHigh  = dir.riskLevel === 'HIGH';
    const aiHigh    = aiRiskLevel   === 'HIGH';
    const match     = (mathHigh === aiHigh) ||
                      (dir.riskLevel === 'MEDIUM' && aiRiskLevel !== 'LOW') ||
                      (dir.riskLevel === 'LOW'    && aiRiskLevel === 'LOW');

    return { ...dir, aiRiskLevel, match };
  });

  const matchCount  = comparisons.filter(c => c.match).length;
  const trustScore  = comparisons.length > 0
    ? Math.round((matchCount / comparisons.length) * 100)
    : 0;

  return { dirResults, comparisons, trustScore, matchCount, total: comparisons.length };
}

// ── Compute hire rates for heatmap ────────────────────────
// Returns a matrix: { rowKey, colKey, hireRate, count }
function computeHireMatrix(rows, rowField, colField) {
  const matrix = {};

  rows.forEach(row => {
    const r = row[rowField] || 'Unknown';
    const c = row[colField] || 'Unknown';
    const hired = (row['hired'] || '').toLowerCase() === 'yes';
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
