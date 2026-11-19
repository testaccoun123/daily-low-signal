// One-time YouTube login: gets a refresh token so the routine can upload Shorts by itself.
// Usage (on your own computer): node carousel/youtube-auth.js
// Needs YT_CLIENT_ID and YT_CLIENT_SECRET in .env (OAuth client of type "Desktop app").
// Opens a Google sign-in link; sign in with the channel's (anonymous) Google account and allow upload.
// Writes YT_REFRESH_TOKEN into .env. Nothing secret is printed.
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { execFile } = require('child_process');

const envFile = path.join(__dirname, '..', '.env');
const env = {};
for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) { const m = line.match(/^\s*([A-Z_]+)=(.*)$/); if (m && m[2].trim()) env[m[1]] = m[2].trim(); }
if (!env.YT_CLIENT_ID || !env.YT_CLIENT_SECRET) { console.error('Add YT_CLIENT_ID and YT_CLIENT_SECRET to .env first.'); process.exit(1); }

const PORT = 53682, REDIRECT = `http://127.0.0.1:${PORT}`;
const state = crypto.randomBytes(16).toString('hex');
const verifier = crypto.randomBytes(32).toString('base64url');
const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: env.YT_CLIENT_ID, redirect_uri: REDIRECT, response_type: 'code', access_type: 'offline', prompt: 'consent',
  scope: 'https://www.googleapis.com/auth/youtube.upload', state, code_challenge: challenge, code_challenge_method: 'S256',
});

const server = http.createServer(async (req, res) => {
  const q = new URL(req.url, REDIRECT).searchParams;
  if (!q.get('code') && !q.get('error')) { res.end(); return; }
  if (q.get('state') !== state || q.get('error')) { res.end('Login failed or cancelled. Close this tab and try again.'); console.error('login failed:', q.get('error') || 'state mismatch'); server.close(); return; }
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({
    code: q.get('code'), client_id: env.YT_CLIENT_ID, client_secret: env.YT_CLIENT_SECRET, redirect_uri: REDIRECT, grant_type: 'authorization_code', code_verifier: verifier }) });
  const tok = await r.json();
  if (!tok.refresh_token) { res.end('No refresh token received. Close this tab.'); console.error('no refresh_token:', tok.error || 'unknown'); server.close(); return; }
  let text = fs.readFileSync(envFile, 'utf8');
  text = /^YT_REFRESH_TOKEN=.*$/m.test(text) ? text.replace(/^YT_REFRESH_TOKEN=.*$/m, `YT_REFRESH_TOKEN=${tok.refresh_token}`) : text.trimEnd() + `\nYT_REFRESH_TOKEN=${tok.refresh_token}\n`;
  fs.writeFileSync(envFile, text);
  res.end('YouTube connected. You can close this tab.');
  console.log('OK: YT_REFRESH_TOKEN saved to .env');
  server.close();
});
server.listen(PORT, '127.0.0.1', () => {
  console.log('Opening Google sign-in in your browser. If it does not open, copy this link:\n' + url);
  if (process.platform === 'win32') execFile('cmd', ['/c', 'start', '', url.replace(/&/g, '^&')]);
});
