// ── Demo dataset ──────────────────────────────────────────
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
Nikhil Bose,Male,Tier 1,Kolkata,1,Yes`;

// ── CSV parser ─────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
  return { headers, rows };
}
