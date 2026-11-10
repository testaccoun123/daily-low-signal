// Pushes the given project files to the GitHub repo via the API (no git needed).
// Usage: node carousel/push-files.js <file> [file...]
// Refuses to push .env or anything that looks like it contains a secret.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const env = {};
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)=(.*)$/);
  if (m && m[2].trim()) env[m[1]] = m[2].trim();
}
for (const k of ['GITHUB_TOKEN', 'GITHUB_REPO']) if (process.env[k]) env[k] = process.env[k];
const secrets = ['IG_ACCESS_TOKEN', 'GITHUB_TOKEN'].map((k) => env[k]).filter(Boolean);

async function gh(method, endpoint, body) {
  const res = await fetch(`https://api.github.com/${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'feed-publisher' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok && !(method === 'GET' && res.status === 404)) throw new Error(`${method} ${endpoint}: ${res.status} ${data.message}`);
  return { status: res.status, data };
}

(async () => {
  const files = process.argv.slice(2);
  const { data: repo } = await gh('GET', `repos/${env.GITHUB_REPO}`);
  for (const f of files) {
    const rel = path.relative(root, path.resolve(f)).split(path.sep).join('/');
    if (/(^|\/)\.env$/.test(rel)) throw new Error('refusing to push .env');
    const buf = fs.readFileSync(path.join(root, rel));
    if (secrets.some((s) => buf.includes(s))) throw new Error(`refusing to push ${rel}: contains a secret`);
    const existing = await gh('GET', `repos/${env.GITHUB_REPO}/contents/${rel}?ref=${repo.default_branch}`);
    await gh('PUT', `repos/${env.GITHUB_REPO}/contents/${rel}`, {
      message: `Update ${rel}`, content: buf.toString('base64'), branch: repo.default_branch,
      ...(existing.status === 200 ? { sha: existing.data.sha } : {}),
    });
    console.log('pushed', rel);
  }
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
