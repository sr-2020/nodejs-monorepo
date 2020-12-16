import {
  BoolProperty,
  Condition,
  EmptyModel,
  Event,
  NumberProperty,
  ObjectProperty,
  StringProperty,
} from '@alice/alice-common/models/alice-model-engine';
import { model, property } from '@loopback/repository';

@model()
export class MemoryEntry {
  @StringProperty()
  title: string;

  @StringProperty()
  text: string;

  @StringProperty()
  url: string;

  @StringProperty()
  mID: string;
}

@model()
export class Change {
  @StringProperty()
  mID: string;

  @StringProperty()
  text: string;

  @NumberProperty()
  timestamp: number;
}

@model()
export class Message {
  @StringProperty()
  mID: string;

  @StringProperty()
  title: string;

  @StringProperty()
  text: string;
}

@model()
export class DeusExModel extends EmptyModel {
  @property.array(MemoryEntry, { required: true })
  memory: MemoryEntry[];

  @NumberProperty()
  hp: number;

  @NumberProperty()
  maxHp: number;

  @NumberProperty()
  randomSeed: number;

  @StringProperty()
  login: string;

  @StringProperty()
  mail: string;

  @StringProperty({ optional: true })
  generation?: string;

  @StringProperty()
  profileType: string;

  @StringProperty()
  firstName: string;

  @StringProperty()
  nicName: string;

  @StringProperty()
  lastName: string;

  @StringProperty()
  model: string; //For droids

  @StringProperty()
  sweethome: string;

  @StringProperty()
  sex: string;

  @StringProperty()
  corporation: string;

  @NumberProperty()
  salaryLevel: number;

  @StringProperty()
  insurance: string;

  @NumberProperty()
  insuranceLevel: number;

  @StringProperty()
  insuranceDiplayName: string;

  @StringProperty({ optional: true })
  hackingLogin?: string;

  @NumberProperty()
  hackingProtection: number;

  @NumberProperty()
  lockReduction: number;

  @NumberProperty()
  proxyRegen: number;

  @NumberProperty()
  maxProxy: number;

  @NumberProperty()
  maxSecondsInVr: number;

  @StringProperty()
  owner: string;

  @StringProperty()
  creator: string;

  @BoolProperty()
  isAlive: boolean;

  @NumberProperty()
  lastVREnterTimestamp: number;

  @NumberProperty()
  lastVREnterDuration: number;

  @NumberProperty()
  totalSpentInVR: number;

  @ObjectProperty(Object)
  mind: any;

  @property.array(Number, { required: true })
  genome?: number[];

  @property.array(Number, { required: true })
  systems?: number[];

  @StringProperty()
  password: string;

  @property.array(Change, { required: true })
  changes: Change[];

  @property.array(Message, { required: true })
  messages: Message[];

  @property.array(Message, { required: true })
  conditions: Condition[];

  @BoolProperty({ optional: true })
  showTechnicalInfo?: boolean;
}

@model()
export class DeusExProcessModelRequest {
  @ObjectProperty(DeusExModel)
  baseModel: DeusExModel;

  @property.array(Event, { required: true })
  events: Event[];

  @NumberProperty()
  timestamp: number;
}

@model()
export class DeusExProcessModelResponse {
  @ObjectProperty(DeusExModel)
  baseModel: DeusExModel;

  @ObjectProperty(DeusExModel)
  workModel: DeusExModel;
}
