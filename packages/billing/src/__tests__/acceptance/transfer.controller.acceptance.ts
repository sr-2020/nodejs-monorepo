import {Client, expect} from '@loopback/testlab';
import {BillingApplication} from '../../application';
import {setupApplication} from './test-helper';
import {TransactionRepository} from '../../repositories';
import * as nock from 'nock';

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
      await repo.create({
        created_at: new Date().toUTCString(),
        sin_from: 0,
        sin_to: 123,
        amount: 200,
      });

      const scope = nock('http://gateway.evarun.ru/api/v1/push')
        .post('/send_notification/321', {title: /.*/, body: /.*/})
        .reply(200);

      await client
        .post('/transfer')
        .send({
          sin_from: 123,
          sin_to: 321,
          amount: 100,
        })
        .expect(200);

      expect(scope.isDone()).to.be.true();

      const allEntries = await repo.find({where: {sin_from: 123}});
      expect(allEntries.length).to.equal(1);
      expect(allEntries[0]).to.containEql({
        sin_from: 123,
        sin_to: 321,
        amount: 100,
      });
    });

    it('Returns 400 if not enough money', async () => {
      await repo.create({
        created_at: new Date().toUTCString(),
        sin_from: 0,
        sin_to: 123,
        amount: 120,
      });

      await repo.create({
        created_at: new Date().toUTCString(),
        sin_from: 123,
        sin_to: 125,
        amount: 21,
      });

      await client
        .post('/transfer')
        .send({
          sin_from: 123,
          sin_to: 321,
          amount: 100,
        })
        .expect(400);

      const allEntries = await repo.find({where: {sin_to: 321}});
      expect(allEntries.length).to.equal(0);
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
