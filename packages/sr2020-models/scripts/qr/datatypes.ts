import { QrCode } from '@sr2020/interface/models/qr-code.model';

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
}

export function typedQrData<T>(qr: QrCode) {
  return qr.data as T;
}
