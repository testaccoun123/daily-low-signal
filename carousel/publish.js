// Publishes a carousel from a post folder to Instagram via the Graph API.
//
// Usage:
//   node carousel/publish.js posts/2026-11-10 --base-url https://.../posts/2026-11-10 [--dry-run]
//
// The folder must contain slide-1.jpg ... slide-N.jpg and caption.txt.
// --base-url is the PUBLIC web address where those slide images are reachable
// (Instagram downloads them from there). --dry-run checks everything without publishing.
// Reads IG_ACCESS_TOKEN, IG_USER_ID, IG_API_BASE from .env in the project root.

const fs = require('fs');
const path = require('path');

function loadEnv() {
  // Local: read .env. Cloud: values come from environment variables (they win if set).
  const file = path.join(__dirname, '..', '.env');
  const env = {};
  if (fs.existsSync(file)) for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)=(.*)$/);
    if (m && m[2].trim()) env[m[1]] = m[2].trim();
  }
  for (const k of ['IG_ACCESS_TOKEN', 'IG_USER_ID', 'IG_API_BASE']) if (process.env[k]) env[k] = process.env[k];
  for (const k of ['IG_ACCESS_TOKEN', 'IG_USER_ID']) if (!env[k]) throw new Error(`${k} missing in .env`);
  env.IG_API_BASE = env.IG_API_BASE || 'https://graph.facebook.com/v23.0';
  return env;
}

function parseArgs() {
  const a = process.argv.slice(2);
  const opts = { dir: a[0], dryRun: a.includes('--dry-run') };
  const i = a.indexOf('--base-url');
  if (i >= 0) opts.baseUrl = a[i + 1].replace(/\/$/, '');
  if (!opts.dir || !opts.baseUrl) throw new Error('Usage: node carousel/publish.js <post-dir> --base-url <public-url> [--dry-run]');
  return opts;
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

async function waitReady(env, id) {
  for (let i = 0; i < 30; i++) {
    const { status_code } = await api(env, 'GET', id, { fields: 'status_code' });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`container ${id} ${status_code}`);
    await sleep(3000);
  }
  throw new Error(`container ${id} not ready in time`);
}

(async () => {
  const env = loadEnv();
  const { dir, baseUrl, dryRun } = parseArgs();
  const slides = fs.readdirSync(dir).filter((f) => /^slide-\d+\.jpg$/.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
  const caption = fs.readFileSync(path.join(dir, 'caption.txt'), 'utf8').trim();
  if (slides.length < 2 || slides.length > 10) throw new Error(`carousel needs 2-10 images, found ${slides.length}`);
  if (caption.length > 2200) throw new Error('caption longer than 2200 characters');

  const urls = slides.map((f) => `${baseUrl}/${f}`);
  console.log(`${slides.length} slides, caption ${caption.length} chars`);

  // Check that every image is publicly reachable as a JPEG (Instagram must be able to download it).
  for (const u of urls) {
    const r = await fetch(u, { method: 'HEAD' });
    const type = r.headers.get('content-type') || '';
    if (!r.ok || !/jpe?g/.test(type)) throw new Error(`not reachable as JPEG: ${u} (${r.status} ${type})`);
  }
  console.log('all images reachable');

  const quota = await api(env, 'GET', `${env.IG_USER_ID}/content_publishing_limit`, { fields: 'quota_usage,config' });
  console.log('publishing quota:', JSON.stringify(quota.data[0]));

  if (dryRun) { console.log('DRY RUN: nothing published'); return; }

  const children = [];
  for (const u of urls) {
    const { id } = await api(env, 'POST', `${env.IG_USER_ID}/media`, { image_url: u, is_carousel_item: 'true' });
    children.push(id);
    console.log('item container', id);
  }
  for (const id of children) await waitReady(env, id);

  const { id: carousel } = await api(env, 'POST', `${env.IG_USER_ID}/media`, {
    media_type: 'CAROUSEL', children: children.join(','), caption,
  });
  await waitReady(env, carousel);

  const { id: mediaId } = await api(env, 'POST', `${env.IG_USER_ID}/media_publish`, { creation_id: carousel });
  const { permalink } = await api(env, 'GET', mediaId, { fields: 'permalink' });
  console.log('PUBLISHED', mediaId, permalink);
  fs.writeFileSync(path.join(dir, 'published.json'), JSON.stringify({ mediaId, permalink, at: new Date().toISOString() }, null, 2));
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
