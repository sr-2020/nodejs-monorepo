import { Sr2020CharacterApi } from '@sr2020/interface/models/sr2020-character.model';
import { Event } from '@sr2020/interface/models/alice-model-engine';

export function wound(api: Sr2020CharacterApi, _data: {}, _: Event) {
  api.model.healthState = 'wounded';
  api.sendNotification('Ранение', 'Вы тяжело ранены');
}

export function revive(api: Sr2020CharacterApi, _data: {}, _: Event) {
  api.model.healthState = 'healthy';
  api.sendNotification('Восстановление', 'Вы снова в строю');
}
