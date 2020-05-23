import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { ActiveAbilityData } from '@sr2020/sr2020-model-engine/scripts/character/active_abilities';
import { addFeature, addTemporaryPassiveAbility, removeFeature } from '@sr2020/sr2020-model-engine/scripts/character/features';
import { duration } from 'moment';
import { addTemporaryModifier, modifierFromEffect } from '@sr2020/sr2020-model-engine/scripts/character/util';
import { increaseMaxMeatHp } from '@sr2020/sr2020-model-engine/scripts/character/basic_effects';

function reduceEssence(api: EventModelApi<Sr2020Character>) {
  const price = Math.min(5, api.workModel.essence);
  api.model.essenceDetails.gap += price;
}

export function onKokkoroNanohiveInstall(api: EventModelApi<Sr2020Character>, data: never) {
  onNanohiveInstall(api, 'kokkoro');
}

export function onKokkoroNanohiveRemove(api: EventModelApi<Sr2020Character>, data: never) {
  onNanohiveRemove(api, 'kokkoro');
}

export function onKoshcgheiNanohiveInstall(api: EventModelApi<Sr2020Character>, data: never) {
  onNanohiveInstall(api, 'koshcghei');
}

export function onKoshcgheiNanohiveRemove(api: EventModelApi<Sr2020Character>, data: never) {
  onNanohiveRemove(api, 'koshcghei');
}

export function onHorizonNanohiveInstall(api: EventModelApi<Sr2020Character>, data: never) {
  onNanohiveInstall(api, 'horizon');
}

export function onHorizonNanohiveRemove(api: EventModelApi<Sr2020Character>, data: never) {
  onNanohiveRemove(api, 'horizon');
}

export function onBadassNanohiveInstall(api: EventModelApi<Sr2020Character>, data: never) {
  onNanohiveInstall(api, 'badass');
}

export function onBadassNanohiveRemove(api: EventModelApi<Sr2020Character>, data: never) {
  onNanohiveRemove(api, 'badass');
}

type AiId = 'kokkoro' | 'koshcghei' | 'horizon' | 'badass';

const kNanohiveAbilitySuffixes = ['armor', 'shooter', 'health', 'backup'];

function onNanohiveInstall(api: EventModelApi<Sr2020Character>, aiId: AiId) {
  for (const suffix of kNanohiveAbilitySuffixes) {
    addFeature(api, { id: `${aiId}-${suffix}` });
  }
}

function onNanohiveRemove(api: EventModelApi<Sr2020Character>, aiId: AiId) {
  for (const suffix of kNanohiveAbilitySuffixes) {
    removeFeature(api, { id: `${aiId}-${suffix}` });
  }
}

export function nanohiveArmorAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  reduceEssence(api);
  addTemporaryPassiveAbility(api, 'stone-skin-effect', duration(15, 'minutes'));
}

export function nanohiveShooterAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  reduceEssence(api);
  addTemporaryPassiveAbility(api, 'automatic-weapons-unlock', duration(15, 'minutes'));
}

export function nanohiveHealhAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  reduceEssence(api);
  addTemporaryModifier(
    api,
    modifierFromEffect(increaseMaxMeatHp, { amount: 2 }),
    duration(15, 'minutes'),
    'Увеличение количества хитов на 2',
  );
}

export function nanohiveBackupAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  reduceEssence(api);
  // Do nothing intentionally - the player knows what to do
}
