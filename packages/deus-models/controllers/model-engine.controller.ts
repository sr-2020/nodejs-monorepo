import { post, requestBody, HttpErrors } from '@loopback/rest';
import { DeusExModel, DeusExProcessModelRequest, DeusExProcessModelResponse } from '@sr2020/interface/models/deus-ex-model';
import { Engine } from '@sr2020/alice-model-engine/engine';
import { inject } from '@loopback/core';
import { AquiredObjects } from '@sr2020/interface/models/alice-model-engine';

export class ModelEngineController {
  constructor(@inject(Engine.bindingKey) private _engine: Engine<DeusExModel>) {}

  @post('/process', {
    // TODO: Document failure modes
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/json': { schema: { 'x-ts-type': DeusExProcessModelResponse } },
        },
      },
    },
  })
  // TODO: Add at least some simple test.
  async process(@requestBody() req: DeusExProcessModelRequest): Promise<DeusExProcessModelResponse> {
    // TODO: Valdate timestamp order
    req.events.push({ eventType: '_', modelId: req.baseModel.modelId, timestamp: req.timestamp });
    // TODO: Support preprocess
    const aquired: AquiredObjects = {};
    const res = this._engine.process(req.baseModel, aquired, req.events);

    // TODO: Better success validation
    // TODO: Also return viewmodels
    if (res.status == 'ok') {
      return { baseModel: res.baseModel, workModel: res.workingModel };
    } else {
      throw new HttpErrors.BadRequest('Не шмогла');
    }
  }
}
