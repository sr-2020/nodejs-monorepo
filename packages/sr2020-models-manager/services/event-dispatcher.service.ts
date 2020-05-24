import { inject, Provider } from '@loopback/core';
import { Location } from '@sr2020/interface/models/location.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { EventDispatcherService, EventDispatcherServiceImpl } from '@sr2020/alice-models-manager/services/event-dispatcher.service';

export class EventDispatcherServiceProvider implements Provider<EventDispatcherService> {
  constructor(
    @inject('services.ModelEngineService')
    private _modelEngineService: ModelEngineService,
  ) {}

  value(): EventDispatcherService {
    return new EventDispatcherServiceImpl(this._modelEngineService, [Sr2020Character, Location, QrCode]);
  }
}
