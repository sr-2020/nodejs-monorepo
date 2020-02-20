import { Event, UserVisibleError, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/interface/models/qr-code.model';

export function consume(api: EventModelApi<QrCode>, data: {}, _: Event) {
  if (api.model.usesLeft <= 0 || api.model.type == 'empty') {
    throw new UserVisibleError('QR-код уже использован!');
  }
  api.model.usesLeft -= 1;
  if (api.model.usesLeft == 0) {
    api.model.type = 'empty';
    api.model.description = '';
    api.model.eventType = undefined;
    api.model.data = undefined;
  }
}

export function create(api: EventModelApi<QrCode>, data: Partial<QrCode>, _: Event) {
  if (api.model.type != 'empty') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  api.model = { ...api.model, ...data, timestamp: api.model.timestamp, modelId: api.model.modelId, modifiers: [], timers: undefined };
}

interface Merchandise {
  id: string;
  name: string;
  description: string;
  numberOfUses?: number;
  additionalData: any;
}

export function createMerchandise(api: EventModelApi<QrCode>, data: Merchandise, _: Event) {
  if (api.model.type != 'empty') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  api.model = {
    type: 'merchandise',
    name: data.name,
    description: data.description,
    usesLeft: data.numberOfUses ?? 1,
    data: { ...data.additionalData, id: data.id },

    timestamp: api.model.timestamp,
    modifiers: [],
    modelId: api.model.modelId,
  };
}
