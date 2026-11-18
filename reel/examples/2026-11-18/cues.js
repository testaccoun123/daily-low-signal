// TODAY'S SOUND CUES — rewritten every day together with the scenes (see ROUTINE.md).
// Compute each cue's frame with the SAME formulas the scenes use (wordAt, land, interpolate),
// so picture and sound cannot drift. All frames are ABSOLUTE (S[i] = start of scene i, 0 = hook).
// This file = the approved 2026-11-18 reel (GTA 6 / Google / robot / Hubble), kept as the worked example.
module.exports = (k) => {
  const { S, FPS, clamp, wordAt, land, springAt, interpolate, Easing, t, hits, beds, put, putPanned, layer,
    whoosh, click, metalClank, sparks, spinWhoosh, powerDown, glitchSlice, slam, boom, roar, I, mtof, TAU } = k;

  // ---------- HOOK (scene 0): tiles fly in, title words pop ----------
  const TILE_FROM_X = [-900, 900, -900, 900];
  [0, 1, 2, 3].forEach((i) => {
    const start = S[0] + i * 3, l = land(start, { damping: 14, stiffness: 120, mass: 0.8 }), pan = Math.sign(TILE_FROM_X[i]) * 0.55;
    putPanned(hits, whoosh(t(l - start) + 0.08, 700, 3200, { peak: 0.75, seed: 10 + i }), start, 0.55, (x) => pan * (1 - x * 0.7));
    put(hits, I.thud(110 + i * 12, 0.05, 30 + i), l, 0.35, pan * 0.4);
  });
  for (let w = 0; w < 8; w++) put(hits, I.pop(1300 + w * 160, 60 + w), S[0] + 3 + w * 2, 0.22, w % 2 ? 0.25 : -0.25);
  put(hits, click(2600, { decay: 0.003, body: 0.4, bodyHz: 420, seed: 70 }), S[0] + 30, 0.25, 0.4);
  put(hits, I.woodTick(1.1), S[0] + 40, 0.22, -0.4);
  // zoom-through into scene 1 (transition is 12 frames)
  put(hits, whoosh(t(12) + 0.2, 300, 6000, { peak: 0.62, q: 0.7, seed: 80 }), S[1] - 4, 1.0);

  // ---------- GTA (scene 1): counter ticks 99->9, slam on "nine", logo spins in, calendar, padlock ----------
  const nine = wordAt(1, /^nine$/i, 45), rock = wordAt(1, /^Rockstar$/i, 80) - 3, nov = wordAt(1, /^November$/i, 105) - 2;
  const countN = (f) => Math.round(99 - 90 * interpolate(f, [0, nine], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }));
  let tick = 0;
  for (let f = 1; f <= nine; f++) if (countN(f) !== countN(f - 1)) put(hits, click(3200 + (tick % 2) * 400, { decay: 0.0018, body: 0.25, bodyHz: 900, seed: 100 + tick++ }), S[1] + f, 0.45);
  put(hits, slam({ seed: 120 }), S[1] + nine, 0.57, 0, 0.25);
  put(hits, I.bell(mtof(43), 0.35, 1.2, 2.01), S[1] + nine, 0.12);
  const logoCfg = { damping: 11, stiffness: 140 };
  put(hits, click(5000, { decay: 0.003, seed: 130 }), S[1] + rock, 0.3);
  put(hits, spinWhoosh(Array.from({ length: 40 }, (_, q) => interpolate(springAt(q, logoCfg), [0, 1], [-540, 0]))), S[1] + rock, 0.9, 0, 0.15);
  put(hits, I.thud(95, 0.07, 131), land(S[1] + rock, logoCfg), 0.35);
  const day = (f) => Math.min(19, 10 + Math.floor(f / 2.2));
  const flicks = [S[1] + nov];
  for (let f = 1; f < 22; f++) if (day(f) !== day(f - 1)) flicks.push(S[1] + nov + f);
  flicks.forEach((f, i) => put(hits, I.paperFwip(0.9 + i * 0.05, 140 + i), f, 0.85, i % 2 ? 0.2 : -0.2));
  put(hits, layer([metalClank(0.9, { decay: 0.05, body: 0.8, seed: 150 }), 0.7], [I.thud(120, 0.06, 151), 0.6]), S[1] + nov + 22, 0.75, 0.3, 0.2);
  put(hits, metalClank(1.35, { decay: 0.03, body: 0.2, seed: 152 }), land(S[1] + nov + 22, { damping: 8, stiffness: 300 }), 0.55, 0.3);

  // ---------- GOOGLE (scene 2): whip in, click "off", power-down + glitch, typing, glass shatters on "lose" ----------
  putPanned(hits, whoosh(0.45, 500, 4500, { peak: 0.45, q: 0.8, seed: 200 }), S[2] - 4, 1.1, (x) => 0.85 - 1.7 * x);
  const off = wordAt(2, /^off$/i, 28), and = wordAt(2, /^schools$/i, 80) - 4, lose = wordAt(2, /^lose$/i, 120) - and;
  put(hits, click(2800, { decay: 0.0025, body: 0.5, bodyHz: 350, seed: 210 }), S[2] + off, 0.6);
  put(hits, click(3300, { decay: 0.002, body: 0.2, bodyHz: 380, seed: 211 }), S[2] + off + 4, 0.3);
  put(hits, layer([I.thud(150, 0.05, 212), 0.8], [click(1800, { decay: 0.004, seed: 213 }), 0.4]), land(S[2] + off, { damping: 9, stiffness: 240 }), 0.55);
  put(beds, powerDown(0.5), S[2] + off, 0.3);
  const glitchG = (f) => interpolate(f, [off, off + 3, off + 16], [0, 1, 0.15], clamp);
  for (let f = off; f < and; f++) if (glitchG(f) > 0.05) { const seed = Math.floor(f / 2); put(beds, glitchSlice(seed), S[2] + f, glitchG(f), ((seed % 3) - 1) * 0.5); }
  put(hits, whoosh(0.18, 1200, 3500, { peak: 0.3, seed: 220 }), S[2] + and, 0.3);
  const typed = (f) => Math.min(18, Math.max(0, Math.floor((f - 4) / 1.4)));
  let key = 0;
  for (let f = 1; f < lose; f++) if (typed(f) > typed(f - 1)) { put(hits, click(2200 + ((key * 7) % 5) * 220, { decay: 0.002, body: 0.35, bodyHz: 260, seed: 230 + key }), S[2] + and + f, 0.4, ((key % 3) - 1) * 0.2); key++; }
  put(hits, layer([I.glass(7, { size: 1.2 }), 0.75], [I.thwack(), 0.45], [I.subBoom(0.7, 70, 38), 0.3]), S[2] + and + lose, 0.8, 0, 0.3);
  put(hits, I.thud(70, 0.12, 250), land(S[2] + and + lose + 6, { damping: 10, stiffness: 200 }), 0.5);

  // ---------- ROBOT (scene 3): iris in, 8 ring segments clank into place (rising notes), mesh unfolds, stamp ----------
  put(hits, layer([whoosh(0.5, 400, 7000, { peak: 0.55, q: 0.8, seed: 300 }), 0.8], [I.launchWhistle(0.45, 301), 0.25]), S[3] - 3, 0.85, 0, 0.25);
  const SEG = 8, START = 4, done = wordAt(3, /^own$/i, 88), no = wordAt(3, /^No$/, 103);
  const step = Math.max(10, Math.floor((done - START) / SEG));
  const notes = [67, 69, 71, 74, 76, 79, 81, 86];
  for (let i = 0; i < SEG; i++) {
    put(beds, I.noiseSweep(0.16, 600, 1600, { q: 3, seed: 310 + i }), S[3] + START + i * step, 0.18, ((i % 2) - 0.5) * 0.4);
    const f = S[3] + Math.ceil(START + i * step + step * 0.55), pan = Math.sin(((i + 0.5) / 8) * TAU) * 0.6;
    put(hits, metalClank(0.85 + i * 0.03, { decay: 0.045, body: 0.4, seed: 320 + i }), f, 0.5, pan, 0.25);
    put(hits, I.bell(mtof(notes[i]), 0.25, 1.4, 3.5), f, 0.15, pan, 0.4);
    put(hits, sparks(10 / FPS, { seed: 340 + i }), f, 0.22, pan);
  }
  const mesh = S[3] + done, meshLand = land(mesh, { damping: 12, stiffness: 90 }), span = t(meshLand - mesh);
  put(hits, layer(...[79, 83, 86, 88, 91, 95].map((m, q) => [I.bell(mtof(m), 0.4, 1.2, 3.5), 0.16, (q / 5) * span]), [whoosh(span + 0.25, 1500, 6000, { peak: 0.7, seed: 360 }), 0.5]), mesh, 0.7, 0, 0.5);
  put(beds, whoosh(0.5, 180, 900, { peak: 0.5, q: 0.7, seed: 370 }), S[3] + no - 2, 0.5);
  put(hits, layer([I.thwack(), 0.85], [I.thud(85, 0.1, 371), 0.6]), land(S[3] + no + 2, { damping: 9, stiffness: 220 }), 0.44, 0, 0.25);

  // ---------- HUBBLE (scene 4): wipe down, re-entry roar grows with heat, held breath, giant impact, slam on "seven" ----------
  put(hits, whoosh(0.42, 4500, 450, { peak: 0.4, q: 0.8, seed: 400 }), S[4] - 3, 0.85);
  const fall = wordAt(4, /^falling$/i, 40), hit = wordAt(4, /^crashing$/i, 105) + 8, seven = wordAt(4, /^seven$/i, 148);
  const heat = (absF) => interpolate(absF - S[4], [fall + 10, hit], [0, 1], clamp);
  const [rl, rr] = roar(S[4] + fall, S[4] + hit - 1, heat); // ends 1 frame early: a held breath before the hit
  beds.addStereo(rl, rr, t(S[4] + fall), 0.75);
  put(hits, boom(410), S[4] + hit, 0.56, 0, 0.45);
  put(hits, click(6000, { decay: 0.006, seed: 412 }), S[4] + hit, 0.35);
  put(hits, slam({ sub: 0.8, seed: 420 }), S[4] + seven + 2, 0.54, 0, 0.25);
};
