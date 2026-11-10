// Uploads a post folder's slides to a public GitHub repo via the GitHub API (no git needed)
// and prints the public base URL to pass to publish.js.
//
// Usage: node carousel/upload.js posts/2026-11-10
// Needs in .env: GITHUB_TOKEN (fine-grained, Contents: read/write on that repo only)
//                GITHUB_REPO  (e.g. myuser/daily-low-signal)

const fs = require('fs');
const path = require('path');

function loadEnv() {
  // Local: read .env. Cloud: values come from environment variables (they win if set).
  const env = {};
  const file = path.join(__dirname, '..', '.env');
  if (fs.existsSync(file)) for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)=(.*)$/);
    if (m && m[2].trim()) env[m[1]] = m[2].trim();
  }
  for (const k of ['GITHUB_TOKEN', 'GITHUB_REPO']) if (process.env[k]) env[k] = process.env[k];
  for (const k of ['GITHUB_TOKEN', 'GITHUB_REPO']) if (!env[k]) throw new Error(`${k} missing in .env`);
  return env;
}

async function gh(env, method, endpoint, body) {
  const res = await fetch(`https://api.github.com/${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'feed-publisher',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? {} : await res.json();
  if (!res.ok && !(method === 'GET' && res.status === 404)) throw new Error(`${method} ${endpoint}: ${res.status} ${data.message}`);
  return { status: res.status, data };
}

(async () => {
  const env = loadEnv();
  const dir = process.argv[2];
  if (!dir) throw new Error('Usage: node carousel/upload.js <post-dir>');
  const folder = path.basename(path.resolve(dir));
  const slides = fs.readdirSync(dir).filter((f) => /^slide-\d+\.jpg$/.test(f));
  if (!slides.length) throw new Error('no slide-*.jpg files found');

  const repo = await gh(env, 'GET', `repos/${env.GITHUB_REPO}`);
  if (repo.status === 404) throw new Error(`repo ${env.GITHUB_REPO} not found or token has no access`);
  if (repo.data.private) throw new Error('repo is private; Instagram cannot download images from a private repo');
  const branch = repo.data.default_branch;

  for (const f of slides) {
    const repoPath = `posts/${folder}/${f}`;
    const existing = await gh(env, 'GET', `repos/${env.GITHUB_REPO}/contents/${repoPath}?ref=${branch}`);
    await gh(env, 'PUT', `repos/${env.GITHUB_REPO}/contents/${repoPath}`, {
      message: `Add ${repoPath}`,
      content: fs.readFileSync(path.join(dir, f)).toString('base64'),
      branch,
      ...(existing.status === 200 ? { sha: existing.data.sha } : {}),
    });
    console.log('uploaded', repoPath);
  }
  const base = `https://raw.githubusercontent.com/${env.GITHUB_REPO}/${branch}/posts/${folder}`;
  console.log('BASE_URL', base);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
