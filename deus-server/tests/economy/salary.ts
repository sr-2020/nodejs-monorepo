import { expect } from 'chai';
import 'mocha';
import * as rp from 'request-promise';

export function getSalaryTest(address: string) {
describe('Salary', () => {

    it('Can pay salary', async () => {
        const response = await rp.post(address + '/economy/pay_salary',
        {
          resolveWithFullResponse: true,
          json: {},
          auth: { username: 'admin', password: 'admin' },
        }).promise();
      expect(response.statusCode).to.eq(200);

      const responseBalance = await rp.get(address + '/economy/00001',
      {
        resolveWithFullResponse: true, json: {},
        auth: { username: 'first', password: '1' },
      }).promise();
        expect(responseBalance.statusCode).to.eq(200);
        expect(responseBalance.body.balance).to.deep.equal(1001);
    });

    it('Only admins can pay salary', async () => {
        const response = await rp.post(address + '/economy/pay_salary',
        {
          resolveWithFullResponse: true,
          json: {},
          auth: { username: 'withoutbalance', password: '3' },
          simple: false,
        }).promise();
      expect(response.statusCode).to.eq(401);
    });
  });
}
