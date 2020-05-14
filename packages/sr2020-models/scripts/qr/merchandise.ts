import { QrType, QrCode } from '@sr2020/interface/models/qr-code.model';
import { Implant, kAllImplants } from '../character/implants_library';
import { kAllPills, Pill } from '../character/chemo_library';
import { kAllReagents, Reagent } from './reagents_library';
import { UserVisibleError, EventModelApi, Event } from '@sr2020/interface/models/alice-model-engine';
import { consumeFood } from '../character/merchandise';
import { consumeChemo } from '../character/chemo';
import { MerchandiseQrData, TypedQrCode } from '@sr2020/sr2020-models/scripts/qr/datatypes';

interface MerchandiseExternalData {
  id: string;
  name?: string;
  description?: string;
  numberOfUses?: number;
  basePrice?: number;
  rentPrice?: number;
  dealId?: string;
  lifestyle?: string;
  gmDescription?: string;
  additionalData: any;
}

interface MerchandiseLibraryData {
  type: QrType;
  name?: string;
  description?: string;
  eventType?: string;
}

function getLibraryData(id: string): MerchandiseLibraryData {
  if (id == 'food') {
    return {
      type: 'food',
      eventType: consumeFood.name,
    };
  }

  if (id == 'locus-charge') {
    return { type: 'locus_charge' };
  }

  const sameId = (item: Implant | Pill | Reagent) => item.id == id;
  const maybeImplant = kAllImplants.find(sameId);
  if (maybeImplant) {
    return {
      type: 'implant',
      name: maybeImplant.name,
      description: maybeImplant.description,
    };
  }

  const maybePill = kAllPills.find(sameId);
  if (maybePill) {
    return {
      type: 'pill',
      name: maybePill.name,
      eventType: consumeChemo.name,
    };
  }

  const maybeReagent = kAllReagents.find(sameId);
  if (maybeReagent) {
    return {
      type: 'reagent',
      name: maybeReagent.name,
    };
  }

  throw new UserVisibleError('Неизвестный ID товара');
}

export function createMerchandise(api: EventModelApi<QrCode>, data: MerchandiseExternalData, _: Event) {
  if (api.model.type != 'empty') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  const libraryData = getLibraryData(data.id);

  (api.model as TypedQrCode<MerchandiseQrData>) = {
    type: libraryData.type,
    name: libraryData.name ?? data.name ?? '',
    description: libraryData.description ?? data.description ?? '',
    usesLeft: data.numberOfUses ?? 1,
    data: {
      ...data.additionalData,
      id: data.id,
      basePrice: data.basePrice ?? 0,
      rentPrice: data.basePrice ?? 0,
      dealId: data.dealId ?? '',
      gmDescription: data.gmDescription ?? '',
      lifestyle: data.lifestyle ?? '',
    },
    eventType: libraryData.eventType,
    timestamp: api.model.timestamp,
    modifiers: [],
    modelId: api.model.modelId,
  };
}
