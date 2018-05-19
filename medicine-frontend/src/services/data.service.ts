import { Injectable } from "@angular/core";
import { ViewModel, HistoryEntry, LabTest } from "src/datatypes/viewmodel";
import { currentTimestamp } from "src/app/util";

@Injectable()
export class DataService {
  // TODO: Remove when backend is enabled
  private _viewModel: ViewModel = {
    availableTests: [
      {
        name: "sum",
        displayableName: "Сумма всех систем",
      },
      {
        name: "max",
        displayableName: "Максимум из всех систем",
      }
    ], patientHistory: [
      {
        timestamp: currentTimestamp(),
        patientId: "9005",
        patientFullName: "Петя Васечкин",
        text: "Lorem ipsum",
      }
    ]
  };

  public setViewModel(viewModel: ViewModel) { this._viewModel = viewModel; }
  public getViewModel() { return this._viewModel; }

  public addComment(patientId: string, comment: string) {
    // TODO: Send request to server
    const entry: HistoryEntry = {
      timestamp: currentTimestamp(),
      patientId: patientId,
      patientFullName: "Вася Пупкин",
      text: comment,
    };
    this._viewModel.patientHistory.push(entry);
  }

  public runTests(patientId: string, tests: LabTest[]) {
    // TODO: Send request to server
  };
}