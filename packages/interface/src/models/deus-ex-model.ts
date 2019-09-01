import { ModelApiInterface, EmptyModel, Event, rproperty, Condition } from '@sr2020/interface/models/alice-model-engine';
import { model, property } from '@loopback/repository';

@model()
export class MemoryEntry {
  @rproperty()
  title: string;

  @rproperty()
  text: string;

  @rproperty()
  url: string;

  @rproperty()
  mID: string;
}

@model()
export class Change {
  @rproperty()
  mID: string;

  @rproperty()
  text: string;

  @rproperty()
  timestamp: number;
}

@model()
export class Message {
  @rproperty()
  mID: string;

  @rproperty()
  title: string;

  @rproperty()
  text: string;
}

@model()
export class DeusExModel extends EmptyModel {
  @property.array(MemoryEntry, { required: true })
  memory: MemoryEntry[];

  @rproperty()
  hp: number;

  @rproperty()
  maxHp: number;

  @rproperty()
  randomSeed: number;

  @rproperty()
  login: string;

  @rproperty()
  mail: string;

  @rproperty()
  generation: string;

  @rproperty()
  profileType: string;

  @rproperty()
  firstName: string;

  @rproperty()
  nicName: string;

  @rproperty()
  lastName: string;

  @rproperty()
  model: string; //For droids

  @rproperty()
  sweethome: string;

  @rproperty()
  sex: string;

  @rproperty()
  corporation: string;

  @rproperty()
  salaryLevel: number;

  @rproperty()
  insurance: string;

  @rproperty()
  insuranceLevel: number;

  @rproperty()
  insuranceDiplayName: string;

  @property()
  hackingLogin?: string;

  @rproperty()
  hackingProtection: number;

  @rproperty()
  lockReduction: number;

  @rproperty()
  proxyRegen: number;

  @rproperty()
  maxProxy: number;

  @rproperty()
  maxSecondsInVr: number;

  @rproperty()
  owner: string;

  @rproperty()
  creator: string;

  @rproperty()
  isAlive: boolean;

  @rproperty()
  lastVREnterTimestamp: number;

  @rproperty()
  lastVREnterDuration: number;

  @rproperty()
  totalSpentInVR: number;

  @rproperty()
  mind: any;

  @property.array(Number, { required: true })
  genome: number[];

  @property.array(Number, { required: true })
  systems: number[];

  @rproperty()
  password: string;

  @property.array(Change, { required: true })
  changes: Change[];

  @property.array(Message, { required: true })
  messages: Message[];

  @property.array(Message, { required: true })
  conditions: Condition[];

  @property()
  showTechnicalInfo?: boolean;
}

export type DeusExModelApiInterface = ModelApiInterface<DeusExModel>;

@model()
export class DeusExProcessModelRequest {
  @rproperty()
  baseModel: DeusExModel;

  @property.array(Event, { required: true })
  events: Event[];

  @rproperty()
  timestamp: number;
}

@model()
export class DeusExProcessModelResponse {
  @rproperty()
  baseModel: DeusExModel;

  @rproperty()
  workModel: DeusExModel;
}
