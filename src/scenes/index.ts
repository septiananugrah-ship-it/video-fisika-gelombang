import type React from 'react';
import {ANC} from './ANC';
import {Bridge} from './Bridge';
import {Equation} from './Equation';
import {Hook} from './Hook';
import {Interference} from './Interference';
import {Kinds} from './Kinds';
import {Light} from './Light';
import {Matter} from './Matter';
import {Music} from './Music';
import {Outro} from './Outro';
import {Quantities} from './Quantities';
import {Recap} from './Recap';
import {Roadmap} from './Roadmap';
import {Sound} from './Sound';
import {Speed} from './Speed';
import {Standing} from './Standing';
import {Title} from './Title';
import {Ultrasound} from './Ultrasound';
import {XRay} from './XRay';

// Pemetaan id adegan di naskah → komponen visual.
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  title: Title,
  roadmap: Roadmap,
  kinds: Kinds,
  quantities: Quantities,
  equation: Equation,
  speed: Speed,
  interference: Interference,
  standing: Standing,
  sound: Sound,
  light: Light,
  xray: XRay,
  matter: Matter,
  bridge: Bridge,
  music: Music,
  ultrasound: Ultrasound,
  anc: ANC,
  recap: Recap,
  outro: Outro,
};
