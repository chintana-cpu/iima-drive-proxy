const GAS = 'https://script.google.com/macros/s/AKfycbxKslEZWlXa1r7Qhc-Gid5T4un9-5OF2T8T7KORZ41yNtqzBp8o5qRIVfJGiYGOM8qX/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { company = '', query = 'all', list_only = 'false' } = req.query;
  if (!company) return res.status(400).json({ error: 'Missing company' });

  try {
    const url = `${GAS}?company=${encodeURIComponent(company)}&query=${encodeURIComponent(query)}&format=json`;
    const r    = await fetch(url);
    const data = await r.json();

    // If list_only, strip content to keep response small
    if (list_only === 'true') {
      return res.json({ all_docs: data.all_docs || [], document: data.document });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
