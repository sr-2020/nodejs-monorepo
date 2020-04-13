import { Event, UserVisibleError, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { consumeFood } from '../character/merchandise';
import { duration } from 'moment';

export function consume(api: EventModelApi<QrCode>, data: {}, event: Event) {
  if (api.model.usesLeft <= 0 || api.model.type == 'empty') {
    throw new UserVisibleError('QR-код уже использован!');
  }
  api.model.usesLeft -= 1;
  if (api.model.usesLeft == 0) {
    clear(api, {}, event);
  }
}

export function create(api: EventModelApi<QrCode>, data: Partial<QrCode>, _: Event) {
  if (api.model.type != 'empty') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  api.model = { ...api.model, ...data, timestamp: api.model.timestamp, modelId: api.model.modelId, modifiers: [], timers: undefined };
}

export function clear(api: EventModelApi<QrCode>, data: {}, _: Event) {
  api.model = {
    modelId: api.model.modelId,
    timestamp: api.model.timestamp,
    usesLeft: 0,
    type: 'empty',
    name: 'Пустышка',
    description: 'Не записанный QR-код. На него можно записать что угодно',
    modifiers: [],
  };
}

interface Merchandise {
  id: string;
  name: string;
  description: string;
  numberOfUses?: number;
  additionalData: any;
}

function merchandiseIdToEventType(id: string) {
  if (id == 'food') {
    return consumeFood.name;
  }

  return undefined;
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
    eventType: merchandiseIdToEventType(data.id),
    timestamp: api.model.timestamp,
    modifiers: [],
    modelId: api.model.modelId,
  };
}

export interface MentalQrData {
  attackerId: string;
  attack: number;
  eventType: string;
  name: string;
  description: string;
}

export function writeMentalAbility(api: EventModelApi<QrCode>, data: MentalQrData, _: Event) {
  api.model.usesLeft = 1;
  api.model.type = 'ability';
  api.model.name = 'Способность ' + data.name;
  api.model.description = data.description;
  api.model.eventType = data.eventType;
  api.model.data = data;
  api.model.modifiers = [];
  api.model.timers = {};

  api.setTimer('clear', duration(5, 'minutes'), clearMentalAbility, undefined);
}

export function clearMentalAbility(api: EventModelApi<QrCode>, data: undefined, _: Event) {
  api.model = {
    usesLeft: 100,
    description: '',
    modelId: api.model.modelId,
    modifiers: [],
    timers: {},
    name: '',
    timestamp: api.model.timestamp,
    type: 'ability',
    eventType: 'scannedConsumedMentalAbility',
  };
}
