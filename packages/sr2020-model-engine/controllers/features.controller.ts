import { get, requestBody } from '@loopback/rest';
import { Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { getAllAvailableFeatures } from '@sr2020/sr2020-model-engine/scripts/character/features';

export class FeaturesController {
  @get('/available_features', {
    summary: `Returns the list of features provided character can buy for karma`,
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
                  description: { type: 'string' },
                  karmaCost: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  availableFeatures(@requestBody() req: Sr2020Character): { id: string; description: string; karmaCost: number }[] {
    return getAllAvailableFeatures(req);
  }
}
