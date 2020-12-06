import { QrCode, QrType } from '@alice/sr2020-common/models/qr-code.model';
import { kAllImplants } from '../character/implants_library';
import { kAllPills } from '../character/chemo_library';
import { kAllReagents } from './reagents_library';
import { EventModelApi, UserVisibleError } from '@alice/interface/models/alice-model-engine';
import { consumeFood } from '../character/hunger';
import { consumeChemo } from '../character/chemo';
import { DroneData, MerchandiseQrData, TypedQrCode } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { kAllDrones, kCommonDroneAbilityIds } from '@alice/sr2020-model-engine/scripts/qr/drone_library';
import { kAllPassiveAbilities } from '@alice/sr2020-model-engine/scripts/character/passive_abilities_library';
import { getAllActiveAbilities } from '@alice/sr2020-model-engine/scripts/character/library_registrator';
import { kAllFocuses } from '@alice/sr2020-model-engine/scripts/qr/focus_library';
import { kALlCyberDecks } from '@alice/sr2020-model-engine/scripts/qr/cyberdeck_library';
import { kAllSoftware } from '@alice/sr2020-model-engine/scripts/qr/software_library';

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
  data: object;
}

function getLibraryData(id: string): MerchandiseLibraryData {
  if (['food', 'cow-meat', 'cow-blood'].includes(id)) {
    return {
      type: 'food',
      eventType: consumeFood.name,
      data: {},
    };
  }

  if (id == 'locus-charge') {
    return { type: 'locus_charge', data: {} };
  }

  const sameId = (item: { id: string }) => item.id == id;
  const maybeImplant = kAllImplants.find(sameId);
  if (maybeImplant) {
    return {
      type: 'implant',
      name: maybeImplant.name,
      description: maybeImplant.description,
      data: {},
    };
  }

  const maybePill = kAllPills.find(sameId);
  if (maybePill) {
    return {
      type: 'pill',
      name: maybePill.name,
      eventType: consumeChemo.name,
      data: {},
    };
  }

  const maybeReagent = kAllReagents.find(sameId);
  if (maybeReagent) {
    return {
      type: 'reagent',
      name: maybeReagent.name,
      data: {},
    };
  }

  const maybeDrone = kAllDrones.find(sameId);
  if (maybeDrone) {
    const droneData: DroneData = {
      hitpoints: maybeDrone.hitpoints,
      modSlots: maybeDrone.modSlots,
      moddingCapacity: maybeDrone.moddingCapacity,
      sensor: maybeDrone.sensor,
      type: maybeDrone.type,
      inUse: false,
      activeAbilities: [],
      passiveAbilities: [],
    };

    for (const abilityId of maybeDrone.abilityIds.concat(kCommonDroneAbilityIds)) {
      const maybePassiveAbility = kAllPassiveAbilities.get(abilityId);
      if (maybePassiveAbility) {
        droneData.passiveAbilities.push({
          id: maybePassiveAbility.id,
          humanReadableName: maybePassiveAbility.humanReadableName,
          description: maybePassiveAbility.description,
          modifierIds: [], // We assume that drone passive abilities don't have any modifiers, so modifierIds are empty.
        });
        continue;
      }

      const maybeActiveAbility = getAllActiveAbilities().get(abilityId);
      if (maybeActiveAbility) {
        droneData.activeAbilities.push({
          id: maybeActiveAbility.id,
          humanReadableName: maybeActiveAbility.humanReadableName,
          description: maybeActiveAbility.description,
          cooldownMinutes: maybeActiveAbility.cooldownMinutes,
          cooldownUntil: 0,
          target: maybeActiveAbility.target,
          targetsSignature: maybeActiveAbility.targetsSignature,
        });
        continue;
      }

      throw new UserVisibleError('Описание дрона содержит несуществующую способность');
    }

    return {
      type: 'drone',
      name: maybeDrone.name,
      description: maybeDrone.description,
      data: droneData,
    };
  }

  const maybeFocus = kAllFocuses.find(sameId);
  if (maybeFocus) {
    return {
      type: 'focus',
      name: maybeFocus.name,
      data: maybeFocus,
    };
  }

  const maybeCyberDeck = kALlCyberDecks.find(sameId);
  if (maybeCyberDeck) {
    return {
      type: 'cyberdeck',
      name: maybeCyberDeck.name,
      description: maybeCyberDeck.description,
      data: maybeCyberDeck,
    };
  }

  const maybeSoftware = kAllSoftware.find(sameId);
  if (maybeSoftware) {
    return {
      type: 'software',
      name: maybeSoftware.name,
      description: maybeSoftware.description,
      data: maybeSoftware,
    };
  }

  throw new UserVisibleError('Неизвестный ID товара');
}

export function createMerchandise(api: EventModelApi<QrCode>, data: MerchandiseExternalData) {
  if (api.model.type != 'empty') {
    throw new UserVisibleError('QR-код уже записан!');
  }

  const libraryData = getLibraryData(data.id);

  (api.model as TypedQrCode<MerchandiseQrData>) = {
    type: libraryData.type,
    name: data.name ?? libraryData.name ?? '',
    description: data.description ?? libraryData.description ?? '',
    usesLeft: data.numberOfUses ?? 1,
    data: {
      ...data.additionalData,
      id: data.id,
      basePrice: data.basePrice ?? 0,
      rentPrice: data.basePrice ?? 0,
      dealId: data.dealId ?? '',
      gmDescription: data.gmDescription ?? '',
      lifestyle: data.lifestyle ?? '',
      ...libraryData.data,
    },
    eventType: libraryData.eventType,
    timestamp: api.model.timestamp,
    modifiers: [],
    timers: [],
    modelId: api.model.modelId,
  };
}
