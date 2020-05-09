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
