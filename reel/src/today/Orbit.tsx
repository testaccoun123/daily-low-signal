import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { INTER, MONO, THEMES, clamp, rnd, shake, wordAt } from '../theme';

const T = THEMES.amber;

const Stars: React.FC<{ f: number; speed: number; n?: number }> = ({ f, speed, n = 110 }) => (
  <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
    {Array.from({ length: n }).map((_, k) => {
      const z = 0.3 + rnd(k * 3.3) * 0.7;
      const y = (rnd(k * 7.1) * 1920 + f * speed * z) % 1920;
      return <circle key={k} cx={rnd(k * 1.7) * 1080} cy={y} r={z * 2.6} fill="#fff" opacity={0.3 + 0.6 * z} />;
    })}
  </svg>
);

// A server rack carrying the Google logo (the "AI computer").
const Rack: React.FC<{ w: number; f: number }> = ({ w, f }) => (
  <div style={{ width: w, height: w * 1.25, borderRadius: w * 0.06, background: 'linear-gradient(160deg, #2c2f36, #101114)', border: `${Math.max(2, w * 0.02)}px solid #555`, boxShadow: `0 0 ${w * 0.3}px ${T.a}66`, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: '8%', right: '8%', top: '6%', height: '22%', background: '#fff', borderRadius: w * 0.03, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Img src={staticFile('photo-4.png')} style={{ width: '82%' }} />
    </div>
    {Array.from({ length: 5 }).map((_, k) => (
      <div key={k} style={{ position: 'absolute', left: '8%', right: '8%', top: `${34 + k * 12.5}%`, height: '9%', background: '#1c1e23', borderRadius: 3, display: 'flex', alignItems: 'center', gap: '4%', paddingLeft: '5%' }}>
        {Array.from({ length: 4 }).map((__, j) => <div key={j} style={{ width: w * 0.04, height: w * 0.04, borderRadius: '50%', background: (Math.floor(f / 3) + k * 3 + j) % 4 ? '#3dffb0' : '#1a4030', boxShadow: '0 0 6px #3dffb0' }} />)}
      </div>
    ))}
  </div>
);

export const Orbit: React.FC<{ dur: number }> = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const booked = wordAt(4, /^booked$/i, 15) + 2;
  const rocketW = wordAt(4, /^rocket$/i, 45);
  const fly = wordAt(4, /^fly$/i, 67);
  const ai = wordAt(4, /^AI$/i, 82);
  const space = wordAt(4, /^space$/i, 114);
  const yr = wordAt(4, /^twentynine$/i, 158);
  const early = wordAt(4, /^early$/i, 141);

  // --- ground phase ---
  const drop = spring({ frame: f - booked + 8, fps, config: { damping: 20, stiffness: 120 } });
  const load = interpolate(f, [rocketW, rocketW + 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ticket = spring({ frame: f - booked, fps, config: { damping: 20, stiffness: 120 } });
  const [bx, by] = shake(f, booked, 3, 9);
  // --- launch phase ---
  const lift = interpolate(f, [fly, space], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const rumble = f >= fly && f < space ? 0 : 0;
  const [ix, iy] = shake(f, fly, 6, 18);
  const rx = rumble * Math.sin(f * 2.9), ry = rumble * Math.cos(f * 3.7);
  const sky = interpolate(lift, [0, 1], [0, 1]);
  const orbit = f >= space;
  // --- orbit phase ---
  const open = spring({ frame: f - space, fps, config: { damping: 20, stiffness: 120 } });
  const wings = spring({ frame: f - space - 6, fps, config: { damping: 20, stiffness: 90 } });
  const [ox, oy] = shake(f, space, 4, 15);
  const big = spring({ frame: f - yr, fps, config: { damping: 20, stiffness: 120 } });
  const [yx, yy] = shake(f, yr, 4, 12);
  const earlyS = spring({ frame: f - early, fps, config: { damping: 20, stiffness: 100 } });
  const chips = spring({ frame: f - ai, fps, config: { damping: 20, stiffness: 120 } });

  const rocketY = f < fly ? 0 : -lift * 260; // rocket climbs a bit on screen while the world drops away
  const worldY = f < fly ? 0 : interpolate(lift, [0, 1], [0, 2600], clamp);
  const rackX = interpolate(load, [0, 1], [780, 540]), rackY = interpolate(load, [0, 1], [interpolate(drop, [0, 1], [-400, 900]), 400]);
  const rackW = interpolate(load, [0, 1], [190, 80]);

  return (
    <AbsoluteFill style={{ background: orbit ? '#020208' : `linear-gradient(${interpolate(sky, [0, 1], [0, 1]) > 0.5 ? '#04040c' : '#0b1430'}, ${sky > 0.5 ? '#0b0b22' : '#3a1d10'})`, overflow: 'hidden' }}>
      {!orbit && (
        <div style={{ position: 'absolute', inset: -80, translate: `${bx + ix + rx}px ${by + iy + ry}px` }}>
          <div style={{ position: 'absolute', left: 80, top: 80, width: 1080, height: 1920 }}>
            <Stars f={f} speed={lift * 40} n={60 + Math.round(sky * 80)} />
            {/* clouds whipping past */}
            {lift > 0.1 && Array.from({ length: 8 }).map((_, k) => (
              <div key={k} style={{ position: 'absolute', left: rnd(k * 2.7) * 900 - 200, top: ((rnd(k * 5.3) * 2400 + worldY * 1.4) % 2400) - 300, width: 500 + rnd(k) * 300, height: 120, borderRadius: 60,
                background: '#ffffff', opacity: 0.35 * (1 - sky), filter: 'blur(12px)' }} />
            ))}
            {/* ground + pad + tower drop away */}
            <div style={{ position: 'absolute', left: 0, top: worldY, width: 1080, height: 1920 }}>
              <div style={{ position: 'absolute', left: -100, right: -100, top: 1110, height: 900, background: 'linear-gradient(#2a160c, #0c0604)' }} />
              <div style={{ position: 'absolute', left: 380, top: 1095, width: 320, height: 26, background: '#555', borderRadius: 6 }} />
              <div style={{ position: 'absolute', left: 330, top: 300, width: 40, height: 800, background: 'repeating-linear-gradient(45deg, #6b4a32 0 10px, transparent 10px 30px), #2a1a10', border: '4px solid #6b4a32' }} />
            </div>
            {/* exhaust + smoke */}
            {f >= fly && (
              <>
                <div style={{ position: 'absolute', left: 540 - 170, top: 1100 + rocketY - 10, width: 340, height: 900, background: 'radial-gradient(ellipse at 50% 0%, #fff 0%, #ffe08a 12%, #ff8a3d 30%, #ff3d0055 55%, transparent 72%)', filter: 'blur(6px)' }} />
                {Array.from({ length: 18 }).map((_, k) => {
                  const t = f - fly, a = Math.PI * (0.1 + rnd(k) * 0.8), v = 8 + rnd(k * 3) * 14;
                  return <div key={k} style={{ position: 'absolute', left: 540 + Math.cos(a) * v * t * (k % 2 ? 1 : -1) - 120, top: 1080 + worldY + Math.sin(a) * v * t * 0.3 - 80, width: 240 + t * 6, height: 160 + t * 4, borderRadius: '50%', background: '#c9b8a8', opacity: 0.5 * (1 - sky), filter: 'blur(10px)' }} />;
                })}
              </>
            )}
            {/* rocket */}
            <div style={{ position: 'absolute', left: 540 - 70, top: 340 + rocketY, width: 140, height: 760 }}>
              <svg width="140" height="760" viewBox="0 0 140 760" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                <path d="M70 0 C 110 40 128 100 128 170 L128 740 L12 740 L12 170 C12 100 30 40 70 0 Z" fill="#f4efe8" />
                <rect x="12" y="180" width="116" height="10" fill={T.a} />
                <path d="M12 640 L-20 750 L12 740 Z M128 640 L160 750 L128 740 Z" fill="#9a8f84" />
              </svg>
              <div style={{ position: 'absolute', left: 30, top: 260, width: 80, height: 420, writingMode: 'vertical-rl', fontFamily: MONO, fontWeight: 800, fontSize: 52, letterSpacing: '0.18em', color: '#1a1a22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>NEW GLENN</div>
            </div>
            {/* rack: drops onto pad on "booked", gets loaded into the nose on "rocket" */}
            {load < 1 && (
              <div style={{ position: 'absolute', left: rackX - rackW / 2, top: rackY - rackW * 0.6, rotate: `${interpolate(drop, [0, 1], [-20, 0])}deg` }}>
                <Rack w={rackW} f={f} />
              </div>
            )}
            {load >= 1 && f < fly + 4 && <div style={{ position: 'absolute', left: 540 - 50, top: 360 + rocketY, width: 100, height: 100, borderRadius: 50, background: T.a, opacity: interpolate(f, [rocketW + 16, rocketW + 24], [0.9, 0], clamp), filter: 'blur(10px)' }} />}
          </div>
        </div>
      )}
      {orbit && (
        <div style={{ position: 'absolute', inset: 0, translate: `${ox + yx}px ${oy + yy}px` }}>
          <Stars f={f} speed={0.3} />
          <div style={{ position: 'absolute', left: -1460, top: 1350, width: 4000, height: 4000, borderRadius: '50%', background: 'radial-gradient(circle at 50% 4%, #4f8fe0 0%, #1d4f9a 8%, #071a3a 22%)', boxShadow: '0 -30px 140px #6aa0ffaa' }} />
          {/* sun glow */}
          <div style={{ position: 'absolute', left: 760, top: 170, width: 320, height: 320, borderRadius: 160, background: 'radial-gradient(circle, #fff 0%, #ffe08a 25%, transparent 70%)' }} />
          {/* fairing halves flying apart */}
          {[-1, 1].map((d) => (
            <svg key={d} width="160" height="300" viewBox="0 0 80 150" style={{ position: 'absolute', left: 540 - 80 + d * open * 520, top: 380 + open * 120, rotate: `${d * open * 70}deg`, opacity: interpolate(open, [0.7, 1], [1, 0.4], clamp) }}>
              <path d={d < 0 ? 'M80 0 C 30 30 10 70 10 150 L80 150 Z' : 'M0 0 C 50 30 70 70 70 150 L0 150 Z'} fill="#f4efe8" />
            </svg>
          ))}
          {/* satellite: solar wings unfold */}
          <div style={{ position: 'absolute', left: 540, top: 600, width: 0, height: 0, scale: String(interpolate(open, [0, 1], [0.5, 1]) * (1 + (f - space) * 0.002)), rotate: `${interpolate(open, [0, 1], [20, -4])}deg` }}>
            {[-1, 1].map((d) => (
              <div key={d} style={{ position: 'absolute', top: -70, left: d < 0 ? -110 - 430 * wings : 110, width: 430 * wings, height: 140, background: 'repeating-linear-gradient(90deg, #1f3a8a 0 50px, #9fb4ff 50px 54px)', border: '4px solid #c7d2ff', boxShadow: `0 0 40px ${T.a}55` }} />
            ))}
            <div style={{ position: 'absolute', left: -100, top: -125 }}><Rack w={200} f={f} /></div>
          </div>
          {/* 2029 */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 48, letterSpacing: '0.3em', color: '#fff', background: '#000a', padding: '6px 20px', opacity: earlyS, translate: `0 ${(1 - earlyS) * 40}px` }}>TARGET: EARLY</div>
            <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 250, lineHeight: 1, color: '#fff', letterSpacing: '-0.03em', textShadow: `0 0 60px ${T.a}, 0 10px 0 #000`,
              scale: String(Math.max(0.88, interpolate(big, [0, 1], [1.15, 1]))), opacity: interpolate(big, [0, 0.2], [0, 1], clamp) }}>2029</div>
          </div>
        </div>
      )}
      <AbsoluteFill style={{ background: '#fff', opacity: Math.max(interpolate(f, [fly, fly + 5, fly + 28], [0, 0.12, 0], clamp), interpolate(f, [space, space + 5, space + 28], [0, 0.12, 0], clamp)) }} />
      {/* readouts */}
      <div style={{ position: 'absolute', left: 60, top: 190, fontFamily: MONO, fontWeight: 800, fontSize: 34, letterSpacing: '0.16em', color: T.b }}>
        {orbit ? 'PROJECT SUNCATCHER' : f >= fly ? `LIFTOFF · T+${String(Math.floor((f - fly) / 30)).padStart(2, '0')}` : 'GOOGLE × BLUE ORIGIN'}
        <div style={{ fontSize: 28, marginTop: 8, color: '#fff9', fontWeight: 700 }}>PLANNED LAUNCH · EARLY 2029</div>
      </div>
      {!orbit && (
        <div style={{ position: 'absolute', left: 620, top: 300, padding: '10px 26px', border: `8px solid ${T.a}`, borderRadius: 16, background: '#000c', fontFamily: INTER, fontWeight: 900, fontSize: 70, color: '#fff',
          scale: String(interpolate(ticket, [0, 1], [1.15, 1])), opacity: f < fly ? interpolate(ticket, [0, 0.2], [0, 1], clamp) : interpolate(f, [fly, fly + 6], [1, 0], clamp), rotate: `${interpolate(ticket, [0, 1], [-25, 8])}deg` }}>BOOKED</div>
      )}
      {!orbit && f >= ai && (
        <div style={{ position: 'absolute', left: 620, top: 520, fontFamily: INTER, fontWeight: 900, fontSize: 64, lineHeight: 1.05, color: '#fff', textShadow: `0 0 30px ${T.a}, 0 6px 0 #000`,
          scale: String(interpolate(chips, [0, 1], [1.15, 1])), opacity: interpolate(chips, [0, 0.2], [0, 1], clamp) }}>AI CHIPS<br /><span style={{ color: T.a }}>ON BOARD</span></div>
      )}
    </AbsoluteFill>
  );
};
