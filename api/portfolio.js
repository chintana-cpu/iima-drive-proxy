const SHEET_ID = '1ILNj-fx6F87RqyAcifxrUIaRTipnrg7ByUuXbihAzPI';
const GID = '950821764';

const KEEP_COLUMNS = [
  'Company Name', 'Legal Name', 'Status', 'Investment Date',
  'CIIE Investment (INR)', 'CIIE Grant (INR)', 'Total Round Size (INR)',
  'Post Money Valuation (INR)', 'Last Valuation (INR)', 'Current Stake',
  'Follow-On Raised (INR)', 'Exit Amount (INR)', 'IRR', 'Multiplier',
  'Date of Write-off'
];

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += line[i];
    }
  }
  values.push(current.trim());
  return values;
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
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
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    if (!r.ok) throw new Error(`Sheet fetch failed: ${r.status}`);
    const text = await r.text();
    if (text.includes('<!DOCTYPE') || text.includes('<html')) throw new Error('Got HTML - sheet requires auth');
    const companies = parseCSV(text);
    res.json({ count: companies.length, companies });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
