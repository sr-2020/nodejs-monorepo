import { EmptyModel, EventRequest } from '@alice/alice-common/models/alice-model-engine';
import { PushService } from '@alice/alice-common/services/push.service';
import { TimeService } from '@alice/alice-models-manager/services/time.service';
import { ModelAquirerService } from '@alice/alice-models-manager/services/model-aquirer.service';
import { PubSubService } from '@alice/alice-models-manager/services/pubsub.service';
import { PushResult } from '@alice/alice-common/models/push-result.model';
import { getConnection, getRepository } from 'typeorm';
import { ModelProcessResponse } from '@alice/alice-common/models/process-requests-respose';
import { Empty } from '@alice/alice-common/models/empty.model';
import { LoggerService } from '@alice/alice-models-manager/services/logger.service';
import { ModelEngineService } from '@alice/alice-common/services/model-engine.service';
import { EventDispatcherService } from '@alice/alice-models-manager/services/event-dispatcher.service';
import { NotFoundException } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

export class AnyModelController<TModel extends EmptyModel> {
  constructor(
    protected tmodel: new () => TModel,
    protected modelEngineService: ModelEngineService,
    protected timeService: TimeService,
    protected eventDispatcherService: EventDispatcherService,
    protected modelAquirerService: ModelAquirerService,
    protected pushService: PushService,
    protected pubSubService: PubSubService,
    protected logger: LoggerService,
  ) {}

  async replaceById(model: TModel): Promise<Empty> {
    await getRepository(this.tmodel).save([model as any]);
    return new Empty();
  }

  async delete(id: number): Promise<Empty> {
    await getRepository(this.tmodel).delete(id);
    return new Empty();
  }

  get(id: number): Promise<ModelProcessResponse<TModel>> {
    return this.postEventImpl(id, { eventType: '_' });
  }

  async predict(id: number, timestamp: number): Promise<ModelProcessResponse<TModel>> {
    try {
      const baseModel = await getRepository(this.tmodel).findOneOrFail(id);
      const result = await this.modelEngineService.process(this.tmodel, {
        baseModel,
        events: [],
        timestamp,
        aquiredObjects: {},
      });
      return result;
    } catch (e) {
      if (e instanceof EntityNotFoundError) throw new NotFoundException(`${this.tmodel.name} model with id = ${id} not found`);
      throw e;
    }
  }

  postEvent(id: number, event: EventRequest): Promise<ModelProcessResponse<TModel>> {
    return this.postEventImpl(id, event);
  }

  async broadcastEvent(event: EventRequest): Promise<Empty> {
    const models = await getRepository(this.tmodel).createQueryBuilder().getMany();
    for (const model of models) {
      await this.postEvent(Number(model.modelId), event);
    }
    return new Empty();
  }

  // We can't call postEvent directly from get(...) because it will call child's this.postEvent(...). And that wouldn't work
  // because of @Transaction decorator on this method - basically it will be applied twice (on initial child's get(...) call, and then
  // on child's postEvent(...) call.
  async postEventImpl(id: number, event: EventRequest): Promise<ModelProcessResponse<TModel>> {
    if (!event.eventType.startsWith('_')) {
      this.logger.info(`Processing event ${JSON.stringify(event)} for ${this.tmodel.name} with id ${id}`);
    }

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const aquired = await this.modelAquirerService.aquireModels(queryRunner.manager, event, this.timeService.timestamp());
      const results = await this.eventDispatcherService.dispatchEventsRecursively(
        [
          {
            ...event,
            timestamp: aquired.maximalTimestamp,
            modelId: id.toString(),
            modelType: this.tmodel.name,
          },
        ],
        aquired,
      );
      await Promise.all([this._sendNotifications(results), aquired.flush()]);
      await queryRunner.commitTransaction();
      return {
        baseModel: aquired.getBaseModels()[this.tmodel.name][id.toString()],
        workModel: aquired.getWorkModels()[this.tmodel.name][id.toString()],
        notifications: [],
        outboundEvents: [],
        pubSubNotifications: [],
        tableResponse: results[0].tableResponse,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  private async _sendNotifications(results: ModelProcessResponse<EmptyModel>[]) {
    const promises: Promise<PushResult>[] = [];
    const pubSubPromises: Promise<string>[] = [];
    for (const r of results) {
      for (const notification of r.notifications) {
        promises.push(this.pushService.send(r.baseModel.modelId, notification));
      }

      for (const pubSubNotification of r.pubSubNotifications) {
        pubSubPromises.push(this.pubSubService.publish(pubSubNotification.topic, pubSubNotification.body));
      }
    }

    await Promise.all(promises);
    await Promise.all(pubSubPromises);
  }
}
