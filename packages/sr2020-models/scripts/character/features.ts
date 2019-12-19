import { AddedFeature, Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Event, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { kAllFeatures } from './features_library';

export function addFeature(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const feature = kAllFeatures.get(data.id);
  if (feature == undefined) throw Error('No such feature in the features library');

  // Feature is already present in the character - won't add again.
  if (api.model.features.find((f) => f.id == data.id)) return;

  const modifiersToAdd = Array.isArray(feature.modifier) ? feature.modifier : [feature.modifier];
  const addedFeature: AddedFeature = { id: feature.id, name: feature.name, description: feature.description, modifierIds: [] };
  for (const m of modifiersToAdd) addedFeature.modifierIds.push(api.addModifier(m).mID);
  api.model.features.push(addedFeature);
}

export function removeFeature(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const featureToRemove = api.model.features.find((f) => f.id == data.id);
  if (featureToRemove == undefined) return;
  for (const modifierId of featureToRemove.modifierIds) api.removeModifier(modifierId);
  api.model.features = api.model.features.filter((f) => f.id != data.id);
}
