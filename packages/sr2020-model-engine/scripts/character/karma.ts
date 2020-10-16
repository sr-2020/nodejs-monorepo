import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';

export const kMaxKarmaOnCreation = 20;
export const kMaxKarmaPerGame = 500;
export const kMaxKarmaPerCycle = 100;

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
