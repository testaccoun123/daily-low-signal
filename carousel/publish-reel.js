// Publishes a Reel (reel.mp4 + caption.txt in a post folder) to Instagram via the Graph API.
// The video is uploaded directly to Instagram (resumable upload) — no public hosting needed.
//
// Usage:
//   node carousel/publish-reel.js posts/YYYY-MM-DD --dry-run   checks file, length, caption, quota; uploads nothing
//   node carousel/publish-reel.js posts/YYYY-MM-DD --stage     uploads + waits for processing, but does NOT publish
//   node carousel/publish-reel.js posts/YYYY-MM-DD             uploads and publishes
// Reads IG_ACCESS_TOKEN, IG_USER_ID, IG_API_BASE (+ GITHUB_TOKEN, GITHUB_REPO for the archive) from .env or env vars.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function loadEnv() {
  const env = {};
  const file = path.join(__dirname, '..', '.env');
  if (fs.existsSync(file)) for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)=(.*)$/);
    if (m && m[2].trim()) env[m[1]] = m[2].trim();
  }
  for (const k of ['IG_ACCESS_TOKEN', 'IG_USER_ID', 'IG_API_BASE', 'GITHUB_TOKEN', 'GITHUB_REPO']) if (process.env[k]) env[k] = process.env[k];
  for (const k of ['IG_ACCESS_TOKEN', 'IG_USER_ID']) if (!env[k]) throw new Error(`${k} missing`);
  env.IG_API_BASE = env.IG_API_BASE || 'https://graph.facebook.com/v23.0';
  return env;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(env, method, endpoint, params = {}) {
  const url = new URL(`${env.IG_API_BASE}/${endpoint}`);
  const init = { method, headers: { Authorization: `Bearer ${env.IG_ACCESS_TOKEN}` } };
  if (method === 'GET') for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  else init.body = new URLSearchParams(params);
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`${endpoint}: ${JSON.stringify(data.error || data)}`);
  return data;
}

function videoInfo(file) {
  let ffmpeg;
  try { ffmpeg = require('ffmpeg-static'); } catch { ffmpeg = require(path.join(__dirname, '..', 'reel', 'node_modules', 'ffmpeg-static')); }
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const txt = r.stderr || '';
  const d = txt.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const size = txt.match(/, (\d{3,4})x(\d{3,4})/);
  return {
    seconds: d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : NaN,
    width: size ? Number(size[1]) : NaN, height: size ? Number(size[2]) : NaN,
    h264: /Video: h264/.test(txt), aac: /Audio: aac/.test(txt),
  };
}

async function archiveToRepo(env, dir, names) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) { console.log('archive skipped: no GITHUB_TOKEN/GITHUB_REPO'); return; }
  const headers = { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'feed-publisher' };
  const folder = path.basename(path.resolve(dir));
  for (const name of names) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) continue;
    const repoPath = `posts/${folder}/${name}`;
    const url = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${repoPath}`;
    const existing = await fetch(url, { headers });
    const sha = existing.ok ? (await existing.json()).sha : undefined;
    const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify({ message: `Archive ${repoPath}`, content: fs.readFileSync(file).toString('base64'), ...(sha ? { sha } : {}) }) });
    console.log(res.ok ? `archived ${repoPath}` : `archive failed for ${repoPath}: ${res.status}`);
  }
}

(async () => {
  const args = process.argv.slice(2);
  const dir = args[0];
  const dryRun = args.includes('--dry-run'), stage = args.includes('--stage');
  if (!dir) throw new Error('Usage: node carousel/publish-reel.js <post-dir> [--dry-run|--stage]');
  const env = loadEnv();
  const video = path.join(dir, 'reel.mp4');
  if (!fs.existsSync(video)) throw new Error(`missing ${video}`);
  const caption = fs.readFileSync(path.join(dir, 'caption.txt'), 'utf8').trim();
  if (caption.length > 2200) throw new Error('caption longer than 2200 characters');

  const info = videoInfo(video);
  const bytes = fs.statSync(video).size;
  console.log(`reel ${info.width}x${info.height}, ${info.seconds.toFixed(1)} s, ${(bytes / 1e6).toFixed(1)} MB, caption ${caption.length} chars`);
  if (!(info.seconds >= 3 && info.seconds <= 90)) throw new Error('reel must be 3–90 s');
  if (info.width !== 1080 || info.height !== 1920) throw new Error('reel must be 1080x1920');
  if (!info.h264 || !info.aac) throw new Error('reel must be H.264 video + AAC audio');
  if (bytes > 300e6) throw new Error('reel larger than 300 MB');

  const quota = await api(env, 'GET', `${env.IG_USER_ID}/content_publishing_limit`, { fields: 'quota_usage,config' });
  console.log('publishing quota:', JSON.stringify(quota.data[0]));
  if (dryRun) { console.log('DRY RUN: nothing uploaded or published'); return; }

  // 1) container with resumable upload  2) upload the bytes  3) wait for processing  4) publish
  const container = await api(env, 'POST', `${env.IG_USER_ID}/media`, {
    media_type: 'REELS', upload_type: 'resumable', caption, share_to_feed: 'true', thumb_offset: '1600',
  });
  console.log('container', container.id);
  const up = await fetch(container.uri || `https://rupload.facebook.com/ig-api-upload/${env.IG_API_BASE.split('/').pop()}/${container.id}`, {
    method: 'POST',
    headers: { Authorization: `OAuth ${env.IG_ACCESS_TOKEN}`, offset: '0', file_size: String(bytes) },
    body: fs.readFileSync(video),
  });
  const upRes = await up.json().catch(() => ({}));
  if (!up.ok || upRes.success === false) throw new Error(`upload failed: ${up.status} ${JSON.stringify(upRes)}`);
  console.log('uploaded');

  for (let i = 0; i < 60; i++) {
    const { status_code, status } = await api(env, 'GET', container.id, { fields: 'status_code,status' });
    if (status_code === 'FINISHED') break;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`processing ${status_code}: ${status}`);
    if (i === 59) throw new Error('processing timed out');
    await sleep(5000);
  }
  console.log('processed');
  if (stage) { console.log(`STAGED (not published). Container ${container.id} expires in 24 h.`); return; }

  const { id: mediaId } = await api(env, 'POST', `${env.IG_USER_ID}/media_publish`, { creation_id: container.id });
  const { permalink } = await api(env, 'GET', mediaId, { fields: 'permalink' });
  console.log('PUBLISHED', mediaId, permalink);
  fs.writeFileSync(path.join(dir, 'published.json'), JSON.stringify({ mediaId, permalink, type: 'REELS', at: new Date().toISOString() }, null, 2));
  await archiveToRepo(env, dir, ['content.json', 'caption.txt', 'published.json', 'cover.jpg']).catch((e) => console.log('archive failed:', e.message));
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
