import { inject } from '@loopback/core';
import { get, param, post, put, requestBody, del } from '@loopback/rest';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Empty } from '@sr2020/interface/models/empty.model';
import { Sr2020Character, Sr2020CharacterProcessResponse } from '@sr2020/interface/models/sr2020-character.model';
import { ModelEngineService, PushService } from '@sr2020/interface/services';
import { EntityManager, Transaction, TransactionManager, getManager, getRepository } from 'typeorm';
import { PubSubService } from '../services/pubsub.service';
import { EventDispatcherService } from '../services/event-dispatcher.service';
import { ModelAquirerService } from '../services/model-aquirer.service';
import { TimeService } from '../services/time.service';
import { AnyModelController } from './anymodel.controller';
import { QrCode } from '@sr2020/interface/models/qr-code.model';

export class CharacterController extends AnyModelController<Sr2020Character> {
  constructor(
    @inject('services.ModelEngineService')
    protected modelEngineService: ModelEngineService,
    @inject('services.TimeService')
    protected timeService: TimeService,
    @inject('services.EventDispatcherService')
    protected eventDispatcherService: EventDispatcherService,
    @inject('services.ModelAquirerService')
    protected modelAquirerService: ModelAquirerService,
    @inject('services.PushService')
    protected pushService: PushService,
    @inject('services.PubSubService')
    protected pubSubService: PubSubService,
  ) {
    super(Sr2020Character, modelEngineService, timeService, eventDispatcherService, modelAquirerService, pushService, pubSubService);
  }

  @get('/character/update_all', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                count: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async updateAll(): Promise<{ count: number }> {
    const characters = await getRepository(Sr2020Character)
      .createQueryBuilder()
      .getMany();
    for (const character of characters) {
      await getManager().transaction(async (transactionManager) => {
        await this.get(Number(character.modelId), transactionManager);
      });
    }

    return { count: characters.length };
  }

  @put('/character/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: Sr2020Character): Promise<Empty> {
    return super.replaceById(model);
  }

  @put('/character/default/{id}', {
    summary: 'Inits character default character model',
    description: 'Creates and saves default character model. Some field can be randomly populated, other will have default "empty" state.',
    responses: {
      content: {
        'application/json': { schema: { 'x-ts-type': Sr2020Character } },
      },
    },
  })
  async setDefault(
    @param.path.number('id') id: number,
    @requestBody() req: Empty,
    @param.query.boolean('noAbilities') noAbilities: boolean,
  ): Promise<Empty> {
    const model = await this.modelEngineService.defaultCharacter(req);
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
      timers: {},
      data: {},
    };

    await getManager().transaction(async (manager) => {
      await manager.getRepository(Sr2020Character).save(model);
      await manager.getRepository(QrCode).save(code);
    });

    if (!noAbilities) {
      for (const f of ['ask-anon', 'ground-heal', 'fireball']) {
        await this.postEvent(id, { eventType: 'addFeature', data: { id: f } }, undefined);
      }
    }

    return new Empty();
  }

  @del('/character/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction DELETE success',
        content: { 'application/json': { schema: { 'x-ts-type': Empty } } },
      },
    },
  })
  @Transaction()
  async delete(@param.path.number('id') id: number, @TransactionManager() manager: EntityManager): Promise<Empty> {
    return super.delete(id, manager);
  }

  @get('/character/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': Sr2020CharacterProcessResponse } } },
      },
    },
  })
  @Transaction()
  async get(@param.path.number('id') id: number, @TransactionManager() manager: EntityManager): Promise<Sr2020CharacterProcessResponse> {
    return super.get(id, manager);
  }

  @get('/character/model/{id}/predict', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': Sr2020CharacterProcessResponse } } },
      },
    },
  })
  async predict(@param.path.number('id') id: number, @param.query.number('t') timestamp: number): Promise<Sr2020CharacterProcessResponse> {
    return super.predict(id, timestamp);
  }

  @post('/character/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': Sr2020CharacterProcessResponse } } },
      },
    },
  })
  @Transaction()
  async postEvent(
    @param.path.number('id') id: number,
    @requestBody() event: EventRequest,
    @TransactionManager() manager?: EntityManager,
  ): Promise<Sr2020CharacterProcessResponse> {
    return super.postEvent(id, event, manager!);
  }
}
