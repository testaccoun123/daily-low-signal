// TODAY'S SOUND CUES (2026-11-20: Anthropic IPO / Steam Machine / Instagram edit / Google Suncatcher).
// Every frame is computed with the same formulas the scenes use. Frames are ABSOLUTE (S[i] = scene start).
module.exports = (k) => {
  const { S, FPS, clamp, wordAt, land, interpolate, Easing, t, hits, beds, put, putPanned, layer,
    whoosh, click, metalClank, sparks, powerDown, glitchSlice, slam, boom, roar, I, mtof } = k;

  // ---------- HOOK ----------
  const TILE_FROM_X = [-900, 900, -900, 900];
  [0, 1, 2, 3].forEach((i) => {
    const start = S[0] + i * 3, l = land(start, { damping: 20, stiffness: 120, mass: 0.8 }), pan = Math.sign(TILE_FROM_X[i]) * 0.55;
    putPanned(hits, whoosh(t(l - start) + 0.08, 700, 3200, { peak: 0.75, seed: 10 + i }), start, 0.55, (x) => pan * (1 - x * 0.7));
    put(hits, I.thud(110 + i * 12, 0.05, 30 + i), l, 0.35, pan * 0.4);
  });
  for (let w = 0; w < 7; w++) put(hits, I.pop(1300 + w * 160, 60 + w), S[0] + 2 + w * 2, 0.22, w % 2 ? 0.25 : -0.25);
  put(hits, metalClank(1.2, { decay: 0.03, body: 0.3, seed: 71 }), S[0] + 30, 0.25, 0.4);
  put(hits, whoosh(t(12) + 0.2, 300, 6000, { peak: 0.62, q: 0.7, seed: 80 }), S[1] - 4, 1.0);

  // ---------- IPO (scene 1) ----------
  const anth = wordAt(1, /^Anthropic$/i, 22), big = wordAt(1, /^biggest$/i, 63) - 3, ipo = wordAt(1, /^IPO$/i, 75), ever = wordAt(1, /^ever$/i, 92);
  const shares = wordAt(1, /^Shares$/i, 105) - 3, jump = wordAt(1, /^thirtyfour$/i, 133);
  put(hits, layer([I.launchWhistle(0.6, 101), 0.3], [whoosh(t(anth) + 0.05, 200, 3000, { peak: 0.9, seed: 102 }), 0.6]), S[1], 0.6);
  put(hits, slam({ seed: 103 }), S[1] + anth, 0.5, 0, 0.25);
  put(hits, I.bell(mtof(72), 0.5, 1.4, 2.01), S[1] + anth + 2, 0.12, 0, 0.4);
  [big + 3, ipo, ever].forEach((b, i) => put(hits, layer([I.thwack(), 0.8], [I.thud(90 - i * 10, 0.08, 110 + i), 0.7]), S[1] + b, 0.42 + i * 0.06, 0, 0.2));
  put(hits, layer([I.fireworkBurst(115, 1.0), 0.6], [I.crash(116), 0.3]), S[1] + ever, 0.55, 0, 0.3);
  put(hits, metalClank(1.1, { decay: 0.04, body: 0.5, seed: 117 }), land(S[1] + ever + 4, { damping: 20, stiffness: 120 }), 0.4, 0.4);
  put(hits, whoosh(0.3, 1200, 3500, { peak: 0.4, seed: 118 }), S[1] + shares - 2, 0.35);
  put(beds, I.noiseSweep(t(jump - shares) + 0.1, 200, 2500, { q: 2, seed: 119 }), S[1] + shares, 0.15);
  put(hits, I.launchWhistle(0.3, 120), S[1] + jump - 7, 0.4);
  put(hits, layer([I.glass(9, { size: 1.3 }), 0.8], [I.subBoom(0.9, 70, 34), 0.5], [I.thwack(), 0.4]), S[1] + jump, 0.8, 0.3, 0.3);
  put(hits, slam({ sub: 0.6, seed: 121 }), S[1] + jump + 2, 0.4, 0, 0.2);

  // ---------- STEAM (scene 2) ----------
  putPanned(hits, whoosh(0.45, 500, 4500, { peak: 0.45, q: 0.8, seed: 200 }), S[2] - 4, 1.1, (x) => 0.85 - 1.7 * x);
  const wl = wordAt(2, /^waitlist$/i, 24) + 2, b = wordAt(2, /^twoterabyte$/i, 53) - 5, steam = wordAt(2, /^Steam$/i, 72);
  const mem = wordAt(2, /^Memory$/i, 98) - 4, soar = wordAt(2, /^soaring$/i, 131);
  for (let f = 2; f < wl; f += 5) put(hits, I.woodTick(0.8 + ((f / 5) % 2) * 0.15), S[2] + f, 0.12, 0.3);
  put(beds, I.noiseSweep(0.18, 400, 2000, { q: 2, seed: 210 }), S[2] + wl - 6, 0.25);
  put(hits, layer([metalClank(0.7, { decay: 0.08, body: 0.9, seed: 211 }), 0.8], [I.subBoom(0.7, 70, 36), 0.5], [I.thud(80, 0.1, 212), 0.6]), S[2] + wl, 0.7, 0.2, 0.25);
  [0, 1, 2].forEach((q) => put(hits, I.thud(160 + q * 20, 0.04, 213 + q), S[2] + wl + 2 + q * 2, 0.25, -0.3));
  put(hits, layer([I.thwack(), 0.7], [I.bell(mtof(55), 0.3, 1.2, 2.01), 0.3]), land(S[2] + wl + 3, { damping: 20, stiffness: 120 }), 0.45, 0, 0.2);
  put(hits, whoosh(0.35, 3000, 300, { peak: 0.5, seed: 220 }), S[2] + b - 2, 0.5);
  put(hits, I.thud(70, 0.12, 221), land(S[2] + b, { damping: 20, stiffness: 120 }), 0.55);
  put(hits, I.pop(900, 222), S[2] + b + 5, 0.35);
  put(hits, layer([I.paperFwip(0.7, 223), 0.8], [I.thwack(), 0.6]), S[2] + steam, 0.6, -0.4);
  put(hits, layer([I.paperFwip(0.8, 224), 0.8], [I.thwack(), 0.6]), S[2] + steam + 5, 0.6, 0.4);
  put(hits, whoosh(0.25, 1500, 4000, { peak: 0.4, seed: 225 }), S[2] + mem, 0.3);
  for (let f = mem + 4; f < S[2] + 0 + soar; f += 2) put(hits, click(2600 + ((f * 7) % 5) * 200, { decay: 0.0015, body: 0.2, bodyHz: 700, seed: 230 + f }), S[2] + f, 0.22);
  const [rl, rr] = roar(S[2] + soar - 2, S[2] + soar + 26, (af) => interpolate(af - S[2] - soar, [-2, 6, 26], [0.2, 1, 0], clamp));
  beds.addStereo(rl, rr, t(S[2] + soar - 2), 0.6);
  put(hits, slam({ seed: 240 }), S[2] + soar + 6, 0.5, 0, 0.25);

  // ---------- INSTAGRAM (scene 3) ----------
  put(hits, layer([whoosh(0.5, 400, 7000, { peak: 0.55, q: 0.8, seed: 300 }), 0.8], [I.launchWhistle(0.45, 301), 0.25]), S[3] - 3, 0.85, 0, 0.25);
  const edit = wordAt(3, /^edit$/i, 21), ig = wordAt(3, /^Instagram$/i, 33), after = wordAt(3, /^posting$/i, 78) - 4;
  const cut = wordAt(3, /^fifteen$/i, 107) - 10, fifteen = cut + 10, keep = wordAt(3, /^keep$/i, 140), views = wordAt(3, /^views$/i, 152);
  put(hits, I.thud(100, 0.06, 302), land(S[3], { damping: 20, stiffness: 120 }), 0.35);
  put(hits, whoosh(0.3, 600, 4000, { peak: 0.5, seed: 310 }), S[3] + edit - 8, 0.5, 0.5);
  put(hits, layer([I.scribble ? I.scribble(0.25, 311) : I.paperFwip(1.2, 311), 0.6], [click(3000, { decay: 0.003, seed: 312 }), 0.5]), S[3] + edit, 0.55);
  put(hits, layer(...[84, 88, 91, 96].map((m, q) => [I.bell(mtof(m), 0.3, 1.2, 3.5), 0.18, q * 0.04])), S[3] + edit + 2, 0.6, 0, 0.4);
  put(hits, layer([I.boing ? I.boing() : I.pop(700, 313), 0.5], [I.pop(1200, 314), 0.4]), S[3] + ig, 0.4, -0.4);
  put(hits, slam({ sub: 0.5, seed: 315 }), S[3] + after, 0.42, 0, 0.2);
  put(hits, whoosh(0.3, 3500, 600, { peak: 0.5, seed: 320 }), S[3] + cut - 2, 0.45);
  put(hits, slam({ seed: 321 }), S[3] + fifteen, 0.5, 0, 0.25);
  const drain = (f) => interpolate(f, [fifteen + 4, keep - 2], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  let last = -1, n = 0;
  for (let f = fifteen + 4; f < keep; f++) { const s = Math.floor(15 * (1 - drain(f))); if (s !== last) { put(hits, I.woodTick(1 + (n++ % 2) * 0.2), S[3] + f, 0.3); last = s; } }
  put(hits, layer([I.glass(12, { size: 1.0 }), 0.7], [I.subBoom(0.6, 70, 38), 0.4]), S[3] + keep, 0.7, 0, 0.3);
  put(hits, I.pop(1000, 330), S[3] + keep + 3, 0.3);
  put(hits, layer([metalClank(1.3, { decay: 0.03, body: 0.3, seed: 331 }), 0.7], [I.thud(120, 0.06, 332), 0.6]), S[3] + views, 0.6, 0.2, 0.2);

  // ---------- ORBIT (scene 4) ----------
  put(hits, whoosh(0.42, 4500, 450, { peak: 0.4, q: 0.8, seed: 400 }), S[4] - 3, 0.85);
  const booked = wordAt(4, /^booked$/i, 15) + 2, rocketW = wordAt(4, /^rocket$/i, 45), fly = wordAt(4, /^fly$/i, 67), ai = wordAt(4, /^AI$/i, 82);
  const space = wordAt(4, /^space$/i, 114), yr = wordAt(4, /^twentynine$/i, 158);
  put(hits, whoosh(0.3, 3000, 400, { peak: 0.5, seed: 401 }), S[4] + booked - 8, 0.4);
  put(hits, layer([I.thud(80, 0.1, 402), 0.8], [metalClank(0.8, { decay: 0.05, body: 0.6, seed: 403 }), 0.5]), land(S[4] + booked - 8, { damping: 20, stiffness: 120 }), 0.55);
  put(hits, slam({ sub: 0.4, seed: 404 }), S[4] + booked, 0.4, 0.4, 0.2);
  put(beds, I.noiseSweep(0.55, 500, 2500, { q: 2, seed: 405 }), S[4] + rocketW, 0.25);
  put(hits, metalClank(1.0, { decay: 0.05, body: 0.5, seed: 406 }), S[4] + rocketW + 16, 0.45);
  put(hits, sparks(0.3, { seed: 407 }), S[4] + rocketW + 16, 0.2);
  put(hits, boom(410), S[4] + fly, 0.5, 0, 0.4);
  const [ql, qr] = roar(S[4] + fly, S[4] + space - 1, (af) => interpolate(af - S[4], [fly, space], [0.6, 1], clamp));
  beds.addStereo(ql, qr, t(S[4] + fly), 0.7);
  put(hits, layer([I.thwack(), 0.6], [I.pop(1500, 411), 0.4]), S[4] + ai, 0.4, 0.4);
  put(hits, layer([I.subBoom(1.2, 80, 30), 0.7], [I.crash(412), 0.4], [click(6000, { decay: 0.006, seed: 413 }), 0.4]), S[4] + space, 0.6, 0, 0.45);
  put(hits, layer(...[67, 71, 74, 79, 83].map((m, q) => [I.bell(mtof(m), 0.4, 1.2, 3.5), 0.16, q * 0.07]), [whoosh(0.6, 1500, 6000, { peak: 0.6, seed: 414 }), 0.4]), S[4] + space + 6, 0.6, 0, 0.5);
  put(hits, slam({ sub: 0.9, seed: 420 }), S[4] + yr, 0.55, 0, 0.25);
};
