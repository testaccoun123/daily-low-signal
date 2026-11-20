// Builds a "fact" reel (one fact, one continuous animation) for a post folder.
//   node build-fact.mjs ../posts/<dir>               -> <dir>/reel.mp4 (+ cover.jpg)
//   node build-fact.mjs ../posts/<dir> --skip-voice  (reuse voice/timeline after editing the scene)
// Scene: src/fact/today/ (index.ts exports FACT + ACCENT), cues: src/fact/today/cues.js.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const post = path.resolve(process.argv[2] || '');
if (!fs.existsSync(path.join(post, 'content.json'))) { console.error('Usage: node build-fact.mjs <post-dir with content.json>'); process.exit(1); }
const skipVoice = process.argv.includes('--skip-voice');
const run = (label, cmd, args, env = {}) => {
  const t0 = Date.now();
  console.log(`\n== ${label}`);
  const r = spawnSync(cmd, args, { cwd: here, stdio: 'inherit', env: { ...process.env, ...env } });
  if (r.status !== 0) { console.error(`FAILED: ${label}`); process.exit(1); }
  console.log(`   ${label} done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
};
if (!skipVoice) run('voice-over (Kokoro)', process.execPath, ['prepare-kokoro.mjs', post]);
run('type-check', 'npx', ['tsc', '-p', '.']);
run('sound effects', process.execPath, ['sfx/song.js'], { CUES: path.join(here, 'src', 'fact', 'today', 'cues.js') });
const out = path.join(post, 'reel.mp4');
run('render (Remotion)', 'npx', ['remotion', 'render', 'src/index.ts', 'Fact', out, '--concurrency=50%', '--crf=18', '--pixel-format=yuv420p', '--log=error']);
const ffmpeg = require('ffmpeg-static');
spawnSync(ffmpeg, ['-v', 'error', '-y', '-ss', '2.0', '-i', out, '-frames:v', '1', '-q:v', '2', path.join(post, 'cover.jpg')]);
const tl = JSON.parse(fs.readFileSync(path.join(here, 'src', 'timeline.json'), 'utf8'));
console.log(`\nwrote ${out} (${(tl.total / tl.fps).toFixed(1)} s) and cover.jpg`);
