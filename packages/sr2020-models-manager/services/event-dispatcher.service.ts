import { inject, Provider } from '@loopback/core';
import { Location } from '@alice/sr2020-common/models/location.model';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { ModelEngineService } from '@alice/alice-common/services/model-engine.service';
import { EventDispatcherService, GenericEventDispatcherService } from '@alice/alice-models-manager/services/event-dispatcher.service';

export class EventDispatcherServiceProvider implements Provider<EventDispatcherService> {
  constructor(
    @inject('services.ModelEngineService')
    private _modelEngineService: ModelEngineService,
  ) {}

  value(): EventDispatcherService {
    return new GenericEventDispatcherService(this._modelEngineService, [Sr2020Character, Location, QrCode]);
  }
}
