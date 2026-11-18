import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, Sequence } from 'remotion';
import { INTER, MONO, THEMES, clamp, rnd, shake, wordAt } from '../theme';

const T = THEMES.teal;

const Cursor: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <svg width="90" height="110" viewBox="0 0 30 36" style={{ position: 'absolute', left: x, top: y, scale: String(1 - press * 0.18), filter: 'drop-shadow(0 6px 10px #000)' }}>
    <path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L24 19 Z" fill="#fff" stroke="#000" strokeWidth="2" />
  </svg>
);

// Shot A+B: logo + glowing AI toggle; cursor flies in, clicks OFF on "off", logo greys out and glitches.
const Toggle: React.FC<{ click: number }> = ({ click }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 15, stiffness: 120 } });
  const cur = spring({ frame: f - 4, fps, config: { damping: 18, stiffness: 60 }, durationInFrames: click - 4 });
  const press = interpolate(f, [click - 2, click, click + 4], [0, 1, 0], clamp);
  const off = spring({ frame: f - click, fps, config: { damping: 9, stiffness: 240 } });
  const g = interpolate(f, [click, click + 3, click + 16], [0, 1, 0.15], clamp); // glitch amount
  const grey = interpolate(f, [click, click + 14], [0, 1], clamp);
  const punch = spring({ frame: f - click, fps, config: { damping: 12, stiffness: 200 } });
  const [sx, sy] = shake(f, click, 18, 3);
  const zoom = 1 + interpolate(punch, [0, 0.5, 1], [0, 0.12, 0.05]) + f * 0.0012;
  const knobX = interpolate(off, [0, 1], [300, 20]);
  const slices = 7;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${interpolate(grey, [0, 1], [1, 0]) > 0.5 ? T.deep : '#1a1a1a'}, ${T.bg} 70%)`, translate: `${sx}px ${sy}px`, scale: String(zoom) }}>
      {/* Logo, sliced for glitch displacement */}
      {Array.from({ length: slices }).map((_, k) => {
        const dx = g > 0.05 ? (rnd(k * 7 + Math.floor(f / 2) * 13) - 0.5) * 160 * g : 0;
        return (
          <div key={k} style={{ position: 'absolute', left: 90 + dx, top: 360, width: 900, height: 300, clipPath: `inset(${(k / slices) * 100}% 0 ${100 - ((k + 1) / slices) * 100}% 0)`,
            scale: String(interpolate(enter, [0, 1], [0.4, 1])), opacity: enter }}>
            <Img src={staticFile('photo-2.png')} style={{ width: 900, filter: `grayscale(${grey}) brightness(${1 - grey * 0.45})` }} />
          </div>
        );
      })}
      {g > 0.05 && (
        <>
          <Img src={staticFile('photo-2.png')} style={{ position: 'absolute', left: 90 - 18 * g, top: 360, width: 900, opacity: 0.6 * g, mixBlendMode: 'screen', filter: 'sepia(1) saturate(8) hue-rotate(-50deg)' }} />
          <Img src={staticFile('photo-2.png')} style={{ position: 'absolute', left: 90 + 18 * g, top: 360, width: 900, opacity: 0.6 * g, mixBlendMode: 'screen', filter: 'sepia(1) saturate(8) hue-rotate(140deg)' }} />
        </>
      )}
      {/* Toggle */}
      <div style={{ position: 'absolute', left: 290, top: 760, width: 500, height: 240, scale: String(enter) }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 120, background: interpolate(off, [0, 0.5], [1, 0], clamp) > 0.5 ? T.a : '#3a3a3a', boxShadow: off < 0.5 ? `0 0 90px ${T.a}, inset 0 0 30px #fff8` : 'inset 0 0 30px #000' }} />
        <div style={{ position: 'absolute', top: 20, left: knobX, width: 200, height: 200, borderRadius: 100, background: '#fff', boxShadow: '0 10px 30px #0008', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 80, color: off < 0.5 ? T.deep : '#555',
          scale: `${1 + Math.abs(Math.sin(off * Math.PI)) * 0.25} ${1 - Math.abs(Math.sin(off * Math.PI)) * 0.15}` }}>AI</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 56, letterSpacing: '0.3em', color: off > 0.5 ? '#ff5a5a' : T.a }}>
        {off > 0.5 ? 'AI: OFF' : 'AI: ON'}
      </div>
      <Cursor x={interpolate(cur, [0, 1], [1100, 640]) - press * 0} y={interpolate(cur, [0, 1], [1500, 880])} press={press} />
      <AbsoluteFill style={{ background: '#fff', opacity: interpolate(f, [click, click + 1, click + 5], [0, 0.7, 0], clamp) }} />
    </AbsoluteFill>
  );
};

// Shot C: the search bar shatters on "lose".
const Search: React.FC<{ hit: number }> = ({ hit }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 13, stiffness: 160 } });
  const [sx, sy] = shake(f, hit, 26, 4);
  const shards = 14;
  const typed = 'how to do homework'.slice(0, Math.max(0, Math.floor((f - 4) / 1.4)));
  const lbl = spring({ frame: f - hit - 6, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #10302a, ${T.bg} 70%)`, translate: `${sx}px ${sy}px` }}>
      <Img src={staticFile('photo-2.png')} style={{ position: 'absolute', left: 290, top: 330, width: 500, filter: 'grayscale(1) brightness(0.55)', opacity: enter }} />
      {Array.from({ length: shards }).map((_, k) => {
        const t = Math.max(0, f - hit);
        const vx = (rnd(k * 3.1) - 0.5) * 40, vy = -rnd(k * 5.7) * 30 - 6, vr = (rnd(k * 9.3) - 0.5) * 30;
        const x0 = (k / shards) * 920;
        return (
          <div key={k} style={{ position: 'absolute', left: 80, top: 600, width: 920, height: 170, overflow: 'visible',
            clipPath: `polygon(${x0 - 10 + rnd(k) * 20}px 0, ${x0 + 920 / shards + 10}px 0, ${x0 + 920 / shards - 10 + rnd(k + 1) * 20}px 170px, ${x0 - 10}px 170px)`,
            translate: `${vx * t}px ${vy * t + 1.6 * t * t}px`, rotate: `${vr * t}deg`, scale: String(interpolate(enter, [0, 1], [0.6, 1])), opacity: interpolate(t, [20, 34], [1, 0], clamp) }}>
            <div style={{ width: 920, height: 170, borderRadius: 85, background: '#fff', boxShadow: `0 0 60px ${T.a}66`, display: 'flex', alignItems: 'center', gap: 30, padding: '0 50px', boxSizing: 'border-box', fontFamily: INTER, fontWeight: 500, fontSize: 56, color: '#333' }}>
              <svg width="64" height="64" viewBox="0 0 24 24"><circle cx="10" cy="10" r="7" stroke="#666" strokeWidth="2.5" fill="none" /><path d="M15 15 L22 22" stroke="#666" strokeWidth="2.5" /></svg>
              {typed}<span style={{ opacity: f % 16 < 8 ? 1 : 0 }}>|</span>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 104, lineHeight: 1, color: '#fff', scale: String(interpolate(lbl, [0, 1], [2.2, 1])), opacity: interpolate(lbl, [0, 0.3], [0, 1], clamp) }}>
        NO AI = <span style={{ color: '#ff5a5a' }}>NO SEARCH</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 990, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 36, letterSpacing: '0.2em', color: T.b, opacity: lbl }}>FOR SCHOOLS THAT OPT OUT</div>
    </AbsoluteFill>
  );
};

export const Google: React.FC<{ dur: number }> = ({ dur }) => {
  const s0 = 235;
  const off = wordAt(2, /^off$/i, 28);
  const and = wordAt(2, /^schools$/i, 80) - 4;
  const lose = wordAt(2, /^lose$/i, 120) - and;
  void s0;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={and}><Toggle click={off} /></Sequence>
      <Sequence from={and} durationInFrames={dur - and + 30}><Search hit={lose} /></Sequence>
    </AbsoluteFill>
  );
};
