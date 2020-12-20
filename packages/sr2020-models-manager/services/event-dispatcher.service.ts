import { Location } from '@alice/sr2020-common/models/location.model';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import type { ModelEngineService } from '@alice/alice-common/services/model-engine.service';
import { GenericEventDispatcherService } from '@alice/alice-models-manager/services/event-dispatcher.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class Sr2020EventDispatcherService extends GenericEventDispatcherService {
  constructor(@Inject('ModelEngineService') modelEngineService: ModelEngineService) {
    super(modelEngineService, [Sr2020Character, Location, QrCode]);
  }
}
