// Uploads a post's reel.mp4 to YouTube as a Short.
// Usage: node carousel/publish-youtube.js posts/YYYY-MM-DD [--dry-run] [--privacy public|unlisted|private]
// Needs YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN (from .env or env vars).
// Used for every reel: news reels (category News) and xQc clips (category Gaming; the account owner
// has written permission from xQc for all platforms).
// Note: until the Google Cloud project passes YouTube's API compliance audit, YouTube forces
// API uploads to "private" regardless of --privacy.
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const env = {};
  const file = path.join(__dirname, '..', '.env');
  if (fs.existsSync(file)) for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) { const m = line.match(/^\s*([A-Z_]+)=(.*)$/); if (m && m[2].trim()) env[m[1]] = m[2].trim(); }
  for (const k of ['YT_CLIENT_ID', 'YT_CLIENT_SECRET', 'YT_REFRESH_TOKEN']) if (process.env[k]) env[k] = process.env[k];
  for (const k of ['YT_CLIENT_ID', 'YT_CLIENT_SECRET', 'YT_REFRESH_TOKEN']) if (!env[k]) throw new Error(`${k} missing`);
  return env;
}

(async () => {
  const args = process.argv.slice(2);
  const dir = args[0];
  const dryRun = args.includes('--dry-run');
  const pi = args.indexOf('--privacy');
  const privacy = pi >= 0 ? args[pi + 1] : 'public';
  if (!dir) throw new Error('Usage: node carousel/publish-youtube.js <post-dir> [--dry-run] [--privacy public|unlisted|private]');
  const env = loadEnv();
  const video = path.join(dir, 'reel.mp4');
  const caption = fs.readFileSync(path.join(dir, 'caption.txt'), 'utf8').trim();
  const content = fs.existsSync(path.join(dir, 'content.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'content.json'), 'utf8')) : {};
  const isClip = content.type === 'clip'; // xQc clips: owner has written permission for all platforms

  // Title: the caption's first line without emoji, max 100 chars incl. " #Shorts".
  const first = caption.split('\n')[0].replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();
  const title = (first.length > 90 ? first.slice(0, first.lastIndexOf(' ', 88)) + '…' : first) + ' #Shorts';
  const tags = [...new Set((caption.match(/#\w+/g) || []).map((t) => t.slice(1)))].slice(0, 15);
  const meta = { snippet: { title, description: caption, tags, categoryId: isClip ? '20' /* Gaming */ : '25' /* News & Politics */ },
    status: { privacyStatus: privacy, selfDeclaredMadeForKids: false } };
  console.log(`title: ${title}\ntags: ${tags.join(', ')}\nprivacy: ${privacy}, ${(fs.statSync(video).size / 1e6).toFixed(1)} MB`);

  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({
    client_id: env.YT_CLIENT_ID, client_secret: env.YT_CLIENT_SECRET, refresh_token: env.YT_REFRESH_TOKEN, grant_type: 'refresh_token' }) });
  const tok = await tr.json();
  if (!tok.access_token) throw new Error(`token refresh failed: ${tok.error || tr.status}`);
  if (dryRun) { console.log('DRY RUN: credentials OK, nothing uploaded'); return; }

  const bytes = fs.readFileSync(video);
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok.access_token}`, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': String(bytes.length) },
    body: JSON.stringify(meta),
  });
  if (!init.ok) throw new Error(`upload init failed: ${init.status} ${await init.text()}`);
  const up = await fetch(init.headers.get('location'), { method: 'PUT', headers: { 'Content-Type': 'video/mp4' }, body: bytes });
  const v = await up.json();
  if (!up.ok || !v.id) throw new Error(`upload failed: ${up.status} ${JSON.stringify(v.error || v)}`);
  const link = `https://youtube.com/shorts/${v.id}`;
  fs.writeFileSync(path.join(dir, 'youtube.json'), JSON.stringify({ id: v.id, link, privacy: v.status && v.status.privacyStatus, at: new Date().toISOString() }, null, 2));
  console.log(`UPLOADED ${link} (privacy: ${v.status && v.status.privacyStatus})`);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
