import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, Sequence } from 'remotion';
import { INTER, MONO, THEMES, clamp, rnd, shake, wordAt } from '../theme';

const T = THEMES.teal;

const Person: React.FC<{ x: number; y: number; s: number; f: number; c: string; rot?: number }> = ({ x, y, s, f, c, rot = 0 }) => (
  <svg width={80 * s} height={180 * s} viewBox="0 0 40 90" style={{ position: 'absolute', left: x, top: y, rotate: `${rot}deg`, overflow: 'visible' }}>
    <circle cx="20" cy="10" r="9" fill={c} />
    <rect x="11" y="21" width="18" height="34" rx="8" fill={c} />
    <line x1="16" y1="54" x2={16 + Math.sin(f / 3) * 8} y2="86" stroke={c} strokeWidth="7" strokeLinecap="round" />
    <line x1="24" y1="54" x2={24 - Math.sin(f / 3) * 8} y2="86" stroke={c} strokeWidth="7" strokeLinecap="round" />
  </svg>
);

// Shot A: a queue marches toward the WAITLIST gate; a steel shutter slams down on "waitlist", the line piles up.
const Queue: React.FC<{ slam: number }> = ({ slam }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = interpolate(f, [slam - 5, slam], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const [sx, sy] = shake(f, slam, 6, 15);
  const sign = spring({ frame: f - slam - 3, fps, config: { damping: 20, stiffness: 120 } });
  const GATE = 520;
  const zoom = interpolate(f, [0, slam, slam + 30], [1.0, 1.08, 1.2], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 75% 45%, ${T.deep}, ${T.bg} 70%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, translate: `${sx}px ${sy}px`, scale: String(zoom) }}>
        {/* floor */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, height: 8, background: `${T.a}66` }} />
        {/* gate */}
        <div style={{ position: 'absolute', left: GATE, top: 520, width: 380, height: 520, border: `14px solid ${T.a}`, borderBottom: 'none', borderRadius: '30px 30px 0 0', boxShadow: `0 0 60px ${T.a}88`, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, ${T.a}55, transparent 70%)` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: `${drop * 100}%`, background: 'repeating-linear-gradient(0deg, #6c7f7a 0 34px, #2e3b38 34px 44px)', boxShadow: '0 10px 30px #000' }} />
        </div>
        <div style={{ position: 'absolute', left: GATE - 20, top: 430, width: 420, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 54, letterSpacing: '0.12em', color: T.a, textShadow: `0 0 20px ${T.a}` }}>WAITLIST</div>
        {/* queue */}
        {Array.from({ length: 9 }).map((_, k) => {
          const walk = f * 9 - k * 95;
          const stopX = GATE - 120 - k * 70;
          let x = Math.min(walk + 40, f >= slam ? stopX : 2000);
          const bumped = f >= slam && walk + 40 >= stopX;
          const t = f - slam;
          const back = bumped ? Math.max(0, 40 * Math.exp(-t / 5) * Math.sin(t / 1.5)) : 0;
          x -= back;
          if (x > GATE + 380) return null;
          const fall = k === 0 && f >= slam ? interpolate(t, [0, 8], [0, -70], clamp) : 0;
          return <Person key={k} x={x} y={860 - (k === 0 && f >= slam ? interpolate(t, [0, 8], [0, -30], clamp) : 0)} s={1} f={f + k * 3} c={k % 2 ? T.b : '#ffffff'} rot={fall} />;
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', scale: String(Math.max(0.88, interpolate(sign, [0, 1], [1.15, 1]))), opacity: interpolate(sign, [0, 0.2], [0, 1], clamp), rotate: `${interpolate(sign, [0, 1], [12, -5])}deg` }}>
        <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 150, color: '#fff', background: '#e8344a', padding: '6px 40px', borderRadius: 20, boxShadow: '0 16px 0 #0008' }}>CLOSED</span>
      </div>
    </AbsoluteFill>
  );
};

// Shot B: the Steam Machine drops in, "2TB" pops, and OUT OF STOCK tape slaps across it on "Steam".
const Box: React.FC<{ tb: number; tape: number }> = ({ tb, tape }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = spring({ frame: f, fps, config: { damping: 20, stiffness: 120 } });
  const badge = spring({ frame: f - tb, fps, config: { damping: 20, stiffness: 120 } });
  const t1 = spring({ frame: f - tape, fps, config: { damping: 20, stiffness: 120 } });
  const t2 = spring({ frame: f - tape - 5, fps, config: { damping: 20, stiffness: 120 } });
  const [sx, sy] = shake(f, tape, 4, 12);
  const [bx, by] = shake(f, tape + 5, 3, 12);
  const spin = interpolate(f, [0, 80], [-28, 10]);
  const Tape: React.FC<{ s: number; rot: number; y: number; from: number }> = ({ s, rot, y, from }) => (
    <div style={{ position: 'absolute', left: -200, top: y, width: 1480, height: 130, rotate: `${rot}deg`, translate: `${interpolate(s, [0, 1], [from, 0])}px 0`,
      background: 'repeating-linear-gradient(135deg, #ffd23d 0 60px, #111 60px 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px #000a' }}>
      <span style={{ background: '#ffd23d', padding: '0 30px', fontFamily: INTER, fontWeight: 900, fontSize: 84, color: '#111', letterSpacing: '0.02em' }}>OUT OF STOCK</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${T.deep}, ${T.bg} 70%)`, overflow: 'hidden', translate: `${sx + bx}px ${sy + by}px` }}>
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: 'absolute', left: 290, top: interpolate(land, [0, 1], [-700, 470]), width: 500, height: 500, transformStyle: 'preserve-3d', rotate: `y ${spin}deg`, scale: String(1 + f * 0.002) }}>
          {/* front */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #2a2d33, #0c0d10)', borderRadius: 40, border: '3px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 40px 80px #000, 0 0 80px ${T.a}44`, translate: '0 0 250px' }}>
            <Img src={staticFile('photo-2.png')} style={{ width: 200, opacity: 0.95 }} />
            <div style={{ position: 'absolute', bottom: 40, left: 60, right: 60, height: 10, borderRadius: 5, background: T.a, boxShadow: `0 0 20px ${T.a}` }} />
          </div>
          {/* side */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #1b1d22, #050506)', borderRadius: 40, rotate: 'y 90deg', translate: '250px 0 0' }} />
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 660, top: 380, width: 300, height: 300, borderRadius: 150, background: T.a, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 120, color: T.bg,
        scale: String(interpolate(badge, [0, 1], [0, 1])), rotate: `${interpolate(badge, [0, 1], [-90, 12])}deg`, boxShadow: `0 0 60px ${T.a}` }}>2TB</div>
      <Tape s={t1} rot={-12} y={640} from={-1600} />
      <Tape s={t2} rot={9} y={790} from={1600} />
    </AbsoluteFill>
  );
};

// Shot C: a RAM stick, its price tag spinning like a slot machine; on "soaring" it rockets off-screen in flames.
const Ram: React.FC<{ soar: number; costs: number }> = ({ soar, costs }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 20, stiffness: 120 } });
  const lift = interpolate(f, [soar - 2, soar + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const shudder = 0 * costs; // no shaking (cosy style)
  const [sx, sy] = shake(f, soar, 5, 15);
  const q = spring({ frame: f - soar - 6, fps, config: { damping: 20, stiffness: 120 } });
  const ramY = 760 - lift * 1500;
  const digits = (k: number) => <span style={{ display: 'inline-block', translate: `0 ${(rnd(k * 13.3 + Math.floor(f / 1.5)) - 0.5) * 50}px` }}>?</span>;
  return (
    <AbsoluteFill style={{ background: f >= soar ? `radial-gradient(circle at 50% 30%, #145c4c, ${T.bg} 70%)` : `radial-gradient(circle at 50% 45%, ${T.panel}, ${T.bg} 70%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, translate: `${sx + Math.sin(f * 3) * shudder}px ${sy + Math.cos(f * 4) * shudder}px` }}>
        {/* speed lines */}
        {lift > 0 && Array.from({ length: 22 }).map((_, k) => (
          <div key={k} style={{ position: 'absolute', left: rnd(k * 3.1) * 1080, top: ((rnd(k * 1.9) * 2200 + f * 90) % 2200) - 200, width: 6, height: 300 * lift + 60, background: `linear-gradient(transparent, ${T.b})`, opacity: 0.5 }} />
        ))}
        <div style={{ position: 'absolute', left: 140, top: ramY, width: 800, height: 210, scale: String(interpolate(enter, [0, 1], [0.3, 1])), rotate: `${interpolate(enter, [0, 1], [-20, 0]) + lift * 8}deg` }}>
          {/* exhaust flames */}
          {lift > 0 && (
            <div style={{ position: 'absolute', left: 60, top: 190, width: 680, height: 600 * lift + 100, background: `radial-gradient(ellipse at 50% 0%, #fff 0%, #ffe08a 15%, #ff8a3d 35%, #ff3d0066 60%, transparent 75%)`, filter: 'blur(6px)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: '#1f7a4a', borderRadius: 10, border: '4px solid #145234', boxShadow: `0 0 50px ${T.a}66` }}>
            {Array.from({ length: 8 }).map((_, k) => <div key={k} style={{ position: 'absolute', left: 30 + k * 95, top: 40, width: 75, height: 110, background: '#111', borderRadius: 6 }} />)}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: -4, height: 26, background: 'repeating-linear-gradient(90deg, #e6c55a 0 12px, transparent 12px 20px)' }} />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: -90, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: '0.3em', color: T.b }}>MEMORY</div>
        </div>
        {/* slot-machine price tag */}
        {f < soar + 6 && (
          <div style={{ position: 'absolute', left: 260, top: 1020, width: 560, height: 150, borderRadius: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: MONO, fontWeight: 800, fontSize: 100, color: '#111', filter: 'blur(1.5px)', opacity: interpolate(enter, [0, 1], [0, 1]), rotate: '-3deg' }}>
            ${digits(1)}{digits(2)}{digits(3)}{digits(4)}
          </div>
        )}
      </div>
      <AbsoluteFill style={{ background: '#fff', opacity: interpolate(f, [soar, soar + 5, soar + 28], [0, 0.12, 0], clamp) }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        scale: String(Math.max(0.88, interpolate(q, [0, 1], [1.15, 1]))), opacity: interpolate(q, [0, 0.2], [0, 1], clamp) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, letterSpacing: '0.25em', color: '#fff', background: '#000a', padding: '6px 20px' }}>NEXT PRICE</div>
        <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 230, lineHeight: 1, color: T.a, textShadow: `0 0 60px ${T.a}, 0 12px 0 #000` }}>$???</div>
      </div>
    </AbsoluteFill>
  );
};

export const Steam: React.FC<{ dur: number }> = ({ dur }) => {
  const wl = wordAt(2, /^waitlist$/i, 24) + 2;
  const b = wordAt(2, /^twoterabyte$/i, 53) - 5;
  const steam = wordAt(2, /^Steam$/i, 72) - b;
  const mem = wordAt(2, /^Memory$/i, 98) - 4;
  const costs = wordAt(2, /^costs$/i, 110) - mem;
  const soar = wordAt(2, /^soaring$/i, 131) - mem;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={b}><Queue slam={wl} /></Sequence>
      <Sequence from={b} durationInFrames={mem - b}><Box tb={5} tape={steam} /></Sequence>
      <Sequence from={mem} durationInFrames={dur - mem + 30}><Ram soar={soar} costs={costs} /></Sequence>
    </AbsoluteFill>
  );
};
