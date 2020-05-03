import { QrType, QrCode } from '@sr2020/interface/models/qr-code.model';
import { kAllImplants } from '../character/implants_library';
import { kAllPills } from '../character/chemo_library';
import { kAllReagents } from './reagents_library';
import { UserVisibleError, EventModelApi, Event } from '@sr2020/interface/models/alice-model-engine';
import { consumeFood } from '../character/merchandise';
import { consumeChemo } from '../character/chemo';

interface Merchandise {
  id: string;
  name: string;
  description: string;
  numberOfUses?: number;
  additionalData: any;
}

function merchandiseIdToQrType(id: string): QrType {
  if (id == 'food') {
    return 'food';
  }

  if (id == 'locus-charge') {
    return 'locus_charge';
  }

  if (kAllImplants.find((it) => it.id == id)) return 'implant';
  if (kAllPills.find((it) => it.id == id)) return 'pill';
  if (kAllReagents.find((it) => it.id == id)) return 'reagent';

  throw new UserVisibleError('Неизвестный ID товара');
}

function merchandiseIdToEventType(id: string) {
  const qrType = merchandiseIdToQrType(id);
  if (qrType == 'food') {
    return consumeFood.name;
  }

  if (qrType == 'pill') {
    return consumeChemo.name;
  }

  return undefined;
}

export function createMerchandise(api: EventModelApi<QrCode>, data: Merchandise, _: Event) {
  if (api.model.type != 'empty') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  api.model = {
    type: merchandiseIdToQrType(data.id),
    name: data.name,
    description: data.description,
    usesLeft: data.numberOfUses ?? 1,
    data: { ...data.additionalData, id: data.id },
    eventType: merchandiseIdToEventType(data.id),
    timestamp: api.model.timestamp,
    modifiers: [],
    modelId: api.model.modelId,
  };
}
