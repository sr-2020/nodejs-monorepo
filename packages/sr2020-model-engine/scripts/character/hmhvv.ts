import { EventModelApi, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { ActiveAbilityData } from '@sr2020/sr2020-model-engine/scripts/character/active_abilities';
import { healthStateTransition, reviveAbsolute } from '@sr2020/sr2020-model-engine/scripts/character/death_and_rebirth';

export function vampireBite(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const victim = api.aquired(Sr2020Character, data.targetCharacterId!);
  const essenceAmount = Math.min(200, api.workModel.essenceDetails.gap, victim.essence);
  api.model.essenceDetails.gap -= essenceAmount;
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, bittenEvent, { essenceLoss: essenceAmount, vampiric: true });
}

export function ghoulBite(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const victim = api.aquired(Sr2020Character, data.targetCharacterId!);
  const essenceAmount = Math.min(100, api.workModel.essenceDetails.gap, victim.essence);
  api.model.essenceDetails.gap -= essenceAmount;
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, bittenEvent, { essenceLoss: essenceAmount, vampiric: false });
}

export function bittenEvent(api: EventModelApi<Sr2020Character>, data: { essenceLoss: number; vampiric: boolean }) {
  if (api.workModel.healthState == 'clinically_dead' || api.workModel.healthState == 'biologically_dead') {
    throw new UserVisibleError('Нельзя кусать мертвого персонажа.');
  }
  api.model.essenceDetails.gap += data.essenceLoss;
  healthStateTransition(api, 'clinically_dead');
}

export function gmRespawnHmhvv(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, hmhvvRespawnEvent, {});
}

export function hmhvvRespawnEvent(api: EventModelApi<Sr2020Character>, data: {}) {
  if (api.workModel.metarace != 'meta-hmhvv1' && api.workModel.metarace != 'meta-hmhvv3') {
    throw new UserVisibleError('Это работает только на HMHVV');
  }
  reviveAbsolute(api, {});
  api.model.essenceDetails.gap = 920;
}
