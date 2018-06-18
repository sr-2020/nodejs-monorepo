import { CurrentUser, Get, JsonController, NotFoundError, Param } from 'routing-controllers';
import { Container } from 'typedi';
import { Account, DatabasesContainerToken } from '../services/db-container';
import { canonicalId, checkAccess, currentTimestamp, returnCharacterNotFoundOrRethrow } from '../utils';

@JsonController()
export class ViewModelController {

  @Get('/viewmodel/:type/:id')
  public async get(@CurrentUser() user: Account, @Param('type') type: string, @Param('id') id: string) {
    try {
      const dbContainer = Container.get(DatabasesContainerToken);
      id = await canonicalId(id);
      await checkAccess(user, id);
      const db = dbContainer.viewModelDb(type);
      if (!db) {
        throw new NotFoundError('Viewmodel type is not found');
      } else {
        const doc = (await db.get(id));
        delete doc._id;
        delete doc._rev;
        return {
          serverTime: currentTimestamp(),
          id,
          viewModel: doc,
        };
      }
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }
}
