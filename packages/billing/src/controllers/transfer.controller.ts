import {repository} from '@loopback/repository';
import {TransactionRepository} from '../repositories';
import {post, requestBody, HttpErrors} from '@loopback/rest';
import {Transfer, Empty} from '../../../interface/src/models';
import {balance} from '../lib/balance';

export class TransferController {
  constructor(
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
  ) {}

  @post('/transfer', {
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/json': {schema: {'x-ts-type': Empty}},
        },
      },
      '400': {
        description: 'Impossible transfer',
      },
      '422': {
        description: 'Bad request body',
      },
    },
  })
  async transfer(@requestBody() transferRequest: Transfer): Promise<Empty> {
    if (transferRequest.amount <= 0)
      throw new HttpErrors.BadRequest(
        'Величина транзакции должна быть положительной.',
      );

    if (transferRequest.sin_from == transferRequest.sin_to)
      throw new HttpErrors.BadRequest('Нельзя переводить деньги самому себе.');

    if (
      (await balance(this.transactionRepository, transferRequest.sin_from)) <
      transferRequest.amount
    )
      throw new HttpErrors.BadRequest('Недостаточно денег.');

    await this.transactionRepository.create({
      ...transferRequest,
      created_at: new Date().toUTCString(),
    });
    return new Empty();
  }
}
