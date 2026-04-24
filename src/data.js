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
