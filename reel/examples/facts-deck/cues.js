// PROTOTYPE fact cues (52!) — "cosy" palette: warm pad bed, wooden/marimba/music-box tones, paper sounds.
// No slams, booms or harsh clicks; every hit is soft-attack and tuned to the chord underneath.
module.exports = (k) => {
  const { S, TOTAL, wordAt, interpolate, Easing, t, hits, beds, put, layer, whoosh, I, mtof } = k;
  const W = (sc, re, fb) => S[sc] + wordAt(sc, re, fb);
  const soft = (len, seed, peak = 0.25) => whoosh(len, 300, 1800, { peak, q: 0.6, seed }); // airy, low, no hiss

  // ---- pad bed: Dmaj9-ish warm chords, one per voice line ----
  const chords = [[50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [43, 50, 55, 59, 62], [45, 52, 57, 61, 64], [50, 57, 62, 66, 69]];
  S.forEach((from, i) => {
    const to = i < S.length - 1 ? S[i + 1] : TOTAL;
    chords[i].forEach((m, q) => { const p = I.padNote(m, t(to - from) + 0.6, { cutoff: 700 + i * 120, attack: 0.9, release: 1.6, detune: 0.08, seed: 10 + i * 5 + q }); beds.addStereo(p.L, p.R, t(from), 0.055); });
  });
  const key = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86]; // D major pentatonic-ish, always consonant

  // ---- HOOK: soft riffle (paper flutter), music-box sparkle as the fan opens ----
  const history = W(0, /^history$/i, 103);
  for (let f = 0; f < history; f++) {
    const c = f % 40;
    if (c === 9) put(hits, I.paperFwip(0.7, 40 + f), f, 0.35, -0.2);
    if (c === 20) put(hits, I.paperFwip(0.75, 60 + f), f, 0.3, 0.2);
    if (c >= 9 && c < 37 && f % 2 === 0) put(hits, I.woodTick(1.6 + (f % 3) * 0.1), f, 0.05, ((f % 4) - 1.5) * 0.3);
  }
  put(hits, soft(0.8, 70, 0.3), history - 6, 0.5, 0, 0.5);
  [74, 78, 81, 86].forEach((m, q) => put(hits, I.musicBox(m, { decay: 1.2, seed: 80 + q }), history + q * 3, 0.16, (q / 3 - 0.5) * 0.6, 0.5));

  // ---- BUILD: every card landing = one soft marimba note climbing the scale (very satisfying cascade) ----
  const t52 = W(1, /^fiftytwo$/i, 167), t51 = W(1, /^fiftyone$/i, 218), t50 = W(1, /^fifty$/i, 250), allW = W(1, /^All$/i, 270), one = W(1, /^one$/i, 307);
  const land = (q) => (q === 0 ? t52 : q === 1 ? t51 : q === 2 ? t50 : Math.round(interpolate(q, [3, 51], [allW, one + 2], { easing: Easing.out(Easing.quad) })));
  for (let q = 0; q < 52; q++) {
    const m = key[Math.min(key.length - 1, Math.floor(q / 5))];
    put(hits, I.marimba(m, { decay: 0.5, thock: 0.15, seed: 100 + q }), land(q), q < 3 ? 0.32 : 0.14, ((q % 13) / 12 - 0.5) * 0.7, 0.3);
    if (q < 3) put(hits, I.paperFwip(0.9, 150 + q), land(q) - 6, 0.25);
  }
  put(hits, I.musicBox(86, { decay: 1.6, seed: 199 }), land(51) + 4, 0.2, 0, 0.6);

  // ---- NUMBER: digits patter like light rain, a warm chime on "eight", a gentle bloom on the collapse ----
  const mult = W(2, /^Multiply$/i, 320), eight = W(2, /^eight$/i, 389), zeros = W(2, /^zeros$/i, 429), behind = W(2, /^behind$/i, 442);
  put(hits, soft(0.6, 200), mult - 4, 0.4);
  for (let i = 0; i < 68; i += 2) { const at = Math.round(mult + 6 + (i / 67) * (eight - 2 - mult - 6)); put(hits, I.woodTick(1.3 + ((i * 7) % 5) * 0.08), at, 0.07, ((i % 12) / 11 - 0.5) * 0.6, 0.2); }
  put(hits, layer([I.musicBox(81, { decay: 1.8, seed: 290 }), 0.5], [I.bell(mtof(69), 0.6, 0.8, 2.0), 0.15]), eight, 0.4, 0, 0.5);
  for (let i = 1; i < 68; i += 6) put(hits, I.musicBox(key[(i / 6) % key.length | 0] + 12, { decay: 0.6, seed: 300 + i }), Math.round(zeros - 8 + (i / 67) * 14), 0.06, 0, 0.4);
  [62, 66, 69, 74].forEach((m, q) => put(hits, I.marimba(m, { decay: 0.8, thock: 0.1, seed: 320 + q }), behind + q * 2, 0.18, 0, 0.4));

  // ---- TWIST: tiny bubble pops as people appear, a slow airy rise into a warm swell (no boom) ----
  const person = W(3, /^person$/i, 490), second = W(3, /^second$/i, 548), since = W(3, /^since$/i, 569), bang = W(3, /^Bang$/i, 585);
  put(hits, soft(0.7, 400), S[3] - 4, 0.4);
  for (let q = 0; q < 10; q++) put(hits, I.pop(600 + q * 60, 410 + q), person - 6 + q * 2, 0.07, (q / 9 - 0.5) * 0.8, 0.3);
  put(hits, I.musicBox(78, { decay: 1.0, seed: 420 }), second, 0.18, 0, 0.4);
  put(beds, I.noiseSweep(t(bang - since) + 0.2, 200, 2200, { q: 0.8, seed: 430, pink: true }), since, 0.18);
  put(hits, layer([I.subBoom(1.6, 55, 40), 0.25], ...[62, 69, 74, 78, 81].map((m, q) => [I.bell(mtof(m), 0.9, 0.9, 2.0), 0.1, q * 0.05])), bang, 0.5, 0, 0.7);

  // ---- PAYOFF: a soft rising shimmer while zooming, cards fan back with paper, warm resolved chord ----
  const still = W(4, /^still$/i, 605), so = W(4, /^So$/, 652), never = W(4, /^never$/i, 732);
  put(beds, I.noiseSweep(t(so - 4 - still) + 0.2, 400, 2500, { q: 1.2, seed: 501, pink: true }), still, 0.12);
  put(hits, I.paperFwip(0.8, 510), so, 0.35);
  for (let q = 0; q < 52; q += 6) put(hits, I.woodTick(1.5 + q * 0.01), so + Math.round(q * 0.3) + 4, 0.05, (q / 51 - 0.5) * 0.8);
  [62, 66, 69, 74, 78].forEach((m, q) => put(hits, I.marimba(m, { decay: 0.9, thock: 0.1, seed: 520 + q }), never + q * 3, 0.2, (q / 4 - 0.5) * 0.5, 0.5));
  put(hits, I.musicBox(86, { decay: 1.8, seed: 530 }), never + 16, 0.15, 0, 0.6);
  put(hits, I.paperFwip(0.7, 540), TOTAL - 24, 0.3);
};
