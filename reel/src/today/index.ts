// TODAY'S SCENES — rewritten every day by the routine (see ROUTINE.md).
// Order: hook first, then the 4 stories. Each scene is a React component receiving { dur } (frames).
import type React from 'react';
import { Hook } from './Hook';
import { Gta } from './Gta';
import { Google } from './Google';
import { Robot } from './Robot';
import { Hubble } from './Hubble';

export const SCENES: React.FC<{ dur: number }>[] = [Hook, Gta, Google, Robot, Hubble];
