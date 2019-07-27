import { Client, expect } from '@loopback/testlab';
import { BillingApplication } from '../../application';
import { setupApplication } from './test-helper';
import { TransactionRepository } from '../../repositories';

describe('AccountInfoController', async function() {
  // For some reason this test is quite slow to start
  // tslint:disable-next-line: no-invalid-this
  this.timeout(15000);

  let app: BillingApplication;
  let client: Client;
  let repo: TransactionRepository;

  beforeEach('setupApplication', async () => {
    ({ app, client } = await setupApplication());
    repo = await app.getRepository(TransactionRepository);
    await repo.deleteAll();
  });

  afterEach(async () => {
    await app.stop();
  });

  describe('GET /account_info', () => {
    it('User with no transactions', async () => {
      await client
        .get('/account_info/123')
        .expect(200)
        .expect({
          sin: 123,
          balance: 0,
          history: [],
        });
    });

    it('User with some transactions', async () => {
      await repo.create({
        created_at: new Date().toUTCString(),
        sin_from: 0,
        sin_to: 123,
        amount: 1000,
      });

      await repo.create({
        created_at: new Date().toUTCString(),
        sin_from: 123,
        sin_to: 1,
        amount: 200,
      });

      await repo.create({
        created_at: new Date().toUTCString(),
        sin_from: 2,
        sin_to: 123,
        amount: 100,
      });

      await repo.create({
        created_at: new Date().toUTCString(),
        sin_from: 123,
        sin_to: 3,
        amount: 27,
      });

      const response = await client.get('/account_info/123').expect(200);
      expect(response.body).containDeep({
        sin: 123,
        balance: 873,
        history: [
          { sin_from: 123, sin_to: 3, amount: 27 },
          { sin_from: 2, sin_to: 123, amount: 100 },
          { sin_from: 123, sin_to: 1, amount: 200 },
          { sin_from: 0, sin_to: 123, amount: 1000 },
        ],
      });
    });
  });
});
