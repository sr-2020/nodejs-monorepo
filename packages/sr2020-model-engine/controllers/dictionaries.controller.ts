import { get } from '@loopback/rest';
import { kAllImplants } from '../scripts/character/implants_library';
import { kAllPills } from '../scripts/character/chemo_library';
import { kAllReagents } from '../scripts/qr/reagents_library';
import { kAllEthicGroups } from '../scripts/character/ethics_library';
import { kAllDrones } from '@sr2020/sr2020-model-engine/scripts/qr/drone_library';
import { Feature, kFeatureDescriptor } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { getAllFeatures } from '@sr2020/sr2020-model-engine/scripts/character/features';

export class DictionariesController {
  @get('/features', {
    summary: `Returns the list of implemented character features with their names and descriptions`,
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: kFeatureDescriptor,
            },
          },
        },
      },
    },
  })
  features(): Feature[] {
    return getAllFeatures();
  }

  @get('/implants', {
    summary: `Returns the list of implemented implants`,
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  implants(): { id: string; name: string; description: string }[] {
    return kAllImplants.map((it) => ({ id: it.id, name: it.name, description: it.description }));
  }

  @get('/pills', {
    summary: `Returns the list of implemented pills`,
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  pills(): { id: string; name: string }[] {
    return kAllPills.map((p) => ({ id: p.id, name: p.name }));
  }

  @get('/reagents', {
    summary: `Returns the list of implemented reagents`,
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  reagents(): { id: string; name: string }[] {
    return kAllReagents;
  }

  @get('/drones', {
    summary: `Returns the list of implemented drones`,
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  drones(): { id: string; name: string; description: string }[] {
    return kAllDrones.map((p) => ({ id: p.id, name: p.name, description: p.description }));
  }

  @get('/ethic_groups', {
    summary: `Returns the list of implemented ethic groups`,
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  ethicGroups(): { id: string; name: string }[] {
    return kAllEthicGroups.map((p) => ({ id: p.id, name: p.name }));
  }
}
