const SHEET_ID = ''; // paste Portfolio Cap Tables sheet ID here
const GID = '0';     // first sheet tab

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { company = '', shareholder = '' } = req.query;

  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    const r = await fetch(url);
    const csv = await r.text();

    const rows = csv.trim().split('\n').map(row => {
      const cols = row.match(/(".*?"|[^,]+|(?<=,)(?=,))/g) || row.split(',');
      return cols.map(c => c.replace(/^"|"$/g, '').trim());
    });

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i] || '');
      return obj;
    });

    // Filter by company if provided
    let filtered = data;
    if (company) {
      const cl = company.toLowerCase();
      filtered = data.filter(r => r['Company'] && r['Company'].toLowerCase().includes(cl));
    }

    // Filter by shareholder if provided
    if (shareholder) {
      const sl = shareholder.toLowerCase();
      filtered = filtered.filter(r => r['Shareholder'] && r['Shareholder'].toLowerCase().includes(sl));
    }

    res.json({ rows: filtered, total: filtered.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
