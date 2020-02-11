import { model, property } from '@loopback/repository';
import { EmptyModel, rproperty, JsonColumn } from './alice-model-engine';
import { BaseModelProcessRequest, BaseModelProcessResponse } from './process-requests-respose';
import { Entity, Column } from 'typeorm';

@model()
export class Spell {
  @rproperty() humanReadableName: string;
  @rproperty() description: string;
  @rproperty() eventType: string;
  @rproperty() canTargetSelf: boolean = false;
  @rproperty() canTargetSingleTarget: boolean = false;
  @rproperty() canTargetLocation: boolean = false;
  @rproperty() canTargetItem: boolean = false;
}

@model()
export class ActiveAbility {
  @rproperty() humanReadableName: string;
  @rproperty() description: string;
  @rproperty() eventType: string;
  @rproperty() canTargetSelf: boolean = false;
  @rproperty() canTargetSingleTarget: boolean = false;
}

// Passive ability contained in the model object (as opposed to PassiveAbility which is configuration/dictionary kind).
@model()
export class AddedPassiveAbility {
  // Unique string identifier. Should be unique not only among all AddedPassiveAbility, but also among
  // other features: active abilities, etc.
  @rproperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @rproperty() name: string;

  // Full description. Can be multiline.
  @rproperty() description: string;

  // List of modifiers added by this passive ability. Used to remove them when feature is being removed.
  // Can be omitted if this passive abiliy doesn't have any modifiers (i.e. it's only effect is to
  // show some text to the user).
  @property.array(String) modifierIds?: string[];
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
@Entity({
  name: 'sr2020-character',
})
export class Sr2020Character extends EmptyModel {
  @rproperty()
  @Column()
  maxHp: number;

  @property({ required: true, type: 'string' })
  @Column({ type: 'text' })
  healthState: 'healthy' | 'wounded' | 'clinically_dead' | 'biologically_dead';

  @rproperty()
  @Column()
  magicPowerBonus: number;

  @rproperty()
  @Column()
  magicAura: string;

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
  magic: number;

  @rproperty()
  @Column({ default: 0 })
  resonance: number;

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
  adminHostNumber: number;

  @rproperty()
  @Column({ default: 0 })
  spriteLevel: number;

  @rproperty()
  @Column({ default: 30 })
  maxTimeInVr: number;

  @rproperty()
  @Column({ default: 0 })
  magicFeedbackReduction: number;

  @rproperty()
  @Column({ default: 1.0 })
  magicRecoverySpeed: number;

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
  ethicGroupMaxSize: number;

  @rproperty()
  @Column({ default: 9000 })
  chemoBodyDetectableThreshold: number;

  @rproperty()
  @Column({ default: 9000 })
  chemoPillDetectableThreshold: number;

  @rproperty()
  @Column({ default: 50 })
  chemoBaseEffectThreshold: number;

  @rproperty()
  @Column({ default: 70 })
  chemoSuperEffectThreshold: number;

  @rproperty()
  @Column({ default: 120 })
  chemoCrysisThreshold: number;

  @property.array(Spell, { required: true })
  @JsonColumn()
  spells: Spell[];

  @property.array(ActiveAbility, { required: true })
  @JsonColumn()
  activeAbilities: ActiveAbility[];

  @property.array(AddedPassiveAbility, { required: true })
  @JsonColumn()
  passiveAbilities: AddedPassiveAbility[];

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
