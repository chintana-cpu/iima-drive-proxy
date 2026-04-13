async function getAccessToken() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  const d = await r.json();
  return d.access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { query = '' } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const token = await getAccessToken();
    const search = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { messages = [] } = await search.json();

    const emails = await Promise.all(messages.map(async m => {
      const msg = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = await msg.json();
      const headers = d.payload?.headers || [];
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      const snippet = d.snippet || '';
      return `[${date}] From: ${from}\nSubject: ${subject}\n${snippet}`;
    }));

    res.json({ emails });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
