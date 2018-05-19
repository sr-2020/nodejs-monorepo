import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSelectionList, MatListOption } from '@angular/material';

import { DataService } from 'src/services/data.service';
import { LabTest } from 'src/datatypes/viewmodel';

@Component({
  selector: 'app-choose-lab-tests',
  templateUrl: './choose-lab-tests.component.html',
  styleUrls: ['./choose-lab-tests.component.css']
})
export class ChooseLabTestsComponent implements OnInit {
  @ViewChild('tests')
  tests: MatSelectionList;

  availableTests: LabTest[];
  constructor(private _dataService: DataService) {}

  public ngOnInit() {
    this.availableTests = this._dataService.getViewModel().availableTests
  }

  public applyChoice() {
    const checkedTests = this.tests.options
      .filter((item: MatListOption) => this.tests.selectedOptions.isSelected(item))
      .map((item: MatListOption, index: number) => this.availableTests[index].name);
    console.log(JSON.stringify(checkedTests));
  }
}
