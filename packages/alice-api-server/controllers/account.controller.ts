import { CurrentUser, Get, JsonController } from 'routing-controllers';
import { AliceAccount } from '../models/alice-account';

@JsonController()
export class AccountController {

  @Get('/account')
  public async get(@CurrentUser() account: AliceAccount) {
    delete account._rev;
    return { account };
  }
}
