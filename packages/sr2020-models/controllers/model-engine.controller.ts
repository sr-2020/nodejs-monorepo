import { post, requestBody, HttpErrors, OperationObject } from '@loopback/rest';
import {
  Sr2020Character,
  Sr2020CharacterProcessResponse,
  Sr2020CharacterProcessRequest,
} from '@sr2020/interface/models/sr2020-character.model';
import { Engine } from '@sr2020/alice-model-engine/engine';
import { inject } from '@loopback/core';
import { AquiredObjects, EmptyModel, Event, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { LocationProcessRequest, Location, LocationProcessResponse } from '@sr2020/interface/models/location.model';
import { QrCodeProcessRequest, QrCode, QrCodeProcessResponse } from '@sr2020/interface/models/qr-code.model';
import { ModelEngineService } from '@sr2020/interface/services/model-engine.service';
import { Empty } from '@sr2020/interface/models';
import { initEthic } from '../scripts/character/ethics';

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

export class ModelEngineController implements ModelEngineService {
  constructor(
    @inject(Engine.bindingKey + '.Sr2020Character') private _characterEngine: Engine<Sr2020Character>,
    @inject(Engine.bindingKey + '.Location') private _locationEngine: Engine<Location>,
    @inject(Engine.bindingKey + '.QrCode') private _qrCodeEngine: Engine<QrCode>,
  ) {}

  @post('/character/process', spec('character', Sr2020CharacterProcessResponse))
  async processCharacter(@requestBody() req: Sr2020CharacterProcessRequest): Promise<Sr2020CharacterProcessResponse> {
    return this.process(this._characterEngine, req.baseModel, req.events, req.timestamp, req.aquiredObjects);
  }

  @post('/location/process', spec('location', LocationProcessResponse))
  async processLocation(@requestBody() req: LocationProcessRequest): Promise<LocationProcessResponse> {
    return this.process(this._locationEngine, req.baseModel, req.events, req.timestamp, req.aquiredObjects);
  }

  @post('/qr/process', spec('qr', QrCodeProcessResponse))
  async processQr(@requestBody() req: QrCodeProcessRequest): Promise<QrCodeProcessResponse> {
    return this.process(this._qrCodeEngine, req.baseModel, req.events, req.timestamp, req.aquiredObjects);
  }

  @post('/character/default', {
    summary: 'Returns default character object.',
    description: 'Returns default character object. Some field can be randomly populated, other will have default "empty" state.',
    responses: {
      '200': {
        content: {
          'application/json': { schema: { 'x-ts-type': Sr2020Character } },
        },
      },
    },
  })
  async defaultCharacter(@requestBody() _: Empty): Promise<Sr2020Character> {
    const result: Sr2020Character = {
      modelId: '',
      gender: 'мужчина',
      metarace: 'meta-norm',
      maxHp: 3,
      timestamp: 0,
      body: 3,
      intelligence: 3,
      charisma: 3,
      mentalAttackBonus: 0,
      mentalDefenceBonus: 0,
      mentalQrId: 0,
      magic: 5,
      resonance: 3,
      maxTimeAtHost: 15,
      hostEntrySpeed: 5,
      conversionAttack: 5,
      conversionFirewall: 5,
      conversionSleaze: 5,
      conversionDataprocessing: 5,
      fadingResistance: 0,
      biofeedbackResistance: 0,
      matrixHp: 1,
      adminHostNumber: 3,
      spriteLevel: 0,
      maxTimeInVr: 30,
      magicFeedbackReduction: 0,
      magicRecoverySpeed: 1,
      spiritResistanceMultiplier: 1,
      auraReadingMultiplier: 1,
      auraMarkMultiplier: 1,
      auraMask: 0,
      magicPowerBonus: 0,
      magicAura: 'aaaabbbbccccddddeeee',
      healthState: 'healthy',
      ethicGroupMaxSize: 0,
      chemoBodyDetectableThreshold: 9000,
      chemoPillDetectableThreshold: 9000,
      chemoBaseEffectThreshold: 50,
      chemoSuperEffectThreshold: 70,
      chemoCrysisThreshold: 120,
      stockGainPercentage: 0,
      discounts: {
        weaponsArmor: 0,
        drones: 0,
        chemo: 0,
        implants: 0,
        magicStuff: 0,
      },
      spells: [],
      activeAbilities: [],
      passiveAbilities: [],
      implants: [],
      ethicTrigger: [],
      ethicState: [],
      ethicLockedUntil: 0,
      history: [],
      modifiers: [],
      timers: {},
    };
    initEthic(result);
    return result;
  }

  async process<T extends EmptyModel>(engine: Engine<T>, baseModel: T, events: Event[], timestamp: number, aquired: AquiredObjects) {
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
    const res = engine.process(baseModel, aquired, events);

    // TODO: Also return viewmodels
    if (res.status == 'ok') {
      return {
        baseModel: res.baseModel,
        workModel: res.workingModel,
        outboundEvents: res.outboundEvents,
        notifications: res.notifications,
        pubSubNotifications: res.pubSubNotifications,
        tableResponse: res.tableResponse,
      };
    } else {
      if (res.error instanceof UserVisibleError) {
        throw new HttpErrors.BadRequest(`${res.error.message}`);
      } else {
        throw new HttpErrors.InternalServerError(`Error during model processing: ${res.error}`);
      }
    }
  }
}
