import { repository } from '@loopback/repository';

import { TransactionRepository } from '../repositories';
import { param, get } from '@loopback/rest';
import { balance } from '../lib/balance';
import { AccountInfo } from '@sr2020/interface/models';

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';

export class AccountInfoController {
  constructor(
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
  ) {}

  @get('/account_info/{sin}', {
    responses: {
      '200': {
        description: 'AccountInfo model instance',
        content: { 'application/json': { schema: { 'x-ts-type': AccountInfo } } },
      },
    },
  })
  async getInfo(@param.path.number('sin') sin: number): Promise<AccountInfo> {
    // TODO(aeremin): Limit to some reasonable (100?) number of items?
    const history = this.transactionRepository.find({
      where: { or: [{ sin_from: sin }, { sin_to: sin }] },
      order: ['created_at DESC'],
    });
    return {
      sin,
      modelId: sin.toString(),
      balance: await balance(this.transactionRepository, sin),
      history: await history,
      timestamp: 0,
      conditions: [],
      modifiers: [],
      timers: {},
    };
  }
}
