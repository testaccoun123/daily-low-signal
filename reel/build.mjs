// Builds today's reel for a post folder.
//   node build.mjs ../posts/YYYY-MM-DD          -> ../posts/YYYY-MM-DD/reel.mp4 (+ cover.jpg)
//   node build.mjs ../posts/YYYY-MM-DD --skip-voice   (reuse existing voice/timeline, e.g. after editing scenes)
// Steps: 1) voice-over + word timings (Kokoro)  2) type-check scenes  3) sound effects  4) Remotion render  5) cover frame
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const post = path.resolve(process.argv[2] || '');
if (!fs.existsSync(path.join(post, 'content.json'))) { console.error('Usage: node build.mjs <post-dir with content.json>'); process.exit(1); }
const skipVoice = process.argv.includes('--skip-voice');

const run = (label, cmd, args) => {
  const t0 = Date.now();
  console.log(`\n== ${label}`);
  // npx is a .cmd on Windows, so it needs a shell there; args are fixed strings + our own paths.
  const r = spawnSync(cmd, args.map((a) => (process.platform === 'win32' && /\s/.test(a) ? `"${a}"` : a)), { cwd: here, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) { console.error(`FAILED: ${label}`); process.exit(1); }
  console.log(`   ${label} done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
};

if (!skipVoice) run('voice-over (Kokoro)', process.execPath, ['prepare-kokoro.mjs', post]);
run('type-check scenes', 'npx', ['tsc', '-p', '.']);
run('sound effects', process.execPath, ['sfx/song.js']);
const out = path.join(post, 'reel.mp4');
run('render (Remotion)', 'npx', ['remotion', 'render', 'src/index.ts', 'Reel', out, '--concurrency=50%', '--crf=18', '--pixel-format=yuv420p', '--log=error']);

// Cover image for the Reels grid: a strong frame from the hook (~1.6 s in).
const ffmpeg = require('ffmpeg-static');
spawnSync(ffmpeg, ['-v', 'error', '-y', '-ss', '1.6', '-i', out, '-frames:v', '1', '-q:v', '2', path.join(post, 'cover.jpg')]);
const tl = JSON.parse(fs.readFileSync(path.join(here, 'src', 'timeline.json'), 'utf8'));
console.log(`\nwrote ${out} (${(tl.total / tl.fps).toFixed(1)} s) and cover.jpg`);
