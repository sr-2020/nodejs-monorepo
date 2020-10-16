import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { duration } from 'moment';

export const kMaxKarmaOnCreation = 20;
export const kMaxKarmaPerGame = 500;
export const kMaxKarmaPerCycle = 100;
export const kKarmaActiveAbilityCoefficient = 0.1;
export const kKarmaSpellCoefficient = 0.1;
export const kPassiveAbilityCoefficient = 0.01;
const kKarmaForPassivesTimerName = 'give-karma-for-passives';
const kKarmaForPassivesTimerPeriod = duration(1, 'hour');

export function earnKarma(api: EventModelApi<Sr2020Character>, data: { amount: number }) {
  const amountEarned = Math.min(data.amount, api.workModel.karma.cycleLimit);
  if (amountEarned <= 0) return;

  api.model.karma.available += amountEarned;
  api.model.karma.cycleLimit -= amountEarned;
}

export function resetKarmaCycleLimit(api: EventModelApi<Sr2020Character>, data: {}) {
  const totalKarmaEarned = api.model.karma.spent + api.model.karma.available;
  const gameKarmaLimit = Math.max(kMaxKarmaPerGame - totalKarmaEarned, 0);
  api.model.karma.cycleLimit = Math.min(gameKarmaLimit, kMaxKarmaPerCycle);
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
  earnKarma(api, { amount: kPassiveAbilityCoefficient * api.model.karma.spentOnPassives });
  addKarmaGivingTimer(api.model);
}
