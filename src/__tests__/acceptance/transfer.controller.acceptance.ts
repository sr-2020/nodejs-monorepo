import {Client, expect} from '@loopback/testlab';
import {BillingApplication} from '../..';
import {setupApplication} from './test-helper';
import {TransactionRepository} from '../../repositories';

describe('TransferController', () => {
  let app: BillingApplication;
  let client: Client;
  let repo: TransactionRepository;

  beforeEach('setupApplication', async () => {
    ({app, client} = await setupApplication());
    repo = await app.getRepository(TransactionRepository);
    await repo.deleteAll();
  });

  afterEach(async () => {
    await app.stop();
  });

  describe('POST /transfer', () => {
    it('Returns 200 on success', async () => {
      await client
        .post('/transfer')
        .send({
          sin_from: 123,
          sin_to: 321,
          amount: 100,
        })
        .expect(200);

      const allEntries = await repo.find();
      expect(allEntries.length).to.equal(1);
      expect(allEntries[0]).to.containEql({
        sin_from: 123,
        sin_to: 321,
        amount: 100,
      });
    });

    it('Returns 400 if transfering negative amount', async () => {
      await client
        .post('/transfer')
        .send({
          sin_from: 123,
          sin_to: 321,
          amount: -100,
        })
        .expect(400);
    });

    it('Returns 400 if transfering to ourselves', async () => {
      await client
        .post('/transfer')
        .send({
          sin_from: 123,
          sin_to: 123,
          amount: 100,
        })
        .expect(400);
    });

    it('Returns 422 if amount is not a number', async () => {
      await client
        .post('/transfer')
        .send({
          sin_from: 123,
          sin_to: 123,
          amount: '100',
        })
        .expect(422);
    });
  });
});
