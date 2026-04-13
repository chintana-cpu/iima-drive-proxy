const SHEET_ID = '1ILNj-fx6F87RqyAcifxrUIaRTipnrg7ByUuXbihAzPI';
const SHEET_NAME = 'Portfolio';

const KEEP_COLUMNS = [
  'Company Name', 'Legal Name', 'Status', 'Investment Date',
  'CIIE Investment (INR)', 'CIIE Grant (INR)', 'Total Round Size (INR)',
  'Post Money Valuation (INR)', 'Last Valuation (INR)', 'Current Stake',
  'Follow-On Raised (INR)', 'Exit Amount (INR)', 'IRR', 'Multiplier',
  'Date of Write-off'
];

function parseTSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split('\t').map(h => h.replace(/"/g, '').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t').map(v => v.replace(/"/g, '').trim());
    const row = {};
    headers.forEach((h, idx) => {
      if (KEEP_COLUMNS.includes(h)) row[h] = values[idx] || '';
    });
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
    const text = await r.text();
    const companies = parseTSV(text);
    res.json({ count: companies.length, companies });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
