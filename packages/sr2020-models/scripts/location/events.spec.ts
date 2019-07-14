import { Client } from '@loopback/testlab';
import { getApplication } from '../../testing/test-helper';
import { LocationProcessResponse, LocationProcessRequest } from '@sr2020/interface/models/location.model';

describe('Character events', () => {
  let client: Client;

  before('setupApplication', async () => {
    client = (await getApplication()).client;
  });

  it('Process reduceManaDensity event', async () => {
    const req: LocationProcessRequest = {
      baseModel: {
        modelId: '1',
        manaDensity: 100,
        timestamp: 2,
        modifiers: [],
        conditions: [],
        timers: {},
      },
      events: [
        {
          modelId: '1',
          eventType: 'reduce-mana-density',
          timestamp: 5,
          data: {
            amount: 64,
          },
        },
      ],
      timestamp: 10,
    };
    const resp: LocationProcessResponse = {
      baseModel: {
        modelId: '1',
        manaDensity: 36,
        timestamp: 10,
        modifiers: [],
        conditions: [],
        timers: {},
      },
      workModel: {
        modelId: '1',
        manaDensity: 36,
        timestamp: 10,
        modifiers: [],
        conditions: [],
        timers: {},
      },
    };
    await client
      .post('/location/process')
      .send(req)
      .expect(200)
      .expect(resp);
  });
});
