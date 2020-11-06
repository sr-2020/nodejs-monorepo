import { get } from '@loopback/rest';
import { kAllImplants } from '../scripts/character/implants_library';
import { kAllPills } from '../scripts/character/chemo_library';
import { kAllReagents } from '../scripts/qr/reagents_library';
import { kAllEthicGroups } from '../scripts/character/ethics_library';
import { kAllDrones } from '@sr2020/sr2020-model-engine/scripts/qr/drone_library';
import { Feature, kFeatureDescriptor } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { getAllFeatures } from '@sr2020/sr2020-model-engine/scripts/character/features';
import { kAllFocuses } from '@sr2020/sr2020-model-engine/scripts/qr/focus_library';
import { kALlCyberDecks } from '@sr2020/sr2020-model-engine/scripts/qr/cyberdeck_library';
import { kAllSoftware } from '@sr2020/sr2020-model-engine/scripts/qr/software_library';

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
                  slot: { type: 'string' },
                  grade: { type: 'string' },
                  essenceCost: { type: 'number' },
                  installDifficulty: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  implants() {
    return kAllImplants.map((it) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { modifiers, onInstallEvent, onRemoveEvent, ...rest } = it;
      return rest;
    });
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

  @get('/cyberdecks', {
    summary: `Returns the list of implemented cyberdecks`,
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
  cyberdecks(): { id: string; name: string; description: string }[] {
    return kALlCyberDecks.map((p) => ({ id: p.id, name: p.name, description: p.description }));
  }

  @get('/software', {
    summary: `Returns the list of implemented software`,
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
  software(): { id: string; name: string; description: string }[] {
    return kAllSoftware.map((p) => ({ id: p.id, name: p.name, description: p.description }));
  }

  @get('/focuses', {
    summary: `Returns the list of implemented magic focuses`,
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
  focuses(): { id: string; name: string }[] {
    return kAllFocuses.map((p) => ({ id: p.id, name: p.name }));
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
