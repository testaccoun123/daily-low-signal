import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { INTER, MONO, THEMES, clamp, rnd, shake, wordAt } from '../theme';
import { Stars } from './Robot';

const T = THEMES.amber;

export const Hubble: React.FC<{ dur: number }> = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fall = wordAt(4, /^falling$/i, 40);
  const hit = wordAt(4, /^crashing$/i, 105) + 8;
  const seven = wordAt(4, /^seven$/i, 148);

  const fp = interpolate(f, [fall, hit], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const heat = interpolate(f, [fall + 10, hit], [0, 1], clamp);
  const after = f >= hit;
  // camera shake: rumble grows during the fall, huge kick on impact
  const rumble = heat * 14;
  const [kx, ky] = shake(f, hit, 70, 7);
  const rx = rumble * Math.sin(f * 2.7), ry = rumble * Math.cos(f * 3.9);
  const dutch = after ? 0 : interpolate(fp, [0, 1], [0, -9]);
  const fire = spring({ frame: f - hit, fps, config: { damping: 30, stiffness: 40, mass: 1.4 } });
  const wave = interpolate(f, [hit, hit + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const flash = interpolate(f, [hit, hit + 1, hit + 8], [0, 1, 0], clamp);
  const yrs = spring({ frame: f - seven + 2, fps, config: { damping: 9, stiffness: 240 } });
  const [yx, yy] = shake(f, seven + 2, 16, 3);
  const groundY = after ? 1060 : interpolate(fp, [0, 1], [2300, 1060]);

  return (
    <AbsoluteFill style={{ background: after ? '#1a0904' : `radial-gradient(circle at 50% 30%, ${T.panel}, ${T.bg} 70%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: -120, translate: `${rx + kx}px ${ry + ky}px`, rotate: `${dutch}deg` }}>
        <div style={{ position: 'absolute', left: 120, top: 120, width: 1080, height: 1920 }}>
          <Stars f={f} speed={after ? 0 : 0.3 + fp * 12} n={after ? 40 : 120} />
          {/* speed streaks during the fall */}
          {!after && fp > 0.05 && Array.from({ length: 26 }).map((_, k) => (
            <div key={k} style={{ position: 'absolute', left: rnd(k * 4.4) * 1080, top: ((rnd(k * 2.2) * 2200 - f * 70 * (0.5 + fp)) % 2200 + 2200) % 2200 - 200, width: 4, height: 200 + fp * 500,
              background: `linear-gradient(${T.b}, transparent)`, opacity: 0.25 + fp * 0.5 }} />
          ))}
          {/* Earth, lit amber, rising to meet it */}
          <div style={{ position: 'absolute', left: -1460, top: groundY, width: 4000, height: 4000, borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 4%, #c7742e 0%, #6b3417 10%, #2a1208 26%)', boxShadow: `0 -30px 160px ${T.a}99` }} />
          {/* Hubble */}
          {!after && (
            <div style={{ position: 'absolute', left: 540, top: interpolate(fp, [0, 1], [640, 1010]), width: 0, height: 0 }}>
              {/* plasma sheath */}
              <div style={{ position: 'absolute', left: -380, top: -760, width: 760, height: 900, opacity: heat,
                background: `radial-gradient(ellipse at 50% 85%, #fff 0%, #ffd27a 12%, ${T.a} 30%, #ff3d0066 50%, transparent 70%)`, filter: 'blur(8px)' }} />
              <Img src={staticFile('asset-hubble-cut.png')} style={{
                position: 'absolute', left: -360, top: -270, width: 720,
                rotate: `${interpolate(f, [0, fall], [-8, 0], clamp) + fp * 70}deg`, scale: String(interpolate(f, [0, fall], [1.05, 1], clamp) * interpolate(fp, [0, 1], [1, 0.45])),
                filter: `sepia(${heat * 0.8}) saturate(${1 + heat * 3}) brightness(${1 + heat * 0.8})`,
              }} />
            </div>
          )}
          {/* fireball + shockwave */}
          {after && (
            <div style={{ position: 'absolute', left: 540, top: 1060, width: 0, height: 0 }}>
              <div style={{ position: 'absolute', left: -1100 * wave, top: -260 * wave, width: 2200 * wave, height: 520 * wave, borderRadius: '50%', border: `${30 * (1 - wave)}px solid #ffe2b0`, opacity: 1 - wave }} />
              <svg width="1400" height="1400" viewBox="-700 -700 1400 1400" style={{ position: 'absolute', left: -700, top: -1050, overflow: 'visible' }}>
                <defs>
                  <radialGradient id="fb"><stop offset="0" stopColor="#fff" /><stop offset="0.25" stopColor="#ffe08a" /><stop offset="0.5" stopColor={T.a} /><stop offset="0.75" stopColor="#c0260a" /><stop offset="1" stopColor="#2a0a04" stopOpacity="0" /></radialGradient>
                  <filter id="boil"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed={Math.floor(f / 2)} /><feDisplacementMap in="SourceGraphic" scale={60 + fire * 40} /></filter>
                </defs>
                <g filter="url(#boil)">
                  <ellipse cx="0" cy={350 - fire * 260} rx={60 + fire * 520} ry={60 + fire * 480} fill="url(#fb)" />
                  <ellipse cx="0" cy={360 - fire * 120} rx={40 + fire * 240} ry={30 + fire * 300} fill="url(#fb)" opacity="0.9" />
                </g>
              </svg>
              {Array.from({ length: 36 }).map((_, k) => {
                const t = f - hit;
                const a = -Math.PI * (0.05 + rnd(k * 2.9) * 0.9), v = 12 + rnd(k * 6.1) * 30;
                return <div key={k} style={{ position: 'absolute', left: Math.cos(a) * v * t, top: Math.sin(a) * v * t + 0.9 * t * t, width: 10 + rnd(k) * 16, height: 10 + rnd(k) * 16, borderRadius: 3,
                  background: k % 3 ? '#ffb15c' : '#3a1a0c', boxShadow: k % 3 ? '0 0 16px #ff8a3d' : 'none', opacity: interpolate(t, [20, 40], [1, 0], clamp) }} />;
              })}
            </div>
          )}
        </div>
      </div>
      {/* heat vignette + impact flash */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent 40%, ${T.a} 140%)`, opacity: heat * (after ? 0.3 : 0.8) }} />
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      {/* readouts */}
      {!after && (
        <div style={{ position: 'absolute', left: 60, top: 190, fontFamily: MONO, fontWeight: 800, fontSize: 36, letterSpacing: '0.16em', color: fp > 0 ? '#ff6a3d' : T.b }}>
          {fp > 0 ? '⚠ ORBIT DECAYING' : 'HUBBLE · 36 YRS IN ORBIT'}
          <div style={{ fontSize: 30, marginTop: 8, color: '#fff9', fontWeight: 700 }}>NO ENGINE · NO REBOOST</div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', translate: `${yx}px ${yy}px`,
        scale: String(interpolate(yrs, [0, 1], [3, 1])), opacity: interpolate(yrs, [0, 0.25], [0, 1], clamp) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: '0.3em', color: '#fff', background: '#000a', padding: '6px 18px' }}>IF NO RESCUE</div>
        <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 210, lineHeight: 1, color: '#fff', textShadow: `0 0 60px ${T.a}, 0 10px 0 #000`, letterSpacing: '-0.03em' }}>~7 YEARS</div>
      </div>
    </AbsoluteFill>
  );
};
