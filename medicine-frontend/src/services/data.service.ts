import { Injectable } from "@angular/core";
import { ViewModel, HistoryEntry, LabTest } from "src/datatypes/viewmodel";
import { currentTimestamp } from "src/app/util";

@Injectable()
export class DataService {
  private _viewModel: ViewModel;

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