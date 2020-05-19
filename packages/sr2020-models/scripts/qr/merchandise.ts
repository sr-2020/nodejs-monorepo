import { QrType, QrCode } from '@sr2020/interface/models/qr-code.model';
import { Implant, kAllImplants } from '../character/implants_library';
import { kAllPills, Pill } from '../character/chemo_library';
import { kAllReagents, Reagent } from './reagents_library';
import { UserVisibleError, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { consumeFood } from '../character/merchandise';
import { consumeChemo } from '../character/chemo';
import { DroneData, MerchandiseQrData, TypedQrCode } from '@sr2020/sr2020-models/scripts/qr/datatypes';
import { Drone, kAllDrones } from '@sr2020/sr2020-models/scripts/qr/drone_library';
import { kAllPassiveAbilities } from '@sr2020/sr2020-models/scripts/character/passive_abilities_library';
import { getAllActiveAbilities } from '@sr2020/sr2020-models/scripts/character/library_registrator';

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
  if (id == 'food') {
    return {
      type: 'food',
      eventType: consumeFood.name,
      data: {},
    };
  }

  if (id == 'locus-charge') {
    return { type: 'locus_charge', data: {} };
  }

  const sameId = (item: Implant | Pill | Reagent | Drone) => item.id == id;
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
      requiredSkill: maybeDrone.requiredSkill,
      inUse: false,
      activeAbilities: [],
      passiveAbilities: [],
    };

    for (const abilityId of maybeDrone.abilityIds) {
      const maybePassiveAbility = kAllPassiveAbilities.get(abilityId);
      if (maybePassiveAbility) {
        droneData.passiveAbilities.push({
          id: maybePassiveAbility.id,
          name: maybePassiveAbility.name,
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

  throw new UserVisibleError('Неизвестный ID товара');
}

export function createMerchandise(api: EventModelApi<QrCode>, data: MerchandiseExternalData) {
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
      ...libraryData.data,
    },
    eventType: libraryData.eventType,
    timestamp: api.model.timestamp,
    modifiers: [],
    timers: [],
    modelId: api.model.modelId,
  };
}
