// TODAY'S SCENES — rewritten every day by the routine (see ROUTINE.md).
// Order: hook first, then the 4 stories. Each scene is a React component receiving { dur } (frames).
import type React from 'react';
import { Hook } from './Hook';
import { Ipo } from './Ipo';
import { Steam } from './Steam';
import { Insta } from './Insta';
import { Orbit } from './Orbit';

export const SCENES: React.FC<{ dur: number }>[] = [Hook, Ipo, Steam, Insta, Orbit];
