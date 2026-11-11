// Writes recent-stories.json (the "do not repeat tomorrow" list) from a published post's
// content.json, overwriting the previous list, and uploads it to the repo root via the GitHub API.
// Usage: node carousel/recent.js posts/2026-11-11
// Needs GITHUB_TOKEN and GITHUB_REPO (env or .env), same as upload.js.
const fs = require('fs');
const path = require('path');

(async () => {
  const dir = process.argv[2];
  if (!dir) throw new Error('Usage: node carousel/recent.js <post-dir>');
  const content = JSON.parse(fs.readFileSync(path.join(dir, 'content.json'), 'utf8'));
  const strip = (s) => String(s).replace(/<[^>]+>/g, '');
  const list = {
    posted: path.basename(path.resolve(dir)),
    date: content.date,
    stories: content.stories.map((s) => ({ topic: s.topic, headline: strip(s.headline), source: s.source })),
  };
  const text = JSON.stringify(list, null, 2) + '\n';
  fs.writeFileSync(path.join(__dirname, '..', 'recent-stories.json'), text);

  const env = { GITHUB_TOKEN: process.env.GITHUB_TOKEN, GITHUB_REPO: process.env.GITHUB_REPO };
  const envFile = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envFile)) for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(GITHUB_TOKEN|GITHUB_REPO)=(.*)$/);
    if (m && m[2].trim() && !env[m[1]]) env[m[1]] = m[2].trim();
  }
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) throw new Error('GITHUB_TOKEN / GITHUB_REPO missing');
  const api = async (method, endpoint, body) => {
    const res = await fetch(`https://api.github.com/${endpoint}`, {
      method,
      headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'feed-publisher' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok && !(method === 'GET' && res.status === 404)) throw new Error(`${method} ${endpoint}: ${res.status} ${data.message}`);
    return { status: res.status, data };
  };
  const repo = await api('GET', `repos/${env.GITHUB_REPO}`);
  const branch = repo.data.default_branch;
  const existing = await api('GET', `repos/${env.GITHUB_REPO}/contents/recent-stories.json?ref=${branch}`);
  await api('PUT', `repos/${env.GITHUB_REPO}/contents/recent-stories.json`, {
    message: `Update recent-stories.json (${list.posted})`,
    content: Buffer.from(text).toString('base64'),
    branch,
    ...(existing.status === 200 ? { sha: existing.data.sha } : {}),
  });
  console.log('updated recent-stories.json for', list.posted);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
