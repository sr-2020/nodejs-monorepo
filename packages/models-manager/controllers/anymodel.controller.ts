import { EmptyModel, EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { ModelEngineService, PushService, processAny } from '@sr2020/interface/services';
import { TimeService } from '../services/time.service';
import { EventDispatcherService } from '../services/event-dispatcher.service';
import { ModelAquirerService } from '../services/model-aquirer.service';
import { PubSubService } from '../services/pubsub.service';
import { Empty, PushResult } from '@sr2020/interface/models';
import { getRepository, EntityManager } from 'typeorm';
import { HttpErrors } from '@loopback/rest';
import { getAndLockModel } from '../utils/db-utils';
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

  async get(id: number, manager: EntityManager): Promise<ModelProcessResponse<TModel>> {
    const baseModel = await getAndLockModel(this.tmodel, manager, id);
    const timestamp = this.timeService.timestamp();
    const result = await processAny(this.tmodel, this.modelEngineService, {
      baseModel,
      events: [],
      timestamp,
      aquiredObjects: {},
    });
    await manager.getRepository(this.tmodel).save(result.baseModel as any);
    await this._sendNotifications([result]);
    return result;
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

  async postEvent(id: number, event: EventRequest, manager: EntityManager): Promise<ModelProcessResponse<TModel>> {
    const aquired = await this.modelAquirerService.aquireModels(manager, event, this.timeService.timestamp());
    const result = await this.eventDispatcherService.dispatchEvent(
      this.tmodel,
      manager,
      { ...event, modelId: id.toString(), timestamp: aquired.maximalTimestamp },
      aquired,
    );
    const consequentResults = await this.eventDispatcherService.dispatchEventsRecursively(manager, result.outboundEvents, aquired);
    consequentResults.push(result);
    await this._sendNotifications(consequentResults);

    result.outboundEvents = [];
    return result;
  }

  private async _sendNotifications(results: ModelProcessResponse<EmptyModel>[]) {
    const promises: Promise<PushResult>[] = [];
    const pubSubPromises: Promise<string>[] = [];
    for (const r of results) {
      for (const notification of r.notifications) {
        promises.push(this.pushService.send(Number(r.baseModel.modelId), notification));
        pubSubPromises.push(this.pubSubService.publish('push', { characterId: Number(r.baseModel.modelId), ...notification }));
      }
    }
    await Promise.all(promises);
    await Promise.all(pubSubPromises);
  }
}
