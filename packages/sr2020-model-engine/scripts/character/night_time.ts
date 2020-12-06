import { EffectModelApi, EventModelApi, Modifier } from '@alice/interface/models/alice-model-engine';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { duration } from 'moment';
import { addTemporaryModifier, modifierFromEffect } from '@alice/sr2020-model-engine/scripts/character/util';

export function pauseAndPostpone(api: EventModelApi<Sr2020Character>, data: { pauseDurationHours: number; postponeDurationHours: number }) {
  for (const timer of api.model.timers) {
    timer.miliseconds += duration(data.postponeDurationHours, 'hours').asMilliseconds();
  }

  addTemporaryModifier(api, modifierFromEffect(setPaused, {}), duration(data.pauseDurationHours, 'hours'), 'Ночная пауза');

  api.sendNotification(
    'Перерыв на ночь',
    `Активирован режим ночной паузы. Никакие активные действия недоступны в течение ${data.pauseDurationHours} часов. Все таймеры сдвинуты на ${data.postponeDurationHours} часов вперед.`,
  );
}

export function setPaused(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.screens.billing = false;
  api.model.screens.spellbook = false;
  api.model.screens.activeAbilities = false;
  api.model.screens.karma = false;
  api.model.screens.ethics = false;
  api.model.screens.wound = false;
  api.model.screens.scanQr = false;
}
