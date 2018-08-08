import { CurrentUser, Get, JsonController } from 'routing-controllers';
import { Account } from '../services/db-container';

@JsonController()
export class AccountController {

  @Get('/account')
  public async get(@CurrentUser() account: Account) {
    delete account._rev;
    return { account };
  }
}
