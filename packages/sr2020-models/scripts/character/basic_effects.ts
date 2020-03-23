// Basic effects adjusting value of some characteristic.
// Must handle min-max clamping.
import { clamp } from 'lodash';

import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Modifier, EffectModelApi } from '@sr2020/interface/models/alice-model-engine';

export function increaseMaxHp(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.maxHp += m.amount;
  api.model.maxHp = clamp(api.model.maxHp, 0, 6);
}

export function increaseCharisma(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.charisma += m.amount;
  api.model.charisma = clamp(api.model.charisma, 0, 10);
}

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

export function increaseFadingResistance(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.fadingResistance += m.amount;
  api.model.fadingResistance = clamp(api.model.fadingResistance, 1, 50);
}

export function increaseBiofeedbackResistance(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.biofeedbackResistance += m.amount;
  api.model.biofeedbackResistance = clamp(api.model.biofeedbackResistance, 0, 50);
}

export function increaseMatrixHp(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.matrixHp += m.amount;
  api.model.matrixHp = clamp(api.model.matrixHp, 1, 9000);
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

export function increaseAuraMarkMultiplier(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.auraMarkMultiplier += m.amount;
  api.model.auraMarkMultiplier = clamp(api.model.auraMarkMultiplier, 0.1, 2.0);
}

export function increaseAuraReadingMultiplier(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.auraReadingMultiplier += m.amount;
  api.model.auraReadingMultiplier = clamp(api.model.auraReadingMultiplier, 0.1, 2.0);
}

export function increaseAuraMask(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.auraMask += m.amount;
  api.model.auraMask = clamp(api.model.auraMask, 0, 9000);
}

export function increaseEthicGroupMaxSize(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.ethicGroupMaxSize += m.amount;
  api.model.ethicGroupMaxSize = clamp(api.model.ethicGroupMaxSize, 0, 100);
}

export function decreaseChemoBodyDetectableThresholdTo(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.chemoBodyDetectableThreshold = Math.min(api.model.chemoBodyDetectableThreshold, m.amount);
}

export function decreaseChemoPillDetectableThresholdTo(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.chemoPillDetectableThreshold = Math.min(api.model.chemoPillDetectableThreshold, m.amount);
}

export function increaseСhemoBaseEffectThreshold(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.chemoBaseEffectThreshold += m.amount;
  api.model.chemoBaseEffectThreshold = clamp(api.model.chemoBaseEffectThreshold, 0, 9000);
}

export function increaseСhemoSuperEffectThreshold(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.chemoSuperEffectThreshold += m.amount;
  api.model.chemoSuperEffectThreshold = clamp(api.model.chemoSuperEffectThreshold, 0, 9000);
}

export function increaseСhemoCrysisThreshold(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.chemoCrysisThreshold += m.amount;
  api.model.chemoCrysisThreshold = clamp(api.model.chemoCrysisThreshold, 0, 9000);
}

export function increaseStockGainPercentage(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.stockGainPercentage += m.amount;
  api.model.stockGainPercentage = clamp(api.model.stockGainPercentage, 0, 50);
}

export function increaseAllDiscounts(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  increaseDiscountWeaponsArmor(api, m);
  increaseDiscountDrones(api, m);
  increaseDiscountChemo(api, m);
  increaseDiscountImplants(api, m);
  increaseDiscountMagicStuff(api, m);
}

export function increaseDiscountWeaponsArmor(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.discounts.weaponsArmor += m.amount;
  api.model.discounts.weaponsArmor = clamp(api.model.discounts.weaponsArmor, 0, 50);
}

export function increaseDiscountDrones(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.discounts.drones += m.amount;
  api.model.discounts.drones = clamp(api.model.discounts.drones, 0, 50);
}

export function increaseDiscountChemo(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.discounts.chemo += m.amount;
  api.model.discounts.chemo = clamp(api.model.discounts.chemo, 0, 50);
}

export function increaseDiscountImplants(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.discounts.implants += m.amount;
  api.model.discounts.implants = clamp(api.model.discounts.implants, 0, 50);
}

export function increaseDiscountMagicStuff(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.discounts.magicStuff += m.amount;
  api.model.discounts.magicStuff = clamp(api.model.discounts.magicStuff, 0, 50);
}

export function increaseMentalProtection(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.mentalDefenceBonus += m.amount;
}

export function increaseMentalAttack(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.mentalAttackBonus += m.amount;
}
