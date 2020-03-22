import { Modifier } from '@sr2020/interface/models/alice-model-engine';

export interface Implant {
  id: string;
  name: string;
  description: string;
  slot: 'body' | 'arm' | 'biomonitor' | 'head' | 'rcc' | 'commlink';
  grade: 'alpha' | 'beta' | 'gamma' | 'delta' | 'bio';
  essenceCost: number;
  installDifficulty: number;
  modifiers: Modifier[];
}
