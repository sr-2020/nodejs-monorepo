import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';

import { DataService } from 'src/services/data.service';
import { HistoryEntry } from 'src/datatypes/viewmodel';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  public patientHistory: HistoryEntry[] = [];
  public addCommentForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _dataService: DataService
  ) {
    this.addCommentForm = this._formBuilder.group({
      patientId: ['', Validators.required],
      comment: ['', Validators.required],
    });
  }

  public ngOnInit() {
    this.update();
  }

  public async addComment(formDirective: FormGroupDirective) {
    await this._dataService.addComment(this.addCommentForm.value.patientId, this.addCommentForm.value.comment);
    this.update();
    this.addCommentForm.value.patientId = '';
    this.addCommentForm.value.comment = '';
    formDirective.resetForm();
  }

  private update() {
    this.patientHistory = this._dataService.getViewModel().patientHistory.reverse();
  }
}
