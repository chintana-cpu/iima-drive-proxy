const SHEET_ID = '1ILNj-fx6F87RqyAcifxrUIaRTipnrg7ByUuXbihAzPI';
const SHEET_NAME = 'Portfolio';

const KEEP_COLUMNS = [
  'Company Name', 'Legal Name', 'Status', 'Investment Date',
  'CIIE Investment (INR)', 'CIIE Grant (INR)', 'Total Round Size (INR)',
  'Post Money Valuation (INR)', 'Last Valuation (INR)', 'Current Stake',
  'Follow-On Raised (INR)', 'Exit Amount (INR)', 'IRR', 'Multiplier',
  'Date of Write-off', 'Owners'
];

function parseCSV(text) {
  const lines = text.split('\n');
  const headers = lines[0].split('	').map(h => h.replace(/"/g, '').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '"') { inQuotes = !inQuotes; }
      else if (line[j] === '	' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += line[j]; }
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, idx) => { if (KEEP_COLUMNS.includes(h)) row[h] = values[idx] || ''; });
    if (row['Company Name']) rows.push(row);
  }
  return rows;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Sheet fetch failed: ${r.status}`);
    const csv = await r.text();
    const companies = parseCSV(csv);
    res.json({ count: companies.length, companies });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
