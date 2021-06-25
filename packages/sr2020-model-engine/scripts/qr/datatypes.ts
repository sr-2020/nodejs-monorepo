import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { AddedActiveAbility, AddedPassiveAbility, BodyType, SpellSphere } from '@alice/sr2020-common/models/sr2020-character.model';
import { DroneType } from '@alice/sr2020-model-engine/scripts/qr/drone_library';
import { CyberDeck } from '@alice/sr2020-model-engine/scripts/qr/cyberdeck_library';

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
  textOnDefenceFailure: string;
  disablesAbilities: boolean;
}

// qr.type in kMerchandiseQrTypes
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
  type: DroneType;
  broken: boolean;
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

export interface MagicFocusData {
  amount: number;
  sphere: SpellSphere;
  cooldownSeconds: number;
}

// qr.type == 'focus'
export type MagicFocusQrData = MagicFocusData & MerchandiseQrData;

// qr.type == 'cyberdeck'
export type CyberDeckQrData = CyberDeck & MerchandiseQrData & { broken: boolean };

// qr.type == 'spirit'
export interface SpiritQrData {
  inUse: boolean;
  hitpoints: number;
  activeAbilities: AddedActiveAbility[];
  passiveAbilities: AddedPassiveAbility[];
}

// qr.type == 'spirit_jar'
export interface SpiritJarQrData {
  spiritId?: string;
  emptiness_reason?: string;
}

// qr.type == 'repair_kit'
export interface RepairKitQrData {
  bonus: number;
}

// qr.type == 'sprite'
export type SpriteQrData = MerchandiseQrData;

// qr.type == 'foundation_node'
export interface FoundationNodeQrData {
  id: string;
}

export function typedQrData<T>(qr: QrCode) {
  return qr.data as T;
}
