import * as cuid from 'cuid';
import { AddedActiveAbility, AddedPassiveAbility, AddedSpell, Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { EffectModelApi, EventModelApi, Modifier, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { kAllPassiveAbilities, PassiveAbility } from './passive_abilities_library';
import { kAllSpells, Spell } from './spells_library';
import { ActiveAbility } from './active_abilities_library';
import { cloneDeep } from 'lodash';
import { getAllActiveAbilities } from '@sr2020/sr2020-model-engine/scripts/character/library_registrator';
import { Duration } from 'moment';
import { addTemporaryModifier, modifierFromEffect, validUntil } from '@sr2020/sr2020-model-engine/scripts/character/util';
import { TemporaryModifier } from '@sr2020/sr2020-model-engine/scripts/character/typedefs';

export function addFeature(api: EventModelApi<Sr2020Character>, data: { id: string }) {
  addFeatureToModel(api.model, data.id);
}

export function addFeatureToModel(model: Sr2020Character, featureId: string) {
  const passiveAbility = kAllPassiveAbilities.get(featureId);
  if (passiveAbility) {
    addPassiveAbility(model, passiveAbility);
    return;
  }

  const activeAbility = getAllActiveAbilities().get(featureId);
  if (activeAbility) {
    addActiveAbility(model, activeAbility);
    return;
  }

  const spell = kAllSpells.get(featureId);
  if (spell) {
    addSpell(model, spell);
    return;
  }

  // TODO: Support other kinds of features (e.g. archetypes).
  throw Error('No such feature in the features library');
}

function addPassiveAbility(model: Sr2020Character, ability: PassiveAbility) {
  // Ability is already present in the character - won't add again.
  if (model.passiveAbilities.find((f) => f.id == ability.id)) return;

  const modifiersToAdd = Array.isArray(ability.modifier) ? ability.modifier : [ability.modifier];
  const modifierIds: string[] = [];
  for (const m of modifiersToAdd) modifierIds.push(addModifier(model, m).mID);
  const addedAbility: AddedPassiveAbility = { id: ability.id, name: ability.name, description: ability.description, modifierIds };
  model.passiveAbilities.push(addedAbility);
}

function addActiveAbility(model: Sr2020Character, ability: ActiveAbility) {
  // Ability is already present in the character - won't add again.
  if (model.activeAbilities.find((f) => f.id == ability.id)) return;
  model.activeAbilities.push({
    id: ability.id,
    humanReadableName: ability.humanReadableName,
    description: ability.description,
    target: ability.target,
    targetsSignature: ability.targetsSignature,
    cooldownMinutes: ability.cooldownMinutes,
    cooldownUntil: 0,
  });
}

function addSpell(model: Sr2020Character, spell: Spell) {
  // Spell is already present in the character - won't add again.
  if (model.spells.find((f) => f.id == spell.id)) return;
  model.spells.push({
    id: spell.id,
    description: spell.description,
    humanReadableName: spell.humanReadableName,
    hasTarget: spell.hasTarget ?? false,
  });
}

export function removeFeature(api: EventModelApi<Sr2020Character>, data: { id: string }) {
  removeFeatureFromModel(api.model, data.id);
}

export function removeFeatureFromModel(model: Sr2020Character, featureId: string) {
  const passiveAbility = model.passiveAbilities.find((f) => f.id == featureId);
  if (passiveAbility) {
    removePassiveAbility(model, passiveAbility);
    return;
  }

  const activeAbility = model.activeAbilities.find((f) => f.id == featureId);
  if (activeAbility) {
    removeActiveAbility(model, activeAbility);
    return;
  }

  const spell = model.spells.find((f) => f.id == featureId);
  if (spell) {
    removeSpell(model, spell);
    return;
  }
}

function removePassiveAbility(model: Sr2020Character, ability: AddedPassiveAbility) {
  if (ability.modifierIds != undefined) {
    for (const modifierId of ability.modifierIds) removeModifier(model, modifierId);
  }
  model.passiveAbilities = model.passiveAbilities.filter((f) => f.id != ability.id);
}

function removeActiveAbility(model: Sr2020Character, ability: AddedActiveAbility) {
  model.activeAbilities = model.activeAbilities.filter((f) => f.id != ability.id);
}

function removeSpell(model: Sr2020Character, spell: AddedSpell) {
  model.spells = model.spells.filter((f) => f.id != spell.id);
}

// We reimplement addModifier/removeModifier here to remove the dependency on API.
function addModifier(model: Sr2020Character, modifier: Modifier) {
  const m: Modifier = { ...cloneDeep(modifier), mID: cuid() };
  model.modifiers.push(m);
  return m;
}

function removeModifier(model: Sr2020Character, id: string) {
  model.modifiers = model.modifiers.filter((it) => it.mID != id);
}

// Beware: doesn't support abilities with modifiers
export function addTemporaryPassiveAbility(api: EventModelApi<Sr2020Character>, abilityId: string, d: Duration) {
  const passiveAbility = kAllPassiveAbilities.get(abilityId);
  if (!passiveAbility) {
    throw new UserVisibleError(`Неизвестная способность ${abilityId}`);
  }

  if (passiveAbility.modifier instanceof Modifier || passiveAbility.modifier.length > 0) {
    throw new UserVisibleError(`Временная способность ${abilityId} содержит модификаторы!`);
  }

  addTemporaryModifier(
    api,
    modifierFromEffect(addTemporaryPassiveAbilityEffect, {
      validUntil: validUntil(api, d),
      ability: passiveAbility,
    }),
    d,
    `Добавление временной способности ${passiveAbility.name}`,
  );
}

export function addTemporaryPassiveAbilityEffect(api: EffectModelApi<Sr2020Character>, m: TemporaryModifier & { ability: PassiveAbility }) {
  api.model.passiveAbilities.push({
    id: m.ability.id,
    name: m.ability.name,
    description: m.ability.description,
    validUntil: m.validUntil,
  });
}
