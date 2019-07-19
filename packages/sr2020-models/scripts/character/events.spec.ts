import { Client } from '@loopback/testlab';
import { getApplication, getDefaultCharacter } from '../../testing/test-helper';
import { Sr2020CharacterProcessResponse, Sr2020CharacterProcessRequest } from '@sr2020/interface/models/sr2020-character.model';

describe('Character events', () => {
  let client: Client;

  before('setupApplication', async () => {
    client = (await getApplication()).client;
  });

  it('Process dummySpell event', async () => {
    const req: Sr2020CharacterProcessRequest = {
      baseModel: {
        ...getDefaultCharacter(),
        spellsCasted: 23,
      },
      events: [
        {
          modelId: getDefaultCharacter().modelId,
          eventType: 'dummy-spell',
          timestamp: 5,
          data: {},
        },
      ],
      timestamp: 10,
    };
    const resp: Sr2020CharacterProcessResponse = {
      baseModel: {
        ...getDefaultCharacter(),
        spellsCasted: 24,
        timestamp: 10,
      },
      workModel: {
        ...getDefaultCharacter(),
        spellsCasted: 24,
        timestamp: 10,
      },
      outboundEvents: [],
    };
    await client
      .post('/character/process')
      .send(req)
      .expect(200)
      .expect(resp);
  });
});
