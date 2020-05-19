// Basic effects adjusting value of some characteristic.
// Must handle min-max clamping.
import { clamp } from 'lodash';

import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Modifier, EffectModelApi } from '@sr2020/interface/models/alice-model-engine';
import { ModifierWithAmount } from '@sr2020/sr2020-models/scripts/character/typedefs';

export function increaseMaxMeatHp(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  if (api.model.currentBody != 'physical') return;

  api.model.maxHp += m.amount;
  api.model.maxHp = clamp(api.model.maxHp, 0, 6);
  // Checking for healthState here to prevent infinite loop
  // (sending event leads to effect being re-applied leading to event send)
  if (api.model.maxHp == 0 && api.model.healthState != 'clinically_dead') {
    // Sending as string to prevent circular dependency.
    api.sendSelfEvent('clinicalDeath0MaxHp', {});
  }
}

export function increaseAllBaseStats(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  increaseResonance(api, m);
  increaseIntelligence(api, m);
  increaseCharisma(api, m);
  increaseMagic(api, m);
  increaseBody(api, m);
}

export function increaseCharisma(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.charisma += m.amount;
  api.model.charisma = clamp(api.model.charisma, 0, 10);
}

export function increaseIntelligence(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.intelligence += m.amount;
  api.model.intelligence = clamp(api.model.intelligence, 0, 6);
}

export function increaseBody(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.body += m.amount;
  api.model.body = clamp(api.model.body, 0, 6);
}

export function increaseMagic(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magic += m.amount;
  api.model.magic = clamp(api.model.magic, 0, 9000);
}

export function increaseMagicFeedbackReduction(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.feedbackReduction += m.amount;
  api.model.magicStats.feedbackReduction = clamp(api.model.magicStats.feedbackReduction, -9000, 9000);
}

export function increaseResonance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.resonance += m.amount;
  api.model.resonance = clamp(api.model.resonance, 0, 9000);
}

export function increaseResonanceForControl(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.resonanceForControlBonus += m.amount;
  api.model.hacking.resonanceForControlBonus = clamp(api.model.hacking.resonanceForControlBonus, 0, 3);
}

export function increaseMaxTimeAtHost(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.maxTimeAtHost += m.amount;
  api.model.hacking.maxTimeAtHost = clamp(api.model.hacking.maxTimeAtHost, 15, 60);
}

export function increaseHostEntrySpeed(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.hostEntrySpeed += m.amount;
  api.model.hacking.hostEntrySpeed = clamp(api.model.hacking.hostEntrySpeed, 5, 20);
}

export function increaseConversionAttack(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.conversionAttack += m.amount;
  api.model.hacking.conversionAttack = clamp(api.model.hacking.conversionAttack, 5, 20);
}

export function increaseConversionFirewall(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.conversionFirewall += m.amount;
  api.model.hacking.conversionFirewall = clamp(api.model.hacking.conversionFirewall, 5, 20);
}

export function increaseConversionSleaze(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.conversionSleaze += m.amount;
  api.model.hacking.conversionSleaze = clamp(api.model.hacking.conversionSleaze, 5, 20);
}

export function increaseConversionDataprocessing(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.conversionDataprocessing += m.amount;
  api.model.hacking.conversionDataprocessing = clamp(api.model.hacking.conversionDataprocessing, 5, 20);
}

export function increaseFadingResistance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.fadingResistance += m.amount;
  api.model.hacking.fadingResistance = clamp(api.model.hacking.fadingResistance, 1, 50);
}

export function increaseCompilationFadingResistance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.compilationFadingResistance += m.amount;
  api.model.hacking.compilationFadingResistance = clamp(api.model.hacking.compilationFadingResistance, 0, 100);
}

export function increaseVarianceResistance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.varianceResistance += m.amount;
  api.model.hacking.varianceResistance = clamp(api.model.hacking.varianceResistance, 0, 100);
}

export function increaseBiofeedbackResistance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.biofeedbackResistance += m.amount;
  api.model.hacking.biofeedbackResistance = clamp(api.model.hacking.biofeedbackResistance, 0, 50);
}

export function increaseMatrixHp(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.matrixHp += m.amount;
  api.model.matrixHp = clamp(api.model.matrixHp, 1, 6);
}

export function increaseAdminHostNumber(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.adminHostNumber += m.amount;
  api.model.hacking.adminHostNumber = clamp(api.model.hacking.adminHostNumber, 3, 10);
}

export function increaseBackdoors(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.additionalBackdoors += m.amount;
  api.model.hacking.additionalBackdoors = clamp(api.model.hacking.additionalBackdoors, 0, 5);
}

export function increaseBackdoorTtl(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.backdoorTtl += m.amount;
  api.model.hacking.backdoorTtl = clamp(api.model.hacking.backdoorTtl, 0, 9000);
}

export function increaseControlRequests(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.additionalRequests += m.amount;
  api.model.hacking.additionalRequests = clamp(api.model.hacking.additionalRequests, 0, 5);
}

export function increaseSpriteLevel(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.spriteLevel += m.amount;
  api.model.hacking.spriteLevel = clamp(api.model.hacking.spriteLevel, 0, 3);
}

export function increaseSpriteCount(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.additionalSprites += m.amount;
  api.model.hacking.additionalSprites = clamp(api.model.hacking.additionalSprites, 0, 5);
}

export function increaseMaxTimeInVr(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.maxTimeInVr += m.amount;
  api.model.maxTimeInVr = clamp(api.model.maxTimeInVr, 30, 9000);
}

export function increaseMagicRecoverySpeed(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.recoverySpeed += m.amount;
  // As this is a coefficient - we use 1/3 and 5/3 instead of 1 and 5 from the sheet.
  api.model.magicStats.recoverySpeed = clamp(api.model.magicStats.recoverySpeed, 1.0 / 3.0, 5.0 / 3.0);
}

export function increaseSpiritResistanceMultiplier(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.spiritResistanceMultiplier += m.amount;
  api.model.magicStats.spiritResistanceMultiplier = clamp(api.model.magicStats.spiritResistanceMultiplier, 0.2, 2.0);
}

export function increaseAuraMarkMultiplier(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.auraMarkMultiplier += m.amount;
  api.model.magicStats.auraMarkMultiplier = clamp(api.model.magicStats.auraMarkMultiplier, 0.1, 2.0);
}

export function increaseAuraReadingMultiplier(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.auraReadingMultiplier += m.amount;
  api.model.magicStats.auraReadingMultiplier = clamp(api.model.magicStats.auraReadingMultiplier, 0.1, 2.0);
}

export function increaseAuraMask(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.auraMask += m.amount;
  api.model.magicStats.auraMask = clamp(api.model.magicStats.auraMask, 0, 9000);
}

export function increaseСhemoBaseEffectThreshold(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.chemo.baseEffectThreshold += m.amount;
  api.model.chemo.baseEffectThreshold = clamp(api.model.chemo.baseEffectThreshold, 0, 9000);
}

export function increaseСhemoSuperEffectThreshold(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.chemo.superEffectThreshold += m.amount;
  api.model.chemo.superEffectThreshold = clamp(api.model.chemo.superEffectThreshold, 0, 9000);
}

export function increaseСhemoCrysisThreshold(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.chemo.crysisThreshold += m.amount;
  api.model.chemo.crysisThreshold = clamp(api.model.chemo.crysisThreshold, 0, 9000);
}

export function increaseStockGainPercentage(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.billing.stockGainPercentage += m.amount;
  api.model.billing.stockGainPercentage = clamp(api.model.billing.stockGainPercentage, 0, 50);
}

export function multiplyCorpDiscountAres(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.ares *= m.amount;
}

export function multiplyCorpDiscountAztechnology(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.aztechnology *= m.amount;
}

export function multiplyCorpDiscountSaederKrupp(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.saederKrupp *= m.amount;
}

export function multiplyCorpDiscountSpinradGlobal(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.spinradGlobal *= m.amount;
}

export function multiplyCorpDiscountNeonet1(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.neonet1 *= m.amount;
}

export function multiplyCorpDiscountEvo(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.evo *= m.amount;
}

export function multiplyCorpDiscountHorizon(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.horizon *= m.amount;
}

export function multiplyCorpDiscountWuxing(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.wuxing *= m.amount;
}

export function multiplyCorpDiscountRussia(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.russia *= m.amount;
}

export function multiplyCorpDiscountRenraku(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.renraku *= m.amount;
}

export function multiplyCorpDiscountMutsuhama(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.mutsuhama *= m.amount;
}

export function multiplyCorpDiscountShiavase(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.shiavase *= m.amount;
}

export function multiplyAllDiscounts(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.everything *= m.amount;
}

export function multiplyDiscountWeaponsArmor(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.discounts.weaponsArmor *= m.amount;
}

export function increaseMentalProtection(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.mentalDefenceBonus += m.amount;
}

export function increaseMentalAttack(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.mentalAttackBonus += m.amount;
}

export function increaseMentalAttackAndProtection(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  increaseMentalAttack(api, m);
  increaseMentalProtection(api, m);
}

export function increaseMaxDroneDifficulty(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.maxDifficulty += m.amount;
  api.model.drones.maxDifficulty = clamp(api.model.drones.maxDifficulty, -1000, 40);
}

export function increaseMaxTimeInDrone(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.maxTimeInside += m.amount;
  api.model.drones.maxTimeInside = clamp(api.model.drones.maxTimeInside, 6, 120);
}

export function increasePostDroneRecoveryTime(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.recoveryTime += m.amount;
  api.model.drones.recoveryTime = clamp(api.model.drones.recoveryTime, 6, 300);
}

export function increaseImplantDifficultyBonus(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.rigging.implantDifficultyBonus += m.amount;
}

export function allowBiowareInstallation(api: EffectModelApi<Sr2020Character>, _: Modifier) {
  api.model.rigging.canWorkWithBioware = true;
}

export function multiplyCooldownCoefficient(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.cooldownCoefficient *= m.amount;
}

export function multiplyDiscourseMongerCooldowns(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  for (const ability of api.model.activeAbilities) {
    if (ability.id.startsWith('dgroup-') || ability.id.startsWith('dm-')) {
      ability.cooldownMinutes = Math.round(ability.cooldownMinutes * m.amount);
    }
  }
}

export function setTransactionAnonymous(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.billing.anonymous = true;
}
