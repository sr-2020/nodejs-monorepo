import { EventModelApi, Modifier, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { createClampingEffect, createCooldownCalculatorEffect } from '@alice/sr2020-model-engine/scripts/character/basic_effects';
import { addFadingDecreaseTimer, kFadingDecreaseTimerName } from '@alice/sr2020-model-engine/scripts/character/technomancers';
import { addFeature, removeFeature } from '@alice/sr2020-model-engine/scripts/character/features';
import { sendNotificationAndHistoryRecord } from '@alice/sr2020-model-engine/scripts/character/util';
import { debugReviveAbsolute } from '@alice/sr2020-model-engine/scripts/character/death_and_rebirth';
import { removeHmhvvHunger, removeHunger } from '@alice/sr2020-model-engine/scripts/character/hunger';
import { cleanAddictions } from '@alice/sr2020-model-engine/scripts/character/chemo';

// Migrates to updated character model (e.g. sets some optional fields to the default values).
export function developmentMigrate(api: EventModelApi<Sr2020Character>, data: never) {
  for (const modifier of api.model.modifiers) {
    if (modifier.priority == undefined) {
      modifier.priority = Modifier.kDefaultPriority;
    }
  }

  const systemModifier = api.getModifierById('_system');
  systemModifier.priority = Modifier.kPriorityEarly;

  if (!api.getModifierById('_limiter')) {
    api.addModifier({
      mID: '_limiter',
      priority: Modifier.kPriorityLatest,
      enabled: true,
      effects: [createClampingEffect()],
    });
  }

  if (!api.getModifierById('_cooldown_calculator')) {
    api.addModifier({
      mID: '_cooldown_calculator',
      priority: Modifier.kPriorityLatest,
      enabled: true,
      effects: [createCooldownCalculatorEffect()],
    });
  }

  if (!api.getTimer(kFadingDecreaseTimerName)) {
    addFadingDecreaseTimer(api.model);
  }

  for (const id of ['how-much-it-costs', 'who-needs-it', 'how-much-is-rent', 'let-him-pay', 're-rent', 'save-scoring']) {
    if (api.model.activeAbilities.find((ability) => ability.id == id)) {
      removeFeature(api, { id });
      addFeature(api, { id });
    }
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

export function divineIntervention(api: EventModelApi<Sr2020Character>, data: never) {
  api.model.karma.available += 100;
}

export function gameIsOver(api: EventModelApi<Sr2020Character>, data: never) {
  addFeature(api, { id: 'divine-intervention' });
  addFeature(api, { id: 'game-is-over' });
  sendNotificationAndHistoryRecord(
    api,
    'Игра завершена',
    'Если хотите поэкспериментировать - см. описание добавившейся пассивной способности "Игра завершилась"',
  );
  debugReviveAbsolute(api, {});
  removeHunger(api.model);
  removeHmhvvHunger(api.model);
  cleanAddictions(api, { amount: 1 });
}
