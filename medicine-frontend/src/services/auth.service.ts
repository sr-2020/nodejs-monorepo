import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { GlobalConfig } from 'medicine-frontend/src/config';
import { ViewModel } from 'medicine-frontend/src/datatypes/viewmodel';

@Injectable()
export class AuthService {
  private _userId: string | null = null;
  private _password: string | null = null;

  constructor(private _http: HttpClient) { }

  public async tryLoginAndGetViewmodel(loginOrUserId: string, password: string): Promise<ViewModel> {
    const fullUrl = GlobalConfig.getViewmodelBaseUrl + loginOrUserId;
    const response = await this._http.get<{viewModel: ViewModel, id: string}>(fullUrl,
      this.getRequestOptionsWithCredentials(loginOrUserId, password)).toPromise();
    await this._saveCredentials(response.id, password);
    return response.viewModel;
  }

  public async logout() {
    this._userId = null;
    this._password = null;
  }

  public getUserId(): string | null {
    return this._userId;
  }

  public getRequestOptionsWithSavedCredentials() {
    if (!(this._userId && this._password))
      throw Error('Not logged in');
    return this.getRequestOptionsWithCredentials(this._userId, this._password);
  }

  private async _saveCredentials(userId: string, password: string) {
    this._userId = userId;
    this._password = password;
  }

  private getRequestOptionsWithCredentials(userId: string, password: string) {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + btoa(userId + ':' + password),
      }),
    };
  }
}
