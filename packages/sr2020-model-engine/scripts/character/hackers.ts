import { EffectModelApi, EventModelApi, Modifier, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import {
  increaseBody,
  increaseCharisma,
  increaseIntelligence,
  increaseResonance,
} from '@sr2020/sr2020-model-engine/scripts/character/basic_effects';
import * as cuid from 'cuid';
import { duration } from 'moment';
import { healthStateTransition } from '@sr2020/sr2020-model-engine/scripts/character/death_and_rebirth';
import { sendNotificationAndHistoryRecord } from '@sr2020/sr2020-model-engine/scripts/character/util';
import { ModifierWithAmount } from '@sr2020/sr2020-model-engine/scripts/character/typedefs';

interface DumpshockModifier extends Modifier {
  amount: number; // always positive or zero
}

const kDumpshockModifier: DumpshockModifier = {
  mID: 'dumpshock',
  amount: 0,
  enabled: true,
  effects: [
    {
      enabled: true,
      type: 'normal',
      handler: dumpshockEffect.name,
    },
  ],
};

export function dumpshock(api: EventModelApi<Sr2020Character>, data: {}) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Цель не находится в мясном теле.');
  }

  if (api.model.healthState != 'biologically_dead') {
    healthStateTransition(api, 'clinically_dead');
  }

  adjustDumpshock(api, { amount: 1 });

  sendNotificationAndHistoryRecord(api, 'Дампшок!', 'Вы испытали дампшок! Клиническая смерть.');
  api.sendPubSubNotification('dumpshock', { characterId: api.model.modelId });
}

export function temporaryAntiDumpshock(api: EventModelApi<Sr2020Character>, data: { durationInMinutes: number }) {
  if (adjustDumpshock(api, { amount: -1 })) {
    api.setTimer(cuid(), 'Завершение эффекта уменьшения дампшока', duration(data.durationInMinutes, 'minutes'), adjustDumpshock, {
      amount: 1,
    });
  }
}

export function adjustDumpshock(api: EventModelApi<Sr2020Character>, data: { amount: number }): boolean {
  const m = api.getModifierById(kDumpshockModifier.mID);
  if (m) {
    const dumpshockModifier = m as ModifierWithAmount;
    if (dumpshockModifier.amount + data.amount >= 0) {
      dumpshockModifier.amount += data.amount;
      return true;
    } else {
      return false;
    }
  } else {
    if (data.amount < 0) return false;
    api.addModifier({ ...kDumpshockModifier, amount: data.amount });
    return true;
  }
}

export function dumpshockEffect(api: EffectModelApi<Sr2020Character>, m: DumpshockModifier) {
  increaseResonance(api, { ...m, amount: -m.amount });
  increaseCharisma(api, { ...m, amount: -m.amount });
  increaseBody(api, { ...m, amount: -m.amount });
  increaseIntelligence(api, { ...m, amount: -m.amount });
  api.model.passiveAbilities.push({
    id: 'dump-shock-survivor',
    name: 'Пережитый дамп-шок',
    description: `Ты пережил дамп-шок. Тебя преследует постоянная головная боль. Эффект x ${m.amount}`,
  });
}
