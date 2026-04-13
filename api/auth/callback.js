export default async function handler(req, res) {
  const { code } = req.query;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });
  const tokens = await r.json();
  if (tokens.refresh_token) {
    res.send(`<h2>✅ Done!</h2><p>Copy this refresh token and save it:</p><pre>${tokens.refresh_token}</pre>`);
  } else {
    res.send(`<pre>${JSON.stringify(tokens, null, 2)}</pre>`);
  }
}
