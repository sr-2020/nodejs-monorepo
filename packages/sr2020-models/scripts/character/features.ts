import { Sr2020Character, AddedPassiveAbility } from '@sr2020/interface/models/sr2020-character.model';
import { Event, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { kAllFeatures } from './features_library';

export function addFeature(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const feature = kAllFeatures.get(data.id);
  // TODO: Support other kinds of features (e.g. active abilities).
  if (feature == undefined) throw Error('No such feature in the features library');

  // Feature is already present in the character - won't add again.
  if (api.model.passiveAbilities.find((f) => f.id == data.id)) return;

  const modifiersToAdd = Array.isArray(feature.modifier) ? feature.modifier : [feature.modifier];
  const addedAbility: AddedPassiveAbility = { id: feature.id, name: feature.name, description: feature.description, modifierIds: [] };
  for (const m of modifiersToAdd) addedAbility.modifierIds.push(api.addModifier(m).mID);
  api.model.passiveAbilities.push(addedAbility);
}

export function removeFeature(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const featureToRemove = api.model.passiveAbilities.find((f) => f.id == data.id);
  if (featureToRemove == undefined) return;
  for (const modifierId of featureToRemove.modifierIds) api.removeModifier(modifierId);
  api.model.passiveAbilities = api.model.passiveAbilities.filter((f) => f.id != data.id);
}
