import { Client } from '@loopback/testlab';
import { getApplication } from '../../testing/test-helper';
import { Sr2020CharacterProcessResponse, Sr2020CharacterProcessRequest } from '@sr2020/interface/models/sr2020-character.model';

describe('Character events', () => {
  let client: Client;

  before('setupApplication', async () => {
    client = (await getApplication()).client;
  });

  it('Process dummySpell event', async () => {
    const req: Sr2020CharacterProcessRequest = {
      baseModel: {
        modelId: '1',
        spellsCasted: 23,
        timestamp: 2,
        modifiers: [],
        conditions: [],
        timers: {},
      },
      events: [
        {
          modelId: '1',
          eventType: 'dummy-spell',
          timestamp: 5,
          data: {},
        },
      ],
      timestamp: 10,
    };
    const resp: Sr2020CharacterProcessResponse = {
      baseModel: {
        modelId: '1',
        spellsCasted: 24,
        timestamp: 10,
        modifiers: [],
        conditions: [],
        timers: {},
      },
      workModel: {
        modelId: '1',
        spellsCasted: 24,
        timestamp: 10,
        modifiers: [],
        conditions: [],
        timers: {},
      },
    };
    await client
      .post('/character/process')
      .send(req)
      .expect(200)
      .expect(resp);
  });
});
