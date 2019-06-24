import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSelectionList, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { QrData, QrType } from 'alice-qr-lib/qr.types';
import { QrReaderComponent } from 'medicine-frontend/src/app/qr-reader/qr-reader.component';
import { LabTest } from 'medicine-frontend/src/datatypes/viewmodel';
import { DataService } from 'medicine-frontend/src/services/data.service';

@Component({
  selector: 'app-choose-lab-tests',
  templateUrl: './choose-lab-tests.component.html',
  styleUrls: ['./choose-lab-tests.component.css'],
})
export class ChooseLabTestsComponent implements OnInit {
  @ViewChild('tests')
  public tests!: MatSelectionList;

  public availableTests: LabTest[] = [];
  public numTests: number = 0;

  constructor(
    private _router: Router,
    private _dialog: MatDialog,
    private _matSnackBar: MatSnackBar,
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

    const dialogRef = this._dialog.open(QrReaderComponent, {
      width: '500px',
      data: {
        title: 'Сканирование QR-кода пациента',
        qrType: QrType.Passport,
      },
    });

    dialogRef.afterClosed().subscribe(async (result: QrData) => {
      if (result) {
        await this._dataService.runTests(result.payload, checkedTests);
        this._matSnackBar.open('Aнализ завершен', '', { duration: 2000 });
        this._router.navigate(['history']);
      }
    });
  }

  public cancel() {
    this._router.navigate(['history']);
  }
}
