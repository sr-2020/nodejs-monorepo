import { EventModelApi } from '@alice/alice-common/models/alice-model-engine';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { ActiveAbilityData } from '@alice/sr2020-common/models/common_definitions';
import { addFeature, addTemporaryPassiveAbility, removeFeature } from '@alice/sr2020-model-engine/scripts/character/features';
import { duration } from 'moment';
import { addTemporaryModifier, modifierFromEffect } from '@alice/sr2020-model-engine/scripts/character/util';
import { increaseMaxMeatHp, increaseMaxTimeInVr } from '@alice/sr2020-model-engine/scripts/character/basic_effects';

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

const kNanohiveAbilitySuffixes = ['shooter', 'health', 'backup', 'vr'];

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
    'Увеличение количества хитов на 2 (максимум 6)',
  );
}

export function nanohiveBackupAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  reduceEssence(api);
  // Do nothing intentionally - the player knows what to do
}

export function nanohiveVrAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  reduceEssence(api);
  addTemporaryModifier(
    api,
    modifierFromEffect(increaseMaxTimeInVr, { amount: 60 }),
    duration(40, 'minutes'),
    'Время пребывания в VR увеличено на час',
  );
}