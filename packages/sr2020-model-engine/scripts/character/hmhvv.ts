import { EventModelApi, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { LocationMixin, MetaRace, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { ActiveAbilityData } from '@alice/sr2020-common/models/common_definitions';
import { healthStateTransition, reviveAbsolute } from '@alice/sr2020-model-engine/scripts/character/death_and_rebirth';
import { consumeChemo } from '@alice/sr2020-model-engine/scripts/character/chemo';

export function vampireBite(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const victim = api.aquired(Sr2020Character, data.targetCharacterId!);
  const essenceAmount = Math.min(200, api.workModel.essenceDetails.gap, victim.essence);
  api.model.essenceDetails.gap -= essenceAmount;
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, bittenEvent, {
    essenceLoss: essenceAmount,
    vampiric: true,
    location: data.location,
  });
}

export function ghoulBite(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const victim = api.aquired(Sr2020Character, data.targetCharacterId!);
  const essenceAmount = Math.min(100, api.workModel.essenceDetails.gap, victim.essence);
  api.model.essenceDetails.gap -= essenceAmount;
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, bittenEvent, {
    essenceLoss: essenceAmount,
    vampiric: false,
    location: data.location,
  });
}

export function bittenEvent(api: EventModelApi<Sr2020Character>, data: { essenceLoss: number; vampiric: boolean } & LocationMixin) {
  if (api.workModel.healthState == 'clinically_dead' || api.workModel.healthState == 'biologically_dead') {
    throw new UserVisibleError('Нельзя кусать мертвого персонажа.');
  }

  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Можно кусать только персонажей в мясном теле.');
  }

  const allowedRaces: MetaRace[] = ['meta-elf', 'meta-ork', 'meta-dwarf', 'meta-norm', 'meta-troll'];
  if (!allowedRaces.includes(api.workModel.metarace)) {
    throw new UserVisibleError('Можно кусать только персонажей метарас эльф, орк, гном, норм, тролль.');
  }

  api.model.essenceDetails.gap += data.essenceLoss;

  if (data.vampiric) {
    consumeChemo(api, { id: 'vampire-saliva', location: data.location });
  } else {
    healthStateTransition(api, 'clinically_dead', data.location);
  }
}

export function gmRespawnHmhvv(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, hmhvvRespawnEvent, data);
}

export function hmhvvRespawnEvent(api: EventModelApi<Sr2020Character>, data: LocationMixin) {
  if (api.workModel.metarace != 'meta-vampire' && api.workModel.metarace != 'meta-ghoul') {
    throw new UserVisibleError('Это работает только на HMHVV');
  }
  reviveAbsolute(api, data);
  api.model.essenceDetails.gap = 920;
}
