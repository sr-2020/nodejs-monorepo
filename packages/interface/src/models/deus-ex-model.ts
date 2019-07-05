import { ModelApiInterface, EmptyModel, Event } from '@sr2020/interface/models/alice-model-engine';
import { model, property } from '@loopback/repository';

@model()
export class MemoryEntry {
  @property({ required: true })
  title: string;

  @property({ required: true })
  text: string;

  @property({ required: true })
  url: string;

  @property({ required: true })
  mID: string;
}

@model()
export class Change {
  @property({ required: true })
  mID: string;

  @property({ required: true })
  text: string;

  @property({ required: true })
  timestamp: number;
}

@model()
export class Message {
  @property({ required: true })
  mID: string;

  @property({ required: true })
  title: string;

  @property({ required: true })
  text: string;
}

@model()
export class DeusExModel extends EmptyModel {
  @property.array(MemoryEntry, { required: true })
  memory: MemoryEntry[];

  @property({ required: true })
  hp: number;

  @property({ required: true })
  maxHp: number;

  @property({ required: true })
  randomSeed: number;

  @property({ required: true })
  login: string;

  @property({ required: true })
  mail: string;

  @property({ required: true })
  generation: string;

  @property({ required: true })
  profileType: string;

  @property({ required: true })
  firstName: string;

  @property({ required: true })
  nicName: string;

  @property({ required: true })
  lastName: string;

  @property({ required: true })
  model: string; //For droids

  @property({ required: true })
  sweethome: string;

  @property({ required: true })
  sex: string;

  @property({ required: true })
  corporation: string;

  @property({ required: true })
  salaryLevel: number;

  @property({ required: true })
  insurance: string;

  @property({ required: true })
  insuranceLevel: number;

  @property({ required: true })
  insuranceDiplayName: string;

  @property()
  hackingLogin?: string;

  @property({ required: true })
  hackingProtection: number;

  @property({ required: true })
  lockReduction: number;

  @property({ required: true })
  proxyRegen: number;

  @property({ required: true })
  maxProxy: number;

  @property({ required: true })
  maxSecondsInVr: number;

  @property({ required: true })
  owner: string;

  @property({ required: true })
  creator: string;

  @property({ required: true })
  isAlive: boolean;

  @property({ required: true })
  lastVREnterTimestamp: number;

  @property({ required: true })
  lastVREnterDuration: number;

  @property({ required: true })
  totalSpentInVR: number;

  @property({ required: true })
  mind: any;

  @property.array(Number, { required: true })
  genome: number[];

  @property.array(Number, { required: true })
  systems: number[];

  @property({ required: true })
  password: string;

  @property.array(Change, { required: true })
  changes: Change[];

  @property.array(Message, { required: true })
  messages: Message[];

  @property()
  showTechnicalInfo?: boolean;
}

export type DeusExModelApiInterface = ModelApiInterface<DeusExModel>;

@model()
export class DeusExProcessModelRequest {
  @property({ required: true })
  baseModel: DeusExModel;

  @property.array(Event, { required: true })
  events: Event[];

  @property({ required: true })
  timestamp: number;
}

@model()
export class DeusExProcessModelResponse {
  @property({ required: true })
  baseModel: DeusExModel;

  @property({ required: true })
  workModel: DeusExModel;
}
