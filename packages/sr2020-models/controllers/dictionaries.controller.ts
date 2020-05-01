import { get } from '@loopback/rest';
import { kAllPassiveAbilities } from '../scripts/character/passive_abilities_library';
import { kAllSpells } from '../scripts/character/spells_library';
import { kAllActiveAbilities } from '../scripts/character/active_abilities_library';
import { kAllImplants } from '../scripts/character/implants_library';
import { kAllPills } from '../scripts/character/chemo_library';
import { kAllReagents } from '../scripts/qr/reagents_library';

export class DictionariesController {
  @get('/features', {
    summary: `Returns the list of implemented character features with their names and descriptions`,
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
  features(): { id: string; name: string; description: string }[] {
    const pasiveAbilities = [...kAllPassiveAbilities.values()].map((f) => ({ id: f.id, name: f.name, description: f.description }));
    const activeAbilities = [...kAllActiveAbilities.values()].map((f) => ({
      id: f.id,
      name: f.humanReadableName,
      description: f.description,
    }));
    const spells = [...kAllSpells.values()].map((f) => ({ id: f.id, name: f.humanReadableName, description: f.description }));
    return [...spells, ...pasiveAbilities, ...activeAbilities];
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
    return kAllReagents.map((p) => ({ id: p.id, name: p.name }));
  }
}
