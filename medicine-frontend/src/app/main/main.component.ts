import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  constructor(
    private _router: Router, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'history',
      sanitizer.bypassSecurityTrustResourceUrl('assets/history.svg'));
    iconRegistry.addSvgIcon(
      'analyze',
      sanitizer.bypassSecurityTrustResourceUrl('assets/analyze.svg'));
  }

  public newLabTest() {
    this._router.navigate(['choose-lab-tests']);
  }

  public labTestHistory() {
    this._router.navigate(['history']);
  }
}

