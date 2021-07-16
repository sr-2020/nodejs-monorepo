import {
  ArrayProperty,
  BigIntTransformer,
  BoolProperty,
  EmptyModel,
  JsonColumn,
  JsonNullableColumn,
  NumberProperty,
  ObjectProperty,
  StringProperty,
} from '@alice/alice-common/models/alice-model-engine';
import { BaseModelProcessRequest, BaseModelProcessResponse } from '@alice/alice-common/models/process-requests-respose';
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
  | 'meta-digital'
  | 'meta-spirit';

export type BodyType = 'physical' | 'astral' | 'drone' | 'ectoplasm' | 'vr';

export type SpellSphere = 'healing' | 'fighting' | 'protection' | 'astral' | 'aura' | 'stats';

// Spell contained in the model object (as opposed to Spell which is configuration/dictionary kind).
export class AddedSpell {
  // Unique string identifier. Should be unique not only among all AddedPassiveAbility, but also among
  // other features: active abilities, spells, etc.
  @StringProperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @StringProperty() humanReadableName: string;

  // Full description. Can be multiline.
  @StringProperty() description: string;

  @BoolProperty() hasTarget: boolean;

  @StringProperty()
  sphere: SpellSphere;
}

export interface Targetable {
  targetCharacterId: string;
  pillId: string;
  locusId: string;
  qrCodeId: string;
  droneId: string;
  bodyStorageId: string;
  nodeId: string;
}

export interface LocationData {
  id: number;
  manaLevel: number;
}

export interface LocationMixin {
  location: LocationData;
}

export class TargetSignature {
  // Human-readable name to e.g. show on button
  @StringProperty() name: string;
  @ArrayProperty(String) allowedTypes: QrType[];
  // Name of field inside data in which client should pass an id of corresponding target
  @StringProperty() field: keyof Targetable;
}

// Active ability contained in the model object (as opposed to ActiveAbility which is configuration/dictionary kind).
export class AddedActiveAbility {
  // Unique string identifier. Should be unique not only among all AddedActiveAbility, but also among
  // other features: passive abilities, spells, etc.
  @StringProperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @StringProperty() humanReadableName: string;

  // Full description. Can be multiline.
  @StringProperty() description: string;

  // True if ability needs a target - other character or object
  @StringProperty() target: 'scan' | 'show';

  // True if ability needs a target - other character or object
  @ArrayProperty(TargetSignature) targetsSignature: TargetSignature[];

  // Unix timestamp in milliseconds. Set only if ability is temporary
  // (e.g. was added by effect of some other ability or spell)
  @NumberProperty({ optional: true }) validUntil?: number;

  // Normal cooldown in minutes.
  @NumberProperty() cooldownMinutes: number;

  // Unix timestamp in milliseconds.
  @NumberProperty() cooldownUntil: number;
}

// Passive ability contained in the model object (as opposed to PassiveAbility which is configuration/dictionary kind).
export class AddedPassiveAbility {
  // Unique string identifier. Should be unique not only among all AddedPassiveAbility, but also among
  // other features: active abilities, spells, etc.
  @StringProperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @StringProperty() humanReadableName: string;

  // Full description. Can be multiline.
  @StringProperty() description: string;

  // Unix timestamp in milliseconds. Set only if ability is temporary
  // (e.g. was added by effect of some other ability or spell)
  @NumberProperty({ optional: true }) validUntil?: number;

  // List of modifiers added by this passive ability. Used to remove them when feature is being removed.
  // Can be omitted if this passive abiliy doesn't have any modifiers (i.e. it's only effect is to
  // show some text to the user).
  @ArrayProperty(String, { optional: true }) modifierIds?: string[];
}

export class PackInfo {
  @StringProperty() id: string;
  @NumberProperty() level: number;
}

export type FeatureAvailability = 'open' | 'closed' | 'master';

export class Feature {
  @StringProperty() id: string;
  @StringProperty() humanReadableName: string;
  @StringProperty() description: string;
  @NumberProperty() karmaCost: number;
  @ArrayProperty(String) prerequisites: string[];
  @ObjectProperty(PackInfo, { optional: true }) pack?: PackInfo;
  @StringProperty() availability: FeatureAvailability;
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
export class AddedEthicTrigger {
  @StringProperty() id: string;

  @StringProperty()
  kind: 'action' | 'crysis' | 'principle';

  // Full description. Can be multiline.
  @StringProperty() description: string;
}

export class AddedEthicState {
  @StringProperty()
  scale: 'violence' | 'control' | 'individualism' | 'mind';

  @NumberProperty() value: number;

  // Full description. Can be multiline.
  @StringProperty() description: string;
}

export class AddedImplant {
  @StringProperty() id: string;
  @StringProperty() name: string;
  @StringProperty() description: string;

  @StringProperty()
  slot: 'body' | 'arm' | 'head' | 'rcc';

  @StringProperty()
  grade: 'alpha' | 'beta' | 'gamma' | 'delta' | 'bio';

  @NumberProperty() installDifficulty: number;
  @NumberProperty() essenceCost: number;

  // List of modifiers added by this implant. Used to remove them when implant is being removed.
  @ArrayProperty(String) modifierIds: string[];

  // Various economics crap. Only needed to support implant extraction case
  @NumberProperty() basePrice: number;
  @NumberProperty() rentPrice: number;
  @StringProperty() gmDescription: string;
  @StringProperty() dealId: string;
  @StringProperty() lifestyle: string;
}

export class HistoryRecord {
  @StringProperty() id: string;
  @NumberProperty() timestamp: number;
  @StringProperty() title: string;
  @StringProperty() shortText: string;
  @StringProperty() longText: string;
}

export class ChemoConsumptionRecord {
  @NumberProperty() timestamp: number;
  @StringProperty() chemoName: string;
}

export class AnalyzedBody {
  @StringProperty() healthState: HealthState;
  @NumberProperty() essence: number;

  @ArrayProperty(AddedImplant)
  @JsonColumn()
  implants: AddedImplant[];
}

export class Discounts {
  @NumberProperty()
  @Column({ default: 1.0, type: 'real' })
  weaponsArmor: number;

  @NumberProperty()
  @Column({ default: 1.0, type: 'real' })
  everything: number;
}

export class Concentrations {
  @NumberProperty()
  @Column({ default: 0 })
  teqgel: number;

  @NumberProperty()
  @Column({ default: 0 })
  iodine: number;

  @NumberProperty()
  @Column({ default: 0 })
  argon: number;

  @NumberProperty()
  @Column({ default: 0 })
  radium: number;

  @NumberProperty()
  @Column({ default: 0 })
  junius: number;

  @NumberProperty()
  @Column({ default: 0 })
  custodium: number;

  @NumberProperty()
  @Column({ default: 0 })
  polonium: number;

  @NumberProperty()
  @Column({ default: 0 })
  silicon: number;

  @NumberProperty()
  @Column({ default: 0 })
  magnium: number;

  @NumberProperty()
  @Column({ default: 0 })
  chromium: number;

  @NumberProperty()
  @Column({ default: 0 })
  opium: number;

  @NumberProperty()
  @Column({ default: 0 })
  elba: number;

  @NumberProperty()
  @Column({ default: 0 })
  barium: number;

  @NumberProperty()
  @Column({ default: 0 })
  uranium: number;

  @NumberProperty()
  @Column({ default: 0 })
  moscovium: number;

  @NumberProperty()
  @Column({ default: 0 })
  iconium: number;

  @NumberProperty()
  @Column({ default: 0 })
  vampirium: number;
}

export class Chemo {
  @NumberProperty()
  @Column({ default: 160 })
  baseEffectThreshold: number;

  @NumberProperty()
  @Column({ default: 220 })
  uberEffectThreshold: number;

  @NumberProperty()
  @Column({ default: 280 })
  superEffectThreshold: number;

  @NumberProperty()
  @Column({ default: 340 })
  crysisThreshold: number;

  @NumberProperty()
  @Column({ default: 280 })
  sensitivity: number; // which concentration can detect when using whats-in-the-body

  @ObjectProperty(Concentrations)
  @Column((type) => Concentrations, { prefix: 'concentration' })
  concentration: Concentrations;
}

export class MagicStats {
  @NumberProperty()
  @Column({ default: 1.0, type: 'real' })
  feedbackMultiplier: number;

  @NumberProperty()
  @Column({ default: 1.0, type: 'real' })
  recoverySpeedMultiplier: number;

  @NumberProperty()
  @Column({ default: 1.0, type: 'real' })
  spiritResistanceMultiplier: number;

  @NumberProperty()
  @Column({ default: 1.0, type: 'real' })
  auraReadingMultiplier: number;

  @NumberProperty()
  @Column({ default: 1.0, type: 'real' })
  auraMarkMultiplier: number;

  @NumberProperty()
  @Column({ default: 0 })
  auraMask: number;

  @StringProperty()
  @Column()
  aura: string;

  @NumberProperty()
  @Column({ default: 0 })
  maxPowerBonus: number;

  @NumberProperty()
  @Column({ default: 1 })
  victimCoefficient: number;

  @NumberProperty()
  @Column({ default: 1 })
  participantCoefficient: number;
}

export class Hacking {
  @NumberProperty()
  @Column({ default: 0 })
  maxTimeAtHost: number;

  @NumberProperty()
  @Column({ default: 0 })
  hostEntrySpeed: number;

  @NumberProperty()
  @Column({ default: 0 })
  conversionAttack: number;

  @NumberProperty()
  @Column({ default: 0 })
  conversionFirewall: number;

  @NumberProperty()
  @Column({ default: 0 })
  conversionSleaze: number;

  @NumberProperty()
  @Column({ default: 0 })
  conversionDataprocessing: number;

  @NumberProperty()
  @Column({ default: 0.0, type: 'real' })
  fadingResistance: number;

  @NumberProperty()
  @Column({ default: 0 })
  biofeedbackResistance: number;

  @NumberProperty()
  @Column({ default: 0 })
  adminHostNumber: number;

  @NumberProperty()
  @Column({ default: 0 })
  spriteLevel: number;

  @NumberProperty()
  @Column({ default: 0 })
  resonanceForControlBonus: number;

  @NumberProperty()
  @Column({ default: 0 })
  varianceResistance: number;

  @NumberProperty()
  @Column({ default: 0 })
  compilationFadingResistance: number;

  @NumberProperty()
  @Column({ default: 0 })
  additionalRequests: number;

  @NumberProperty()
  @Column({ default: 0 })
  additionalSprites: number;

  @NumberProperty()
  @Column({ default: 0 })
  additionalBackdoors: number;

  @NumberProperty()
  @Column({ default: 0 })
  backdoorTtl: number;

  @BoolProperty()
  @Column({ default: false })
  jackedIn: boolean;

  @NumberProperty()
  @Column({ default: 0 })
  fading: number;

  @NumberProperty()
  @Column({ default: 0 })
  fadingDecrease: number;
}

export class Drones {
  @NumberProperty()
  @Column({ default: -1000 })
  maxDifficulty: number;

  @NumberProperty()
  @Column({ default: 60 })
  maxTimeInside: number;

  @NumberProperty()
  @Column({ default: 50 })
  recoveryTime: number;

  @NumberProperty()
  @Column({ default: 2 })
  medicraftBonus: number;

  @NumberProperty()
  @Column({ default: 2 })
  autodocBonus: number;

  @NumberProperty()
  @Column({ default: 2 })
  aircraftBonus: number;

  @NumberProperty()
  @Column({ default: 2 })
  groundcraftBonus: number;

  @NumberProperty()
  @Column({ default: 0 })
  feedbackModifier: number;

  @NumberProperty()
  @Column({ default: 0 })
  recoverySkill: number;
}

export class Rigging {
  @BoolProperty()
  @Column({ default: false })
  canWorkWithBioware: boolean;

  @NumberProperty()
  @Column({ default: 2 })
  implantsBonus: number;

  @NumberProperty()
  @Column({ default: 2 })
  tuningBonus: number;

  @NumberProperty()
  @Column({ default: 2 })
  repomanBonus: number;
}

export class Billing {
  @BoolProperty()
  @Column({ default: false })
  anonymous: boolean;

  @NumberProperty()
  @Column({ default: 0 })
  stockGainPercentage: number;
}

export class EssenceDetails {
  @NumberProperty()
  @Column({ default: 600 })
  max: number;

  @NumberProperty()
  @Column({ default: 0 })
  used: number;

  @NumberProperty()
  @Column({ default: 0 })
  gap: number;
}

export class Karma {
  @NumberProperty()
  @Column({ default: 0, type: 'numeric', precision: 8, scale: 2 })
  available: number;

  @NumberProperty()
  @Column({ default: 0, type: 'numeric', precision: 8, scale: 2 })
  spent: number;

  @NumberProperty()
  @Column({ default: 0, type: 'numeric', precision: 8, scale: 2 })
  spentOnPassives: number;

  @NumberProperty()
  @Column({ default: 0, type: 'numeric', precision: 8, scale: 2 })
  cycleLimit: number;
}

export class Screens {
  @BoolProperty()
  @Column({ default: true })
  billing: boolean;

  @BoolProperty()
  @Column({ default: true })
  spellbook: boolean;

  @BoolProperty()
  @Column({ default: true })
  activeAbilities: boolean;

  @BoolProperty()
  @Column({ default: true })
  passiveAbilities: boolean;

  @BoolProperty()
  @Column({ default: true })
  karma: boolean;

  @BoolProperty()
  @Column({ default: true })
  implants: boolean;

  @BoolProperty()
  @Column({ default: false })
  autodoc: boolean;

  @BoolProperty()
  @Column({ default: false })
  autodocWoundHeal: boolean;

  @BoolProperty()
  @Column({ default: false })
  autodocImplantInstall: boolean;

  @BoolProperty()
  @Column({ default: false })
  autodocImplantRemoval: boolean;

  @BoolProperty()
  @Column({ default: false })
  ethics: boolean;

  @BoolProperty()
  @Column({ default: false })
  location: boolean;

  @BoolProperty()
  @Column({ default: true })
  wound: boolean;

  @BoolProperty()
  @Column({ default: true })
  scanQr: boolean;

  @BoolProperty()
  @Column({ default: false })
  scoring: boolean;
}

export class Ethic {
  @ArrayProperty(String)
  @JsonColumn()
  groups: string[];

  @ArrayProperty(AddedEthicState)
  @JsonColumn()
  state: AddedEthicState[];

  @ArrayProperty(AddedEthicTrigger)
  @JsonColumn()
  trigger: AddedEthicTrigger[];

  @NumberProperty()
  @Column({ default: 0, type: 'bigint', transformer: new BigIntTransformer() })
  lockedUntil: number;
}

@Entity({
  name: 'sr2020-character',
})
export class Sr2020Character extends EmptyModel {
  @StringProperty()
  @Column({ default: '' })
  name: string;

  @StringProperty()
  @Column({ type: 'text', default: 'physical' })
  currentBody: BodyType;

  @NumberProperty()
  @Column()
  maxHp: number;

  @StringProperty()
  @Column({ type: 'text', default: 'healthy' })
  healthState: HealthState;

  @StringProperty()
  @Column({ type: 'text', default: 'meta-norm' })
  metarace: MetaRace;

  @NumberProperty()
  @Column({ default: 0 })
  body: number;

  @NumberProperty()
  @Column({ default: 2 })
  strength: number;

  @NumberProperty()
  @Column({ default: 2 })
  depth: number;

  @NumberProperty()
  @Column({ default: 1 })
  intelligence: number;

  @NumberProperty()
  @Column({ default: 0 })
  charisma: number;

  @NumberProperty()
  @Column({ default: 0 })
  essence: number;

  @NumberProperty()
  @Column({ default: 0 })
  mentalAttackBonus: number;

  @NumberProperty()
  @Column({ default: 0 })
  mentalDefenceBonus: number;

  @NumberProperty()
  @Column({ default: 0 })
  mentalQrId: number;

  @NumberProperty()
  @Column({ default: 0 })
  magic: number;

  @NumberProperty()
  @Column({ default: 0 })
  resonance: number;

  @NumberProperty()
  @Column({ default: 1 })
  matrixHp: number;

  @NumberProperty()
  @Column({ default: 30 })
  maxTimeInVr: number;

  @NumberProperty()
  @Column({ default: 1.0, type: 'real' })
  cooldownCoefficient: number;

  @NumberProperty()
  @Column({ default: 1 })
  victimCoefficient: number;

  @NumberProperty()
  @Column({ default: 1 })
  participantCoefficient: number;

  @NumberProperty()
  @Column({ default: 2 })
  implantsBodySlots: number;

  @NumberProperty()
  @Column({ default: 0 })
  implantsRemovalResistance: number; // 0 - 100, measured in percents.

  @ObjectProperty(MagicStats)
  @Column((type) => MagicStats, { prefix: 'magic' })
  magicStats: MagicStats;

  @ObjectProperty(Hacking)
  @Column((type) => Hacking, { prefix: 'hacking' })
  hacking: Hacking;

  @ObjectProperty(Drones)
  @Column((type) => Drones, { prefix: 'drones' })
  drones: Drones;

  @ObjectProperty(Chemo)
  @Column((type) => Chemo, { prefix: 'chemo' })
  chemo: Chemo;

  @ObjectProperty(Billing)
  @Column((type) => Billing, { prefix: 'billing' })
  billing: Billing;

  @ObjectProperty(Discounts)
  @Column((type) => Discounts, { prefix: 'discounts' })
  discounts: Discounts;

  @ObjectProperty(Screens)
  @Column((type) => Screens, { prefix: 'screens' })
  screens: Screens;

  @ArrayProperty(AddedSpell)
  @JsonColumn()
  spells: AddedSpell[];

  @ArrayProperty(AddedActiveAbility)
  @JsonColumn()
  activeAbilities: AddedActiveAbility[];

  @ArrayProperty(AddedPassiveAbility)
  @JsonColumn()
  passiveAbilities: AddedPassiveAbility[];

  @ObjectProperty(Ethic)
  @Column((type) => Ethic, { prefix: 'ethic' })
  ethic: Ethic;

  @ArrayProperty(AddedImplant)
  @JsonColumn()
  implants: AddedImplant[];

  @ArrayProperty(ChemoConsumptionRecord)
  @JsonColumn()
  chemoConsumptionRecords: ChemoConsumptionRecord[];

  @ObjectProperty(AnalyzedBody, { optional: true })
  @JsonNullableColumn()
  analyzedBody?: AnalyzedBody;

  @ObjectProperty(Rigging)
  @Column((type) => Rigging, { prefix: 'rigging' })
  rigging: Rigging;

  @ObjectProperty(EssenceDetails)
  @Column((type) => EssenceDetails, { prefix: 'essence' })
  essenceDetails: EssenceDetails;

  @ObjectProperty(Karma)
  @Column((type) => Karma, { prefix: 'karma' })
  karma: Karma;

  @ArrayProperty(HistoryRecord)
  @JsonColumn()
  history: HistoryRecord[];
}

export class Sr2020CharacterProcessRequest extends BaseModelProcessRequest {
  @ObjectProperty(Sr2020Character)
  baseModel: Sr2020Character;
}

export class Sr2020CharacterProcessResponse extends BaseModelProcessResponse {
  @ObjectProperty(Sr2020Character)
  baseModel: Sr2020Character;

  @ObjectProperty(Sr2020Character)
  workModel: Sr2020Character;
}

export class CharacterCreationRequest {
  @StringProperty({ optional: true })
  name?: string;

  @StringProperty({ optional: true })
  metarace?: MetaRace;

  @ArrayProperty(String, { optional: true })
  features?: string[];

  @NumberProperty({ optional: true })
  karma?: number;
}
