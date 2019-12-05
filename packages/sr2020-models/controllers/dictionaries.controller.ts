import { get } from '@loopback/rest';
import { kAllFeatures } from '../scripts/character/features_library';

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
  features(): object {
    return [...kAllFeatures.values()].map((f) => ({ id: f.id, name: f.name, description: f.description }));
  }
}
