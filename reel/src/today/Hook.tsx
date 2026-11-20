import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { HOOK_GRAD, INTER, MONO, THEMES, clamp } from '../theme';

const TILES = [
  { th: 'pink', label: 'The biggest IPO', em: 'ever', tail: '', from: [-900, -700, -40] },
  { th: 'teal', label: 'Steam Machine waitlist:', em: 'closed', tail: '', from: [900, -700, 35] },
  { th: 'violet', label: 'Instagram Stories get an', em: 'edit', tail: 'button', from: [-900, 900, 30] },
  { th: 'amber', label: "Google's AI is going to", em: 'space', tail: '', from: [900, 900, -45] },
];

const Mini: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const t = THEMES[TILES[i].th];
  if (i === 0) {
    // chart line shoots up
    const p = interpolate(f, [6, 34], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
    const pts = [[0, 120], [40, 110], [80, 118], [120, 100], [160, 105], [200, 120 - p * 170]];
    return (
      <svg width="230" height="150" viewBox="0 -60 220 190" style={{ overflow: 'visible' }}>
        <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={t.a} strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 14px ${t.a})` }} />
        <text x="110" y="-20" textAnchor="middle" fontFamily={INTER} fontWeight={900} fontSize="56" fill="#fff" opacity={p}>+34%</text>
      </svg>
    );
  }
  if (i === 1) {
    const drop = interpolate(f, [22, 30], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    return (
      <div style={{ position: 'relative', width: 170, height: 170, borderRadius: 85, overflow: 'hidden' }}>
        <Img src={staticFile('photo-2.png')} style={{ width: 170, height: 170 }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 170 * drop, background: `repeating-linear-gradient(0deg, #3a4b47 0 14px, #22302d 14px 20px)` }} />
      </div>
    );
  }
  if (i === 2) {
    const w = interpolate(f, [10, 40], [-0.3, 1], clamp);
    return (
      <div style={{ position: 'relative', width: 150, height: 150 }}>
        <Img src={staticFile('photo-3.png')} style={{ width: 150, height: 150 }} />
        <svg width="110" height="110" viewBox="0 0 24 24" style={{ position: 'absolute', left: 80 + Math.sin(w * 9) * 20, top: -30 + w * 30, rotate: `${-20 + Math.sin(f / 3) * 12}deg`, filter: 'drop-shadow(0 4px 8px #000)' }}>
          <path d="M3 21 L4 16 L16 4 L20 8 L8 20 Z" fill="#ffd27a" stroke="#000" strokeWidth="1.2" />
          <path d="M3 21 L4 16 L8 20 Z" fill="#333" />
        </svg>
      </div>
    );
  }
  const up = interpolate(f, [8, 58], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <div style={{ position: 'relative', width: 120, height: 170, translate: `0 ${-up * 120}px` }}>
      <svg width="120" height="230" viewBox="0 0 60 115" style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d="M30 2 C 42 14 44 30 44 50 L44 80 L16 80 L16 50 C16 30 18 14 30 2 Z" fill="#f4efe8" />
        <path d="M16 70 L6 86 L16 82 Z M44 70 L54 86 L44 82 Z" fill={t.a} />
        <path d={`M20 80 Q30 ${108 + Math.sin(f) * 4} 40 80 Z`} fill="#ffd27a" />
      </svg>
    </div>
  );
};

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = ['4', 'things', 'blew', 'up', 'while', 'you', 'scrolled.'];
  const push = interpolate(f, [0, 70], [1, 1.1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #1b1b33 0%, #07070d 70%)' }}>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 170, display: 'flex', flexWrap: 'wrap', gap: '0 22px', fontFamily: INTER, fontWeight: 900, fontSize: 84, lineHeight: 1.05, color: '#fff', letterSpacing: '-0.02em' }}>
        {title.map((w, k) => {
          const s = spring({ frame: f - 2 - k * 2, fps, config: { damping: 20, stiffness: 120 } });
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
          const s = spring({ frame: f - i * 3, fps, config: { damping: 20, stiffness: 120, mass: 0.8 } });
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
