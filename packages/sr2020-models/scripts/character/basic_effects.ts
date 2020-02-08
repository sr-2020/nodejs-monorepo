// Basic effects adjusting value of some characteristic.
// Must handle min-max clamping.
import { clamp } from 'lodash';

import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Modifier, EffectModelApi } from '@sr2020/interface/models/alice-model-engine';

export function increaseMagic(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.magic += m.amount;
  api.model.magic = clamp(api.model.magic, -9000, 9000);
}

export function increaseMagicFeedbackReduction(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.magicFeedbackReduction += m.amount;
  api.model.magicFeedbackReduction = clamp(api.model.magicFeedbackReduction, -9000, 9000);
}

export function increaseResonance(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.resonance += m.amount;
  api.model.resonance = clamp(api.model.resonance, -9000, 9000);
}

export function increaseMaxTimeAtHost(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.maxTimeAtHost += m.amount;
  api.model.maxTimeAtHost = clamp(api.model.maxTimeAtHost, 15, 60);
}

export function increaseHostEntrySpeed(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.hostEntrySpeed += m.amount;
  api.model.hostEntrySpeed = clamp(api.model.hostEntrySpeed, 5, 20);
}

export function increaseConversionAttack(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.conversionAttack += m.amount;
  api.model.conversionAttack = clamp(api.model.conversionAttack, 5, 20);
}

export function increaseConversionFirewall(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.conversionFirewall += m.amount;
  api.model.conversionFirewall = clamp(api.model.conversionFirewall, 5, 20);
}

export function increaseConversionSleaze(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.conversionSleaze += m.amount;
  api.model.conversionSleaze = clamp(api.model.conversionSleaze, 5, 20);
}

export function increaseConversionDataprocessing(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.conversionDataprocessing += m.amount;
  api.model.conversionDataprocessing = clamp(api.model.conversionDataprocessing, 5, 20);
}

export function increaseAdminHostNumber(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.adminHostNumber += m.amount;
  api.model.adminHostNumber = clamp(api.model.adminHostNumber, 3, 10);
}

export function increaseSpriteLevel(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.spriteLevel += m.amount;
  api.model.spriteLevel = clamp(api.model.spriteLevel, 0, 3);
}

export function increaseMaxTimeInVr(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.maxTimeInVr += m.amount;
  api.model.maxTimeInVr = clamp(api.model.maxTimeInVr, 30, 9000);
}

export function increaseMagicRecoverySpeed(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.magicRecoverySpeed += m.amount;
  // As this is a coefficient - we use 1/3 and 5/3 instead of 1 and 5 from the sheet.
  api.model.magicRecoverySpeed = clamp(api.model.magicRecoverySpeed, 1.0 / 3.0, 5.0 / 3.0);
}

export function increaseSpiritResistanceMultiplier(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.spiritResistanceMultiplier += m.amount;
  api.model.spiritResistanceMultiplier = clamp(api.model.spiritResistanceMultiplier, 0.2, 2.0);
}
