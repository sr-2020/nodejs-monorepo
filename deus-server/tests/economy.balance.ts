import { expect } from 'chai';
import * as rp from 'request-promise';

export function getBalanceTest(address: string) {
describe('Get balance', () => {
    it('Can get balance', async () => {
      const response = await rp.get(address + '/economy/first',
        {
          resolveWithFullResponse: true, json: {},
          auth: { username: 'first', password: '1' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.deep.equal({ balance: 1000, history: [] });
    });

    it('Get 404 if user does not exist', async () => {
      const response = await rp.get(address + '/economy/101010',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: '101010', password: '1' },
        }).promise();
      expect(response.statusCode).to.eq(404);
    });
  });
}
