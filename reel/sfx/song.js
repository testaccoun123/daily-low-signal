// Renders the sound-effects track: places today's cues (src/today/cues.js) with the kit, then mixes.
//   node sfx/song.js   -> public/sfx/sfx.wav
// Run after prepare-kokoro.mjs (needs src/timeline.json and public/vo.wav).
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const ffmpeg = process.env.FFMPEG || require('ffmpeg-static');
process.env.FFMPEG = ffmpeg; // the engine's loadAudio() decodes with this

const MIX = require('./engine/audio/mix');
const { reverb } = require('./engine/audio/dsp');
const kit = require('./kit');
const { N, SR, LEN, hits, beds, send } = kit;

// ---- today's cues ----
// CUES=<path> selects another format's cues (e.g. src/fact/today/cues.js); default = today's news reel.
// SFX_STYLE=cosy: soft, tuned replacements for the hard sounds + a quiet warm pad bed under everything.
const COSY = (process.env.SFX_STYLE || 'cosy') === 'cosy'; // default since 2026-11-20; SFX_STYLE=classic = old hard sounds
const cueKit = COSY ? require('./cosy')(kit) : kit;
if (COSY && !process.env.CUES) require('./cosy').bed(kit);
require(process.env.CUES ? path.resolve(process.env.CUES) : '../src/today/cues.js')(cueKit);

// ---- mix ----
const wet = reverb(send, { room: 0.82, damp: 0.3, predelay: 0.015, hp: 250, lp: 7000 });
wet.mixInto(beds, 1.0);

// Duck under the voice: beds hard, hits a little (their transients still punch through).
const vo = MIX.loadAudio(path.join(__dirname, '..', 'public', 'vo.wav'), { length: LEN });
MIX.duck([beds], vo, { depth: 0.6, attack: 0.02, release: 0.3, threshold: 0.03 });
MIX.duck([hits], vo, { depth: 0.3, attack: 0.03, release: 0.2, threshold: 0.03 });

const mix = MIX.mixdown({ hits, beds }, { hits: 1.0, beds: 1.0 }, { stemDir: null });
MIX.highpass(mix, 28);
MIX.fadeOut(mix, LEN - 0.6, LEN);

// Loudness: effects sit ~SFX_UNDER LU under the voice (approved balance used a fixed make-up gain of 0.209).
const voL = MIX.lufs(vo), UNDER = Number(process.env.SFX_UNDER || 11);
const fxL = MIX.lufs(mix);
const g0 = process.env.SFX_GAIN ? Number(process.env.SFX_GAIN) : Math.min(0.5, Math.pow(10, (voL - UNDER - fxL) / 20));
console.log(`make-up gain ${g0.toFixed(3)}`);
for (let i = 0; i < N; i++) { mix.L[i] *= g0; mix.R[i] *= g0; }
MIX.master(mix, 1.0, 0.56); // SFX alone never above -5 dBTP

// Wherever voice + SFX would pass -1.8 dBFS, pull the SFX down just there.
const CEIL = 0.81;
const want = new Float32Array(N).fill(1);
for (let i = 0; i < N; i++) for (const [v, s] of [[vo.L[i], mix.L[i]], [vo.R[i], mix.R[i]]]) {
  if (Math.abs(v + s) > CEIL && Math.abs(s) > 1e-6) { const g = Math.max(0, (Math.sign(v + s) * CEIL - v) / s); if (g < want[i]) want[i] = g; }
}
const LA = Math.round(0.003 * SR); let gr = 1;
const minAhead = new Float32Array(N);
for (let i = 0; i < N; i++) { let m = 1; for (let k = 0; k <= LA && i + k < N; k++) if (want[i + k] < m) m = want[i + k]; minAhead[i] = m; }
for (let i = 0; i < N; i++) { gr = minAhead[i] < gr ? minAhead[i] : gr + (1 - gr) * 0.0005; mix.L[i] *= gr; mix.R[i] *= gr; }

const dir = path.join(__dirname, '..', 'public', 'sfx');
fs.mkdirSync(dir, { recursive: true });
const outF = path.join(dir, 'sfx-f32.wav');
MIX.writeWav(outF, mix);
const out16 = path.join(dir, 'sfx.wav');
const r = spawnSync(ffmpeg, ['-v', 'error', '-y', '-i', outF, '-c:a', 'pcm_s16le', out16]);
if (r.status !== 0) throw new Error(String(r.stderr));
fs.unlinkSync(outF);

let pk = 0, sumPk = 0;
for (let i = 0; i < N; i++) { pk = Math.max(pk, Math.abs(mix.L[i]), Math.abs(mix.R[i])); sumPk = Math.max(sumPk, Math.abs(mix.L[i] + vo.L[i]), Math.abs(mix.R[i] + vo.R[i])); }
const db = (x) => (20 * Math.log10(x)).toFixed(1);
console.log(`voice ${voL.toFixed(1)} LUFS | sfx ${MIX.lufs(mix).toFixed(1)} LUFS, peak ${db(pk)} dBFS | voice+sfx peak ${db(sumPk)} dBFS`);
console.log(`wrote ${path.relative(process.cwd(), out16)} (${LEN.toFixed(3)} s)`);
