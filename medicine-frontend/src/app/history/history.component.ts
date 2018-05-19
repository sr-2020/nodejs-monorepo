import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { HistoryEntry } from 'src/datatypes/viewmodel';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  private _patientHistory: HistoryEntry[];

  constructor(private _dataService: DataService) {}

  public ngOnInit() {
    this._patientHistory = this._dataService.getViewModel().patientHistory;
  }
}
