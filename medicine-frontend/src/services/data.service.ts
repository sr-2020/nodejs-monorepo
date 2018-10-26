import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { QrData } from 'alice-qr-lib/qr.types';
import { GlobalConfig } from 'medicine-frontend/src/config';
import { ViewModel } from 'medicine-frontend/src/datatypes/viewmodel';
import { AuthService } from 'medicine-frontend/src/services/auth.service';

export class ForeignViewModelError {}

interface FullUrlResponse {
  viewModel?: ViewModel;
  status?: string;
}

@Injectable()
export class DataService {
  private _viewModel: ViewModel | undefined;

  constructor(
    private _http: HttpClient,
    private _authService: AuthService) {}

  public setViewModel(viewModel: ViewModel) {
    if (viewModel.profileType != 'medic')
      throw new ForeignViewModelError();
    this._viewModel = viewModel;
  }

  public getViewModel(): ViewModel {
    if (!this._viewModel)
      throw Error('ViewModel was never set');
    return this._viewModel;
  }

  public async addComment(patientId: string, text: string) {
    const fullUrl = GlobalConfig.addCommentBaseUrl + this._authService.getUserId();
    const response = await this._http.post<FullUrlResponse>(fullUrl,
      { patientId, text },
      this._authService.getRequestOptionsWithSavedCredentials()).toPromise();

    if (response.viewModel == undefined) {
      // tslint:disable-next-line:quotemark
      console.error("Didn't get updated viewmodel");
      console.log(JSON.stringify(response));
      console.log(response.status);
      return;
    }
    this.setViewModel(response.viewModel);
  }

  public async runTests(patientId: string, tests: string[]) {
    const fullUrl = GlobalConfig.runTestsBaseUrl + this._authService.getUserId();
    const response = await this._http.post<FullUrlResponse>(fullUrl,
      { patientId, tests },
      this._authService.getRequestOptionsWithSavedCredentials()).toPromise();
      if (response.viewModel == undefined) {
        console.error("Didn't get updated viewmodel");
        console.log(JSON.stringify(response));
        console.log(response.status);
        return;
      }
      this.setViewModel(response.viewModel);
  }

  public async scanQr(data: QrData) {
    const fullUrl = GlobalConfig.scanQrBaseUrl + this._authService.getUserId();
    const response = await this._http.post<FullUrlResponse>(fullUrl, { data },
      this._authService.getRequestOptionsWithSavedCredentials()).toPromise();
      if (response.viewModel == undefined) {
        console.error("Didn't get updated viewmodel");
        console.log(JSON.stringify(response));
        console.log(response.status);
        return;
      }
      this.setViewModel(response.viewModel);
  }
}
