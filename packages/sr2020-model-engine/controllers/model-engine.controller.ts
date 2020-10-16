import { get, HttpErrors, OperationObject, post, requestBody } from '@loopback/rest';
import {
  CharacterCreationRequest,
  Feature,
  kFeatureDescriptor,
  Sr2020Character,
  Sr2020CharacterProcessRequest,
  Sr2020CharacterProcessResponse,
} from '@sr2020/sr2020-common/models/sr2020-character.model';
import { Engine } from '@sr2020/alice-model-engine/engine';
import { inject } from '@loopback/core';
import { AquiredObjects, EmptyModel, Event, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { Location, LocationProcessRequest, LocationProcessResponse } from '@sr2020/sr2020-common/models/location.model';
import { QrCode, QrCodeProcessRequest, QrCodeProcessResponse } from '@sr2020/sr2020-common/models/qr-code.model';
import { ModelEngineService } from '@sr2020/sr2020-common/services/model-engine.service';
import { Empty } from '@sr2020/interface/models/empty.model';
import { initEthic } from '../scripts/character/ethics';
import { createEssenceSystemEffect } from '../scripts/character/essence';
import { AURA_LENGTH } from '../scripts/character/consts';
import { setRaceForModel } from '@sr2020/sr2020-model-engine/scripts/character/races';
import { addFeatureToModel, getAllAvailableFeatures } from '@sr2020/sr2020-model-engine/scripts/character/features';
import { kMaxKarmaOnCreation, kMaxKarmaPerCycle } from '@sr2020/sr2020-model-engine/scripts/character/karma';
import Chance = require('chance');

const chance = new Chance();

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
  async defaultCharacter(@requestBody() req: CharacterCreationRequest): Promise<Sr2020Character> {
    const auraChars: string[] = [];
    for (let i = 0; i < AURA_LENGTH; ++i) auraChars.push(chance.character({ pool: 'abcdefghijklmnopqrstuvwxyz' }));
    const aura = auraChars.join('');

    const result: Sr2020Character = {
      modelId: '',
      name: req.name ?? 'Вася Пупкин',
      metarace: 'meta-norm',
      currentBody: 'physical',
      maxHp: 2,
      timestamp: 0,
      body: 1,
      strength: 1,
      depth: 1,
      intelligence: 1,
      charisma: 1,
      essence: 0,
      mentalAttackBonus: 0,
      mentalDefenceBonus: 0,
      mentalQrId: 0,
      magic: 2,
      resonance: 1,
      hacking: {
        maxTimeAtHost: 15,
        hostEntrySpeed: 5,
        conversionAttack: 5,
        conversionFirewall: 5,
        conversionSleaze: 5,
        conversionDataprocessing: 5,
        fadingResistance: 0,
        biofeedbackResistance: 0,
        adminHostNumber: 3,
        spriteLevel: 0,
        additionalBackdoors: 0,
        backdoorTtl: 120,
        additionalRequests: 0,
        additionalSprites: 0,
        compilationFadingResistance: 0,
        resonanceForControlBonus: 0,
        varianceResistance: 0,
      },
      matrixHp: 1,
      maxTimeInVr: 60,
      magicStats: {
        feedbackMultiplier: 1,
        recoverySpeedMultiplier: 1,
        spiritResistanceMultiplier: 1,
        auraReadingMultiplier: 1,
        auraMarkMultiplier: 1,
        auraMask: 0,
        aura,
        maxPowerBonus: 0,
      },
      healthState: 'healthy',
      cooldownCoefficient: 1.0,
      implantsBodySlots: 2,
      chemo: {
        baseEffectThreshold: 200,
        uberEffectThreshold: 250,
        superEffectThreshold: 300,
        crysisThreshold: 400,
        concentration: {
          argon: 0,
          barium: 0,
          chromium: 0,
          custodium: 0,
          elba: 0,
          iconium: 0,
          iodine: 0,
          junius: 0,
          magnium: 0,
          moscovium: 0,
          opium: 0,
          polonium: 0,
          radium: 0,
          silicon: 0,
          teqgel: 0,
          uranium: 0,
          vampirium: 0,
        },
      },
      drones: {
        maxDifficulty: -1000,
        maxTimeInside: 0,
        recoveryTime: 120,
        medicraftBonus: 2,
        aircraftBonus: 2,
        groundcraftBonus: 2,
        feedbackModifier: 0,
      },
      rigging: {
        implantDifficultyBonus: 0,
        canWorkWithBioware: false,
        implantsBonus: 2,
        repomanBonus: 2,
        tuningBonus: 2,
      },
      billing: {
        anonymous: false,
        stockGainPercentage: 0,
      },
      discounts: {
        weaponsArmor: 1,
        everything: 1,
        ares: 1,
        aztechnology: 1,
        evo: 1,
        horizon: 1,
        mutsuhama: 1,
        neonet1: 1,
        renraku: 1,
        russia: 1,
        saederKrupp: 1,
        shiavase: 1,
        spinradGlobal: 1,
        wuxing: 1,
      },
      essenceDetails: {
        max: 600,
        gap: 0,
        used: 0,
      },
      karma: {
        available: Math.min(req.karma ?? 0, kMaxKarmaOnCreation),
        spent: 0,
        spentOnPassives: 0,
        cycleLimit: kMaxKarmaPerCycle,
      },
      analyzedBody: null,
      spells: [],
      activeAbilities: [],
      passiveAbilities: [],
      implants: [],
      ethic: {
        groups: [],
        trigger: [],
        state: [],
        lockedUntil: 0,
      },
      paused: false,
      history: [],
      modifiers: [
        {
          mID: '_system',
          enabled: true,
          effects: [createEssenceSystemEffect()],
        },
      ],
      timers: [],
    };
    initEthic(result);
    setRaceForModel(result, req.metarace ?? 'meta-norm');
    (req.features ?? []).forEach((f) => addFeatureToModel(result, f));

    return result;
  }

  @get('/character/available_features', {
    summary: `Returns the list of features provided character can buy for karma`,
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: kFeatureDescriptor,
            },
          },
        },
      },
    },
  })
  async availableFeatures(@requestBody() req: Sr2020Character): Promise<Feature[]> {
    return getAllAvailableFeatures(req);
  }

  @post('/location/default', {
    summary: 'Returns default location object.',
    description: 'Returns default location object. Some field can be randomly populated, other will have default "empty" state.',
    responses: {
      '200': {
        content: {
          'application/json': { schema: { 'x-ts-type': Location } },
        },
      },
    },
  })
  async defaultLocation(@requestBody() _: Empty): Promise<Location> {
    const auraChars: string[] = [];
    for (let i = 0; i < AURA_LENGTH; ++i) auraChars.push(chance.character({ pool: 'abcdefghijklmnopqrstuvwxyz' }));
    const aura = auraChars.join('');

    const result: Location = {
      modelId: '',
      timestamp: 0,
      aura,
      spellTraces: [],
      modifiers: [],
      timers: [],
    };
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
