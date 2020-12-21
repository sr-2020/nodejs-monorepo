import {
  AddedActiveAbility,
  Concentrations,
  Feature,
  LocationMixin,
  SpellSphere,
  Targetable,
  TargetSignature,
} from '@alice/sr2020-common/models/sr2020-character.model';
import { Modifier } from '@alice/alice-common/models/alice-model-engine';

export type ActiveAbilityData = Partial<Targetable> &
  LocationMixin & {
    id: string; // corresponds to ActiveAbility.id and AddedActiveAbility.id
  };

export type FullActiveAbilityData = ActiveAbilityData & AddedActiveAbility;

export type FullTargetedAbilityData = FullActiveAbilityData & { targetCharacterId: string };

export type TargetType = 'scan' | 'show';
export interface ActiveAbility extends Feature {
  target: TargetType;
  targetsSignature: TargetSignature[];
  cooldownMinutes: number;
  minimalEssence: number; // in 0-6 range, not 0-600.
  eventType: string;
}

export interface PassiveAbility extends Feature {
  modifier: Modifier | Modifier[];
}

export interface Spell extends Feature {
  sphere: SpellSphere;
  eventType: string;
  hasTarget?: boolean;
}

export interface Addiction extends Modifier {
  stage: number;
  amount: -1;
  element: keyof Concentrations;
}

export type ImplantSlot = 'body' | 'arm' | 'head' | 'rcc';
export type ImplantGrade = 'alpha' | 'beta' | 'gamma' | 'delta' | 'bio';

export interface Implant {
  id: string;
  name: string;
  description: string;
  slot: ImplantSlot;
  grade: ImplantGrade;
  essenceCost: number;
  installDifficulty: number;
  modifiers: Modifier[];
  onInstallEvent?: string;
  onRemoveEvent?: string;
}
