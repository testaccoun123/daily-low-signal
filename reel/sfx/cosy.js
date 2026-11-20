// "Cosy" sound palette: swaps the kit's hard sounds for soft, tuned, satisfying ones, so every existing
// cues file (written with slam/boom/click/glass…) automatically sounds warm. Enabled by SFX_STYLE=cosy.
// Also provides bed(k): a quiet warm pad under the whole reel, one chord per scene.
const KEY = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86]; // D major pentatonic: anything together stays consonant

module.exports = (k) => {
  const { I, layer, mtof } = k;
  const note = (seed, oct = 0) => KEY[Math.abs(Math.round(seed)) % KEY.length] + oct;
  const whoosh = (len, f0, f1, o = {}) => k.whoosh(len * 1.15, Math.min(f0, 2400), Math.min(f1, 2400), { ...o, peak: (o.peak ?? 0.6) * 0.5, q: 0.6 });
  const click = (freq = 3000, o = {}) => I.woodTick(1.25 + ((o.seed || 1) % 5) * 0.06);
  const metalClank = (pitch = 1, o = {}) => I.marimba(note((o.seed || 3) + pitch * 3), { decay: 0.5, thock: 0.12, seed: o.seed || 3 });
  const slam = (o = {}) => { const s = o.seed || 5; return layer([I.thud(70, 0.12, s), 0.45], [I.marimba(note(s, -12), { decay: 0.8, thock: 0.1, seed: s + 1 }), 0.6], [I.musicBox(note(s + 2), { decay: 1.0, seed: s + 2 }), 0.22]); };
  const boom = (seed = 410) => layer([I.subBoom(1.8, 55, 38), 0.3], ...[62, 69, 74, 78].map((m, q) => [I.bell(mtof(m), 0.9, 0.9, 2.0), 0.12, q * 0.06]));
  const sparks = (len, o = {}) => I.musicBox(note(o.seed || 9, 12), { decay: 0.6, seed: o.seed || 9 });
  const glitchSlice = (seed) => I.woodTick(1.5 + (seed % 3) * 0.05);
  const powerDown = (len = 0.5) => k.whoosh(len, 1200, 300, { peak: 0.2, q: 0.6, seed: 77 });
  const roar = (...a) => { const [l, r] = k.roar(...a); for (let i = 0; i < l.length; i++) { l[i] *= 0.35; r[i] *= 0.35; } return [l, r]; };
  const sparkle = (seed, base = 0) => layer(...[0, 2, 4].map((d, q) => [I.musicBox(note(seed + d, 12 + base), { decay: 0.9, seed: seed + q }), 0.35, q * 0.045]));
  const I2 = {
    ...I,
    glass: (seed = 1) => sparkle(seed),
    fireworkBurst: (seed = 29) => sparkle(seed + 3),
    thwack: () => I.thud(120, 0.06, 7),
    crash: () => I.bell(mtof(81), 0.6, 0.9, 2.0),
    launchWhistle: (len = 0.6, seed = 30) => k.whoosh(len, 400, 1500, { peak: 0.25, q: 0.6, seed }),
    pop: (p = 2000, seed = 28) => I.pop(Math.min(p, 900), seed),
    subBoom: (len, f0, f1) => I.subBoom(len, f0, f1).map((x) => x * 0.5),
  };
  return { ...k, whoosh, click, metalClank, slam, boom, sparks, glitchSlice, powerDown, roar, I: I2 };
};

module.exports.bed = (k) => {
  const { S, TOTAL, t, beds, I } = k;
  const chords = [[50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [43, 50, 55, 59, 62], [45, 52, 57, 61, 64], [50, 57, 62, 66, 69]];
  S.forEach((from, i) => {
    const to = i < S.length - 1 ? S[i + 1] : TOTAL;
    chords[i % chords.length].forEach((m, q) => { const p = I.padNote(m, t(to - from) + 0.6, { cutoff: 700 + (i % 5) * 120, attack: 0.9, release: 1.6, detune: 0.08, seed: 900 + i * 5 + q }); beds.addStereo(p.L, p.R, t(from), 0.045); });
  });
};
