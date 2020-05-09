import { EmptyModel, EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { ModelEngineService, PushService, processAny } from '@sr2020/interface/services';
import { TimeService } from '../services/time.service';
import { EventDispatcherService } from '../services/event-dispatcher.service';
import { ModelAquirerService } from '../services/model-aquirer.service';
import { PubSubService } from '../services/pubsub.service';
import { Empty, PushResult } from '@sr2020/interface/models';
import { getRepository, EntityManager } from 'typeorm';
import { HttpErrors } from '@loopback/rest';
import { EntityNotFoundError } from '@loopback/repository';
import { ModelProcessResponse } from '@sr2020/interface/models/process-requests-respose';

export class AnyModelController<TModel extends EmptyModel> {
  constructor(
    protected tmodel: new () => TModel,
    protected modelEngineService: ModelEngineService,
    protected timeService: TimeService,
    protected eventDispatcherService: EventDispatcherService,
    protected modelAquirerService: ModelAquirerService,
    protected pushService: PushService,
    protected pubSubService: PubSubService,
  ) {}

  async replaceById(model: TModel): Promise<Empty> {
    await getRepository(this.tmodel).save([model as any]);
    return new Empty();
  }

  async delete(id: number, manager: EntityManager): Promise<Empty> {
    await manager.getRepository(this.tmodel).delete(id);
    return new Empty();
  }

  get(id: number, manager: EntityManager): Promise<ModelProcessResponse<TModel>> {
    return this.postEventImpl(id, { eventType: '_' }, manager);
  }

  async predict(id: number, timestamp: number): Promise<ModelProcessResponse<TModel>> {
    try {
      const baseModel = await getRepository(this.tmodel).findOneOrFail(id);
      const result = await processAny(this.tmodel, this.modelEngineService, {
        baseModel,
        events: [],
        timestamp,
        aquiredObjects: {},
      });
      return result;
    } catch (e) {
      if (e instanceof EntityNotFoundError) throw new HttpErrors.NotFound(`${this.tmodel.name} model with id = ${id} not found`);
      throw e;
    }
  }

  postEvent(id: number, event: EventRequest, manager: EntityManager): Promise<ModelProcessResponse<TModel>> {
    return this.postEventImpl(id, event, manager);
  }

  // We can't call postEvent directly from get(...) because it will call child's this.postEvent(...). And that wouldn't work
  // because of @Transaction decorator on this method - basically it will be applied twice (on initial child's get(...) call, and then
  // on child's postEvent(...) call.
  async postEventImpl(id: number, event: EventRequest, manager: EntityManager): Promise<ModelProcessResponse<TModel>> {
    const aquired = await this.modelAquirerService.aquireModels(manager, event, this.timeService.timestamp());
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
    return {
      baseModel: aquired.getBaseModels()[this.tmodel.name][id.toString()],
      workModel: aquired.getWorkModels()[this.tmodel.name][id.toString()],
      notifications: [],
      outboundEvents: [],
      pubSubNotifications: [],
      tableResponse: results[0].tableResponse,
    };
  }

  private async _sendNotifications(results: ModelProcessResponse<EmptyModel>[]) {
    const promises: Promise<PushResult>[] = [];
    const pubSubPromises: Promise<string>[] = [];
    for (const r of results) {
      for (const notification of r.notifications) {
        promises.push(this.pushService.send(Number(r.baseModel.modelId), notification));
      }

      for (const pubSubNotification of r.pubSubNotifications) {
        pubSubPromises.push(this.pubSubService.publish(pubSubNotification.topic, pubSubNotification.body));
      }
    }

    await Promise.all(promises);
    await Promise.all(pubSubPromises);
  }
}
