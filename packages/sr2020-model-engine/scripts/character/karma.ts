import { EventModelApi, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { duration } from 'moment';
import {
  addFeature,
  getAllFeatures,
  getFeatureIdsInModel,
  getFeatureKarmaCost,
  satisfiesPrerequisites,
} from '@alice/sr2020-model-engine/scripts/character/features';
import { sendNotificationAndHistoryRecord } from '@alice/sr2020-model-engine/scripts/character/util';
import { getAllPassiveAbilities } from '@alice/sr2020-model-engine/scripts/character/library_registrator';

export const kMaxKarmaPerGame = 500;
export const kMaxKarmaPerCycle = 100;
export const kKarmaActiveAbilityCoefficient = 0.03;
export const kKarmaSpellCoefficient = 0.01;
export const kPassiveAbilityCoefficient = 0.03;

const kKarmaForPassivesTimerName = 'give-karma-for-passives';
const kKarmaForPassivesTimerPeriod = duration(1, 'hour');

export function earnKarma(api: EventModelApi<Sr2020Character>, data: { amount: number; notify: boolean }) {
  if (data.amount <= 0) return;
  const amountEarned = Math.min(data.amount, api.workModel.karma.cycleLimit);
  if (amountEarned <= 0) {
    if (data.notify) {
      sendNotificationAndHistoryRecord(api, 'Карма не начислена', 'Достигнут лимит кармы в цикл/на игру, поэтому карма не была начислена.');
    }
    return;
  }

  if (data.notify) {
    sendNotificationAndHistoryRecord(api, `Начисление кармы: ${amountEarned.toFixed(2)}`, '');
  }

  api.model.karma.available += amountEarned;
  api.model.karma.cycleLimit -= amountEarned;
  api.model.karma.gameLimit -= amountEarned;
}

export function resetKarmaCycleLimit(api: EventModelApi<Sr2020Character>, data: {}) {
  api.model.karma.cycleLimit = Math.min(api.model.karma.gameLimit, kMaxKarmaPerCycle);
}

export function addKarmaGivingTimer(model: Sr2020Character) {
  model.timers.push({
    name: kKarmaForPassivesTimerName,
    description: 'Начисление кармы за пассивные способности',
    miliseconds: kKarmaForPassivesTimerPeriod.asMilliseconds(),
    eventType: giveKarmaForPassiveAbilities.name,
    data: {},
  });
}

export function giveKarmaForPassiveAbilities(api: EventModelApi<Sr2020Character>, data: {}) {
  earnKarma(api, { amount: kPassiveAbilityCoefficient * api.model.karma.spentOnPassives, notify: true });
  addKarmaGivingTimer(api.model);
}

export function buyFeatureForKarma(api: EventModelApi<Sr2020Character>, data: { id: string }) {
  const feature = getAllFeatures().find((f) => f.id == data.id);
  if (!feature) throw new UserVisibleError('Такой способности не существует!');

  if (getFeatureIdsInModel(api.workModel).includes(feature.id)) throw new UserVisibleError('Такая способность у вас уже есть');

  if (!satisfiesPrerequisites(api.model, feature)) throw new UserVisibleError('Не удовлетворены пререквизиты для данной способности');

  const karmaCost = getFeatureKarmaCost(api.workModel, feature);
  if (api.workModel.karma.available < karmaCost) throw new UserVisibleError('Недостаточно кармы для покупки способности');

  addFeature(api, data);

  api.model.karma.available -= karmaCost;
  api.model.karma.spent += karmaCost;
  if (getAllPassiveAbilities().has(feature.id)) api.model.karma.spentOnPassives += karmaCost;

  sendNotificationAndHistoryRecord(
    api,
    'Способность приобретена',
    `Способность "${feature.humanReadableName}" успешно приобретена, списано ${karmaCost} кармы.`,
  );
}
