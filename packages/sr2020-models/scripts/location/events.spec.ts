import { Client } from '@loopback/testlab';
import { getApplication, getDefaultLocation } from '../../testing/test-helper';
import { LocationProcessResponse, LocationProcessRequest } from '@sr2020/interface/models/location.model';

describe('Character events', () => {
  let client: Client;

  before('setupApplication', async () => {
    client = (await getApplication()).client;
  });

  it('Process reduceManaDensity event', async () => {
    const req: LocationProcessRequest = {
      baseModel: {
        ...getDefaultLocation(),
        manaDensity: 100,
      },
      events: [
        {
          modelId: getDefaultLocation().modelId,
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
        ...getDefaultLocation(),
        manaDensity: 36,
        timestamp: 10,
      },
      workModel: {
        ...getDefaultLocation(),
        manaDensity: 36,
        timestamp: 10,
      },
      outboundEvents: [],
    };
    await client
      .post('/location/process')
      .send(req)
      .expect(200)
      .expect(resp);
  });
});
