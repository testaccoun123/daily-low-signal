import React from 'react';
import { Composition } from 'remotion';
import { Reel } from './Reel';
import { TL } from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="Reel" component={Reel} durationInFrames={TL.total} fps={30} width={1080} height={1920} />
);
