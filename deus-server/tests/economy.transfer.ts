import { expect } from 'chai';
import * as rp from 'request-promise';
import { currentTimestamp } from '../utils';

export function getTransferTest(address: string) {

    describe('Transfer', () => {
    it('Can transfer', async () => {
      let response = await rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, json:
        { sender: 'first', receiver: 'second', amount: 15, description: 'For cookies' },
        auth: { username: 'first', password: '1' },
      }).promise();
      expect(response.statusCode).to.eq(200);

      response = await rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, json:
        { sender: 'second', receiver: 'first', amount: 5, description: 'For dark side' },
        auth: { username: 'second', password: '2' },
      }).promise();
      expect(response.statusCode).to.eq(200);

      response = await rp.get(address + '/economy/00001',
        {
          resolveWithFullResponse: true, json: {},
          auth: { username: 'first', password: '1' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body.balance).to.deep.equal(990);

      response = await rp.get(address + '/economy/00002',
        {
          resolveWithFullResponse: true, json: {},
          auth: { username: '00002', password: '2' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body.balance).to.equal(1010);

      const history = response.body.history;
      expect(history).to.exist;
      expect(history.length).to.equal(2);
      expect(history[0].timestamp).to.be.greaterThan(history[1].timestamp);
      expect(history[0].timestamp).to.be.approximately(currentTimestamp(), 1000);
      expect(history[1].timestamp).to.be.approximately(currentTimestamp(), 1000);
      delete history[0].timestamp;
      delete history[1].timestamp;
      expect(history).to.deep.equal([
        { sender: '00002', receiver: '00001', amount: 5, description: 'For dark side' },
        { sender: '00001', receiver: '00002', amount: 15, description: 'For cookies' },
      ]);
    });

    it('Can process simultaneous transfers', async () => {
      const promises: any[] = [];
      for (let i = 0; i < 20; ++i) {
        promises.push(rp.post(address + '/economy/transfer', {
          resolveWithFullResponse: true, json:
          { sender: 'first', receiver: 'second', amount: 10, description: 'For cookies' },
          auth: { username: 'first', password: '1' },
        }).promise());
      }
      const responses = await Promise.all(promises);
      for (const r of responses)
        expect(r.statusCode).to.eq(200);

      const response = await rp.get(address + '/economy/00001',
        {
          resolveWithFullResponse: true, json: {},
          auth: { username: '00001', password: '1' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body.balance).to.equal(800);

      const history = response.body.history;
      expect(history).to.exist;
      expect(history.length).to.equal(20);
    });

    it('Get 401 if no auth', async () => {
      const response = await rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, simple: false,
        json: { sender: 'first', receiver: 'second', amount: 15, description: 'For cookies' },
      }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Get 401 if incorrect password', async () => {
      const response = await rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, simple: false,
        json: { sender: 'first', receiver: 'second', amount: 15, description: 'For cookies' },
        auth: { username: 'first', password: '3' },
      }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Get 401 if user do not have access', async () => {
      const response = await rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, simple: false,
        json: { sender: 'first', receiver: 'second', amount: 15, description: 'For cookies' },
        auth: { username: 'second', password: '2' },
      }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Get 400 if spending more money than present', async () => {
      const response = await rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, simple: false,
        json: { sender: 'first', receiver: 'second', amount: 1500, description: 'For cookies' },
        auth: { username: 'first', password: '1' },
      }).promise();
      expect(response.statusCode).to.eq(400);
    });

    it('Get 400 if spending negative amount', async () => {
      const response = await rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, simple: false,
        json: { sender: 'first', receiver: 'second', amount: -15, description: 'For cookies' },
        auth: { username: 'first', password: '1' },
      }).promise();
      expect(response.statusCode).to.eq(400);
    });

    // TODO(https://deus2017.atlassian.net/browse/DEM-314)
    it.skip('Get 400 if amount is not a number', async () => {
      const response = await rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, simple: false,
        json: { sender: 'first', receiver: 'second', amount: '15', description: 'For cookies' },
        auth: { username: 'first', password: '1' },
      }).promise();
      expect(response.statusCode).to.eq(400);
    });

    it('Get 404 if recepient does not exist', async () => {
      let response = await rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, simple: false,
        json: { sender: 'first', receiver: '10101', amount: 15, description: 'For cookies' },
        auth: { username: 'first', password: '1' },
      }).promise();
      expect(response.statusCode).to.eq(404);

      response = await rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, simple: false,
        json: { sender: 'first', receiver: 'notuser', amount: 15, description: 'For cookies' },
        auth: { username: 'first', password: '1' },
      }).promise();
      expect(response.statusCode).to.eq(404);
    });
  });
}
