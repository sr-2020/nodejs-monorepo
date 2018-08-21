import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { QrData } from 'alice-qr-lib/qr';
import { GlobalConfig } from 'src/config';
import { ViewModel } from 'src/datatypes/viewmodel';
import { AuthService } from 'src/services/auth.service';

export class ForeignViewModelError {}

@Injectable()
export class DataService {
  private _viewModel: ViewModel | undefined;

  constructor(
    private _http: Http,
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
    const response = await this._http.post(fullUrl,
      { patientId, text },
      this._authService.getRequestOptionsWithSavedCredentials()).toPromise();

    if (response.json().viewModel == undefined) {
      // tslint:disable-next-line:quotemark
      console.error("Didn't get updated viewmodel");
      console.log(JSON.stringify(response.json()));
      console.log(response.status);
      return;
    }
    this.setViewModel(response.json().viewModel);
  }

  public async runTests(patientId: string, tests: string[]) {
    const fullUrl = GlobalConfig.runTestsBaseUrl + this._authService.getUserId();
    const response = await this._http.post(fullUrl,
      { patientId, tests },
      this._authService.getRequestOptionsWithSavedCredentials()).toPromise();
      if (response.json().viewModel == undefined) {
        console.error("Didn't get updated viewmodel");
        console.log(JSON.stringify(response.json()));
        console.log(response.status);
        return;
      }
      this.setViewModel(response.json().viewModel);
  }

  public async scanQr(data: QrData) {
    const fullUrl = GlobalConfig.scanQrBaseUrl + this._authService.getUserId();
    const response = await this._http.post(fullUrl, { data },
      this._authService.getRequestOptionsWithSavedCredentials()).toPromise();
      if (response.json().viewModel == undefined) {
        console.error("Didn't get updated viewmodel");
        console.log(JSON.stringify(response.json()));
        console.log(response.status);
        return;
      }
      this.setViewModel(response.json().viewModel);
  }
}
