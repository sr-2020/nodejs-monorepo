import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptionsArgs } from '@angular/http';

import { GlobalConfig } from 'src/config';
import { ViewModel } from 'src/datatypes/viewmodel';

@Injectable()
export class AuthService {
  private _userId: string | null = null;
  private _password: string | null = null;

  constructor(private _http: Http) { }

  public async tryLoginAndGetViewmodel(loginOrUserId: string, password: string): Promise<ViewModel> {
    const fullUrl = GlobalConfig.getViewmodelBaseUrl + loginOrUserId;
    const response = await this._http.get(fullUrl,
      this.getRequestOptionsWithCredentials(loginOrUserId, password)).toPromise();
    await this._saveCredentials(response.json().id, password);
    return response.json().viewModel;
  }

  public async logout() {
    this._userId = null;
    this._password = null;
  }

  public getUserId(): string | null {
    return this._userId;
  }

  public getRequestOptionsWithSavedCredentials(): RequestOptionsArgs {
    if (!(this._userId && this._password))
      throw Error('Not logged in');
    return this.getRequestOptionsWithCredentials(this._userId, this._password);
  }

  private async _saveCredentials(userId: string, password: string) {
    this._userId = userId;
    this._password = password;
  }

  private getRequestOptionsWithCredentials(userId: string, password: string): RequestOptionsArgs {
    return {
      headers: new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + btoa(userId + ':' + password),
      }),
    };
  }
}
