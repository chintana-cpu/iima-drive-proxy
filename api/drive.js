export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { company = '', query = '' } = req.query;
  const GAS = 'https://script.google.com/macros/s/AKfycbxKslEZWlXa1r7Qhc-Gid5T4un9-5OF2T8T7KORZ41yNtqzBp8o5qRIVfJGiYGOM8qX/exec';
  const r = await fetch(`${GAS}?company=${encodeURIComponent(company)}&query=${encodeURIComponent(query)}&format=text`);
  const text = await r.text();
  res.setHeader('Content-Type', 'text/plain');
  res.send(text);
}
