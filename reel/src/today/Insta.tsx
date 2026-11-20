import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, Sequence } from 'remotion';
import { INTER, MONO, THEMES, clamp, rnd, shake, wordAt } from '../theme';

const T = THEMES.violet;

const Pencil: React.FC<{ x: number; y: number; rot: number; s?: number }> = ({ x, y, rot, s = 1 }) => (
  <svg width={260 * s} height={260 * s} viewBox="0 0 24 24" style={{ position: 'absolute', left: x, top: y, rotate: `${rot}deg`, filter: 'drop-shadow(0 12px 16px #000a)', overflow: 'visible' }}>
    <path d="M2 22 L3.5 16.5 L16 4 L20 8 L7.5 20.5 Z" fill="#ffcf4a" stroke="#000" strokeWidth="0.6" />
    <path d="M16 4 L18 2 L22 6 L20 8 Z" fill="#ff7a9c" stroke="#000" strokeWidth="0.6" />
    <path d="M2 22 L3.5 16.5 L7.5 20.5 Z" fill="#f2d7b0" />
    <path d="M2 22 L2.8 19.2 L4.8 21.2 Z" fill="#222" />
  </svg>
);

// Shot A: a posted Story with a typo; a giant pencil dives in on "edit", the typo explodes and re-forms correctly.
const Story: React.FC<{ edit: number; ig: number; after: number }> = ({ edit, ig, after }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 20, stiffness: 120 } });
  const dive = interpolate(f, [edit - 8, edit], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const fixed = f >= edit + 2;
  const [sx, sy] = shake(f, edit, 4, 12);
  const logo = spring({ frame: f - ig, fps, config: { damping: 20, stiffness: 120 } });
  const stamp = spring({ frame: f - after, fps, config: { damping: 20, stiffness: 120 } });
  const [ax, ay] = shake(f, after, 3, 9);
  const push = interpolate(f, [0, edit, edit + 40], [1, 1.12, 1.05], { ...clamp, easing: Easing.out(Easing.quad) });
  const fixP = spring({ frame: f - edit - 2, fps, config: { damping: 20, stiffness: 120 } });
  const bad = 'EVRE'.split(''), good = 'EVER'.split('');
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${T.deep}, ${T.bg} 70%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, translate: `${sx + ax}px ${sy + ay}px`, scale: String(push) }}>
        {/* phone */}
        <div style={{ position: 'absolute', left: 260, top: interpolate(enter, [0, 1], [1900, 190]), width: 560, height: 980, borderRadius: 70, background: '#000', padding: 18, boxSizing: 'border-box', boxShadow: `0 0 80px ${T.a}88`, rotate: `${interpolate(enter, [0, 1], [18, -3])}deg` }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 54, overflow: 'hidden', background: 'linear-gradient(170deg, #ff9a5a, #ff4fa3 45%, #6b3bff)' }}>
            {/* story progress bar */}
            <div style={{ position: 'absolute', left: 24, right: 24, top: 24, height: 7, borderRadius: 4, background: '#fff6' }}>
              <div style={{ width: `${Math.min(100, f * 1.2)}%`, height: '100%', borderRadius: 4, background: '#fff' }} />
            </div>
            <div style={{ position: 'absolute', left: 24, top: 50, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: 'conic-gradient(#ffd23d, #ff4fa3, #a78bff, #ffd23d)', padding: 4, boxSizing: 'border-box' }}><div style={{ width: '100%', height: '100%', borderRadius: 30, background: '#222' }} /></div>
              <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 28, color: '#fff' }}>you · 2m</div>
            </div>
            {/* sun + hills */}
            <div style={{ position: 'absolute', left: 170, top: 210, width: 200, height: 200, borderRadius: 100, background: '#ffe08a', boxShadow: '0 0 80px #ffe08a' }} />
            <div style={{ position: 'absolute', left: -100, top: 640, width: 800, height: 600, borderRadius: '50%', background: '#2b145c' }} />
            {/* sticker text with typo */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 72, color: '#fff', textShadow: '0 4px 0 #0006', lineHeight: 1.05 }}>
              BEST DAY<br />
              {!fixed && bad.map((c, k) => <span key={k} style={{ display: 'inline-block', color: k >= 2 ? '#ffe14a' : '#fff', textDecoration: k >= 2 && f > edit - 14 ? 'underline wavy #ff3355' : 'none' }}>{c}</span>)}
              {fixed && good.map((c, k) => {
                const t = f - edit - 2;
                const off = k >= 2 ? interpolate(fixP, [0, 1], [1, 0]) : 0;
                return <span key={k} style={{ display: 'inline-block', translate: `${(rnd(k * 3) - 0.5) * 400 * off}px ${(rnd(k * 7) - 0.5) * 400 * off}px`, rotate: `${off * 360}deg`, color: k >= 2 && t < 20 ? '#7dffb0' : '#fff' }}>{c}</span>;
              })}
            </div>
            {/* sparkle burst at the fix */}
            {fixed && Array.from({ length: 18 }).map((_, k) => {
              const t = f - edit - 2, a = (k / 18) * Math.PI * 2, v = 10 + rnd(k) * 14;
              return <div key={k} style={{ position: 'absolute', left: 340 + Math.cos(a) * v * t, top: 600 + Math.sin(a) * v * t, width: 14, height: 14, borderRadius: 7, background: '#fff', boxShadow: '0 0 12px #fff', opacity: interpolate(t, [0, 14], [1, 0], clamp) }} />;
            })}
          </div>
        </div>
        {/* pencil dives in */}
        <Pencil x={interpolate(dive, [0, 1], [1100, 560]) + (f > edit ? Math.sin(f) * 6 : 0)} y={interpolate(dive, [0, 1], [1500, 450])} rot={interpolate(dive, [0, 1], [40, 0])} />
        {/* Instagram logo pops */}
        <Img src={staticFile('photo-3.png')} style={{ position: 'absolute', left: 120, top: 210, width: 210, rotate: `${interpolate(logo, [0, 1], [-200, -12])}deg`, scale: String(logo), filter: `drop-shadow(0 0 30px ${T.a})` }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', scale: String(interpolate(stamp, [0, 1], [1.15, 1])), opacity: interpolate(stamp, [0, 0.2], [0, 1], clamp), rotate: `${interpolate(stamp, [0, 1], [-14, 4])}deg` }}>
        <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 100, color: T.bg, background: '#fff', padding: '6px 34px', borderRadius: 18, boxShadow: `0 12px 0 ${T.a}` }}>AFTER POSTING</span>
      </div>
    </AbsoluteFill>
  );
};

const Eye = () => (
  <svg width="110" height="70" viewBox="0 0 24 15"><path d="M1 7.5 C5 1 19 1 23 7.5 C19 14 5 14 1 7.5 Z" fill="none" stroke="#fff" strokeWidth="2" /><circle cx="12" cy="7.5" r="3.6" fill="#fff" /></svg>
);

// Shot B: a 15:00 ring timer slams in and drains to zero, shatters; the view counter survives under a padlock.
const Timer: React.FC<{ fifteen: number; keep: number; views: number }> = ({ fifteen, keep, views }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({ frame: f - fifteen, fps, config: { damping: 20, stiffness: 120 } });
  const [sx, sy] = shake(f, fifteen, 4, 12);
  const drain = interpolate(f, [fifteen + 4, keep - 2], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const secs = Math.round(900 * (1 - drain));
  const mm = Math.floor(secs / 60), ss = secs % 60;
  const broke = f >= keep;
  const [bx, by] = shake(f, keep, 5, 15);
  const vc = spring({ frame: f - keep - 2, fps, config: { damping: 20, stiffness: 120 } });
  const lock = spring({ frame: f - views, fps, config: { damping: 20, stiffness: 120 } });
  const [lx, ly] = shake(f, views, 3, 9);
  const R = 300, C = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 38%, ${T.deep}, ${T.bg} 70%)`, overflow: 'hidden', translate: `${sx + bx + lx}px ${sy + by + ly}px` }}>
      {!broke && (
        <div style={{ position: 'absolute', left: 540 - 360, top: 250, width: 720, height: 720, scale: String(f < fifteen ? 0 : interpolate(slam, [0, 1], [1.15, 1])), opacity: f < fifteen ? 0 : 1 }}>
          <svg width="720" height="720" viewBox="-360 -360 720 720">
            <circle r={R} stroke="#ffffff1a" strokeWidth="44" fill="none" />
            <circle r={R} stroke={drain > 0.8 ? '#ff4f6a' : T.a} strokeWidth="44" fill="none" strokeDasharray={`${C * (1 - drain)} ${C}`} transform="rotate(-90)" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 20px ${T.a})` }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 180, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1 }}>{mm}:{String(ss).padStart(2, '0')}</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: '0.25em', color: T.b, marginTop: 8 }}>TO EDIT</div>
          </div>
        </div>
      )}
      {/* pre-slam: little "15 MIN" teaser before the timer lands */}
      {/* shattered ring */}
      {broke && Array.from({ length: 16 }).map((_, k) => {
        const t = f - keep, a = (k / 16) * Math.PI * 2, v = 16 + rnd(k * 4.4) * 16;
        return <div key={k} style={{ position: 'absolute', left: 540 + Math.cos(a) * (R + v * t) - 30, top: 610 + Math.sin(a) * (R + v * t) + 1.2 * t * t - 22, width: 60, height: 44, borderRadius: 8, background: k % 2 ? T.a : '#ffffff33',
          rotate: `${a * 57 + t * 25}deg`, opacity: interpolate(t, [8, 22], [1, 0], clamp) }} />;
      })}
      {broke && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', scale: String(interpolate(vc, [0, 1], [0.2, 1])), opacity: vc }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '34px 50px', borderRadius: 40, background: '#ffffff14', border: `4px solid ${T.a}`, boxShadow: `0 0 60px ${T.a}66` }}>
            <Eye />
            <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 130, color: '#fff', lineHeight: 1 }}>VIEWS</div>
          </div>
        </div>
      )}
      {broke && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          scale: String(Math.max(0.88, interpolate(lock, [0, 1], [1.15, 1]))), opacity: interpolate(lock, [0, 0.2], [0, 1], clamp) }}>
          <svg width="150" height="170" viewBox="0 0 120 140">
            <path d={`M 30 70 V 45 a 30 30 0 0 1 60 0 V ${interpolate(lock, [0, 1], [30, 70], clamp)}`} stroke="#fff" strokeWidth="14" fill="none" />
            <rect x="15" y="65" width="90" height="70" rx="12" fill={T.a} />
          </svg>
          <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 96, color: T.a, textShadow: '0 8px 0 #000' }}>KEPT</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Insta: React.FC<{ dur: number }> = ({ dur }) => {
  const edit = wordAt(3, /^edit$/i, 21);
  const ig = wordAt(3, /^Instagram$/i, 33);
  const after = wordAt(3, /^posting$/i, 78) - 4;
  const cut = wordAt(3, /^fifteen$/i, 107) - 10;
  const fifteen = wordAt(3, /^fifteen$/i, 107) - cut;
  const keep = wordAt(3, /^keep$/i, 140) - cut;
  const views = wordAt(3, /^views$/i, 152) - cut;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={cut}><Story edit={edit} ig={ig} after={after} /></Sequence>
      <Sequence from={cut} durationInFrames={dur - cut + 30}><Timer fifteen={fifteen} keep={keep} views={views} /></Sequence>
    </AbsoluteFill>
  );
};
