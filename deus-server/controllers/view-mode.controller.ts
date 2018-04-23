import { JsonController, Param, Body, Get, Post, Put, Delete, QueryParam, NotFoundError, CurrentUser } from "routing-controllers";
import { DatabasesContainer, getDatabaseContainer } from "../services/db-container";
import { currentTimestamp, canonicalId, returnCharacterNotFoundOrRethrow, checkAccess } from "../utils";

@JsonController()
export class ViewModelController {

  @Get("/viewmodel/:id")
  async get(@CurrentUser() user: string, @Param("id") id: string, @QueryParam("type") type: string = 'default') {
    try {
      id = await canonicalId(getDatabaseContainer(), id);
      await checkAccess(getDatabaseContainer(), user, id);
      const db = getDatabaseContainer().viewModelDb(type);
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
