// Voice-over with Kokoro-82M (Apache-2.0) + exact word timings from the model's own phoneme durations.
// Usage: node prepare-kokoro.mjs [post-dir] [voice] [speed]
// -> public/vo.wav, public/photo-*, src/timeline.json  (same shape as prepare.js)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KokoroTTS, TextSplitterStream } from 'kokoro-js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const post = path.resolve(process.argv[2] || path.join(root, 'posts', '_photo-test'));
const VOICE = process.argv[3] || 'bm_george'; // approved voice: George (UK male)
const SPEED = Number(process.argv[4] || 1.25); // approved speed
const SR = 24000, FPS = 30, PAD = 0.12, HOLD = 0.35;

const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX-timestamped', { dtype: 'fp32', device: 'cpu' });
// Capture the timestamped model's per-token durations alongside the waveform.
const model = tts.model;
let last = null;
tts.model = async (inputs) => { const out = await model(inputs); last = { ids: inputs.input_ids, out }; return out; };

const content = JSON.parse(fs.readFileSync(path.join(post, 'content.json'), 'utf8'));
const lines = [content.hook.voiceover, ...content.stories.map((s) => s.voiceover)];

// Trim leading/trailing near-silence so scenes start on the first word.
const trimBounds = (a) => {
  const th = 0.008;
  let s = 0, e = a.length - 1;
  while (s < a.length && Math.abs(a[s]) < th) s++;
  while (e > s && Math.abs(a[e]) < th) e--;
  return [Math.max(0, s - 480), Math.min(a.length, e + 960)];
};

const scenes = [];
const chunks = [];
let tSamples = 0;
for (const text of lines) {
  const words = text.split(/\s+/).filter(Boolean);
  const pieces = [];
  const splitter = new TextSplitterStream(); // kokoro-js never closes a string stream itself
  splitter.push(text);
  splitter.close();
  for await (const { phonemes, audio } of tts.stream(splitter, { voice: VOICE, speed: SPEED })) {
    const dur = Array.from(last.out.durations.data, Number);
    const toks = [...phonemes];
    if (dur.length !== toks.length + 2) console.warn(`token/duration mismatch ${dur.length} vs ${toks.length + 2}`);
    const spf = audio.audio.length / dur.reduce((a, b) => a + b, 0); // samples per duration unit
    // Word spans: split phoneme string on spaces; time = cumulative durations (skip BOS at index 0).
    const spans = [];
    let acc = dur[0], cur = null;
    toks.forEach((ch, k) => {
      const d = dur[k + 1];
      if (ch === ' ') { if (cur) { spans.push(cur); cur = null; } }
      else if (/[\p{L}\p{M}ˈˌːʲ]/u.test(ch)) { if (!cur) cur = { s: acc, e: acc + d }; else cur.e = acc + d; } // punctuation = pause, not word
      acc += d;
    });
    if (cur) spans.push(cur);
    // Trim each sentence's own edge silence and keep a short breath between sentences.
    const [ta, tb] = trimBounds(audio.audio);
    const gap = new Float32Array(pieces.length ? Math.round(0.1 * SR) : 0);
    const cut = audio.audio.slice(ta, tb);
    const buf = new Float32Array(gap.length + cut.length);
    buf.set(cut, gap.length);
    pieces.push({ audio: buf, spans: spans.map((x) => ({ s: x.s * spf - ta + gap.length, e: x.e * spf - ta + gap.length })) });
  }
  // Join sentence pieces.
  let off = 0;
  const allSpans = [];
  const bufs = [];
  for (const p of pieces) { p.spans.forEach((x) => allSpans.push({ s: x.s + off, e: x.e + off })); bufs.push(p.audio); off += p.audio.length; }
  const joined = new Float32Array(off);
  let o = 0; for (const b of bufs) { joined.set(b, o); o += b.length; }
  const [a, b] = trimBounds(joined);
  const speech = joined.slice(a, b);
  if (allSpans.length !== words.length) console.warn(`word count mismatch: ${allSpans.length} spans vs ${words.length} words in "${text}"`);
  // Map spans to written words (proportional fallback if the phonemizer merged/split words).
  const map = (k) => allSpans.length === words.length ? allSpans[k] : allSpans[Math.min(allSpans.length - 1, Math.floor((k * allSpans.length) / words.length))];
  const startS = tSamples;
  const w = words.map((word, k) => {
    const sp = map(k);
    return { w: word, s: Math.round(((startS + sp.s - a) / SR) * FPS), e: Math.round(((startS + sp.e - a) / SR) * FPS) };
  });
  const padN = Math.round(PAD * SR);
  chunks.push(speech, new Float32Array(padN));
  tSamples += speech.length + padN;
  const from = Math.round((startS / SR) * FPS);
  scenes.push({ text, from, dur: Math.round((tSamples / SR) * FPS) - from, words: w });
  console.log(`scene ${scenes.length - 1}: ${((speech.length + padN) / SR).toFixed(2)}s  ${text}`);
}
const holdN = Math.round(HOLD * SR);
chunks.push(new Float32Array(holdN));
tSamples += holdN;
const total = Math.ceil((tSamples / SR) * FPS);
scenes[scenes.length - 1].dur = total - scenes[scenes.length - 1].from;

// 16-bit mono WAV.
const pcm = Buffer.alloc(tSamples * 2);
let p = 0;
for (const c of chunks) for (let i = 0; i < c.length; i++, p++) pcm.writeInt16LE(Math.max(-1, Math.min(1, c[i])) * 32767 | 0, p * 2);
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12);
hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22); hdr.writeUInt32LE(SR, 24);
hdr.writeUInt32LE(SR * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
const pub = path.join(here, 'public');
fs.mkdirSync(path.join(pub, 'sfx'), { recursive: true });
// Start from a clean public/ so yesterday's images can't leak into today's reel.
for (const f of fs.readdirSync(pub)) if (/\.(png|jpe?g|webp|svg)$/i.test(f)) fs.unlinkSync(path.join(pub, f));
fs.writeFileSync(path.join(pub, 'vo.wav'), Buffer.concat([hdr, pcm]));
// Images the scenes use: photo-N.* (fetch-image.js) and any extra asset-*.* (e.g. cut-outs) in the post folder.
for (const f of fs.readdirSync(post)) if (/^(photo-\d|asset-[\w-]+)\.(png|jpe?g|webp|svg)$/i.test(f)) fs.copyFileSync(path.join(post, f), path.join(pub, f));
const themes = ['hook', ...content.stories.map((s) => s.theme || 'violet')];
fs.writeFileSync(path.join(here, 'src', 'timeline.json'), JSON.stringify({ fps: FPS, voice: VOICE, speed: SPEED, total, themes, scenes }, null, 1));
console.log(`voice ${VOICE} speed ${SPEED}: total ${(tSamples / SR).toFixed(2)}s = ${total} frames`);
