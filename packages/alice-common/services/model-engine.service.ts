import { ModelProcessRequest, ModelProcessResponse } from '@alice/alice-common/models/process-requests-respose';
import { EmptyModel } from '@alice/alice-common/models/alice-model-engine';

export interface ModelEngineService {
  process<TModel extends EmptyModel>(tmodel: new () => TModel, req: ModelProcessRequest<TModel>): Promise<ModelProcessResponse<TModel>>;
}
