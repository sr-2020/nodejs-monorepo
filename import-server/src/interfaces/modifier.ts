import { Predicate } from './predicate';

export interface DeusModifier {
  id?: string;
  _id?: string;
  _rev?: string;
  displayName?: string;
  details?: string;
  class?: string;
  system?: string;
  effects?: any[];
  enabled?: boolean;
  predicates?: Predicate[];
  conditions?: string[];
  mID?: string;
  illnessStages?: Array<{ duration: number, condition: string }>;
  currentStage?: number;
}
