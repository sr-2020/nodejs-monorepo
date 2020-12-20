import { Empty } from '@alice/alice-common/models/empty.model';
import { PushService } from '@alice/alice-common/services/push.service';
import { EventRequest } from '@alice/alice-common/models/alice-model-engine';
import { Location, LocationCreationRequest, LocationProcessResponse } from '@alice/sr2020-common/models/location.model';
import { getManager } from 'typeorm';
import { ModelAquirerService } from '@alice/alice-models-manager/services/model-aquirer.service';
import { PubSubService } from '@alice/alice-models-manager/services/pubsub.service';
import { TimeService } from '@alice/alice-models-manager/services/time.service';
import { AnyModelController } from '@alice/alice-models-manager/controllers/anymodel.controller';
import { LoggerService } from '@alice/alice-models-manager/services/logger.service';
import { Sr2020ModelEngineHttpService, Sr2020ModelEngineService } from '@alice/sr2020-common/services/model-engine.service';
import { EventDispatcherService } from '@alice/alice-models-manager/services/event-dispatcher.service';
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Location')
export class LocationController extends AnyModelController<Location> {
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
      Location,
      new Sr2020ModelEngineService(sr2020ModelEngineService),
      timeService,
      eventDispatcherService,
      modelAquirerService,
      pushService,
      pubSubService,
      logger,
    );
  }

  @Put('/location/model')
  @ApiResponse({ type: Empty })
  async replaceById(@Body() model: Location): Promise<Empty> {
    return super.replaceById(model);
  }

  @Put('/location/default/:id')
  @ApiOperation({
    summary: 'Inits default location model',
    description: 'Creates and saves default location model. Some field can be randomly populated, other will have default "empty" state.',
  })
  @ApiResponse({ type: Empty })
  async setDefault(@Param('id', ParseIntPipe) id: number, @Body() req: LocationCreationRequest): Promise<Empty> {
    const model = await this.sr2020ModelEngineService.defaultLocation(new Empty());
    model.modelId = id.toString();

    await getManager().transaction(async (manager) => {
      await manager.getRepository(Location).save(model);
    });

    return new Empty();
  }

  @Delete('/location/model/:id')
  @ApiResponse({ type: Empty })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Empty> {
    return super.delete(id);
  }

  @Get('/location/model/:id')
  @ApiResponse({ type: LocationProcessResponse })
  async get(@Param('id', ParseIntPipe) id: number): Promise<LocationProcessResponse> {
    return super.get(id);
  }

  @Get('/location/model/:id/predict')
  @ApiResponse({ type: LocationProcessResponse })
  async predict(@Param('id', ParseIntPipe) id: number, @Query('t', ParseIntPipe) timestamp: number): Promise<LocationProcessResponse> {
    return super.predict(id, timestamp);
  }

  @Post('/location/model/:id')
  @ApiResponse({ type: LocationProcessResponse })
  async postEvent(@Param('id', ParseIntPipe) id: number, @Body() event: EventRequest): Promise<LocationProcessResponse> {
    return super.postEvent(id, event);
  }

  @Post('/location/broadcast')
  @ApiResponse({ description: 'Event successfully broadcasted', type: Empty })
  broadcast(@Body() event: EventRequest): Promise<Empty> {
    return this.broadcastEvent(event);
  }
}
