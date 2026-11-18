import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { HOOK_GRAD, INTER, MONO, THEMES, clamp } from '../theme';

const TILES = [
  { th: 'pink', label: 'GTA 6 is', em: '9 days', tail: 'away', from: [-900, -700, -40] },
  { th: 'teal', label: 'Google turns', em: 'AI off', tail: 'for students', from: [900, -700, 35] },
  { th: 'violet', label: 'A robot built in space.', em: 'Alone.', tail: '', from: [-900, 900, 30] },
  { th: 'amber', label: 'Hubble is', em: 'falling', tail: '', from: [900, 900, -45] },
];

const Mini: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const t = THEMES[TILES[i].th];
  if (i === 0) {
    const n = Math.round(interpolate(f, [4, 40], [99, 9], { ...clamp, easing: Easing.out(Easing.cubic) }));
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 150, color: t.a, lineHeight: 1, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 40px ${t.a}` }}>{n}</div>
        <Img src={staticFile('photo-1.png')} style={{ width: 120, filter: 'drop-shadow(0 0 16px #ff4fa3)' }} />
      </div>
    );
  }
  if (i === 1) {
    const off = interpolate(f, [30, 38], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 1.6, 0.5, 1) });
    return (
      <div style={{ width: 230, height: 120, borderRadius: 60, background: off > 0.5 ? '#333' : t.a, boxShadow: off > 0.5 ? 'none' : `0 0 40px ${t.a}`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: interpolate(off, [0, 1], [122, 12]), width: 96, height: 96, borderRadius: 48, background: '#fff' }} />
      </div>
    );
  }
  if (i === 2) {
    const segs = Math.floor(interpolate(f, [0, 44], [0, 8], clamp));
    return (
      <svg width="200" height="200" viewBox="-100 -100 200 200" style={{ rotate: `${f * 2}deg` }}>
        {Array.from({ length: 8 }).map((_, k) => {
          const a0 = (k / 8) * Math.PI * 2 + 0.05, a1 = ((k + 1) / 8) * Math.PI * 2 - 0.05;
          return <path key={k} d={`M ${80 * Math.cos(a0)} ${80 * Math.sin(a0)} A 80 80 0 0 1 ${80 * Math.cos(a1)} ${80 * Math.sin(a1)}`} stroke={k < segs ? t.a : 'rgba(255,255,255,0.15)'} strokeWidth="18" fill="none" strokeLinecap="round" />;
        })}
      </svg>
    );
  }
  return (
    <div style={{ width: 230, height: 160, borderRadius: 20, overflow: 'hidden', translate: `0 ${f * 1.2}px`, rotate: `${f * 0.4}deg`, boxShadow: `0 -30px 50px ${t.a}aa` }}>
      <Img src={staticFile('photo-4.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = ['4', 'things', 'that', 'happened', 'while', 'you', 'were', 'scrolling.'];
  const push = interpolate(f, [0, 70], [1, 1.1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #1b1b33 0%, #07070d 70%)' }}>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 170, display: 'flex', flexWrap: 'wrap', gap: '0 22px', fontFamily: INTER, fontWeight: 900, fontSize: 84, lineHeight: 1.05, color: '#fff', letterSpacing: '-0.02em' }}>
        {title.map((w, k) => {
          const s = spring({ frame: f - 2 - k * 2, fps, config: { damping: 12, stiffness: 200 } });
          const last = k === title.length - 1;
          return (
            <span key={k} style={{
              display: 'inline-block', opacity: s, translate: `0 ${interpolate(s, [0, 1], [60, 0])}px`, rotate: `${interpolate(s, [0, 1], [8, 0])}deg`,
              ...(last ? { backgroundImage: HOOK_GRAD, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', backgroundSize: '200% 100%', backgroundPosition: `${f * 3}% 0` } : {}),
            }}>{w}</span>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 40, top: 470, width: 1000, height: 700, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, scale: String(push) }}>
        {TILES.map((tile, i) => {
          const t = THEMES[tile.th];
          const s = spring({ frame: f - i * 3, fps, config: { damping: 14, stiffness: 120, mass: 0.8 } });
          const bob = Math.sin((f + i * 11) / 9) * 6;
          return (
            <div key={i} style={{
              position: 'relative', borderRadius: 32, overflow: 'hidden', background: `linear-gradient(160deg, ${t.panel}, ${t.bg})`,
              border: `3px solid ${t.a}`, boxShadow: `0 0 50px ${t.a}55, inset 0 0 60px ${t.a}22`,
              translate: `${interpolate(s, [0, 1], [tile.from[0], 0])}px ${interpolate(s, [0, 1], [tile.from[1], 0]) + bob}px`,
              rotate: `${interpolate(s, [0, 1], [tile.from[2], 0])}deg`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24,
            }}>
              <Mini i={i} f={f} />
              <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 38, color: '#fff', textAlign: 'center', lineHeight: 1.1 }}>
                {tile.label} <span style={{ color: t.a }}>{tile.em}</span> {tile.tail}
              </div>
              <div style={{ position: 'absolute', top: 18, left: 22, fontFamily: MONO, fontSize: 22, fontWeight: 800, color: t.a, letterSpacing: '0.2em' }}>0{i + 1}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
