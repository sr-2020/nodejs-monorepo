import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSelectionList, MatListOption, MatExpansionPanel, MatDialog } from '@angular/material';

import { DataService } from 'src/services/data.service';
import { LabTest } from 'src/datatypes/viewmodel';
import { QrReaderComponent } from 'src/app/qr-reader/qr-reader.component';

@Component({
  selector: 'app-choose-lab-tests',
  templateUrl: './choose-lab-tests.component.html',
  styleUrls: ['./choose-lab-tests.component.css']
})
export class ChooseLabTestsComponent implements OnInit {
  @ViewChild('tests')
  tests: MatSelectionList;

  availableTests: LabTest[];
  checked: { [key: string]: boolean } = {};

  constructor(
    private _router: Router,
    public dialog: MatDialog,
    private _dataService: DataService) {}

  public ngOnInit() {
    this.availableTests = this._dataService.getViewModel().availableTests;
    for (const test of this.availableTests) {
      this.checked[test.name] = false;
    }
  }

  public async applyChoice() {
    const checkedTests = this.availableTests.filter(test => this.checked[test.name]);

    const dialogRef = this.dialog.open(QrReaderComponent, {
      width: '500px',
      data: { checkedTests }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this._dataService.runTests(result, checkedTests);
        this._router.navigate(['history']);
      }
    });
  }

  expandPanel(matExpansionPanel: MatExpansionPanel, event: Event): void {
    event.stopPropagation(); // Preventing event bubbling

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.toggle(); // Here's the magic
    }
  }

  private _isExpansionIndicator(target: any): boolean {
    // TODO: Make clickable area bigger
    // TODO: Toggle checkbox otherwise
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (target.classList && target.classList.contains(expansionIndicatorClass) );
  }
}
