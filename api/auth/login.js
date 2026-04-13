export default function handler(req, res) {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
    `response_type=code&` +
    `scope=https://www.googleapis.com/auth/gmail.readonly&` +
    `access_type=offline&prompt=consent`;
  res.redirect(url);
}
