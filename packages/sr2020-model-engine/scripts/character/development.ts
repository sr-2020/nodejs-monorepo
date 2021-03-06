import { EventModelApi, Modifier, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { createClampingEffect } from '@alice/sr2020-model-engine/scripts/character/basic_effects';

// Migrates to updated character model (e.g. sets some optional fields to the default values).
export function developmentMigrate(api: EventModelApi<Sr2020Character>, data: never) {
  for (const modifier of api.model.modifiers) {
    if (modifier.priority == undefined) {
      modifier.priority = Modifier.kDefaultPriority;
    }
  }

  const systemModifier = api.getModifierById('_system');
  systemModifier.priority = Modifier.kPriorityEarliest;

  if (!api.getModifierById('_limiter')) {
    api.addModifier({
      mID: '_limiter',
      priority: Modifier.kPriorityLatest,
      enabled: true,
      effects: [createClampingEffect()],
    });
  }
}

// Validates that character model is ready to be updated to a new "schema"
// (e.g. that some optional fields can be made required).
export function developmentValidate(api: EventModelApi<Sr2020Character>, data: never) {
  for (const modifier of api.model.modifiers) {
    if (modifier.priority == undefined) {
      throw new UserVisibleError(`Modifier ${modifier.mID} of character ${api.model.modelId} has no priority`);
    }
  }
}
