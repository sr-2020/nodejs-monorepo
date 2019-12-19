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

@model()
export class PassiveAbility {
  @rproperty() humanReadableName: string;
  @rproperty() description: string;
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
export class AddedFeature {
  @rproperty() id: string;
  @rproperty() name: string;
  @rproperty() description: string;
  @property.array(String, { required: true }) modifierIds: string[];
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

  @property.array(Spell, { required: true })
  @JsonColumn()
  spells: Spell[];

  @property.array(ActiveAbility, { required: true })
  @JsonColumn()
  activeAbilities: ActiveAbility[];

  @property.array(PassiveAbility, { required: true })
  @JsonColumn()
  passiveAbilities: PassiveAbility[];

  @property.array(AddedFeature, { required: true })
  @JsonColumn()
  features: AddedFeature[];

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
