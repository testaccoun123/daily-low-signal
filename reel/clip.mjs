// Streamer clip reels (only for streamers who gave written permission — see ROUTINE-clips.md).
//
//   node clip.mjs list  [--channel xqc] [--game "Grand Theft Auto VI"] [--n 15]
//        -> today's most-viewed clips of that game, already-posted ones removed (JSON lines)
//   node clip.mjs build <clip-url> --hook "BIG HOOK TEXT" --label "short label" [--accent "#ff4fa3"] [--max 30]
//        -> posts/clip-YYYY-MM-DD-<slug>/{source.mp4, reel.mp4, cover.jpg, content.json}
// Then write caption.txt in that folder and publish with carousel/publish-reel.js.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const require = createRequire(import.meta.url);
const ffmpeg = require('ffmpeg-static');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const YTDLP = process.env.YTDLP || [path.join(root, 'tools', 'yt-dlp', 'yt-dlp.exe'), path.join(root, 'tools', 'yt-dlp', 'yt-dlp')].find((p) => fs.existsSync(p)) || 'yt-dlp';
const REPO = process.env.GITHUB_REPO || 'testaccoun123/daily-low-signal';

const run = (cmd, a, o = {}) => {
  const r = spawnSync(cmd, a, { encoding: 'utf8', maxBuffer: 1 << 28, ...o });
  if (r.status !== 0) throw new Error(`${path.basename(cmd)} failed: ${(r.stderr || '').slice(-600)}`);
  return r.stdout;
};
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });

async function postedSlugs() {
  const set = new Set();
  for (const d of fs.readdirSync(path.join(root, 'posts'))) if (d.startsWith('clip-')) set.add(d.split('-').pop());
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/posts`, { headers: { 'User-Agent': 'feed-publisher' } });
    for (const x of await res.json()) if (x.type === 'dir' && x.name.startsWith('clip-')) set.add(x.name.split('-').pop());
  } catch {}
  return set;
}

async function list() {
  const channel = opt('--channel', 'xqc'), game = opt('--game', 'Grand Theft Auto VI'), n = Number(opt('--n', '15'));
  const urls = run(YTDLP, ['--flat-playlist', '--playlist-end', String(n), '--print', '%(url)s', `https://www.twitch.tv/${channel}/clips?filter=clips&range=24hr`]).trim().split(/\r?\n/).filter(Boolean);
  const posted = await postedSlugs();
  for (const url of urls) {
    const j = JSON.parse(run(YTDLP, ['-J', url]));
    const slug = String(j.display_id).split('-')[0];
    if (!(j.categories || []).includes(game) || posted.has(slug)) continue;
    console.log(JSON.stringify({ url, slug, views: j.view_count, seconds: j.duration, title: j.title, portrait: (j.formats || []).some((f) => /^portrait/.test(f.format_id)) }));
  }
}

// Last pause between 18 s and `max` s, so the reel ends on a finished sentence.
function cutPoint(file, dur, max) {
  if (dur <= max) return dur;
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', file, '-t', String(max), '-af', 'silencedetect=noise=-32dB:d=0.25', '-f', 'null', '-'], { encoding: 'utf8' });
  const starts = [...(r.stderr || '').matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1])).filter((t) => t >= 18 && t <= max);
  return starts.length ? starts[starts.length - 1] + 0.15 : max;
}

async function build() {
  const url = args[1];
  const hook = opt('--hook'), label = opt('--label'), accent = opt('--accent', '#ff4fa3'), max = Number(opt('--max', '30'));
  if (!url || !hook || !label) throw new Error('Usage: node clip.mjs build <clip-url> --hook "..." --label "..."');
  const j = JSON.parse(run(YTDLP, ['-J', url]));
  const slug = String(j.display_id).split('-')[0];
  const dir = path.join(root, 'posts', `clip-${today()}-${slug}`);
  fs.mkdirSync(dir, { recursive: true });
  const portrait = (j.formats || []).filter((f) => /^portrait/.test(f.format_id)).sort((a, b) => (b.height || 0) - (a.height || 0))[0];
  const src = path.join(dir, 'source.mp4');
  run(YTDLP, ['-q', '-f', portrait ? portrait.format_id : 'best', '-o', src, '--force-overwrites', url]);

  const T = cutPoint(src, j.duration, max);
  // 9:16 H.264 30 fps for Remotion. Landscape fallback: centred game frame over a blurred, zoomed copy.
  const vf = portrait ? 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30'
    : "split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:5[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=0:(H-h)/2,fps=30";
  fs.mkdirSync(path.join(here, 'public'), { recursive: true });
  run(ffmpeg, ['-v', 'error', '-y', '-i', src, '-t', T.toFixed(2), '-vf', vf, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-b:a', '192k', path.join(here, 'public', 'clip.mp4')]);

  const frames = Math.floor(T * 30);
  const props = path.join(dir, 'props.json');
  fs.writeFileSync(props, JSON.stringify({ hook, label, accent, frames }));
  const out = path.join(dir, 'reel.mp4');
  const r = spawnSync('npx', ['remotion', 'render', 'src/index.ts', 'Clip', process.platform === 'win32' ? `"${out}"` : out, `--props=${process.platform === 'win32' ? `"${props}"` : props}`, '--crf=18', '--pixel-format=yuv420p', '--log=error'],
    { cwd: here, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) throw new Error('render failed');
  run(ffmpeg, ['-v', 'error', '-y', '-ss', '1.2', '-i', out, '-frames:v', '1', '-q:v', '2', path.join(dir, 'cover.jpg')]);
  fs.writeFileSync(path.join(dir, 'content.json'), JSON.stringify({ type: 'clip', channel: j.channel, clipUrl: url, slug, title: j.title, views: j.view_count, game: (j.categories || [])[0], seconds: Number(T.toFixed(2)), hook, label, stories: [{ topic: 'gaming', headline: j.title }] }, null, 2));
  console.log(`wrote ${out} (${T.toFixed(1)} s of ${j.duration} s)`);
}

const cmd = args[0];
(cmd === 'list' ? list() : cmd === 'build' ? build() : Promise.reject(new Error('use: list | build'))).catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
