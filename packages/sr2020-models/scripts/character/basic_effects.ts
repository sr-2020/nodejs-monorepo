// Basic effects adjusting value of some characteristic.
// Must handle min-max clamping.
import { clamp } from 'lodash';

import { Sr2020CharacterApi } from '@sr2020/interface/models/sr2020-character.model';
import { Modifier } from '@sr2020/interface/models/alice-model-engine';

export function increaseMagic(api: Sr2020CharacterApi, m: Modifier) {
  api.model.magic += m.amount;
  api.model.magic = clamp(api.model.magic, -9000, 9000);
}

export function increaseMagicFeedbackReduction(api: Sr2020CharacterApi, m: Modifier) {
  api.model.magicFeedbackReduction += m.amount;
  api.model.magicFeedbackReduction = clamp(api.model.magicFeedbackReduction, -9000, 9000);
}

export function increaseMagicRecoverySpeed(api: Sr2020CharacterApi, m: Modifier) {
  api.model.magicRecoverySpeed += m.amount;
  // As this is a coefficient - we use 1/3 and 5/3 instead of 1 and 5 from the sheet.
  api.model.magicRecoverySpeed = clamp(api.model.magicRecoverySpeed, 1.0 / 3.0, 5.0 / 3.0);
}

export function increaseSpiritResistanceMultiplier(api: Sr2020CharacterApi, m: Modifier) {
  api.model.spiritResistanceMultiplier += m.amount;
  api.model.spiritResistanceMultiplier = clamp(api.model.spiritResistanceMultiplier, 0.2, 2.0);
}
