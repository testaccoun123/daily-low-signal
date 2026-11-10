// Instagram statistics for the account and its recent posts.
//
// Usage: node carousel/stats.js [--posts 14] [--json stats.json]
// Needs IG_ACCESS_TOKEN with instagram_manage_insights (from .env locally, env vars in the cloud).
// Prints a readable report; --json also writes the raw numbers for the daily routine to learn from.

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const env = {};
  const file = path.join(__dirname, '..', '.env');
  if (fs.existsSync(file)) for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)=(.*)$/);
    if (m && m[2].trim()) env[m[1]] = m[2].trim();
  }
  for (const k of ['IG_ACCESS_TOKEN', 'IG_USER_ID', 'IG_API_BASE']) if (process.env[k]) env[k] = process.env[k];
  env.IG_API_BASE = env.IG_API_BASE || 'https://graph.facebook.com/v23.0';
  return env;
}

const env = loadEnv();
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const POSTS = parseInt(opt('--posts', '14'), 10);
const JSON_OUT = opt('--json', null);

async function api(endpoint, params = {}) {
  const url = new URL(`${env.IG_API_BASE}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.IG_ACCESS_TOKEN}` } });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error ? data.error.message : `HTTP ${res.status}`);
  return data;
}

// Fetch metrics one by one so a single unsupported metric doesn't hide the others.
async function insights(id, metrics, extra = {}) {
  const out = {};
  for (const m of metrics) {
    try {
      const { data } = await api(`${id}/insights`, { metric: m, ...extra });
      const d = data[0];
      if (!d) continue;
      out[m] = d.total_value ? d.total_value.value : (d.values ? d.values.reduce((s, v) => s + (v.value || 0), 0) : null);
    } catch (e) { out[m] = null; out._errors = [...(out._errors || []), `${m}: ${e.message}`]; }
  }
  return out;
}

const n = (v) => (v === null || v === undefined ? '–' : String(v));
const pad = (s, w) => String(s).padEnd(w);

(async () => {
  const day = 86400;
  const now = Math.floor(Date.now() / 1000);
  const account = await api(env.IG_USER_ID, { fields: 'username,followers_count,follows_count,media_count' });
  const acctMetrics = ['reach', 'views', 'accounts_engaged', 'total_interactions', 'profile_links_taps', 'follows_and_unfollows'];
  const last1 = await insights(env.IG_USER_ID, acctMetrics, { period: 'day', metric_type: 'total_value', since: now - day, until: now });
  const last7 = await insights(env.IG_USER_ID, acctMetrics, { period: 'day', metric_type: 'total_value', since: now - 7 * day, until: now });

  const { data: media } = await api(`${env.IG_USER_ID}/media`, {
    fields: 'id,caption,media_type,timestamp,permalink,like_count,comments_count', limit: POSTS,
  });
  const posts = [];
  for (const m of media) {
    const ins = await insights(m.id, ['reach', 'views', 'saved', 'shares', 'total_interactions']);
    const hook = (m.caption || '').split('\n')[0].slice(0, 90);
    const score = (ins.shares || 0) * 3 + (ins.saved || 0) * 2 + (m.comments_count || 0) * 2 + (m.like_count || 0);
    posts.push({ id: m.id, timestamp: m.timestamp, permalink: m.permalink, type: m.media_type, hook,
      caption: m.caption, likes: m.like_count, comments: m.comments_count, ...ins, score });
  }

  console.log(`@${account.username}  followers ${account.followers_count}  following ${account.follows_count}  posts ${account.media_count}\n`);
  console.log(pad('ACCOUNT', 22) + pad('24 h', 10) + '7 days');
  for (const m of acctMetrics) console.log(pad(m, 22) + pad(n(last1[m]), 10) + n(last7[m]));
  const errs = [...(last1._errors || [])];
  if (errs.length) console.log(`\n(not available: ${errs.map((e) => e.split(':')[0]).join(', ')})`);

  console.log(`\nPOSTS (newest first)`);
  console.log(pad('date', 12) + pad('reach', 8) + pad('views', 8) + pad('likes', 7) + pad('comm', 6) + pad('saves', 7) + pad('shares', 8) + 'hook');
  for (const p of posts) {
    console.log(pad(p.timestamp.slice(0, 10), 12) + pad(n(p.reach), 8) + pad(n(p.views), 8) + pad(n(p.likes), 7)
      + pad(n(p.comments), 6) + pad(n(p.saved), 7) + pad(n(p.shares), 8) + p.hook);
  }
  const ranked = [...posts].sort((a, b) => b.score - a.score || (b.reach || 0) - (a.reach || 0));
  if (ranked.length > 1) {
    console.log(`\nBEST (shares×3 + saves×2 + comments×2 + likes): ${ranked[0].hook}  → ${ranked[0].permalink}`);
  }

  if (JSON_OUT) {
    fs.writeFileSync(JSON_OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), account, last24h: last1, last7d: last7, posts: ranked }, null, 2));
    console.log(`\nwrote ${JSON_OUT}`);
  }
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
