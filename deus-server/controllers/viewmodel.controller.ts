import { JsonController, Param, Body, Get, Post, Put, Delete, QueryParam, NotFoundError, CurrentUser } from "routing-controllers";
import { DatabasesContainerToken, Account } from "../services/db-container";
import { currentTimestamp, canonicalId, returnCharacterNotFoundOrRethrow, checkAccess } from "../utils";
import { Container } from "typedi";

@JsonController()
export class ViewModelController {

  @Get("/viewmodel/:id")
  async get(@CurrentUser() user: Account, @Param("id") id: string, @QueryParam("type") type: string = 'default') {
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
    }
    catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }
}
