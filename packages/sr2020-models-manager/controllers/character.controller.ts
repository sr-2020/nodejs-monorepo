import { EventRequest } from '@alice/alice-common/models/alice-model-engine';
import { Empty } from '@alice/alice-common/models/empty.model';
import {
  CharacterCreationRequest,
  Feature,
  Sr2020Character,
  Sr2020CharacterProcessResponse,
} from '@alice/sr2020-common/models/sr2020-character.model';
import type { PushService } from '@alice/alice-common/services/push.service';
import { getManager, getRepository } from 'typeorm';

import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import type { ModelAquirerService } from '@alice/alice-models-manager/services/model-aquirer.service';
import type { PubSubService } from '@alice/alice-models-manager/services/pubsub.service';
import type { TimeService } from '@alice/alice-models-manager/services/time.service';
import { AnyModelController } from '@alice/alice-models-manager/controllers/anymodel.controller';
import type { LoggerService } from '@alice/alice-models-manager/services/logger.service';
import * as moment from 'moment';
import type { Sr2020ModelEngineHttpService } from '@alice/sr2020-common/services/model-engine.service';
import { Sr2020ModelEngineService } from '@alice/sr2020-common/services/model-engine.service';
import type { EventDispatcherService } from '@alice/alice-models-manager/services/event-dispatcher.service';
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Character')
export class CharacterController extends AnyModelController<Sr2020Character> {
  constructor(
    @Inject('ModelEngineHttpService')
    protected sr2020ModelEngineService: Sr2020ModelEngineHttpService,
    @Inject('TimeService')
    protected timeService: TimeService,
    @Inject('EventDispatcherService')
    protected eventDispatcherService: EventDispatcherService,
    @Inject('ModelAquirerService')
    protected modelAquirerService: ModelAquirerService,
    @Inject('PushService')
    protected pushService: PushService,
    @Inject('PubSubService')
    protected pubSubService: PubSubService,
    @Inject('LoggerService')
    protected logger: LoggerService,
  ) {
    super(
      Sr2020Character,
      new Sr2020ModelEngineService(sr2020ModelEngineService),
      timeService,
      eventDispatcherService,
      modelAquirerService,
      pushService,
      pubSubService,
      logger,
    );
  }

  @Get('/character/update_all')
  async updateAll(
    @Query('older_than_seconds', ParseIntPipe) olderThanSeconds: number = 0,
  ): Promise<{ successes: number; failures: number }> {
    const ts = moment().subtract(olderThanSeconds, 'seconds').valueOf();
    const characters = await getRepository(Sr2020Character).createQueryBuilder().where('timestamp < :ts', { ts }).getMany();

    let successes = 0;
    let failures = 0;

    for (const character of characters) {
      try {
        await this.get(Number(character.modelId));
        successes++;
      } catch (e) {
        failures++;
      }
    }
    this.logger.warning(`Update all results: ${successes} successes, ${failures} failures.`);

    return { successes, failures };
  }

  @Put('/character/model')
  @ApiResponse({ type: Empty })
  async replaceById(@Body() model: Sr2020Character): Promise<Empty> {
    return super.replaceById(model);
  }

  @Put('/character/default/:id')
  @ApiOperation({
    summary: 'Inits character default character model',
    description: 'Creates and saves default character model. Some field can be randomly populated, other will have default "empty" state.',
  })
  @ApiResponse({ type: Empty })
  async setDefault(@Param('id', ParseIntPipe) id: number, @Body() req: CharacterCreationRequest): Promise<Empty> {
    this.logger.info(`Initializing character ${id} with following data: ${JSON.stringify(req)}`);
    const model = await this.sr2020ModelEngineService.defaultCharacter(req);
    model.timestamp = this.timeService.timestamp();
    model.modelId = id.toString();
    model.mentalQrId = id + 10000;

    const code: QrCode = {
      modelId: model.mentalQrId.toString(),
      eventType: '_',
      type: 'ability',
      name: '',
      description: '',
      usesLeft: 0,
      timestamp: model.timestamp,
      modifiers: [],
      timers: [],
      data: {},
    };

    await getManager().transaction(async (manager) => {
      await manager.getRepository(Sr2020Character).save(model);
      await manager.getRepository(QrCode).save(code);
    });

    return new Empty();
  }

  @Delete('/character/model/:id')
  @ApiResponse({ type: Empty })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Empty> {
    return super.delete(id);
  }

  @Get('/character/model/:id')
  @ApiResponse({ type: Sr2020CharacterProcessResponse })
  async get(@Param('id', ParseIntPipe) id: number): Promise<Sr2020CharacterProcessResponse> {
    return super.get(id);
  }

  @Get('/character/model/raw/:id')
  @ApiResponse({ type: Sr2020Character })
  async getRaw(@Param('id', ParseIntPipe) id: number): Promise<Sr2020Character> {
    return super.getRaw(id);
  }

  @Get('/character/model/:id/predict')
  @ApiResponse({ type: Sr2020CharacterProcessResponse })
  async predict(
    @Param('id', ParseIntPipe) id: number,
    @Query('t', ParseIntPipe) timestamp: number,
  ): Promise<Sr2020CharacterProcessResponse> {
    return super.predict(id, timestamp);
  }

  @Post('/character/model/:id')
  @ApiResponse({ type: Sr2020CharacterProcessResponse })
  async postEvent(@Param('id', ParseIntPipe) id: number, @Body() event: EventRequest): Promise<Sr2020CharacterProcessResponse> {
    return super.postEvent(id, event);
  }

  @Post('/character/broadcast')
  @ApiResponse({ description: 'Event successfully broadcasted', type: Empty })
  broadcast(@Body() event: EventRequest): Promise<Empty> {
    return this.broadcastEvent(event);
  }

  @Get('/character/available_features/:id')
  @ApiResponse({ status: 200, type: [Feature] })
  async availableFeatures(@Param('id', ParseIntPipe) id: number): Promise<Feature[]> {
    const model = await getRepository(Sr2020Character).findOneOrFail(id);
    return this.sr2020ModelEngineService.availableFeatures(model);
  }
}
