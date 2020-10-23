import { EventModelApi, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { duration } from 'moment';
import { kAllEthicGroups } from '../character/ethics_library';
import {
  AiSymbolData,
  BodyStorageQrData,
  LocusQrData,
  MentalQrData,
  ReanimateCapsuleData,
  TypedQrCode,
} from '@sr2020/sr2020-model-engine/scripts/qr/datatypes';
import { buyFeatureForKarma, earnKarma } from '@sr2020/sr2020-model-engine/scripts/character/karma';
import { getAllFeatures } from '@sr2020/sr2020-model-engine/scripts/character/features';

export function consume(api: EventModelApi<QrCode>, data: { noClear?: boolean }) {
  if (api.model.usesLeft <= 0 || api.model.type == 'empty') {
    throw new UserVisibleError('QR-код уже использован!');
  }
  api.model.usesLeft -= 1;
  if (api.model.usesLeft == 0 && !data.noClear) {
    if (isMerchandise(api)) {
      makeEmptyBox(api);
    } else {
      clear(api);
    }
  }
}

export function unconsume(api: EventModelApi<QrCode>, data: { amount?: number }) {
  if (api.model.type == 'empty') {
    throw new UserVisibleError('Нельзя зарядить пустышку!');
  }
  api.model.usesLeft += data.amount ?? 1;
}

export function create(api: EventModelApi<QrCode>, data: Partial<QrCode>) {
  if (api.model.type != 'empty') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  api.model = { ...api.model, ...data, timestamp: api.model.timestamp, modelId: api.model.modelId, modifiers: [], timers: [] };
}

export function clear(api: EventModelApi<QrCode>) {
  api.model = {
    modelId: api.model.modelId,
    timestamp: api.model.timestamp,
    usesLeft: 0,
    type: 'empty',
    name: 'Пустышка',
    description: 'Не записанный QR-код. На него можно записать что угодно',
    data: {},
    modifiers: [],
    timers: [],
  };
}

function isMerchandise(api: EventModelApi<QrCode>) {
  return api.model.type == 'implant' || api.model.type == 'pill' || api.model.type == 'reagent' || api.model.type == 'locus_charge';
}

function makeEmptyBox(api: EventModelApi<QrCode>) {
  // Hack to hide pill name
  if (api.model.type == 'pill') {
    api.model.name = 'Коробка от препарата';
  } else {
    api.model.name = 'Коробка от ' + api.model.name;
  }
  api.model.type = 'box';
  api.model.description = 'Пустая коробка от товара. Нужна для операций с рентными платежами по товару.';
}

export interface MentalAbilityData {
  attackerId: string;
  attack: number;
  eventType: string;
  name: string;
  description: string;
}

export function writeMentalAbility(api: EventModelApi<QrCode>, data: MentalAbilityData) {
  api.model.usesLeft = 1;
  api.model.type = 'ability';
  api.model.name = 'Способность ' + data.name;
  api.model.description = data.description;
  api.model.eventType = data.eventType;
  api.model.data = data;
  api.model.modifiers = [];
  api.model.timers = [];

  api.setTimer('clear', '', duration(5, 'minutes'), clearMentalAbility, {});
}

export function clearMentalAbility(api: EventModelApi<QrCode>, data: {}) {
  (api.model as TypedQrCode<MentalQrData>) = {
    usesLeft: 100,
    description: '',
    modelId: api.model.modelId,
    data: { attack: 0, attackerId: '' },
    modifiers: [],
    timers: [],
    name: '',
    timestamp: api.model.timestamp,
    type: 'ability',
    eventType: 'scannedConsumedMentalAbility',
  };
}

export function createLocusQr(api: EventModelApi<QrCode>, data: { groupId: string; numberOfUses: number }) {
  if (api.model.type != 'empty') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  const group = kAllEthicGroups.find((it) => it.id == data.groupId);

  if (!group) {
    throw new UserVisibleError('Такой этической группы не существует!');
  }

  if (data.numberOfUses < 0) {
    throw new UserVisibleError('Количество зарядов локуса не может быть отрицательным!');
  }

  (api.model as TypedQrCode<LocusQrData>) = {
    usesLeft: data.numberOfUses,
    description: `Относится к группе "${group.name}"`,
    modelId: api.model.modelId,
    modifiers: [],
    timers: [],
    name: 'Локус этической группы',
    timestamp: api.model.timestamp,
    type: 'locus',
    data: { groupId: data.groupId },
  };
}

export function writeBodyStorage(api: EventModelApi<QrCode>, data: { name: string }) {
  if (api.model.type != 'empty' && api.model.type != 'body_storage') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  const qrData: BodyStorageQrData = {};

  api.model = {
    modelId: api.model.modelId,
    timestamp: api.model.timestamp,
    type: 'body_storage',
    name: data.name,
    description: '',
    usesLeft: 1,
    modifiers: [],
    timers: [],
    data: qrData,
  };
}

export function writeReanimateCapsule(api: EventModelApi<QrCode>, data: { name: string; description: string } & ReanimateCapsuleData) {
  if (api.model.type != 'empty' && api.model.type != 'reanimate_capsule') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  const qrData: ReanimateCapsuleData = {
    essenceAir: data.essenceAir,
    essenceGet: data.essenceGet,
    cooldown: data.cooldown,
  };

  api.model = {
    modelId: api.model.modelId,
    timestamp: api.model.timestamp,
    type: 'reanimate_capsule',
    name: data.name,
    description: data.description,
    usesLeft: 1,
    modifiers: [],
    timers: [],
    data: qrData,
  };
}

export function writeAiSymbol(api: EventModelApi<QrCode>, data: AiSymbolData) {
  if (api.model.type != 'empty' && api.model.type != 'ai_symbol') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  api.model = {
    modelId: api.model.modelId,
    timestamp: api.model.timestamp,
    type: 'ai_symbol',
    name: 'Символ ИИ',
    description: '',
    usesLeft: 1,
    modifiers: [],
    timers: [],
    data,
  };
}

export function writeKarmaSource(api: EventModelApi<QrCode>, data: { amount: number }) {
  if (api.model.type != 'empty') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  api.model = {
    modelId: api.model.modelId,
    timestamp: api.model.timestamp,
    type: 'event',
    eventType: earnKarma.name,
    name: 'Карма',
    description: `Отсканируй, чтоб получить ${data.amount} кармы.`,
    usesLeft: 999999,
    modifiers: [],
    timers: [],
    data,
  };
}

export function writeBuyableFeature(api: EventModelApi<QrCode>, data: { id: string }) {
  if (api.model.type != 'empty') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  const feature = getAllFeatures().find((f) => f.id == data.id);
  if (!feature) {
    throw new UserVisibleError(`Фича с идентификатором ${data.id} не найдена!`);
  }

  api.model = {
    modelId: api.model.modelId,
    timestamp: api.model.timestamp,
    type: 'feature_to_buy',
    eventType: buyFeatureForKarma.name,
    name: `Способность ${feature.humanReadableName}`,
    description: `Базовая цена (без учета скидки): ${feature.karmaCost} кармы.`,
    usesLeft: 999999,
    modifiers: [],
    timers: [],
    data,
  };
}
