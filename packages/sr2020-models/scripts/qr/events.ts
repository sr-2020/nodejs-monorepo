import { Event } from '@sr2020/interface/models/alice-model-engine';
import { QrCodeApi, QrCode } from '@sr2020/interface/models/qr-code.model';

export function consume(api: QrCodeApi, data: {}, _: Event) {
  if (api.model.usesLeft <= 0 || api.model.type == 'empty') {
    throw Error('QR-код уже использован!');
  }
  api.model.usesLeft -= 1;
  if (api.model.usesLeft == 0) {
    api.model.type = 'empty';
    api.model.description = '';
    api.model.eventType = undefined;
    api.model.data = undefined;
  }
}

export function create(api: QrCodeApi, data: Partial<QrCode>, _: Event) {
  if (api.model.type != 'empty') {
    throw Error('QR-код уже записан!');
  }

  api.model = { ...api.model, ...data };
}
