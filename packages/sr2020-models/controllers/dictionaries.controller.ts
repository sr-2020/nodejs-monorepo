import { get } from '@loopback/rest';
import { kAllPassiveAbilities } from '../scripts/character/passive_abilities_library';
import { kAllSpells } from '../scripts/character/spells_library';

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
    const spells = [...kAllSpells.values()].map((f) => ({ id: f.id, name: f.humanReadableName, description: f.description }));
    return [...spells, ...pasiveAbilities];
  }
}
