// Basic effects adjusting value of some characteristic.
import { clamp } from 'lodash';

import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { Effect, EffectModelApi, Modifier } from '@alice/alice-common/models/alice-model-engine';
import { ModifierWithAmount } from '@alice/sr2020-model-engine/scripts/character/typedefs';
import { getAllActiveAbilities } from '@alice/sr2020-model-engine/scripts/character/library_registrator';

export function increaseMaxMeatHp(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  if (api.model.currentBody != 'physical') return;

  api.model.maxHp += m.amount;
  // Checking for healthState here to prevent infinite loop
  // (sending event leads to effect being re-applied leading to event send)
  if (api.model.maxHp == 0 && api.model.healthState != 'clinically_dead') {
    // Sending as string to prevent circular dependency.
    api.sendSelfEvent('clinicalDeath0MaxHp', {});
  }
}

export function createClampingEffect(): Effect {
  return {
    enabled: true,
    type: 'normal',
    handler: clampAttributes.name,
  };
}

export function clampAttributes(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.maxHp = clamp(api.model.maxHp, 0, 6);
  api.model.charisma = clamp(api.model.charisma, 0, 8);
  api.model.intelligence = clamp(api.model.intelligence, 0, 8);
  api.model.body = clamp(api.model.body, 0, 8);
  api.model.strength = clamp(api.model.strength, 0, 8);
  api.model.depth = clamp(api.model.depth, 0, 8);
  api.model.resonance = clamp(api.model.resonance, 0, 8);
  api.model.hacking.resonanceForControlBonus = clamp(api.model.hacking.resonanceForControlBonus, 0, 3);
  api.model.hacking.maxTimeAtHost = clamp(api.model.hacking.maxTimeAtHost, 15, 60);
  api.model.hacking.hostEntrySpeed = clamp(api.model.hacking.hostEntrySpeed, 5, 20);
  api.model.hacking.conversionAttack = clamp(api.model.hacking.conversionAttack, 5, 20);
  api.model.hacking.conversionFirewall = clamp(api.model.hacking.conversionFirewall, 5, 20);
  api.model.hacking.conversionSleaze = clamp(api.model.hacking.conversionSleaze, 5, 20);
  api.model.hacking.conversionDataprocessing = clamp(api.model.hacking.conversionDataprocessing, 5, 20);
  api.model.hacking.fadingResistance = clamp(api.model.hacking.fadingResistance, 1, 50);
  api.model.hacking.compilationFadingResistance = clamp(api.model.hacking.compilationFadingResistance, 0, 100);
  api.model.hacking.varianceResistance = clamp(api.model.hacking.varianceResistance, 0, 100);
  api.model.hacking.biofeedbackResistance = clamp(api.model.hacking.biofeedbackResistance, 0, 50);
  api.model.matrixHp = clamp(api.model.matrixHp, 1, 6);
  api.model.hacking.adminHostNumber = clamp(api.model.hacking.adminHostNumber, 3, 10);
  api.model.hacking.additionalBackdoors = clamp(api.model.hacking.additionalBackdoors, 0, 5);
  api.model.hacking.backdoorTtl = clamp(api.model.hacking.backdoorTtl, 0, 9000);
  api.model.hacking.additionalRequests = clamp(api.model.hacking.additionalRequests, 0, 5);
  api.model.hacking.spriteLevel = clamp(api.model.hacking.spriteLevel, 0, 3);
  api.model.hacking.additionalSprites = clamp(api.model.hacking.additionalSprites, 0, 5);
  api.model.hacking.fading = clamp(api.model.hacking.fading, 0, 2000);
  api.model.maxTimeInVr = clamp(api.model.maxTimeInVr, 30, 9000);
  api.model.magicStats.spiritResistanceMultiplier = clamp(api.model.magicStats.spiritResistanceMultiplier, 0.2, 2.0);
  api.model.magicStats.auraMarkMultiplier = clamp(api.model.magicStats.auraMarkMultiplier, 0.1, 2.0);
  api.model.magicStats.auraReadingMultiplier = clamp(api.model.magicStats.auraReadingMultiplier, 0.1, 2.0);
  api.model.magicStats.auraMask = clamp(api.model.magicStats.auraMask, 0, 9000);
  api.model.chemo.baseEffectThreshold = clamp(api.model.chemo.baseEffectThreshold, 0, 9000);
  api.model.chemo.uberEffectThreshold = clamp(api.model.chemo.uberEffectThreshold, 0, 9000);
  api.model.chemo.superEffectThreshold = clamp(api.model.chemo.superEffectThreshold, 0, 9000);
  api.model.chemo.crysisThreshold = clamp(api.model.chemo.crysisThreshold, 0, 9000);
  api.model.billing.stockGainPercentage = clamp(api.model.billing.stockGainPercentage, 0, 50);
  api.model.drones.maxDifficulty = clamp(api.model.drones.maxDifficulty, -1000, 40);
  api.model.drones.maxTimeInside = clamp(api.model.drones.maxTimeInside, 6, 120);
  api.model.drones.recoveryTime = clamp(api.model.drones.recoveryTime, 6, 300);
  api.model.implantsBodySlots = clamp(api.model.implantsBodySlots, 0, 10);
}

export function createCooldownCalculatorEffect(): Effect {
  return {
    enabled: true,
    type: 'normal',
    handler: calculateCooldowns.name,
  };
}

export function calculateCooldowns(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  for (const ability of api.model.activeAbilities) {
    const libraryAbility = getAllActiveAbilities().get(ability.id);
    if (libraryAbility) {
      ability.cooldownMinutes = libraryAbility.cooldownMinutes(api.model) * api.model.cooldownCoefficient;
    }
  }
}

export function increaseMaxEctoplasmHp(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  if (api.model.currentBody != 'ectoplasm') return;

  api.model.maxHp += m.amount;
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
}

export function increaseIntelligence(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.intelligence += m.amount;
}

export function increaseBody(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.body += m.amount;
}

export function increaseStrength(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.strength += m.amount;
}

export function increaseDepth(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.depth += m.amount;
}

export function increaseResonance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.resonance += m.amount;
}

export function increaseMagic(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magic += m.amount;
}

export function multiplyMagicFeedbackMultiplier(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.feedbackMultiplier *= m.amount;
}

export function increaseMaxMagicPower(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.maxPowerBonus += m.amount;
}

export function increaseResonanceForControl(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.resonanceForControlBonus += m.amount;
}

export function increaseMaxTimeAtHost(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.maxTimeAtHost += m.amount;
}

export function increaseHostEntrySpeed(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.hostEntrySpeed += m.amount;
}

export function increaseConversionAttack(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.conversionAttack += m.amount;
}

export function increaseConversionFirewall(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.conversionFirewall += m.amount;
}

export function increaseConversionSleaze(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.conversionSleaze += m.amount;
}

export function increaseConversionDataprocessing(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.conversionDataprocessing += m.amount;
}

export function increaseFadingResistance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.fadingResistance += m.amount;
}

export function increaseCompilationFadingResistance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.compilationFadingResistance += m.amount;
}

export function increaseFadingDecrease(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.fadingDecrease += m.amount;
}

export function increaseVarianceResistance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.varianceResistance += m.amount;
}

export function increaseBiofeedbackResistance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.biofeedbackResistance += m.amount;
}

export function increaseMatrixHp(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.matrixHp += m.amount;
}

export function increaseAdminHostNumber(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.adminHostNumber += m.amount;
}

export function increaseBackdoors(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.additionalBackdoors += m.amount;
}

export function increaseBackdoorTtl(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.backdoorTtl += m.amount;
}

export function increaseControlRequests(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.additionalRequests += m.amount;
}

export function increaseSpriteLevel(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.spriteLevel += m.amount;
}

export function increaseSpriteCount(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.hacking.additionalSprites += m.amount;
}

export function increaseMaxTimeInVr(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.maxTimeInVr += m.amount;
}

export function muliplyMagicRecoverySpeed(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.recoverySpeedMultiplier *= m.amount;
}

export function multiplySpiritResistanceMultiplier(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.spiritResistanceMultiplier *= m.amount;
}

export function increaseAuraMarkMultiplier(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.auraMarkMultiplier += m.amount;
}

export function increaseAuraReadingMultiplier(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.auraReadingMultiplier += m.amount;
}

export function increaseAuraMask(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magicStats.auraMask += m.amount;
}

export function increaseСhemoBaseEffectThreshold(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.chemo.baseEffectThreshold += m.amount;
}

export function increaseСhemoUberEffectThreshold(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.chemo.uberEffectThreshold += m.amount;
}

export function increaseСhemoSuperEffectThreshold(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.chemo.superEffectThreshold += m.amount;
}

export function increaseСhemoCrysisThreshold(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.chemo.crysisThreshold += m.amount;
}

export function increaseStockGainPercentage(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.billing.stockGainPercentage += m.amount;
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
}

export function increaseAircraftBonus(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.aircraftBonus += m.amount;
}

export function increaseMedicraftBonus(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.medicraftBonus += m.amount;
}

export function increaseAutodocBonus(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.autodocBonus += m.amount;
}

export function increaseGroundcraftBonus(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.groundcraftBonus += m.amount;
}

export function increaseDroneCrafts(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  increaseAircraftBonus(api, m);
  increaseMedicraftBonus(api, m);
  increaseGroundcraftBonus(api, m);
}

export function increaseMaxTimeInDrone(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.maxTimeInside += m.amount;
}

export function increasePostDroneRecoveryTime(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.recoveryTime += m.amount;
}

export function increaseDroneFeedback(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.feedbackModifier += m.amount;
}

export function increaseImplantsBonus(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.rigging.implantsBonus += m.amount;
}

export function increaseRecoverySkill(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.drones.recoverySkill += m.amount;
}

export function increaseRepomanBonus(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.rigging.repomanBonus += m.amount;
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

export function increaseImplantsSlots(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.implantsBodySlots += m.amount;
}

export function unlockAutodockScreen(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.screens.autodoc = true;
}

export function unlockAutodockImplantInstall(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.screens.autodocImplantInstall = true;
}

export function unlockAutodockImplantRemoval(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.screens.autodocImplantRemoval = true;
}

export function setImplantsRemovalResistance(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.implantsRemovalResistance = Math.max(api.model.implantsRemovalResistance, m.amount);
}

export function decreaseChemoSensitivity(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.chemo.sensitivity -= m.amount;
}

export function increaseMaxEssenceEffect(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.essenceDetails.max += m.amount;
}
