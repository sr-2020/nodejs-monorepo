import { EffectModelApi, EventModelApi } from '@alice/alice-common/models/alice-model-engine';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { DroneQrData, SpiritQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { AddedActiveAbility } from '@alice/sr2020-common/models/sr2020-character.model';
import { modifierFromEffect } from '@alice/sr2020-model-engine/scripts/character/util';

const kDroneIsBrokenModifier = 'drone-is-broken';

export function startUsingDroneOrSpirit(api: EventModelApi<QrCode>, data: {}) {
  typedQrData<DroneQrData | SpiritQrData>(api.model).inUse = true;
}

export function stopUsingDroneOrSpirit(api: EventModelApi<QrCode>, data: { activeAbilities: AddedActiveAbility[]; broken?: boolean }) {
  typedQrData<DroneQrData | SpiritQrData>(api.model).activeAbilities = data.activeAbilities;
  typedQrData<DroneQrData | SpiritQrData>(api.model).inUse = false;
  if (data.broken) {
    api.addModifier({ ...modifierFromEffect(droneIsBroken, {}), mID: kDroneIsBrokenModifier });
  }
}

export function repairDrone(api: EventModelApi<QrCode>, data: {}) {
  api.removeModifier(kDroneIsBrokenModifier);
}

export function droneIsBroken(api: EffectModelApi<QrCode>, data: {}) {
  typedQrData<DroneQrData>(api.model).broken = true;
  api.model.name = api.model.name + ' (сломан)';
}
