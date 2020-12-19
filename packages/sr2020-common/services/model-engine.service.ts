import { ModelProcessRequest, ModelProcessResponse } from '@alice/alice-common/models/process-requests-respose';
import { EmptyModel } from '@alice/alice-common/models/alice-model-engine';
import { Empty } from '@alice/alice-common/models/empty.model';
import { QrCode } from '../models/qr-code.model';
import { CharacterCreationRequest, Feature, Sr2020Character } from '../models/sr2020-character.model';
import { Location } from '../models/location.model';
import { ModelEngineService } from '@alice/alice-common/services/model-engine.service';
import { HttpService, Injectable } from '@nestjs/common';

export interface Sr2020ModelEngineHttpService {
  processCharacter(req: ModelProcessRequest<Sr2020Character>): Promise<ModelProcessResponse<Sr2020Character>>;
  processLocation(req: ModelProcessRequest<Location>): Promise<ModelProcessResponse<Location>>;
  processQr(req: ModelProcessRequest<QrCode>): Promise<ModelProcessResponse<QrCode>>;

  defaultCharacter(req: CharacterCreationRequest): Promise<Sr2020Character>;
  defaultLocation(req: Empty): Promise<Location>;

  availableFeatures(req: Sr2020Character): Promise<Feature[]>;
}

@Injectable()
export class Sr2020ModelEngineService implements ModelEngineService {
  constructor(private inner: Sr2020ModelEngineHttpService) {}

  process<TModel extends EmptyModel>(tmodel: { new (): TModel }, req: ModelProcessRequest<TModel>): Promise<ModelProcessResponse<TModel>> {
    if (new tmodel() instanceof Location) return this.inner.processLocation(req as any) as any;
    if (new tmodel() instanceof Sr2020Character) return this.inner.processCharacter(req as any) as any;
    if (new tmodel() instanceof QrCode) return this.inner.processQr(req as any) as any;
    throw new Error(`Unknown model type: ${tmodel.name}`);
  }
}

@Injectable()
export class Sr2020ModelEngineHttpServiceRemote implements Sr2020ModelEngineHttpService {
  readonly baseURL: string = process.env.MODEL_ENGINE_URL ?? 'http://model-engine';
  constructor(private httpService: HttpService) {}

  async defaultCharacter(req: CharacterCreationRequest): Promise<Sr2020Character> {
    const response = await this.httpService.post<Sr2020Character>(`${this.baseURL}/character/default`, req).toPromise();
    return response.data;
  }

  async defaultLocation(req: Empty): Promise<Location> {
    const response = await this.httpService.post<Location>(`${this.baseURL}/location/default`, req).toPromise();
    return response.data;
  }

  async processCharacter(req: ModelProcessRequest<Sr2020Character>): Promise<ModelProcessResponse<Sr2020Character>> {
    const response = await this.httpService
      .post<ModelProcessResponse<Sr2020Character>>(`${this.baseURL}/character/process`, req)
      .toPromise();
    return response.data;
  }

  async processLocation(req: ModelProcessRequest<Location>): Promise<ModelProcessResponse<Location>> {
    const response = await this.httpService.post<ModelProcessResponse<Location>>(`${this.baseURL}/location/process`, req).toPromise();
    return response.data;
  }

  async processQr(req: ModelProcessRequest<QrCode>): Promise<ModelProcessResponse<QrCode>> {
    const response = await this.httpService.post<ModelProcessResponse<QrCode>>(`${this.baseURL}/qr/process`, req).toPromise();
    return response.data;
  }

  async availableFeatures(req: Sr2020Character): Promise<Feature[]> {
    const response = await this.httpService
      .request<Feature[]>({ url: `${this.baseURL}/character/available_features`, method: 'GET', data: req })
      .toPromise();
    return response.data;
  }
}
