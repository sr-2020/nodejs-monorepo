import {repository} from '@loopback/repository';
import {put, requestBody} from '@loopback/rest';
import {FirebaseTokenRepository} from '../repositories';
import {Empty, FirebaseToken} from '../../../interface/src/models';

export class TokensController {
  constructor(
    @repository(FirebaseTokenRepository)
    public firebaseTokenRepository: FirebaseTokenRepository,
  ) {}

  @put('/save_token', {
    responses: {
      '200': {
        description: 'FirebaseToken PUT success',
        content: {'application/json': {schema: {'x-ts-type': Empty}}},
      },
    },
  })
  async saveToken(@requestBody() firebaseToken: FirebaseToken): Promise<Empty> {
    try {
      await this.firebaseTokenRepository.replaceById(
        firebaseToken.id,
        firebaseToken,
      );
    } catch {
      await this.firebaseTokenRepository.create(firebaseToken);
    }
    return new Empty();
  }
}
