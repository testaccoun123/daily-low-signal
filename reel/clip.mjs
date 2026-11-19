// Streamer clip reels (only for streamers who gave written permission — see ROUTINE-clips.md).
//
//   node clip.mjs list  [--channel xqc] [--game auto|"<Twitch category>"] [--default "Grand Theft Auto VI"] [--n 20]
//        -> first line {"decision": {game, pivot, reason}}: which game to post today (auto = default game unless
//           another game dominates the top clips), then that game's clips by views, already-posted ones removed
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

// Twitch categories that are not games — never pivot to these.
const NON_GAMES = new Set(['Just Chatting', 'IRL', 'Music', 'Talk Shows & Podcasts', 'Sports', 'Watch Party', 'Pools, Hot Tubs, and Beaches',
  'Art', 'Special Events', 'ASMR', 'Travel & Outdoors', 'Food & Drink', 'Science & Technology', 'Makers & Crafting', 'Software and Game Development']);

// Which game to post today: the default game, unless another game clearly dominates xQc's top clips.
// Pivot rule: another game has >= 2 of the top-5 clips AND more total views in the top 10 than the default.
// If the default game has no clips at all today, take the game with the most views in the top 10.
function decideGame(clips, def) {
  const top10 = clips.slice(0, 10), top5 = clips.slice(0, 5);
  const per = {};
  for (const c of top10) {
    if (!c.game || NON_GAMES.has(c.game)) continue;
    per[c.game] ??= { clipsTop10: 0, clipsTop5: 0, views: 0 };
    per[c.game].clipsTop10++; per[c.game].views += c.views || 0;
  }
  for (const c of top5) if (per[c.game]) per[c.game].clipsTop5++;
  const defViews = per[def]?.views || 0;
  const rivals = Object.entries(per).filter(([g]) => g !== def).sort((a, b) => b[1].views - a[1].views);
  const [g, s] = rivals[0] || [];
  if (g && s.clipsTop5 >= 2 && s.views > defViews) return { game: g, pivot: true, reason: `${g}: ${s.clipsTop5} of top 5, ${s.views} views vs ${def} ${defViews}`, perGame: per };
  if (!per[def] && g) return { game: g, pivot: true, reason: `no ${def} clips in the top 10 today; ${g} has the most views`, perGame: per };
  return { game: def, pivot: false, reason: g ? `${def} keeps the lead (${defViews} views vs ${g} ${s.views}, ${s.clipsTop5} in top 5)` : `only ${def} among games`, perGame: per };
}

async function list() {
  const channel = opt('--channel', 'xqc'), n = Number(opt('--n', '20'));
  const gameArg = opt('--game', 'auto'), def = opt('--default', 'Grand Theft Auto VI');
  const urls = run(YTDLP, ['--flat-playlist', '--playlist-end', String(n), '--print', '%(url)s', `https://www.twitch.tv/${channel}/clips?filter=clips&range=24hr`]).trim().split(/\r?\n/).filter(Boolean);
  const clips = [];
  for (const url of urls) {
    const j = JSON.parse(run(YTDLP, ['-J', url]));
    clips.push({ url, slug: String(j.display_id).split('-')[0], views: j.view_count, seconds: j.duration, title: j.title,
      game: (j.categories || [])[0] || null, portrait: (j.formats || []).some((f) => /^portrait/.test(f.format_id)) });
  }
  clips.sort((a, b) => (b.views || 0) - (a.views || 0));
  const decision = gameArg === 'auto' ? decideGame(clips, def) : { game: gameArg, pivot: false, reason: 'game set with --game' };
  console.log(JSON.stringify({ decision }));
  const posted = await postedSlugs();
  for (const c of clips) if (c.game === decision.game && !posted.has(c.slug)) console.log(JSON.stringify(c));
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
