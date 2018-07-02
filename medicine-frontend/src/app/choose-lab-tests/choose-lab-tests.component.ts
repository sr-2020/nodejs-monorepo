import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSelectionList } from '@angular/material';
import { Router } from '@angular/router';

import { QrReaderComponent } from 'src/app/qr-reader/qr-reader.component';
import { LabTest } from 'src/datatypes/viewmodel';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-choose-lab-tests',
  templateUrl: './choose-lab-tests.component.html',
  styleUrls: ['./choose-lab-tests.component.css'],
})
export class ChooseLabTestsComponent implements OnInit {
  @ViewChild('tests')
  public tests: MatSelectionList;

  public availableTests: LabTest[];
  public numTests: number;

  constructor(
    private _router: Router,
    public dialog: MatDialog,
    private _dataService: DataService) {}

  public ngOnInit() {
    this.availableTests = this._dataService.getViewModel().availableTests;
    this.numTests = this._dataService.getViewModel().numTests;
  }

  public canApplyChoice(): boolean {
    return this.numTests >= this.tests.selectedOptions.selected.length &&
                       0 <  this.tests.selectedOptions.selected.length;
  }

  public async applyChoice() {
    const checkedTests: string[] = this.tests.selectedOptions.selected.map((v) => v.value);

    const dialogRef = this.dialog.open(QrReaderComponent, {
      width: '500px',
      data: { checkedTests },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this._dataService.runTests(result, checkedTests);
        this._router.navigate(['history']);
      }
    });
  }
}
