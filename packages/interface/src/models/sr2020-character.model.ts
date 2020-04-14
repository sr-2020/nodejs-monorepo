import { model, property } from '@loopback/repository';
import { EmptyModel, rproperty, JsonColumn, BigIntTransformer, JsonNullableColumn } from './alice-model-engine';
import { BaseModelProcessRequest, BaseModelProcessResponse } from './process-requests-respose';
import { Entity, Column } from 'typeorm';

export type HealthState = 'healthy' | 'wounded' | 'clinically_dead' | 'biologically_dead';

// Spell contained in the model object (as opposed to Spell which is configuration/dictionary kind).
@model()
export class AddedSpell {
  // Unique string identifier. Should be unique not only among all AddedPassiveAbility, but also among
  // other features: active abilities, spells, etc.
  @rproperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @rproperty() humanReadableName: string;

  // Full description. Can be multiline.
  @rproperty() description: string;
  @rproperty() eventType: string;

  @rproperty() hasTarget: boolean;
}

// Active ability contained in the model object (as opposed to ActiveAbility which is configuration/dictionary kind).
@model()
export class AddedActiveAbility {
  // Unique string identifier. Should be unique not only among all AddedActiveAbility, but also among
  // other features: passive abilities, spells, etc.
  @rproperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @rproperty() humanReadableName: string;

  // Full description. Can be multiline.
  @rproperty() description: string;

  // True if ability needs a target - other character or object
  @property({ required: true, type: 'string' }) target: 'none' | 'scan' | 'show';

  // Unix timestamp in milliseconds. Set only if ability is temporary
  // (e.g. was added by effect of some other ability or spell)
  @property() validUntil?: number;

  // Normal cooldown in minutes.
  @property() cooldownMinutes: number;

  // Unix timestamp in milliseconds.
  @property() cooldownUntil: number;

  @rproperty() eventType: string;
}

// Passive ability contained in the model object (as opposed to PassiveAbility which is configuration/dictionary kind).
@model()
export class AddedPassiveAbility {
  // Unique string identifier. Should be unique not only among all AddedPassiveAbility, but also among
  // other features: active abilities, spells, etc.
  @rproperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @rproperty() name: string;

  // Full description. Can be multiline.
  @rproperty() description: string;

  // Unix timestamp in milliseconds. Set only if ability is temporary
  // (e.g. was added by effect of some other ability or spell)
  @property() validUntil?: number;

  // List of modifiers added by this passive ability. Used to remove them when feature is being removed.
  // Can be omitted if this passive abiliy doesn't have any modifiers (i.e. it's only effect is to
  // show some text to the user).
  @property.array(String) modifierIds?: string[];
}

// Ethic trigger contained in the model object (as opposed to EthicTrigger which is configuration/dictionary kind).
@model()
export class AddedEthicTrigger {
  @rproperty() id: string;

  @property({ required: true, type: 'string' })
  kind: 'action' | 'crysis' | 'principle';

  // Full description. Can be multiline.
  @rproperty() description: string;
}

@model()
export class AddedEthicState {
  @property({ required: true, type: 'string' })
  scale: 'violence' | 'control' | 'individualism' | 'mind';

  @rproperty() value: number;

  // Full description. Can be multiline.
  @rproperty() description: string;
}

@model()
export class AddedImplant {
  @rproperty() id: string;
  @rproperty() name: string;
  @rproperty() description: string;

  @property({ required: true, type: 'string' })
  slot: 'body' | 'arm' | 'head' | 'rcc';

  @property({ required: true, type: 'string' })
  grade: 'alpha' | 'beta' | 'gamma' | 'delta' | 'bio';

  @rproperty() installDifficulty: number;

  // List of modifiers added by this implant. Used to remove them when implant is being removed.
  @property.array(String) modifierIds: string[];
}

@model()
export class HistoryRecord {
  @rproperty() id: string;
  @rproperty() timestamp: number;
  @rproperty() title: string;
  @rproperty() shortText: string;
  @rproperty() longText: string;
}

@model()
export class AnalyzedBody {
  @rproperty() healthState: HealthState;
  @rproperty() essence: number;

  @property.array(AddedImplant, { required: true })
  @JsonColumn()
  implants: AddedImplant[];
}

@model()
export class Discounts {
  @rproperty()
  @Column({ default: 1 })
  weaponsArmor: number;

  @rproperty()
  @Column({ default: 1 })
  everything: number;

  @rproperty()
  @Column({ default: 1 })
  ares: number;

  @rproperty()
  @Column({ default: 1 })
  aztechnology: number;

  @rproperty()
  @Column({ default: 1 })
  saederKrupp: number;

  @rproperty()
  @Column({ default: 1 })
  spinradGlobal: number;

  @rproperty()
  @Column({ default: 1 })
  neonet1: number;

  @rproperty()
  @Column({ default: 1 })
  evo: number;

  @rproperty()
  @Column({ default: 1 })
  horizon: number;

  @rproperty()
  @Column({ default: 1 })
  wuxing: number;

  @rproperty()
  @Column({ default: 1 })
  russia: number;

  @rproperty()
  @Column({ default: 1 })
  renraku: number;

  @rproperty()
  @Column({ default: 1 })
  mutsuhama: number;

  @rproperty()
  @Column({ default: 1 })
  shiavase: number;
}

@model()
export class Chemo {
  @rproperty()
  @Column({ default: 50 })
  baseEffectThreshold: number;

  @rproperty()
  @Column({ default: 70 })
  superEffectThreshold: number;

  @rproperty()
  @Column({ default: 120 })
  crysisThreshold: number;
}

@model()
export class MagicStats {
  @rproperty()
  @Column({ default: 0 })
  feedbackReduction: number;

  @rproperty()
  @Column({ default: 1.0 })
  recoverySpeed: number;

  @rproperty()
  @Column({ default: 1.0 })
  spiritResistanceMultiplier: number;

  @rproperty()
  @Column({ default: 1.0 })
  auraReadingMultiplier: number;

  @rproperty()
  @Column({ default: 1.0 })
  auraMarkMultiplier: number;

  @rproperty()
  @Column({ default: 0 })
  auraMask: number;

  @rproperty()
  @Column()
  aura: string;
}

@model()
export class Hacking {
  @rproperty()
  @Column({ default: 0 })
  maxTimeAtHost: number;

  @rproperty()
  @Column({ default: 0 })
  hostEntrySpeed: number;

  @rproperty()
  @Column({ default: 0 })
  conversionAttack: number;

  @rproperty()
  @Column({ default: 0 })
  conversionFirewall: number;

  @rproperty()
  @Column({ default: 0 })
  conversionSleaze: number;

  @rproperty()
  @Column({ default: 0 })
  conversionDataprocessing: number;

  @rproperty()
  @Column({ default: 0 })
  fadingResistance: number;

  @rproperty()
  @Column({ default: 0 })
  biofeedbackResistance: number;

  @rproperty()
  @Column({ default: 0 })
  adminHostNumber: number;

  @rproperty()
  @Column({ default: 0 })
  spriteLevel: number;

  @rproperty()
  @Column({ default: 0 })
  resonanceForControlBonus: number;

  @rproperty()
  @Column({ default: 0 })
  varianceResistance: number;

  @rproperty()
  @Column({ default: 0 })
  compilationFadingResistance: number;

  @rproperty()
  @Column({ default: 0 })
  additionalRequests: number;

  @rproperty()
  @Column({ default: 0 })
  additionalSprites: number;

  @rproperty()
  @Column({ default: 0 })
  additionalBackdoors: number;

  @rproperty()
  @Column({ default: 0 })
  backdoorTtl: number;
}

@model()
export class Drones {
  @rproperty()
  @Column({ default: -1000 })
  maxDifficulty: number;

  @rproperty()
  @Column({ default: 60 })
  maxTimeInside: number;

  @rproperty()
  @Column({ default: 50 })
  recoveryTime: number;
}

@model()
export class Rigging {
  @rproperty()
  @Column({ default: 0 })
  implantDifficultyBonus: number;

  @rproperty()
  @Column({ default: false })
  canWorkWithBioware: boolean;
}

@model()
export class Billing {
  @rproperty()
  @Column({ default: false })
  anonymous: boolean;

  @rproperty()
  @Column({ default: 0 })
  stockGainPercentage: number;
}

@model()
@Entity({
  name: 'sr2020-character',
})
export class Sr2020Character extends EmptyModel {
  @rproperty()
  @Column()
  maxHp: number;

  @property({ required: true, type: 'string' })
  @Column({ type: 'text', default: 'healthy' })
  healthState: HealthState;

  @property({ required: true, type: 'string' })
  @Column({ type: 'text', default: 'meta-norm' })
  metarace: 'meta-norm' | 'meta-elf' | 'meta-dwarf' | 'meta-ork' | 'meta-troll' | 'meta-hmhvv' | 'meta-digital' | 'meta-spirit';

  @rproperty()
  @Column({ default: 0 })
  body: number;

  @rproperty()
  @Column({ default: 0 })
  intelligence: number;

  @rproperty()
  @Column({ default: 0 })
  charisma: number;

  @rproperty()
  @Column({ default: 0 })
  mentalAttackBonus: number;

  @rproperty()
  @Column({ default: 0 })
  mentalDefenceBonus: number;

  @rproperty()
  @Column({ default: 0 })
  mentalQrId: number;

  @rproperty()
  @Column({ default: 0 })
  magic: number;

  @rproperty()
  @Column({ default: 0 })
  resonance: number;

  @rproperty()
  @Column({ default: 1 })
  matrixHp: number;

  @rproperty()
  @Column({ default: 30 })
  maxTimeInVr: number;

  @rproperty()
  @Column((type) => MagicStats, { prefix: 'magic' })
  magicStats: MagicStats;

  @rproperty()
  @Column((type) => Hacking, { prefix: 'hacking' })
  hacking: Hacking;

  @rproperty()
  @Column((type) => Drones, { prefix: 'drones' })
  drones: Drones;

  @rproperty()
  @Column((type) => Chemo, { prefix: 'chemo' })
  chemo: Chemo;

  @rproperty()
  @Column((type) => Billing, { prefix: 'billing' })
  billing: Billing;

  @rproperty()
  @Column((type) => Discounts, { prefix: 'discounts' })
  discounts: Discounts;

  @property.array(AddedSpell, { required: true })
  @JsonColumn()
  spells: AddedSpell[];

  @property.array(AddedActiveAbility, { required: true })
  @JsonColumn()
  activeAbilities: AddedActiveAbility[];

  @property.array(AddedPassiveAbility, { required: true })
  @JsonColumn()
  passiveAbilities: AddedPassiveAbility[];

  @property.array(AddedEthicState, { required: true })
  @JsonColumn()
  ethicState: AddedEthicState[];

  @property.array(AddedEthicTrigger, { required: true })
  @JsonColumn()
  ethicTrigger: AddedEthicTrigger[];

  @property.array(AddedImplant, { required: true })
  @JsonColumn()
  implants: AddedImplant[];

  @property(AnalyzedBody)
  @JsonNullableColumn()
  analyzedBody?: AnalyzedBody;

  @rproperty()
  @Column((type) => Rigging, { prefix: 'rigging' })
  rigging: Rigging;

  @rproperty()
  @Column({ default: 0, type: 'bigint', transformer: new BigIntTransformer() })
  ethicLockedUntil: number;

  @property.array(HistoryRecord, { required: true })
  @JsonColumn()
  history: HistoryRecord[];
}

@model()
export class Sr2020CharacterProcessRequest extends BaseModelProcessRequest {
  @rproperty()
  baseModel: Sr2020Character;
}

@model()
export class Sr2020CharacterProcessResponse extends BaseModelProcessResponse {
  @rproperty()
  baseModel: Sr2020Character;

  @rproperty()
  workModel: Sr2020Character;
}
