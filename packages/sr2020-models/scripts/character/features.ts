import { Sr2020Character, AddedPassiveAbility, AddedSpell } from '@sr2020/interface/models/sr2020-character.model';
import { Event, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { kAllPassiveAbilities, PassiveAbility } from './passive_abilities_library';
import { kAllSpells, Spell } from './spells_library';

export function addFeature(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const passiveAbility = kAllPassiveAbilities.get(data.id);
  if (passiveAbility) {
    addPassiveAbility(api, passiveAbility);
    return;
  }

  const spell = kAllSpells.get(data.id);
  if (spell) {
    addSpell(api, spell);
    return;
  }

  // TODO: Support other kinds of features (e.g. active abilities).
  throw Error('No such feature in the features library');
}

function addPassiveAbility(api: EventModelApi<Sr2020Character>, ability: PassiveAbility) {
  // Ability is already present in the character - won't add again.
  if (api.model.passiveAbilities.find((f) => f.id == ability.id)) return;

  const modifiersToAdd = Array.isArray(ability.modifier) ? ability.modifier : [ability.modifier];
  const modifierIds: string[] = [];
  for (const m of modifiersToAdd) modifierIds.push(api.addModifier(m).mID);
  const addedAbility: AddedPassiveAbility = { id: ability.id, name: ability.name, description: ability.description, modifierIds };
  api.model.passiveAbilities.push(addedAbility);
}

function addSpell(api: EventModelApi<Sr2020Character>, spell: Spell) {
  // Spell is already present in the character - won't add again.
  if (api.model.spells.find((f) => f.id == spell.id)) return;
  api.model.spells.push(spell);
}

export function removeFeature(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const passiveAbility = api.model.passiveAbilities.find((f) => f.id == data.id);
  if (passiveAbility) {
    removePassiveAbility(api, passiveAbility);
    return;
  }

  const spell = api.model.spells.find((f) => f.id == data.id);
  if (spell) {
    removeSpell(api, spell);
    return;
  }
}

function removePassiveAbility(api: EventModelApi<Sr2020Character>, ability: AddedPassiveAbility) {
  if (ability.modifierIds != undefined) {
    for (const modifierId of ability.modifierIds) api.removeModifier(modifierId);
  }
  api.model.passiveAbilities = api.model.passiveAbilities.filter((f) => f.id != ability.id);
}

function removeSpell(api: EventModelApi<Sr2020Character>, spell: AddedSpell) {
  api.model.spells = api.model.spells.filter((f) => f.id != spell.id);
}
