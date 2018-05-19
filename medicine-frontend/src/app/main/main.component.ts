import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  constructor(
    private _router: Router,
  ) { }

  public newLabTest() {
    this._router.navigate(['choose-lab-tests']);
  }

  public labTestHistory() {
    this._router.navigate(['history']);
  }
}

