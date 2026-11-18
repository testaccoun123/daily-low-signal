import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, Sequence } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { INTER, MONO, THEMES, clamp, shake, wordAt } from '../theme';

const T = THEMES.pink;

const Rays: React.FC<{ f: number; color: string }> = ({ f, color }) => (
  <AbsoluteFill style={{ background: `repeating-conic-gradient(from ${f * 0.8}deg at 50% 38%, ${color}22 0deg 6deg, transparent 6deg 18deg)` }} />
);

// Shot A: the number counts 99 -> 9 like a slot reel and slams on "nine".
const Countdown: React.FC<{ land: number }> = ({ land }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(f, [0, land], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const n = Math.round(99 - 90 * p);
  const speed = interpolate(f, [land - 6, land], [1, 0], clamp) * (1 - p * 0.6);
  const slam = spring({ frame: f - land, fps, config: { damping: 9, stiffness: 260 } });
  const [sx, sy] = shake(f, land, 34, 4);
  const ring = interpolate(f, [land, land + 18], [0, 1], clamp);
  const label = spring({ frame: f - land - 4, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 38%, ${T.deep} 0%, ${T.bg} 65%)`, translate: `${sx}px ${sy}px` }}>
      <Rays f={f} color={T.a} />
      <div style={{ position: 'absolute', left: 540, top: 600, width: 10, height: 10, opacity: ring > 0 && ring < 1 ? 1 : 0 }}>
        <div style={{ position: 'absolute', left: -450 * ring, top: -450 * ring, width: 900 * ring, height: 900 * ring, borderRadius: '50%', border: `${24 * (1 - ring)}px solid ${T.a}`, opacity: 1 - ring }} />
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 560, lineHeight: 1,
        color: f >= land ? T.a : '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05em',
        scale: String(f >= land ? interpolate(slam, [0, 1], [1.6, 1]) : 1),
        textShadow: `0 ${-60 * speed}px 0 ${T.a}55, 0 ${-120 * speed}px 0 ${T.a}22, 0 0 80px ${T.a}`,
        filter: `blur(${speed * 6}px)`,
      }}>{n}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 90, letterSpacing: '0.4em', color: '#fff', opacity: label, translate: `0 ${(1 - label) * 60}px` }}>DAYS</div>
    </AbsoluteFill>
  );
};

// Shot B: Rockstar logo spins in, camera crash-zooms on it (motion blur only on the zoom).
const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 11, stiffness: 140 } });
  const zoom = interpolate(f, [0, 34], [1, 1.18], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: T.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `repeating-linear-gradient(115deg, ${T.a}26 0 40px, transparent 40px 120px)`, translate: `${-f * 24}px 0`, width: 3000 }} />
      <AbsoluteFill style={{ perspective: 1400, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 330 }}>
        <Img src={staticFile('photo-1.png')} style={{
          width: 640, rotate: `y ${interpolate(s, [0, 1], [-540, 0])}deg`, scale: String(interpolate(s, [0, 1], [0.2, 1]) * zoom),
          filter: `drop-shadow(0 0 60px ${T.a}) drop-shadow(0 30px 40px #000)`,
        }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Shot C: calendar days flick past and lock on NOV 19.
const Calendar: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const day = Math.min(19, 10 + Math.floor(f / 2.2));
  const flip = (f % 2.2) / 2.2;
  const locked = f >= 20;
  const lock = spring({ frame: f - 22, fps, config: { damping: 8, stiffness: 300 } });
  const [sx, sy] = shake(f, 22, 22, 3);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${T.deep}, ${T.bg} 70%)`, translate: `${sx}px ${sy}px`, perspective: 1600 }}>
      <div style={{ position: 'absolute', left: 190, top: 300, width: 700, height: 760, borderRadius: 48, background: '#fff', overflow: 'hidden', boxShadow: `0 0 120px ${T.a}88`, rotate: `x ${locked ? 0 : 8}deg` }}>
        <div style={{ height: 190, background: T.a, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 110, letterSpacing: '0.2em', color: '#fff' }}>NOV</div>
        <div style={{ position: 'absolute', top: 190, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 400, color: '#111', letterSpacing: '-0.04em',
          rotate: `x ${locked ? 0 : -flip * 80}deg`, transformOrigin: '50% 0%', opacity: locked ? 1 : 1 - flip * 0.5 }}>{day}</div>
      </div>
      <div style={{ position: 'absolute', left: 700, top: 230, width: 230, height: 230, borderRadius: 115, background: '#111', border: `8px solid ${T.a}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        scale: String(interpolate(lock, [0, 1], [3, 1])), opacity: interpolate(lock, [0, 0.2], [0, 1], clamp), rotate: `${interpolate(lock, [0, 1], [-40, 12])}deg` }}>
        <svg width="120" height="140" viewBox="0 0 120 140">
          <path d={`M 30 ${70 - 0} V 45 a 30 30 0 0 1 60 0 V ${interpolate(lock, [0, 1], [30, 70], clamp)}`} stroke="#fff" strokeWidth="14" fill="none" />
          <rect x="15" y="65" width="90" height="70" rx="12" fill={T.a} />
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1090, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 46, letterSpacing: '0.3em', color: T.b, opacity: lock }}>LOCKED IN</div>
    </AbsoluteFill>
  );
};

export const Gta: React.FC<{ dur: number }> = ({ dur }) => {
  const nine = wordAt(1, /^nine$/i, 45);
  const rock = wordAt(1, /^Rockstar$/i, 80) - 3;
  const nov = wordAt(1, /^November$/i, 105) - 2;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={rock}><Countdown land={nine} /></Sequence>
      <Sequence from={rock} durationInFrames={nov - rock}>
        <CameraMotionBlur shutterAngle={180} samples={6}><Logo /></CameraMotionBlur>
      </Sequence>
      <Sequence from={nov} durationInFrames={dur - nov + 30}><Calendar /></Sequence>
    </AbsoluteFill>
  );
};
