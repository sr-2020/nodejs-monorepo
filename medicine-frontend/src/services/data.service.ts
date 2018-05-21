import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

import { ViewModel, HistoryEntry, LabTest } from "src/datatypes/viewmodel";
import { currentTimestamp } from "src/app/util";
import { GlobalConfig } from "src/config";
import { AuthService } from "src/services/auth.service";

@Injectable()
export class DataService {
  // TODO: Remove when backend is enabled
  private _viewModel: ViewModel = {
    "availableTests": [
      {
        "name": "sum",
        "displayableName": "Сумма всех систем"
      },
      {
        "name": "max",
        "displayableName": "Максимум из всех систем"
      }
    ],
    "patientHistory": [
      {
        "timestamp": 1523666164298,
        "patientId": "9005",
        "patientFullName": "Петя Васечкин",
        "text": "Пациент здоров!"
      },
      {
        "timestamp": 1526854063611,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Сумма значений состояний систем равна 49"
      },
      {
        "timestamp": 1526854063612,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Максимум значений состояний систем равна 21"
      },
      {
        "timestamp": 1526854078251,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Ололо"
      },
      {
        "timestamp": 1526854082813,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Сумма значений состояний систем равна 49"
      },
      {
        "timestamp": 1526854082814,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Максимум значений состояний систем равна 21"
      },
      {
        "timestamp": 1526854099810,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Сумма значений состояний систем равна 49"
      },
      {
        "timestamp": 1526854099811,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Максимум значений состояний систем равна 21"
      },
      {
        "timestamp": 1526854107658,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Сумма значений состояний систем равна 49"
      },
      {
        "timestamp": 1526854107659,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Максимум значений состояний систем равна 21"
      },
      {
        "timestamp": 1526854133881,
        "patientId": "9005",
        "patientFullName": "Геннадий Лавров",
        "text": "123"
      },
      {
        "timestamp": 1526854623957,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Сумма значений состояний систем равна 49"
      },
      {
        "timestamp": 1526854623958,
        "patientId": "9010",
        "patientFullName": "Геннадий Лавров",
        "text": "Максимум значений состояний систем равна 21"
      },
      {
        "timestamp": 1526854660637,
        "patientId": "9999",
        "patientFullName": "Геннадий Лавров",
        "text": "54321"
      }
    ],
  };

  constructor(
    private _http: Http,
    private _authService: AuthService) {};

  public setViewModel(viewModel: ViewModel) { this._viewModel = viewModel; }
  public getViewModel() { return this._viewModel; }

  public async addComment(patientId: string, text: string) {
    const fullUrl = GlobalConfig.addCommentBaseUrl + this._authService.getUserId();
    const response = await this._http.post(fullUrl,
      { patientId, text },
      this._authService.getRequestOptionsWithSavedCredentials()).toPromise();

    if (response.json().viewModel == undefined) {
      console.error("Didn't get updated viewmodel");
      console.log(JSON.stringify(response.json()));
      console.log(response.status);
      return;
    }
    this.setViewModel(response.json().viewModel);
  }

  public async runTests(patientId: string, tests: LabTest[]) {
    const fullUrl = GlobalConfig.runTestsBaseUrl + this._authService.getUserId();
    const response = await this._http.post(fullUrl,
      { patientId, tests: tests.map(t => t.name) },
      this._authService.getRequestOptionsWithSavedCredentials()).toPromise();
      if (response.json().viewModel == undefined) {
        console.error("Didn't get updated viewmodel");
        console.log(JSON.stringify(response.json()));
        console.log(response.status);
        return;
      }
      this.setViewModel(response.json().viewModel);
  };
}