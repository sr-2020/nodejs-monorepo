import { ModelApiInterface, EmptyModel } from '@sr2020/alice-model-engine-api/index';

export interface MemoryEntry {
  title: string;
  text: string;
  url: string;
  mID: string;
}

export interface Change {
  mID: string;
  text: string;
  timestamp: number;
}

export interface Message {
  mID: string;
  title: string;
  text: string;
}

export interface DeusExModel extends EmptyModel {
  memory: MemoryEntry[];
  hp: number;
  maxHp: number;
  randomSeed: number;
  login: string;
  mail: string;
  generation: string;
  profileType: string;
  firstName: string;
  nicName: string;
  lastName: string;
  model: string; //For droids
  sweethome: string;
  sex: string;
  corporation: string;
  salaryLevel: number;
  insurance: string;
  insuranceLevel: number;
  insuranceDiplayName: string;
  hackingLogin?: string;
  hackingProtection: number;
  lockReduction: number;
  proxyRegen: number;
  maxProxy: number;
  maxSecondsInVr: number;
  owner: string;
  creator: string;
  isAlive: boolean;

  lastVREnterTimestamp: number;
  lastVREnterDuration: number;
  totalSpentInVR: number;

  mind: any;
  genome: number[];

  systems: number[];

  password: string;
  changes: Change[];
  messages: Message[];

  adminTestUser?: boolean;
  showTechnicalInfo?: boolean;
}

export type DeusExModelApiInterface = ModelApiInterface<DeusExModel>;
