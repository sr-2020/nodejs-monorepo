import {Client, expect} from '@loopback/testlab';
import {BillingApplication} from '../../application';
import {setupApplication} from './test-helper';
import {TransactionRepository} from '../../repositories';

describe('TransactionController', () => {
  let app: BillingApplication;
  let client: Client;
  let repo: TransactionRepository;

  beforeEach('setupApplication', async () => {
    ({app, client} = await setupApplication());
    repo = await app.getRepository(TransactionRepository);
  });

  afterEach(async () => {
    await app.stop();
  });

  it('invokes POST /transactions', async () => {
    await client
      .post('/transactions')
      .send({
        created_at: '2019-05-09T20:20:59.686Z',
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

  it('invokes GET /transactions/count', async () => {
    const res = await client.get('/transactions/count').expect(200);
    expect(res.body).to.containEql({count: 0});

    await repo.create({
      created_at: '2019-05-09T20:20:59.686Z',
      sin_from: 132,
      sin_to: 321,
      amount: 100,
    });

    const res2 = await client.get('/transactions/count').expect(200);
    expect(res2.body).to.containEql({count: 1});
  });
});
