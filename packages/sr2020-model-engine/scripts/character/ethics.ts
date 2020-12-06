import { isEqual } from 'lodash';

import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { EthicGroup, EthicScale, EthicTrigger, kAllCrysises, kAllEthicGroups, kEthicAbilities, kEthicLevels } from './ethics_library';
import { Event, EventModelApi, UserVisibleError } from '@alice/interface/models/alice-model-engine';
import { ActiveAbilityData } from './active_abilities';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { consume, unconsume } from '../qr/events';
import {
  addFeatureToModel,
  getAllFeatures,
  removeFeatureFromModel,
  satisfiesPrerequisites,
} from '@alice/sr2020-model-engine/scripts/character/features';
import { LocusQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';

const MAX_ETHIC_VALUE = 4;
const ETHIC_COOLDOWN_MS = 30 * 1000;

export function initEthic(model: Sr2020Character) {
  updatePersonalEthic(
    model,
    new Map([
      ['violence', 0],
      ['control', 0],
      ['individualism', 0],
      ['mind', 0],
    ]),
  );
}

// Returns true if ethic ability was added and false otherwise.
function updatePersonalEthic(model: Sr2020Character, ethicValues: Map<EthicScale, number>): boolean {
  updateEthicStateAndTriggers(model, ethicValues);
  return updateEthicAbilities(model, ethicValues);
}

// Update ethic profile based on the new ethic values.
// Will remove all non-crysis triggers and recalculate state.
function updateEthicStateAndTriggers(model: Sr2020Character, ethicValues: Map<EthicScale, number>) {
  model.ethic.state = [];
  model.ethic.trigger = model.ethic.trigger.filter((t) => t.kind == 'crysis');
  for (const [scale, value] of ethicValues) {
    const level = kEthicLevels.find((l) => l.scale == scale && l.value == value)!;
    model.ethic.state.push({
      scale,
      value,
      description: level.description,
    });
    model.ethic.trigger.push(
      ...level.triggers.map((t) => {
        return {
          id: t.id,
          kind: t.kind,
          description: t.description,
        };
      }),
    );
  }
}

export function updateGroupEthicAbilities(model: Sr2020Character) {
  updateEthicAbilities(model, getEthicValues(model));
}

function updateEthicAbilities(model: Sr2020Character, ethicValues: Map<EthicScale, number>) {
  const allEthicAbilitiesIds = kEthicAbilities.map((it) => it.abilityId);
  for (const group of kAllEthicGroups) {
    allEthicAbilitiesIds.push(...group.abilityIds);
  }

  const characterEthicAbilities = new Set(
    [...model.activeAbilities, ...model.passiveAbilities].filter((it) => allEthicAbilitiesIds.includes(it.id)).map((it) => it.id),
  );

  const newPersonalEthicAbilities = hasCrysis(model)
    ? []
    : kEthicAbilities.filter((it) => ethicValues.get(it.scale) == it.value).map((it) => it.abilityId);

  let newGroupEthicAbilities: string[] = [];
  for (const groupId of model.ethic.groups) {
    const libraryGroup = kAllEthicGroups.find((it) => it.id == groupId)!;
    let fitsGroup = true;
    for (const condition of libraryGroup.ethicStyle) {
      const v = ethicValues.get(condition.scale)!;
      if (v < condition.conditionMin || v > condition.conditionMax) fitsGroup = false;
    }
    if (fitsGroup) newGroupEthicAbilities.push(...libraryGroup.abilityIds);
  }

  newGroupEthicAbilities = newGroupEthicAbilities.filter((abilityId) =>
    satisfiesPrerequisites(model, getAllFeatures().find((f) => f.id == abilityId)!),
  );

  const newEthicAbilities = new Set([...newPersonalEthicAbilities, ...newGroupEthicAbilities]);

  const abilitiesChanged = !isEqual(characterEthicAbilities, newEthicAbilities);
  if (abilitiesChanged) {
    const toAdd = [...newEthicAbilities].filter((id) => !characterEthicAbilities.has(id));
    const toRemove = [...characterEthicAbilities].filter((id) => !newEthicAbilities.has(id));

    for (const id of toAdd) addFeatureToModel(model, id);
    for (const id of toRemove) removeFeatureFromModel(model, id);
  }
  return abilitiesChanged;
}

function findTrigger(id: string): EthicTrigger {
  const crysis = kAllCrysises.find((cr) => cr.id == id);
  if (crysis) return crysis;

  for (const level of kEthicLevels) {
    const trigger = level.triggers.find((t) => t.id == id);
    if (trigger) return trigger;
  }

  throw new UserVisibleError('Триггер не найден');
}

function hasCrysis(model: Sr2020Character): boolean {
  return model.ethic.trigger.find((it) => it.kind == 'crysis') != undefined;
}

export function ethicSet(
  api: EventModelApi<Sr2020Character>,
  data: { violence: number; control: number; individualism: number; mind: number },
  _: Event,
) {
  updatePersonalEthic(
    api.model,
    new Map([
      ['violence', data.violence],
      ['control', data.control],
      ['individualism', data.individualism],
      ['mind', data.mind],
    ]),
  );
}

function getEthicValues(model: Sr2020Character): Map<EthicScale, number> {
  const values: Map<EthicScale, number> = new Map();
  for (const l of model.ethic.state) values.set(l.scale, l.value);
  return values;
}

export function ethicTrigger(api: EventModelApi<Sr2020Character>, data: { id: string }) {
  const trigger = findTrigger(data.id);
  const values = getEthicValues(api.model);

  let crysisResolved = false;

  if (trigger.kind == 'crysis') {
    api.model.ethic.trigger = api.model.ethic.trigger.filter((t) => t.id != data.id);
    crysisResolved = true;
  }

  let valuesShifted = false;

  for (const shift of trigger.shifts) {
    const v = values.get(shift.scale)!;
    if (v >= shift.conditionMin && v <= shift.conditionMax) {
      if (Math.abs(v + shift.change) == MAX_ETHIC_VALUE) {
        for (const [scale, value] of values) {
          values.set(scale, Math.max(Math.min(value, MAX_ETHIC_VALUE - 1), -MAX_ETHIC_VALUE + 1));
        }
      }
      values.set(shift.scale, v + shift.change);
      valuesShifted = true;
    }
  }

  let crysisAdded = false;

  for (const crysisIndex of trigger.crysises) {
    const crysis = kAllCrysises[crysisIndex - 1];
    if (!api.model.ethic.trigger.some((t) => t.id == crysis.id)) {
      api.model.ethic.trigger.push({
        id: crysis.id,
        kind: crysis.kind,
        description: crysis.description,
      });
      crysisAdded = true;
    }
  }

  const gotNewAbility = updatePersonalEthic(api.model, values);

  if (valuesShifted) {
    api.model.ethic.lockedUntil = api.model.timestamp + ETHIC_COOLDOWN_MS;
  }

  if (valuesShifted) {
    // We assume that situation valuesShifted && crysisAdded is not possible
    let message = crysisResolved
      ? 'Кризис разрешен и это вызвало изменение этических параметров'
      : 'Ваше действие вызвало изменение этических параметров';
    if (gotNewAbility) {
      message = message + '. Вы получили этическую способность!';
    }
    api.sendNotification('Этика', message);
  } else {
    // We assume that situation crysisResolved && crysisAdded is not possible
    if (crysisResolved) {
      api.sendNotification('Этика', 'Кризис разрешен');
    }

    if (crysisAdded) {
      api.sendNotification('Этика', 'Ваше действие привело к кризису');
    }
  }
}

function getLocus(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData): QrCode {
  const locus = api.aquired(QrCode, data.locusId!);
  if (locus?.type != 'locus') {
    throw new UserVisibleError('Отсканированный предмет не является валидным локусом');
  }
  return locus;
}

function getMember(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, locus: QrCode, mode: 'add' | 'remove'): Sr2020Character {
  const groupId = (locus.data as LocusQrData).groupId;
  const character = api.aquired(Sr2020Character, data.targetCharacterId!);
  const inGroup = character.ethic.groups.includes(groupId);
  if (inGroup && mode == 'add') {
    throw new UserVisibleError('Персонаж уже состоит в этой этической группе!');
  }
  if (!inGroup && mode == 'remove') {
    throw new UserVisibleError('Персонаж не состоит в этой этической группе!');
  }
  return character;
}

function getGroup(groupId: string): EthicGroup {
  const group = kAllEthicGroups.find((it) => it.id == groupId);
  if (!group) {
    throw new UserVisibleError(`Несуществующая этическая группа: ${groupId}`);
  }
  return group;
}

export function discourseGroupAddAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  discourseGroupAddGeneric(api, data, true);
}

export function discourseGroupAddGuru(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  discourseGroupAddGeneric(api, data, false);
}

export function discourseGroupAddGeneric(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, consumeCharge: boolean) {
  const locus = getLocus(api, data);
  if (locus.usesLeft <= 0) {
    throw new UserVisibleError('Недостаточно зарядов локуса!');
  }

  const target = getMember(api, data, locus, 'add');
  api.sendOutboundEvent(Sr2020Character, target.modelId, discourseGroupAdd, typedQrData<LocusQrData>(locus));
  if (consumeCharge) api.sendOutboundEvent(QrCode, locus.modelId, consume, { noClear: true });
}

export function discourseGroupExcludeAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  discourseGroupExcludeGeneric(api, data, 0);
}

export function discourseGroupInquisitor1(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  discourseGroupExcludeGeneric(api, data, 1);
}

export function discourseGroupInquisitor2(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  discourseGroupExcludeGeneric(api, data, 2);
}

export function discourseGroupExcludeGeneric(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, recoveredCharges: number) {
  const locus = getLocus(api, data);
  const target = getMember(api, data, locus, 'remove');
  api.sendOutboundEvent(Sr2020Character, target.modelId, discourseGroupRemove, typedQrData<LocusQrData>(locus));
  if (recoveredCharges) api.sendOutboundEvent(QrCode, locus.modelId, unconsume, { amount: recoveredCharges });
}

export function discourseGroupAdd(api: EventModelApi<Sr2020Character>, data: LocusQrData) {
  const group = getGroup(data.groupId);
  api.model.ethic.groups.push(group.id);
  api.model.passiveAbilities.push({
    id: data.groupId,
    humanReadableName: 'Член этической группы',
    description: group.name,
  });
  updateGroupEthicAbilities(api.model);
}

export function discourseGroupRemove(api: EventModelApi<Sr2020Character>, data: LocusQrData) {
  api.model.ethic.groups = api.model.ethic.groups.filter((it) => it != data.groupId);
  api.model.passiveAbilities = api.model.passiveAbilities.filter((it) => it.id != data.groupId);
  updateGroupEthicAbilities(api.model);
}

export function chargeLocusAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  getLocus(api, data);
  const charge = api.aquired(QrCode, data.qrCodeId!);
  if (!(charge && charge.type == 'locus_charge')) {
    throw new UserVisibleError('Отсканированный предмет не является валидным зарядом локуса');
  }

  if (charge.usesLeft <= 0) {
    throw new UserVisibleError('Нет зарядов');
  }

  api.sendOutboundEvent(QrCode, data.qrCodeId!, consume, {});
  api.sendOutboundEvent(QrCode, data.locusId!, unconsume, {});
}

// Intentionally don't do anything, the only purpose here is to set cooldown and add history record (which is done by useAbility).
export function prophetAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {}
