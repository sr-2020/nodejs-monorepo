import { model, property } from '@loopback/repository';
import { BigIntTransformer, EmptyModel, JsonColumn, JsonNullableColumn, rproperty } from '@sr2020/interface/models/alice-model-engine';
import { BaseModelProcessRequest, BaseModelProcessResponse } from '@sr2020/interface/models/process-requests-respose';
import { Column, Entity } from 'typeorm';
import { QrType } from './qr-code.model';

export type HealthState = 'healthy' | 'wounded' | 'clinically_dead' | 'biologically_dead';

export type MetaRace =
  | 'meta-norm'
  | 'meta-elf'
  | 'meta-dwarf'
  | 'meta-ork'
  | 'meta-troll'
  | 'meta-vampire'
  | 'meta-ghoul'
  | 'meta-ai'
  | 'meta-eghost'
  | 'meta-spirit';

export type BodyType = 'physical' | 'astral' | 'drone' | 'ectoplasm';

export type SpellSphere = 'healing' | 'fighting' | 'protection' | 'astral' | 'aura' | 'stats';

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

  @rproperty() hasTarget: boolean;

  @property({ required: true, type: 'string' })
  sphere: SpellSphere;
}

export interface Targetable {
  targetCharacterId: string;
  pillId: string;
  locusId: string;
  qrCodeId: string;
  droneId: string;
  bodyStorageId: string;
}

export interface LocationData {
  id: number;
  manaLevel: number;
}

export interface LocationMixin {
  location: LocationData;
}

@model()
export class TargetSignature {
  // Human-readable name to e.g. show on button
  @rproperty() name: string;
  @property.array(String) allowedTypes: QrType[];
  // Name of field inside data in which client should pass an id of corresponding target
  @property({ required: true, type: 'string' }) field: keyof Targetable;
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
  @property({ required: true, type: 'string' }) target: 'scan' | 'show';

  // True if ability needs a target - other character or object
  @property.array(TargetSignature) targetsSignature: TargetSignature[];

  // Unix timestamp in milliseconds. Set only if ability is temporary
  // (e.g. was added by effect of some other ability or spell)
  @property() validUntil?: number;

  // Normal cooldown in minutes.
  @property() cooldownMinutes: number;

  // Unix timestamp in milliseconds.
  @property() cooldownUntil: number;
}

// Passive ability contained in the model object (as opposed to PassiveAbility which is configuration/dictionary kind).
@model()
export class AddedPassiveAbility {
  // Unique string identifier. Should be unique not only among all AddedPassiveAbility, but also among
  // other features: active abilities, spells, etc.
  @rproperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @rproperty() humanReadableName: string;

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

export interface PackInfo {
  id: string;
  level: number;
}

export type FeatureAvailability = 'open' | 'closed' | 'master';

export interface Feature {
  id: string;
  humanReadableName: string;
  description: string;
  karmaCost: number;
  prerequisites: string[];
  pack?: PackInfo;
  availability: FeatureAvailability;
}

export const kFeatureDescriptor = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    humanReadableName: { type: 'string' },
    description: { type: 'string' },
    availability: { type: 'string' },
    karmaCost: { type: 'number' },
    prerequisites: { type: 'array', items: { type: 'string' } },
    pack: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        level: { type: 'number' },
      },
    },
  },
};

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
  @rproperty() essenceCost: number;

  // List of modifiers added by this implant. Used to remove them when implant is being removed.
  @property.array(String) modifierIds: string[];

  // Various economics crap. Only needed to support implant extraction case
  @rproperty() basePrice: number;
  @rproperty() rentPrice: number;
  @rproperty() gmDescription: string;
  @rproperty() dealId: string;
  @rproperty() lifestyle: string;
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
export class ChemoConsumptionRecord {
  @rproperty() timestamp: number;
  @rproperty() chemoName: string;
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
export class Concentrations {
  @rproperty()
  @Column({ default: 0 })
  teqgel: number;

  @rproperty()
  @Column({ default: 0 })
  iodine: number;

  @rproperty()
  @Column({ default: 0 })
  argon: number;

  @rproperty()
  @Column({ default: 0 })
  radium: number;

  @rproperty()
  @Column({ default: 0 })
  junius: number;

  @rproperty()
  @Column({ default: 0 })
  custodium: number;

  @rproperty()
  @Column({ default: 0 })
  polonium: number;

  @rproperty()
  @Column({ default: 0 })
  silicon: number;

  @rproperty()
  @Column({ default: 0 })
  magnium: number;

  @rproperty()
  @Column({ default: 0 })
  chromium: number;

  @rproperty()
  @Column({ default: 0 })
  opium: number;

  @rproperty()
  @Column({ default: 0 })
  elba: number;

  @rproperty()
  @Column({ default: 0 })
  barium: number;

  @rproperty()
  @Column({ default: 0 })
  uranium: number;

  @rproperty()
  @Column({ default: 0 })
  moscovium: number;

  @rproperty()
  @Column({ default: 0 })
  iconium: number;

  @rproperty()
  @Column({ default: 0 })
  vampirium: number;
}

@model()
export class Chemo {
  @rproperty()
  @Column({ default: 160 })
  baseEffectThreshold: number;

  @rproperty()
  @Column({ default: 220 })
  uberEffectThreshold: number;

  @rproperty()
  @Column({ default: 280 })
  superEffectThreshold: number;

  @rproperty()
  @Column({ default: 340 })
  crysisThreshold: number;

  @rproperty()
  @Column({ default: 280 })
  sensitivity: number; // which concentration can detect when using whats-in-the-body

  @rproperty()
  @Column((type) => Concentrations, { prefix: 'concentration' })
  concentration: Concentrations;
}

@model()
export class MagicStats {
  @rproperty()
  @Column({ default: 1 })
  feedbackMultiplier: number;

  @rproperty()
  @Column({ default: 1.0 })
  recoverySpeedMultiplier: number;

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

  @rproperty()
  @Column({ default: 0 })
  maxPowerBonus: number;
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

  @rproperty()
  @Column({ default: false })
  jackedIn: boolean;
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

  @rproperty()
  @Column({ default: 2 })
  medicraftBonus: number;

  @rproperty()
  @Column({ default: 2 })
  autodocBonus: number;

  @rproperty()
  @Column({ default: 2 })
  aircraftBonus: number;

  @rproperty()
  @Column({ default: 2 })
  groundcraftBonus: number;

  @rproperty()
  @Column({ default: 0 })
  feedbackModifier: number;
}

@model()
export class Rigging {
  @rproperty()
  @Column({ default: 0 })
  implantDifficultyBonus: number;

  @rproperty()
  @Column({ default: false })
  canWorkWithBioware: boolean;

  @rproperty()
  @Column({ default: 2 })
  implantsBonus: number;

  @rproperty()
  @Column({ default: 2 })
  tuningBonus: number;

  @rproperty()
  @Column({ default: 2 })
  repomanBonus: number;
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
export class EssenceDetails {
  @rproperty()
  @Column({ default: 600 })
  max: number;

  @rproperty()
  @Column({ default: 0 })
  used: number;

  @rproperty()
  @Column({ default: 0 })
  gap: number;
}

@model()
export class Karma {
  @rproperty()
  @Column({ default: 0, type: 'real' })
  available: number;

  @rproperty()
  @Column({ default: 0, type: 'real' })
  spent: number;

  @rproperty()
  @Column({ default: 0, type: 'real' })
  spentOnPassives: number;

  @rproperty()
  @Column({ default: 0, type: 'real' })
  cycleLimit: number;
}

@model()
export class Screens {
  @rproperty()
  @Column({ default: true })
  billing: boolean;

  @rproperty()
  @Column({ default: true })
  spellbook: boolean;

  @rproperty()
  @Column({ default: true })
  activeAbilities: boolean;

  @rproperty()
  @Column({ default: true })
  passiveAbilities: boolean;

  @rproperty()
  @Column({ default: true })
  karma: boolean;

  @rproperty()
  @Column({ default: true })
  implants: boolean;

  @rproperty()
  @Column({ default: false })
  autodoc: boolean;

  @rproperty()
  @Column({ default: false })
  autodocWoundHeal: boolean;

  @rproperty()
  @Column({ default: false })
  autodocImplantInstall: boolean;

  @rproperty()
  @Column({ default: false })
  autodocImplantRemoval: boolean;

  @rproperty()
  @Column({ default: false })
  ethics: boolean;

  @rproperty()
  @Column({ default: false })
  location: boolean;

  @rproperty()
  @Column({ default: true })
  wound: boolean;

  @rproperty()
  @Column({ default: true })
  scanQr: boolean;
}

@model()
export class Ethic {
  @property.array(String, { required: true })
  @JsonColumn()
  groups: string[];

  @property.array(AddedEthicState, { required: true })
  @JsonColumn()
  state: AddedEthicState[];

  @property.array(AddedEthicTrigger, { required: true })
  @JsonColumn()
  trigger: AddedEthicTrigger[];

  @rproperty()
  @Column({ default: 0, type: 'bigint', transformer: new BigIntTransformer() })
  lockedUntil: number;
}

@model()
@Entity({
  name: 'sr2020-character',
})
export class Sr2020Character extends EmptyModel {
  @rproperty()
  @Column({ default: '' })
  name: string;

  @rproperty()
  @Column({ type: 'text', default: 'physical' })
  currentBody: BodyType;

  @rproperty()
  @Column()
  maxHp: number;

  @property({ required: true, type: 'string' })
  @Column({ type: 'text', default: 'healthy' })
  healthState: HealthState;

  @property({ required: true, type: 'string' })
  @Column({ type: 'text', default: 'meta-norm' })
  metarace: MetaRace;

  @rproperty()
  @Column({ default: 0 })
  body: number;

  @rproperty()
  @Column({ default: 2 })
  strength: number;

  @rproperty()
  @Column({ default: 2 })
  depth: number;

  @rproperty()
  @Column({ default: 0 })
  intelligence: number;

  @rproperty()
  @Column({ default: 0 })
  charisma: number;

  @rproperty()
  @Column({ default: 0 })
  essence: number;

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
  @Column({ default: 1.0 })
  cooldownCoefficient: number;

  @rproperty()
  @Column({ default: 2 })
  implantsBodySlots: number;

  @rproperty()
  @Column({ default: 0 })
  implantsRemovalResistance: number; // 0 - 100, measured in percents.

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

  @rproperty()
  @Column((type) => Screens, { prefix: 'screens' })
  screens: Screens;

  @property.array(AddedSpell, { required: true })
  @JsonColumn()
  spells: AddedSpell[];

  @property.array(AddedActiveAbility, { required: true })
  @JsonColumn()
  activeAbilities: AddedActiveAbility[];

  @property.array(AddedPassiveAbility, { required: true })
  @JsonColumn()
  passiveAbilities: AddedPassiveAbility[];

  @rproperty()
  @Column((type) => Ethic, { prefix: 'ethic' })
  ethic: Ethic;

  @property.array(AddedImplant, { required: true })
  @JsonColumn()
  implants: AddedImplant[];

  @property.array(ChemoConsumptionRecord, { required: true })
  @JsonColumn()
  chemoConsumptionRecords: ChemoConsumptionRecord[];

  @property({ required: false, jsonSchema: { nullable: true } })
  @JsonNullableColumn()
  analyzedBody: AnalyzedBody | null;

  @rproperty()
  @Column((type) => Rigging, { prefix: 'rigging' })
  rigging: Rigging;

  @rproperty()
  @Column((type) => EssenceDetails, { prefix: 'essence' })
  essenceDetails: EssenceDetails;

  @rproperty()
  @Column((type) => Karma, { prefix: 'karma' })
  karma: Karma;

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

@model()
export class CharacterCreationRequest {
  @property({ required: false })
  name?: string;

  @property({ required: false, type: 'string' })
  metarace?: MetaRace;

  @property.array(String, { required: false })
  features?: string[];

  @property({ required: false })
  karma?: number;
}
