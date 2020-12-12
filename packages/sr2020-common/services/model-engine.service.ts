import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { ModelEngineHttpApiDataSource } from '../datasources/model-engine-http-api.datasource';
import { ModelProcessRequest, ModelProcessResponse } from '@alice/alice-common/models/process-requests-respose';
import { EmptyModel } from '@alice/alice-common/models/alice-model-engine';
import { Empty } from '@alice/alice-common/models/empty.model';
import { QrCode } from '../models/qr-code.model';
import { CharacterCreationRequest, Feature, Sr2020Character } from '../models/sr2020-character.model';
import { Location } from '../models/location.model';
import { ModelEngineService } from '@alice/alice-common/services/model-engine.service';

export interface Sr2020ModelEngineHttpService {
  processCharacter(req: ModelProcessRequest<Sr2020Character>): Promise<ModelProcessResponse<Sr2020Character>>;
  processLocation(req: ModelProcessRequest<Location>): Promise<ModelProcessResponse<Location>>;
  processQr(req: ModelProcessRequest<QrCode>): Promise<ModelProcessResponse<QrCode>>;

  defaultCharacter(req: CharacterCreationRequest): Promise<Sr2020Character>;
  defaultLocation(req: Empty): Promise<Location>;

  availableFeatures(req: Sr2020Character): Promise<Feature[]>;
}

export class Sr2020ModelEngineService implements ModelEngineService {
  constructor(private inner: Sr2020ModelEngineHttpService) {}

  process<TModel extends EmptyModel>(tmodel: { new (): TModel }, req: ModelProcessRequest<TModel>): Promise<ModelProcessResponse<TModel>> {
    if (new tmodel() instanceof Location) return this.inner.processLocation(req as any) as any;
    if (new tmodel() instanceof Sr2020Character) return this.inner.processCharacter(req as any) as any;
    if (new tmodel() instanceof QrCode) return this.inner.processQr(req as any) as any;
    throw new Error(`Unknown model type: ${tmodel.name}`);
  }
}

export class Sr2020ModelEngineHttpServiceProvider implements Provider<Sr2020ModelEngineHttpService> {
  constructor(
    @inject('datasources.ModelEngineHttpApi')
    protected dataSource: ModelEngineHttpApiDataSource = new ModelEngineHttpApiDataSource(),
  ) {}

  async value(): Promise<Sr2020ModelEngineHttpService> {
    return getService<Sr2020ModelEngineHttpService>(this.dataSource);
  }
}

export class Sr2020ModelEngineServiceProvider implements Provider<ModelEngineService> {
  constructor(
    @inject('datasources.ModelEngineHttpApi')
    protected dataSource: ModelEngineHttpApiDataSource = new ModelEngineHttpApiDataSource(),
  ) {}

  async value(): Promise<ModelEngineService> {
    return new Sr2020ModelEngineService(await getService<Sr2020ModelEngineHttpService>(this.dataSource));
  }
}
