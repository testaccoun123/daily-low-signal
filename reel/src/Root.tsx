import React from 'react';
import { Composition } from 'remotion';
import { Reel } from './Reel';
import { ClipReel, ClipProps } from './clip/ClipReel';
import { TL } from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={TL.total} fps={30} width={1080} height={1920} />
    <Composition id="Clip" component={ClipReel} fps={30} width={1080} height={1920} durationInFrames={900}
      defaultProps={{ hook: 'xQc after 24 hours of GTA 6:', label: 'xQc · GTA 6', accent: '#ff4fa3', frames: 900 } as ClipProps}
      calculateMetadata={({ props }) => ({ durationInFrames: props.frames })} />
  </>
);
