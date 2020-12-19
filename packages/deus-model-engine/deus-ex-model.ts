import {
  ArrayProperty,
  BoolProperty,
  Condition,
  EmptyModel,
  Event,
  NumberProperty,
  ObjectProperty,
  StringProperty,
} from '@alice/alice-common/models/alice-model-engine';

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

export class Change {
  @StringProperty()
  mID: string;

  @StringProperty()
  text: string;

  @NumberProperty()
  timestamp: number;
}

export class Message {
  @StringProperty()
  mID: string;

  @StringProperty()
  title: string;

  @StringProperty()
  text: string;
}

export class DeusExModel extends EmptyModel {
  @ArrayProperty(MemoryEntry)
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

  @ArrayProperty(Number, { optional: true })
  genome?: number[];

  @ArrayProperty(Number, { optional: true })
  systems?: number[];

  @StringProperty()
  password: string;

  @ArrayProperty(Change)
  changes: Change[];

  @ArrayProperty(Message)
  messages: Message[];

  @ArrayProperty(Condition)
  conditions: Condition[];

  @BoolProperty({ optional: true })
  showTechnicalInfo?: boolean;
}

export class DeusExProcessModelRequest {
  @ObjectProperty(DeusExModel)
  baseModel: DeusExModel;

  @ArrayProperty(Event)
  events: Event[];

  @NumberProperty()
  timestamp: number;
}

export class DeusExProcessModelResponse {
  @ObjectProperty(DeusExModel)
  baseModel: DeusExModel;

  @ObjectProperty(DeusExModel)
  workModel: DeusExModel;
}
