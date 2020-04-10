import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Event } from '@loopback/repository';

export function analyzeBody(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: string }, _: Event) {
  const patient: Sr2020Character = api.aquired('Character', data.targetCharacterId);

  api.model.analyzedBody = {
    // TODO(aeremin) Implement
    essence: 666,
    healthState: patient.healthState,
    implants: patient.implants,
  };
}

export function disconnectFromBody(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  api.model.analyzedBody = undefined;
}
