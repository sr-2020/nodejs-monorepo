import { Empty } from '@alice/alice-common/models/empty.model';
import { PushService } from '@alice/alice-common/services/push.service';
import { EventRequest } from '@alice/alice-common/models/alice-model-engine';
import { QrCode, QrCodeProcessResponse } from '@alice/sr2020-common/models/qr-code.model';
import { ModelAquirerService } from '@alice/alice-models-manager/services/model-aquirer.service';
import { PubSubService } from '@alice/alice-models-manager/services/pubsub.service';
import { TimeService } from '@alice/alice-models-manager/services/time.service';
import { AnyModelController } from '@alice/alice-models-manager/controllers/anymodel.controller';
import { LoggerService } from '@alice/alice-models-manager/services/logger.service';
import { ModelEngineService } from '@alice/alice-common/services/model-engine.service';
import { EventDispatcherService } from '@alice/alice-models-manager/services/event-dispatcher.service';
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('QR')
export class QrCodeController extends AnyModelController<QrCode> {
  constructor(
    @Inject('ModelEngineService')
    protected modelEngineService: ModelEngineService,
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
    super(QrCode, modelEngineService, timeService, eventDispatcherService, modelAquirerService, pushService, pubSubService, logger);
  }

  @Put('/qr/model')
  @ApiResponse({ type: Empty })
  async replaceById(@Body() model: QrCode): Promise<Empty> {
    return super.replaceById(model);
  }

  @Delete('/qr/model/:id')
  @ApiResponse({ type: Empty })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Empty> {
    return super.delete(id);
  }

  @Get('/qr/model/:id')
  @ApiResponse({ type: QrCodeProcessResponse })
  async get(@Param('id', ParseIntPipe) id: number): Promise<QrCodeProcessResponse> {
    return super.get(id);
  }

  @Get('/qr/model/:id/predict')
  @ApiResponse({ type: QrCodeProcessResponse })
  async predict(@Param('id', ParseIntPipe) id: number, @Query('t', ParseIntPipe) timestamp: number): Promise<QrCodeProcessResponse> {
    return super.predict(id, timestamp);
  }

  @Post('/qr/model/:id')
  @ApiResponse({ type: QrCodeProcessResponse })
  async postEvent(@Param('id', ParseIntPipe) id: number, @Body() event: EventRequest): Promise<QrCodeProcessResponse> {
    return super.postEvent(id, event);
  }

  @Post('/qr/broadcast')
  @ApiResponse({ description: 'Event successfully broadcasted', type: Empty })
  broadcast(@Body() event: EventRequest): Promise<Empty> {
    return this.broadcastEvent(event);
  }
}
