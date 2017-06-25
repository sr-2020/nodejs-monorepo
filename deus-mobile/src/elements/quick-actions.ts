import { Component } from '@angular/core';
import { ModalController } from "ionic-angular";
import { Subscription } from "rxjs";
import { Observable } from "rxjs/Rx";

import { ViewQrCodePage } from "../pages/view-qrcode";
import { QrCodeScanService } from "../services/qrcode-scan.service";
import { DataService, UpdateStatus } from "../services/data.service";
import { LocalDataService } from "../services/local-data.service";
import { LoggingService } from "../services/logging.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: 'quick-actions',
  templateUrl: 'quick-actions.html'
})
export class QuickActions {
  public updateStatusIcon: string = null;
  public hitPoints: number = 0;
  public hitPointsIcon: string = null;
  public vrIcon: string = null;

  private _subscription: Subscription = null;
  private _vrSubscription: Subscription = null;

  constructor(private _modalController: ModalController,
    private _qrCodeScanService: QrCodeScanService,
    private _dataService: DataService,
    private _localDataService: LocalDataService,
    private _authService: AuthService,
    private _logging: LoggingService) {
    _dataService.getUpdateStatus().subscribe(
      status => { this.updateStatusIcon = this.getUpdateStatusIcon(status); },
      error => console.error('Cannot get update status: ' + error))
  }

  private ngOnInit() {
    this._subscription = this._dataService.getData().subscribe(
      // TODO(Andrei): Rework hitpoints indicator and remove Math.min
      // (or make sure that it's NEVER possible to get > 5 hp).
      json => {
        this.hitPoints = json.toolbar.hitPoints;
        this.hitPointsIcon = 'hit-points_' + Math.min(5, json.toolbar.hitPoints) + '.png';
      },
      error => this._logging.error('JSON parsing error: ' + JSON.stringify(error))
    );
    this._vrSubscription = Observable.timer(0, 1000).subscribe(() => {
      this.updateVrStatus();
    });
  }

  private ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  }

  private getUpdateStatusIcon(status: UpdateStatus) : string {
    switch (status) {
      case UpdateStatus.Green: return 'sync-green.svg';
      case UpdateStatus.Yellow: return 'sync-green.svg';
      case UpdateStatus.Red: return 'sync-green.svg';
    }
    return null;
  }

  private updateVrStatus() {
    // TODO: Show time left instead
    this.vrIcon = this._localDataService.vrEnterTime() == null
                      ? "virtual-reality-off.svg"
                      : "virtual-reality-on.svg";
  }

  public onBarcode() {
    this._qrCodeScanService.scanQRCode();
  }

  public onId() {
    let accessModal = this._modalController.create(ViewQrCodePage,
      { value: `character:${this._authService.getUsername()}` });
    accessModal.present();
  }

  public onToggleVr() {
    // TODO: Send event to server
    this._localDataService.toggleVr();
    this.updateVrStatus();
  }

  public onRefresh() {
    this._dataService.trySendEvents();
  }
}
