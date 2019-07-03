import { Effect } from '@sr2020/interface/models/alice-model-engine';

export interface Predicate {
  variable: string;
  value: any;
  effect: string;
  params: any;
}

export interface Implant {
  mID?: string;
  id: string;
  displayName: string;
  class: string;
  system: string;
  effects: any[];
  enabled?: boolean;
  predicates?: Predicate[];
}

export interface IllnessStage {
  duration: number; // In seconds
  condition: string;
}

export interface Illness {
  mID?: string;
  id: string;
  displayName: string;
  class: string;
  system: string;
  currentStage: number;
  illnessStages: IllnessStage[];
  effects?: Effect[];
  enabled?: boolean;
  startTime?: number;
}

export interface Narcotic {
  id: string;
  pillType: string;
  duration: number; // seconds
  conditions?: string[];
  mindCubeTemp?: string;
}
