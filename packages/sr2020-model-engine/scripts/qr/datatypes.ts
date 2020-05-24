import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { AddedActiveAbility, AddedPassiveAbility, BodyType } from '@sr2020/sr2020-common/models/sr2020-character.model';

export interface TypedQrCode<T> extends QrCode {
  data: T;
}

// qr.type == 'locus'
export interface LocusQrData {
  groupId: string;
}

// qr.type == 'ability'
export interface MentalQrData {
  attackerId: string;
  attack: number;
}

// qr.type == 'implant', 'pill', 'reagent', 'locus_charge', 'box', 'drone', 'drone_mod', 'cyberdeck', 'cyberdeck_mod'
export interface MerchandiseQrData {
  id: string;
  basePrice: number;
  rentPrice: number;
  gmDescription: string;
  dealId: string;
  lifestyle: string;
}

// qr.type == 'body_storage'
export interface BodyStorageQrData {
  body?: {
    characterId: string;
    type: BodyType;
  };
}

export interface DroneData {
  requiredSkill: string;
  modSlots: number;
  moddingCapacity: number;
  sensor: number;
  hitpoints: number;
  activeAbilities: AddedActiveAbility[];
  passiveAbilities: AddedPassiveAbility[];
  inUse: boolean;
}

export type DroneQrData = DroneData & MerchandiseQrData;

// qr.type == 'reanimate_capsule'
export interface ReanimateCapsuleData {
  essenceGet: number;
  essenceAir: number;
  cooldown: number;
}

// qr.type == 'ai_symbol'
export interface AiSymbolData {
  ai: string;
}

export function typedQrData<T>(qr: QrCode) {
  return qr.data as T;
}
