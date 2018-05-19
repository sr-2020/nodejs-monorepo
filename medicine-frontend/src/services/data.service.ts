import { Injectable } from "@angular/core";
import { ViewModel, HistoryEntry, LabTest } from "src/datatypes/viewmodel";
import { currentTimestamp } from "src/app/util";

@Injectable()
export class DataService {
  private viewModel_: ViewModel;

  public setViewModel(viewModel: ViewModel) { this.viewModel_ = viewModel; }
  public getViewModel() { return this.viewModel_; }

  public addComment(patientId: string, comment: string) {
    // TODO: Send event to server
    const entry: HistoryEntry = {
      timestamp: currentTimestamp(),
      patientId: patientId,
      patientFullName: "Вася Пупкин",
      text: comment,
    };
    this.viewModel_.patientHistory.push(entry);
  }

  public runTests(patientId: string, tests: LabTest[]) {};
}