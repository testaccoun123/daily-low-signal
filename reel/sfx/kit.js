// SOUND KIT — fixed. Everything a day's cues file needs to place synthesized sound effects
// (animation-studio engine: every sound is generated in code, no samples, no licensing issues).
// Used by sfx/song.js, which calls src/today/cues.js with this kit.
const path = require('path');
const { spring, interpolate, Easing } = require('remotion');
const dsp = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const { mtof } = require('./engine/music');

const { SR, TAU, Bus, rng, Pink, SVF, OnePole, Saw } = dsp;
const TL = require('../src/timeline.json');
const FPS = TL.fps;
const TOTAL = TL.total;
const S = TL.scenes.map((s) => s.from); // absolute start frame of each scene (0 = hook)
const LEN = TOTAL / FPS;
const N = Math.ceil(LEN * SR);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

// ---------- timing helpers (same formulas the scenes use) ----------
/** Frame (relative to scene start) at which the first word matching `re` is spoken. */
const wordAt = (scene, re, fb = 0) => {
  const sc = TL.scenes[scene];
  const w = sc.words.find((x) => re.test(x.w.replace(/[^\w]/g, '')));
  return w ? w.s - sc.from : fb;
};
/** The visible "landing" of a spring started at `start`: first frame its value reaches 1. */
const land = (start, config) => {
  for (let k = 0; k < 90; k++) if (spring({ frame: k, fps: FPS, config }) >= 1) return start + k;
  return start;
};
const springAt = (f, config) => spring({ frame: f, fps: FPS, config });
const t = (frame) => frame / FPS;
const buf = (sec) => new Float32Array(Math.max(1, Math.ceil(sec * SR)));

// ---------- buses ----------
// HITS keep their transients; BEDS (sustained layers) get ducked hard under the voice; SEND feeds the reverb.
const hits = new Bus(N), beds = new Bus(N), send = new Bus(N);
const put = (bus, b, frame, gain = 1, pan = 0, verb = 0) => { bus.addMono(b, t(frame), gain, pan); if (verb) send.addMono(b, t(frame), gain * verb, pan); };
/** Mono buffer with a moving pan (panFn(x in 0..1) -> -1..1). */
const putPanned = (bus, b, frame, gain, panFn) => {
  const s0 = Math.round(t(frame) * SR);
  for (let i = 0; i < b.length; i++) {
    const j = s0 + i; if (j < 0 || j >= N) continue;
    const a = ((panFn(i / b.length) + 1) * Math.PI) / 4;
    bus.L[j] += b[i] * gain * Math.cos(a) * Math.SQRT2; bus.R[j] += b[i] * gain * Math.sin(a) * Math.SQRT2;
  }
};
const scale = (b, g) => { for (let i = 0; i < b.length; i++) b[i] *= g; return b; };
/** Mix several buffers: layer([buf, gain, offsetSec], ...). */
const layer = (...parts) => {
  const len = Math.max(...parts.map(([b, , o = 0]) => b.length + Math.round(o * SR)));
  const out = new Float32Array(len);
  for (const [b, g, o = 0] of parts) { const s = Math.round(o * SR); for (let i = 0; i < b.length; i++) out[s + i] += b[i] * g; }
  return out;
};

// ---------- sound designs ----------
/** Asymmetric air whoosh f0 -> f1 Hz; rises to `peak` (0..1 of its length), then falls. */
const whoosh = (len, f0, f1, { peak = 0.6, q = 0.9, seed = 1 } = {}) =>
  I.noiseSweep(len, f0, f1, { q, seed, pink: true, shape: (x) => (x < peak ? Math.pow(x / peak, 2) : Math.pow((1 - x) / (1 - peak), 1.6)) });

/** Tiny mechanical click (counters, keys, mouse, switches). */
function click(freq = 3000, { decay = 0.0025, body = 0, bodyHz = 300, seed = 1, len = 0.05 } = {}) {
  const out = buf(len), w = rng(seed), hp = new SVF();
  for (let i = 0; i < out.length; i++) {
    const tt = i / SR;
    out[i] = hp.hp(w(), freq, 0.9) * Math.exp(-tt / decay) + Math.sin(TAU * freq * 0.6 * tt) * Math.exp(-tt / (decay * 1.5)) * 0.4
      + Math.sin(TAU * bodyHz * tt) * Math.exp(-tt / 0.018) * body;
  }
  return out;
}

/** Metal latch / clank: inharmonic modes + click + low body. */
function metalClank(pitch = 1, { decay = 0.06, body = 0.5, seed = 3 } = {}) {
  const out = buf(0.5), w = rng(seed), hp = new SVF();
  const modes = [[1, 1, 1], [1.58, 0.7, 0.8], [2.23, 0.5, 0.6], [2.94, 0.35, 0.45], [4.1, 0.2, 0.3]];
  for (let i = 0; i < out.length; i++) {
    const tt = i / SR;
    let s = hp.hp(w(), 2500, 0.8) * Math.exp(-tt / 0.003) * 0.9;
    for (const [r, a, d] of modes) s += Math.sin(TAU * 1450 * pitch * r * tt) * a * Math.exp(-tt / (decay * d));
    s += Math.sin(TAU * 140 * tt) * Math.exp(-tt / 0.05) * body;
    out[i] = Math.tanh(s * 0.9) * 0.8;
  }
  return out;
}

/** Short sizzle of sparks. */
function sparks(len = 0.33, { count = 22, seed = 9 } = {}) {
  const out = buf(len + 0.05), r = rng(seed);
  for (let k = 0; k < count; k++) {
    const t0 = Math.pow(Math.abs(r()), 1.4) * len, f = 3500 + Math.abs(r()) * 6000, a = (0.25 + Math.abs(r()) * 0.6) * (1 - t0 / len);
    const s0 = Math.floor(t0 * SR);
    for (let i = 0; i < 0.012 * SR && s0 + i < out.length; i++) out[s0 + i] += Math.sin((TAU * f * i) / SR) * Math.exp(-i / (0.0025 * SR)) * a;
  }
  return out;
}

/** Air "whum" for a spinning flat object; `angles` = rotation in degrees per frame. */
function spinWhoosh(angles) {
  const len = (angles.length - 1) / FPS, out = buf(len), p = new Pink(41), bp = new SVF();
  for (let i = 0; i < out.length; i++) {
    const fr = (i / SR) * FPS, k = Math.min(angles.length - 2, Math.floor(fr)), x = fr - k;
    const ang = angles[k] + (angles[k + 1] - angles[k]) * x;
    const vel = Math.abs(angles[k + 1] - angles[k]);
    const am = 0.25 + 0.75 * Math.pow(Math.abs(Math.sin((ang * Math.PI) / 180)), 2);
    out[i] = bp.bp(p.next() * 3, 500 + vel * 30, 1.1) * am * Math.min(1, vel / 60);
  }
  return out;
}

/** Descending "power off" tone. */
function powerDown(len = 0.5) {
  const out = buf(len), saw = new Saw(), lp = new SVF();
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const x = i / out.length, f = 880 * Math.pow(90 / 880, x);
    ph += f / SR;
    out[i] = (Math.sin(TAU * ph) * 0.7 + lp.lp(saw.next(f), 1500, 0.8) * 0.3) * Math.pow(1 - x, 1.4) * Math.min(1, i / (0.004 * SR));
  }
  return out;
}

/** One digital glitch slice (use one per frame of glitch, new seed every ~2 frames). */
function glitchSlice(seed, len = 1 / FPS) {
  const out = buf(len), r = rng(seed * 977 + 13), w = rng(seed * 31 + 7);
  const f = 180 + Math.abs(r()) * 1800, hold = 4 + Math.floor(Math.abs(r()) * 40), mix = Math.abs(r());
  let held = 0;
  for (let i = 0; i < out.length; i++) {
    if (i % hold === 0) held = w();
    const sq = Math.sin(TAU * f * (i / SR)) > 0 ? 1 : -1;
    const e = Math.min(1, i / 48) * Math.min(1, (out.length - i) / 48);
    out[i] = (held * mix + sq * (1 - mix) * 0.6) * e;
  }
  return out;
}

/** Thick low slam for big text/number hits (kept low so it sits under a spoken word). */
const slam = ({ sub = 1, crack = 1, seed = 5 } = {}) => layer([I.thwack(), 0.8], [I.subBoom(1.2, 78, 34), 0.55 * sub], [click(4000, { decay: 0.004, seed }), 0.35 * crack]);

/** Huge explosion / impact. */
const boom = (seed = 410) => layer([I.subBoom(3.0, 84, 24), 1.0], [I.thwack(), 0.8], [I.crash(seed), 0.35], [I.fireworkBurst(seed + 1, 1.3), 0.55]);

/** Stereo rumble/roar between two frames; `intensity(absFrame)` 0..1 shapes loudness & brightness. */
function roar(fromF, toF, intensity = () => 1) {
  const len = t(toF - fromF), outL = buf(len), outR = buf(len);
  const pL = new Pink(51), pR = new Pink(52), lpL = new SVF(), lpR = new SVF(), hs = new SVF(), sub = new OnePole();
  const wc = rng(53), crack = rng(54);
  let cr = 0;
  for (let i = 0; i < outL.length; i++) {
    const k = intensity(fromF + (i / SR) * FPS);
    const env = Math.min(1, (i / SR) / 0.35) * (0.22 + 0.78 * k);
    const rumble = sub.lp(wc(), 60) * 9 * (0.3 + k);
    const hiss = hs.bp(pL.next() * 3, 2800 + 2000 * k, 0.8) * k * 0.45;
    if (Math.abs(crack()) > 1 - 0.0009 * k) cr = 1;
    cr *= 0.993;
    const crk = cr * crack() * 0.5, tail = Math.min(1, (outL.length - i) / (0.03 * SR));
    outL[i] = (lpL.lp(pL.next() * 3, 220 + 2600 * k, 0.8) + rumble + hiss + crk) * env * tail;
    outR[i] = (lpR.lp(pR.next() * 3, 220 + 2600 * k, 0.8) + rumble + hiss - crk) * env * tail;
  }
  return [outL, outR];
}

module.exports = {
  // timeline
  TL, FPS, TOTAL, S, LEN, N, SR, TAU, clamp, wordAt, land, springAt, spring, interpolate, Easing, t, buf,
  // buses & placement
  hits, beds, send, put, putPanned, scale, layer,
  // ready-made sounds
  whoosh, click, metalClank, sparks, spinWhoosh, powerDown, glitchSlice, slam, boom, roar,
  // raw building blocks: I.thud, I.pop, I.woodTick, I.bell, I.glass, I.thwack, I.subBoom, I.crash,
  // I.fireworkBurst, I.paperFwip, I.noiseSweep, I.launchWhistle ... (see engine/audio/instruments.js)
  I, mtof, dsp,
};
