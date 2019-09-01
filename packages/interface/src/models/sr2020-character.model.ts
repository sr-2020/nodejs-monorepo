import { model, property } from '@loopback/repository';
import { EmptyModel, ModelApiInterface, rproperty, JsonColumn } from './alice-model-engine';
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
  magic: number;

  @rproperty()
  @Column()
  magicPowerBonus: number;

  @rproperty()
  @Column()
  spellsCasted: number;

  @property.array(Spell, { required: true })
  @JsonColumn()
  spells: Spell[];

  @property.array(ActiveAbility, { required: true })
  @JsonColumn()
  activeAbilities: ActiveAbility[];

  @property.array(PassiveAbility, { required: true })
  @JsonColumn()
  passiveAbilities: PassiveAbility[];

  @property.array(HistoryRecord, { required: true })
  @JsonColumn()
  history: HistoryRecord[];
}

export type Sr2020CharacterApi = ModelApiInterface<Sr2020Character>;

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
