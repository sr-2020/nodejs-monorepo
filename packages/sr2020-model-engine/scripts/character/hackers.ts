import { Effect, EffectModelApi, EventModelApi, Modifier, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import {
  increaseBody,
  increaseCharisma,
  increaseIntelligence,
  increaseResonance,
} from '@alice/sr2020-model-engine/scripts/character/basic_effects';
import * as cuid from 'cuid';
import { duration } from 'moment';
import { healthStateTransition } from '@alice/sr2020-model-engine/scripts/character/death_and_rebirth';
import { sendNotificationAndHistoryRecord } from '@alice/sr2020-model-engine/scripts/character/util';
import { ModifierWithAmount } from '@alice/sr2020-model-engine/scripts/character/typedefs';
import { ActiveAbilityData } from '@alice/sr2020-common/models/common_definitions';
import { template } from 'lodash';
import { getAllPassiveAbilities } from '@alice/sr2020-model-engine/scripts/character/library_registrator';
import { CyberDeckQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';

interface DumpshockModifier extends Modifier {
  amount: number; // always positive or zero
}

const kDumpshockModifier: DumpshockModifier = {
  mID: 'dumpshock',
  priority: Modifier.kDefaultPriority,
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
    healthStateTransition(api, 'clinically_dead', undefined);
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
    const updatedDumpshockAmount = dumpshockModifier.amount + data.amount;
    if (updatedDumpshockAmount >= 0 && updatedDumpshockAmount <= 5) {
      dumpshockModifier.amount = updatedDumpshockAmount;
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
  const ability = getAllPassiveAbilities().get('dump-shock-survivor')!;
  api.model.passiveAbilities.push({
    id: ability.id,
    humanReadableName: ability.humanReadableName,
    description: template(ability.description)({ amount: m.amount }),
  });
}

export function createJackedInEffect(): Effect {
  return {
    enabled: true,
    type: 'normal',
    handler: jackedInEffect.name,
  };
}

export function jackedInEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  const abilityToRemove = api.model.hacking.jackedIn ? 'jack-in' : 'jack-out';
  api.model.activeAbilities = api.model.activeAbilities.filter((ability) => ability.id != abilityToRemove);
}

export function jackInAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  if (typedQrData<CyberDeckQrData>(api.aquired(QrCode, data.qrCodeId!)).broken) {
    throw new UserVisibleError('Кибердека сломана!');
  }
  api.model.hacking.jackedIn = true;
}

export function jackOutAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.model.hacking.jackedIn = false;
}
