import { post, requestBody, HttpErrors, OperationObject } from '@loopback/rest';
import {
  Sr2020Character,
  Sr2020CharacterProcessResponse,
  Sr2020CharacterProcessRequest,
} from '@sr2020/interface/models/sr2020-character.model';
import { Engine } from '@sr2020/alice-model-engine/engine';
import { inject } from '@loopback/core';
import { AquiredObjects, EmptyModel, Event } from '@sr2020/interface/models/alice-model-engine';
import { LocationProcessRequest, Location, LocationProcessResponse } from '@sr2020/interface/models/location.model';

function spec(modelType: string, responseType: any): OperationObject {
  return {
    summary: `Calculates state of provided ${modelType} model at given timestamp in the future (compared to model timestamp) given some events.`,
    description: 'NB: This method is stateless. Caller should handle persistent storing of returned baseModel.',
    responses: {
      '200': {
        description: 'Model processing is successfull. Response will contain calculated base/work model.',
        content: {
          'application/json': { schema: { 'x-ts-type': responseType } },
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
  };
}

export class ModelEngineController {
  constructor(
    @inject(Engine.bindingKey + '.Sr2020Character') private _characterEngine: Engine<Sr2020Character>,
    @inject(Engine.bindingKey + '.Location') private _locationEngine: Engine<Location>,
  ) {}

  @post('/character/process', spec('character', Sr2020CharacterProcessResponse))
  async processCharacter(@requestBody() req: Sr2020CharacterProcessRequest): Promise<Sr2020CharacterProcessResponse> {
    return this.process(this._characterEngine, req.baseModel, req.events, req.timestamp);
  }

  @post('/location/process', spec('location', LocationProcessResponse))
  async processLocation(@requestBody() req: LocationProcessRequest): Promise<LocationProcessResponse> {
    return this.process(this._locationEngine, req.baseModel, req.events, req.timestamp);
  }

  async process<T extends EmptyModel>(engine: Engine<T>, baseModel: T, events: Event[], timestamp: number) {
    events.forEach((event) => {
      if (event.timestamp < baseModel.timestamp)
        throw new HttpErrors.UnprocessableEntity(
          `One of the events (${JSON.stringify(event)}) is in the past compared to model timestamp (${baseModel.timestamp})`,
        );
    });

    events.forEach((event) => {
      if (event.timestamp > timestamp)
        throw new HttpErrors.UnprocessableEntity(
          `One of the events (${JSON.stringify(event)}) is in the future compared to calculation timestamp (${timestamp})`,
        );
    });

    if (timestamp < baseModel.timestamp) {
      throw new HttpErrors.UnprocessableEntity(
        `Model is is in the future (t = ${baseModel.timestamp} compared to calculation timestamp (${timestamp})`,
      );
    }

    events.push({ eventType: '_', modelId: baseModel.modelId, timestamp: timestamp });
    // TODO: Support preprocess
    const aquired: AquiredObjects = {};
    const res = engine.process(baseModel, aquired, events);

    // TODO: Also return viewmodels
    if (res.status == 'ok') {
      return { baseModel: res.baseModel, workModel: res.workingModel, outboundEvents: res.outboundEvents };
    } else {
      throw new HttpErrors.InternalServerError(`Error during model processing: ${res.error}`);
    }
  }
}
