import {
  CharacterCreationRequest,
  Feature,
  Sr2020Character,
  Sr2020CharacterProcessRequest,
  Sr2020CharacterProcessResponse,
} from '@alice/sr2020-common/models/sr2020-character.model';
import { Engine } from '@alice/alice-model-engine/engine';
import { AquiredObjects, EmptyModel, Event, Modifier, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { Location, LocationProcessRequest, LocationProcessResponse } from '@alice/sr2020-common/models/location.model';
import { QrCode, QrCodeProcessRequest, QrCodeProcessResponse } from '@alice/sr2020-common/models/qr-code.model';
import { Empty } from '@alice/alice-common/models/empty.model';
import { initEthic } from '../scripts/character/ethics';
import { createEssenceSystemEffect } from '../scripts/character/essence';
import { AURA_LENGTH } from '../scripts/character/consts';
import { setRaceForModel } from '@alice/sr2020-model-engine/scripts/character/races';
import { addFeatureToModel, getAllAvailableFeatures } from '@alice/sr2020-model-engine/scripts/character/features';
import { addKarmaGivingTimer, kMaxKarmaPerCycle } from '@alice/sr2020-model-engine/scripts/character/karma';
import { createJackedInEffect } from '@alice/sr2020-model-engine/scripts/character/hackers';
import { templateSettings } from 'lodash';
import * as Chance from 'chance';
import { Sr2020ModelEngineHttpService } from '@alice/sr2020-common/services/model-engine.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createClampingEffect, createCooldownCalculatorEffect } from '@alice/sr2020-model-engine/scripts/character/basic_effects';
import { addFadingDecreaseTimer } from '@alice/sr2020-model-engine/scripts/character/technomancers';

const chance = new Chance();

function PerModelApiResponse<T extends {}>(modelName: string, model: new () => T) {
  return (target: unknown, name: string, descriptor: unknown) => {
    ApiOperation({
      summary: `Calculates state of provided ${modelName} model at given timestamp in the future (compared to model timestamp) given some events.`,
      description: 'NB: This method is stateless. Caller should handle persistent storing of returned baseModel.',
    })(target, name, descriptor);
    ApiResponse({
      status: 200,
      description: 'Model processing is successful. Response will contain calculated base/work model.',
      type: model,
    })(target, name, descriptor);
    ApiResponse({
      status: 422,
      description:
        "There were problems with the request body. Either it doesn't conform to schema, or timestamp order is wrong. " +
        'Required order is baseModel.timestamp < event.timestamp (for all events) < timestamp.',
    })(target, name, descriptor);
    ApiResponse({
      status: 500,
      description:
        'Model processing failed. Typical reasons are unsupported events, invalid event payloads, or exceptions in model scripts.',
    })(target, name, descriptor);
  };
}

@Controller()
@ApiTags('Model Engine')
export class ModelEngineController implements Sr2020ModelEngineHttpService {
  constructor(
    @Inject(Engine.bindingKey + '.Sr2020Character') private _characterEngine: Engine<Sr2020Character>,
    @Inject(Engine.bindingKey + '.Location') private _locationEngine: Engine<Location>,
    @Inject(Engine.bindingKey + '.QrCode') private _qrCodeEngine: Engine<QrCode>,
  ) {
    // Needed to allow {{ variableName }} substitutions in ability descriptions.
    templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  }

  @Post('/character/process')
  @PerModelApiResponse('character', Sr2020CharacterProcessResponse)
  async processCharacter(@Body() req: Sr2020CharacterProcessRequest): Promise<Sr2020CharacterProcessResponse> {
    return this.process(this._characterEngine, req.baseModel, req.events, req.timestamp, req.aquiredObjects);
  }

  @Post('/location/process')
  @PerModelApiResponse('location', LocationProcessResponse)
  async processLocation(@Body() req: LocationProcessRequest): Promise<LocationProcessResponse> {
    return this.process(this._locationEngine, req.baseModel, req.events, req.timestamp, req.aquiredObjects);
  }

  @Post('/qr/process')
  @PerModelApiResponse('qr', QrCodeProcessResponse)
  async processQr(@Body() req: QrCodeProcessRequest): Promise<QrCodeProcessResponse> {
    return this.process(this._qrCodeEngine, req.baseModel, req.events, req.timestamp, req.aquiredObjects);
  }

  @Post('/character/default')
  @ApiOperation({
    summary: 'Returns default character object.',
    description: 'Returns default character object. Some field can be randomly populated, other will have default "empty" state.',
  })
  @ApiResponse({ status: 200, type: Sr2020Character })
  async defaultCharacter(@Body() req: CharacterCreationRequest): Promise<Sr2020Character> {
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
      magic: 1,
      resonance: 1,
      hacking: {
        maxTimeAtHost: 30,
        hostEntrySpeed: 8,
        conversionAttack: 0,
        conversionFirewall: 0,
        conversionSleaze: 0,
        conversionDataprocessing: 0,
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
        jackedIn: false,
        fading: 0,
        fadingDecrease: 0,
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
      victimCoefficient: 1,
      participantCoefficient: 1,
      implantsBodySlots: 2,
      implantsRemovalResistance: 0,
      chemo: {
        baseEffectThreshold: 200,
        uberEffectThreshold: 250,
        superEffectThreshold: 300,
        crysisThreshold: 400,
        sensitivity: 280,
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
        autodocBonus: 2,
        aircraftBonus: 2,
        groundcraftBonus: 2,
        feedbackModifier: 0,
        recoverySkill: 0,
      },
      rigging: {
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
      },
      essenceDetails: {
        max: 600,
        gap: 0,
        used: 0,
      },
      karma: {
        available: req.karma ?? 0,
        spent: 0,
        spentOnPassives: 0,
        cycleLimit: kMaxKarmaPerCycle,
      },
      screens: {
        billing: true,
        spellbook: true,
        activeAbilities: true,
        passiveAbilities: true,
        karma: true,
        implants: true,
        autodoc: false,
        autodocWoundHeal: true,
        autodocImplantInstall: false,
        autodocImplantRemoval: false,
        ethics: false,
        location: false,
        wound: true,
        scanQr: true,
        scoring: false,
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
      history: [],
      chemoConsumptionRecords: [],
      modifiers: [
        {
          mID: '_system',
          priority: Modifier.kPriorityEarly,
          enabled: true,
          effects: [createEssenceSystemEffect(), createJackedInEffect()],
        },
        {
          mID: '_limiter',
          priority: Modifier.kPriorityLatest,
          enabled: true,
          effects: [createClampingEffect()],
        },
        {
          mID: '_cooldown_calculator',
          priority: Modifier.kPriorityLatest,
          enabled: true,
          effects: [createCooldownCalculatorEffect()],
        },
      ],
      timers: [],
    };
    initEthic(result);
    setRaceForModel(result, req.metarace ?? 'meta-norm');
    addKarmaGivingTimer(result);
    addFadingDecreaseTimer(result);
    (req.features ?? []).forEach((f) => addFeatureToModel(result, f));

    return result;
  }

  @Get('/character/available_features')
  @ApiOperation({
    summary: 'Returns the list of features provided character can buy for karma',
  })
  @ApiResponse({ status: 200 })
  async availableFeatures(@Body() req: Sr2020Character): Promise<Feature[]> {
    return getAllAvailableFeatures(req);
  }

  @Post('/location/default')
  @ApiOperation({
    summary: 'Returns default location object.',
    description: 'Returns default location object. Some field can be randomly populated, other will have default "empty" state.',
  })
  @ApiResponse({ status: 200, type: Location })
  async defaultLocation(@Body() _: Empty): Promise<Location> {
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
        throw new UnprocessableEntityException(
          `One of the events (${JSON.stringify(event)}) is in the past compared to model timestamp (${baseModel.timestamp})`,
        );
    });

    events.forEach((event) => {
      if (event.timestamp > timestamp)
        throw new UnprocessableEntityException(
          `One of the events (${JSON.stringify(event)}) is in the future compared to calculation timestamp (${timestamp})`,
        );
    });

    if (timestamp < baseModel.timestamp) {
      throw new UnprocessableEntityException(
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
        throw new BadRequestException(`${res.error.message}`);
      } else {
        throw new InternalServerErrorException(`Error during model processing: ${res.error}`);
      }
    }
  }
}
