import { post, requestBody, HttpErrors } from '@loopback/rest';
import { DeusExModel, DeusExProcessModelRequest, DeusExProcessModelResponse } from '@sr2020/interface/models/deus-ex-model';
import { Engine } from '@sr2020/alice-model-engine/engine';
import { inject } from '@loopback/core';
import { AquiredObjects } from '@sr2020/interface/models/alice-model-engine';

export class ModelEngineController {
  constructor(@inject(Engine.bindingKey) private _engine: Engine<DeusExModel>) {}

  @post('/process', {
    summary: 'Calculates state of provided model at given timestamp in the future (compared to model timestamp) given some events.',
    description: 'NB: This method is stateless. Caller should handle persistent storing of returned baseModel.',
    responses: {
      '200': {
        description: 'Model processing is successfull. Response will contain calculated base/work model.',
        content: {
          'application/json': { schema: { 'x-ts-type': DeusExProcessModelResponse } },
        },
      },
      '422': {
        description:
          "There were problems with the request body. Either it doesn't conform to schema, or timestamp order is wrong. " +
          'Required order is baseModel.timestamp < event.timestamp (for all events) < timestamp.',
      },
      '500': {
        description:
          'Model processing failed. Typical reasons are unsupported events, invalid event payloads, or exceptions in model scripts.',
      },
    },
  })
  // TODO: Add at least some simple test.
  async process(@requestBody() req: DeusExProcessModelRequest): Promise<DeusExProcessModelResponse> {
    req.events.forEach((event) => {
      if (event.timestamp < req.baseModel.timestamp)
        throw new HttpErrors.UnprocessableEntity(
          `One of the events (${JSON.stringify(event)}) is in the past compared to model timestamp (${req.baseModel.timestamp})`,
        );
    });

    req.events.forEach((event) => {
      if (event.timestamp > req.timestamp)
        throw new HttpErrors.UnprocessableEntity(
          `One of the events (${JSON.stringify(event)}) is in the future compared to calculation timestamp (${req.timestamp})`,
        );
    });

    req.events.push({ eventType: '_', modelId: req.baseModel.modelId, timestamp: req.timestamp });
    // TODO: Support preprocess
    const aquired: AquiredObjects = {};
    const res = this._engine.process(req.baseModel, aquired, req.events);

    // TODO: Also return viewmodels
    if (res.status == 'ok') {
      return { baseModel: res.baseModel, workModel: res.workingModel };
    } else {
      throw new HttpErrors.InternalServerError(`Error during model processing: ${res.error}`);
    }
  }
}
