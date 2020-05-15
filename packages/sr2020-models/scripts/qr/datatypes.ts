import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { AddedActiveAbility, AddedPassiveAbility, BodyType } from '@sr2020/interface/models/sr2020-character.model';

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

export function typedQrData<T>(qr: QrCode) {
  return qr.data as T;
}
