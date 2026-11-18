import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { HOOK_GRAD, INTER, MONO, SCENE_THEMES, THEMES, TL, Word, clamp } from './theme';

const sceneAt = (f: number) => {
  let i = 0;
  TL.scenes.forEach((s, k) => { if (f >= s.from) i = k; });
  return i;
};

type Chunk = { words: Word[]; s: number; e: number };
const chunks = (words: Word[]): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  words.forEach((w, k) => {
    cur.push(w);
    const brk = /[.,!?]$/.test(w.w) || cur.length >= 3 || k === words.length - 1;
    if (brk) { out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; }
  });
  return out;
};
const ALL = TL.scenes.map((s, i) => chunks(s.words).map((c) => ({ ...c, scene: i }))).flat();

/** TikTok-style word-by-word captions: active word pops in the scene accent colour. */
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = -1;
  ALL.forEach((c, k) => { if (f >= c.s - 2) idx = k; });
  if (idx < 0) return null;
  const c = ALL[idx];
  const next = ALL[idx + 1];
  if (f > c.e + 12 && (!next || f < next.s - 2)) return null; // pause between lines: clear
  const theme = THEMES[SCENE_THEMES[c.scene]];
  const accent = c.scene === 0 ? '#ffd23d' : theme.a;
  const pop = spring({ frame: f - (c.s - 2), fps, config: { damping: 13, stiffness: 220 } });
  let active = 0;
  c.words.forEach((w, k) => { if (f >= w.s) active = k; });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute', left: 50, right: 50, top: 1200, height: 260,
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: '0 36px',
          fontFamily: INTER, fontWeight: 900, fontSize: 96, lineHeight: 1.08, textTransform: 'uppercase',
          scale: String(interpolate(pop, [0, 1], [0.7, 1])),
          translate: `0 ${interpolate(pop, [0, 1], [40, 0])}px`,
          opacity: interpolate(pop, [0, 0.4], [0, 1], clamp),
        }}
      >
        {c.words.map((w, k) => {
          const on = k === active && f >= w.s;
          const said = f >= w.s;
          const wp = spring({ frame: f - w.s, fps, config: { damping: 10, stiffness: 300 } });
          return (
            <span
              key={k}
              style={{
                display: 'inline-block',
                color: on ? accent : '#ffffff',
                opacity: said ? 1 : 0.42,
                scale: String(on ? interpolate(wp, [0, 1], [1.25, 1.08]) : 1),
                rotate: on ? `${interpolate(wp, [0, 1], [-6, -2])}deg` : '0deg',
                WebkitTextStroke: '14px #000',
                paintOrder: 'stroke fill',
                textShadow: on ? `0 0 40px ${accent}99, 0 8px 0 #000` : '0 8px 0 #000',
              }}
            >
              {w.w.replace(/[.,!?]$/, '')}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Story-style progress bar + brand line at the top. */
export const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const cur = sceneAt(f);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 54, display: 'flex', gap: 10 }}>
        {TL.scenes.map((s, i) => {
          const p = interpolate(f, [s.from, s.from + s.dur], [0, 1], clamp);
          const col = i === 0 ? HOOK_GRAD : THEMES[SCENE_THEMES[i]].a;
          return (
            <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
              <div style={{ width: `${p * 100}%`, height: '100%', background: col, boxShadow: i === cur ? `0 0 12px ${i === 0 ? '#fff' : col}` : 'none' }} />
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 44, top: 86, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.88)' }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: cur === 0 ? '#ffd23d' : THEMES[SCENE_THEMES[cur]].a, opacity: 0.6 + 0.4 * Math.abs(Math.sin(f / 8)) }} />
        DAILY LOW SIGNAL
      </div>
    </AbsoluteFill>
  );
};

/** Film grain + vignette so flat colour fields feel photographed. */
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const seed = f % 8;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, transparent 45%, rgba(0,0,0,0.55) 100%)' }} />
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: 0.09, mixBlendMode: 'overlay' }}>
        <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} /></filter>
        <rect width="1080" height="1920" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
