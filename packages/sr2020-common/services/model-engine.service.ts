import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { ModelEngineHttpApiDataSource } from '../datasources/model-engine-http-api.datasource';
import { ModelProcessRequest, ModelProcessResponse } from '@alice/alice-common/models/process-requests-respose';
import { EmptyModel } from '@alice/alice-common/models/alice-model-engine';
import { Empty } from '@alice/alice-common/models/empty.model';
import { QrCode } from '../models/qr-code.model';
import { CharacterCreationRequest, Feature, Sr2020Character } from '../models/sr2020-character.model';
import { Location } from '../models/location.model';

export interface ModelEngineService {
  processCharacter(req: ModelProcessRequest<Sr2020Character>): Promise<ModelProcessResponse<Sr2020Character>>;
  processLocation(req: ModelProcessRequest<Location>): Promise<ModelProcessResponse<Location>>;
  processQr(req: ModelProcessRequest<QrCode>): Promise<ModelProcessResponse<QrCode>>;

  defaultCharacter(req: CharacterCreationRequest): Promise<Sr2020Character>;
  defaultLocation(req: Empty): Promise<Location>;

  availableFeatures(req: Sr2020Character): Promise<Feature[]>;
}

export class ModelEngineServiceProvider implements Provider<ModelEngineService> {
  constructor(
    @inject('datasources.ModelEngineHttpApi')
    protected dataSource: ModelEngineHttpApiDataSource = new ModelEngineHttpApiDataSource(),
  ) {}

  value(): Promise<ModelEngineService> {
    return getService(this.dataSource);
  }
}

export function processAny<TModel extends EmptyModel>(
  tmodel: new () => TModel,
  s: ModelEngineService,
  req: ModelProcessRequest<TModel>,
): Promise<ModelProcessResponse<TModel>> {
  if (new tmodel() instanceof Location) return s.processLocation(req as any) as any;
  if (new tmodel() instanceof Sr2020Character) return s.processCharacter(req as any) as any;
  if (new tmodel() instanceof QrCode) return s.processQr(req as any) as any;
  throw new Error(`Unknown model type: ${tmodel.name}`);
}
