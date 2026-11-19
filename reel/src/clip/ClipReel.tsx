// Streamer clip reel: the clip (already 9:16, trimmed, H.264 in public/clip.mp4) with an animated hook
// banner at the top for the first seconds, then a small persistent label, brand line and progress bar.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { INTER, MONO, clamp } from '../theme';

export type ClipProps = { hook: string; label: string; accent: string; frames: number };

export const ClipReel: React.FC<ClipProps> = ({ hook, label, accent }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const words = hook.split(/\s+/);
  const HOLD = Math.round(2.8 * fps); // big hook on screen, then it shrinks into the label
  const out = interpolate(f, [HOLD, HOLD + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const punch = interpolate(f, [0, 8], [1.08, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const lbl = spring({ frame: f - HOLD - 6, fps, config: { damping: 14, stiffness: 180 } });
  const flash = interpolate(f, [0, 1, 6], [0.8, 0.8, 0], clamp);

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ scale: String(punch) }}>
        <OffthreadVideo src={staticFile('clip.mp4')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />

      {/* top shade so text and brand read on any footage */}
      <AbsoluteFill style={{ background: 'linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0) 22%)' }} />

      {/* big hook (first ~3 s) */}
      {out < 1 && (
        <div style={{ position: 'absolute', left: 50, right: 50, top: 190, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px',
          fontFamily: INTER, fontWeight: 900, fontSize: 92, lineHeight: 1.04, textTransform: 'uppercase', textAlign: 'center',
          opacity: 1 - out, translate: `0 ${-out * 120}px`, scale: String(1 - out * 0.3) }}>
          {words.map((w, k) => {
            const s = spring({ frame: f - 3 - k * 3, fps, config: { damping: 11, stiffness: 220 } });
            const hot = /[!?:]$|\d/.test(w) || k === words.length - 1;
            return (
              <span key={k} style={{ display: 'inline-block', color: hot ? accent : '#fff', opacity: s,
                scale: String(interpolate(s, [0, 1], [1.8, 1])), rotate: `${interpolate(s, [0, 1], [k % 2 ? 8 : -8, 0])}deg`,
                WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 8px 0 #000' }}>{w}</span>
            );
          })}
        </div>
      )}

      {/* small persistent label after the hook */}
      {f > HOLD && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', opacity: lbl, translate: `0 ${(1 - lbl) * -40}px` }}>
          <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 46, color: '#000', background: accent, padding: '10px 26px', borderRadius: 14,
            textTransform: 'uppercase', boxShadow: `0 0 30px ${accent}88`, maxWidth: 940, textAlign: 'center' }}>{label}</div>
        </div>
      )}

      {/* brand + progress */}
      <div style={{ position: 'absolute', left: 40, right: 40, top: 54, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
        <div style={{ width: `${(f / durationInFrames) * 100}%`, height: '100%', background: accent }} />
      </div>
      <div style={{ position: 'absolute', left: 44, top: 82, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 800, fontSize: 26,
        letterSpacing: '0.28em', color: 'rgba(255,255,255,0.9)', textShadow: '0 2px 8px #000' }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: accent }} />DAILY LOW SIGNAL
      </div>
    </AbsoluteFill>
  );
};
