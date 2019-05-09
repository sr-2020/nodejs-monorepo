import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Transaction} from '../models';
import {TransactionRepository} from '../repositories';

export class TransactionController {
  constructor(
    @repository(TransactionRepository)
    public transactionRepository : TransactionRepository,
  ) {}

  @post('/transactions', {
    responses: {
      '200': {
        description: 'Transaction model instance',
        content: {'application/json': {schema: {'x-ts-type': Transaction}}},
      },
    },
  })
  async create(@requestBody() transaction: Transaction): Promise<Transaction> {
    return await this.transactionRepository.create(transaction);
  }

  @get('/transactions/count', {
    responses: {
      '200': {
        description: 'Transaction model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Transaction)) where?: Where,
  ): Promise<Count> {
    return await this.transactionRepository.count(where);
  }

  @get('/transactions', {
    responses: {
      '200': {
        description: 'Array of Transaction model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Transaction}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Transaction)) filter?: Filter,
  ): Promise<Transaction[]> {
    return await this.transactionRepository.find(filter);
  }

  @patch('/transactions', {
    responses: {
      '200': {
        description: 'Transaction PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() transaction: Transaction,
    @param.query.object('where', getWhereSchemaFor(Transaction)) where?: Where,
  ): Promise<Count> {
    return await this.transactionRepository.updateAll(transaction, where);
  }

  @get('/transactions/{id}', {
    responses: {
      '200': {
        description: 'Transaction model instance',
        content: {'application/json': {schema: {'x-ts-type': Transaction}}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Transaction> {
    return await this.transactionRepository.findById(id);
  }

  @patch('/transactions/{id}', {
    responses: {
      '204': {
        description: 'Transaction PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() transaction: Transaction,
  ): Promise<void> {
    await this.transactionRepository.updateById(id, transaction);
  }

  @put('/transactions/{id}', {
    responses: {
      '204': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() transaction: Transaction,
  ): Promise<void> {
    await this.transactionRepository.replaceById(id, transaction);
  }

  @del('/transactions/{id}', {
    responses: {
      '204': {
        description: 'Transaction DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.transactionRepository.deleteById(id);
  }
}
