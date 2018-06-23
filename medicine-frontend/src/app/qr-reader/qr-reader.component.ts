import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MatSelectChange } from '@angular/material';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';

import { decode, QrData } from 'deus-qr-lib/lib/qr';
import { QrType } from 'deus-qr-lib/lib/qr.type';
import { currentTimestamp } from 'src/app/util';
import { DataService } from 'src/services/data.service';


class QrExpiredError {
}

class NonPassportQrError {
}


@Component({
  selector: 'app-qr-reader',
  templateUrl: './qr-reader.component.html',
  styleUrls: ['./qr-reader.component.css']
})
export class QrReaderComponent implements OnInit {
  @ViewChild('scanner')
  scanner: ZXingScannerComponent;

  hasCameras = false;
  hasPermission: boolean;

  errorMessage = ' ';

  availableDevices: MediaDeviceInfo[];
  selectedDevice: MediaDeviceInfo;


  constructor(
    private _dialogRef: MatDialogRef<QrReaderComponent>,
    private _dataService: DataService) { }

  ngOnInit(): void {
    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      if (devices.length == 0) { return; }
      this.hasCameras = true;
      console.log('Devices: ', devices);
      this.availableDevices = devices;
      this.selectedDevice = this.availableDevices[0];
    });

    this.scanner.camerasNotFound.subscribe((devices: MediaDeviceInfo[]) => {
      console.error('An error has occurred when trying to enumerate your video-stream-enabled devices.');
    });

    this.scanner.permissionResponse.subscribe((answer: boolean) => {
      this.hasPermission = answer;
    });

  }

  public onDeviceSelectChange(selectedValue: MatSelectChange) {
    console.log('Selection changed: ', selectedValue);
    this.selectedDevice = this.scanner.getDeviceById(selectedValue.value);
  }

  public async handleQrCodeResult(qr: string) {
    try {
      const data: QrData = decode(qr);
      if (data.validUntil < currentTimestamp() / 1000) {
        throw new QrExpiredError();
      }

      if (data.type != QrType.Passport) {
        console.error('Scanned QR data type: ', data.type);
        throw new NonPassportQrError();
      }

      this._dialogRef.close(data.payload);
    } catch (e) {
      console.error('Unsupported QR code scanned, error: ' + JSON.stringify(e));
      if (e instanceof QrExpiredError) {
        this.errorMessage = 'Отсканирован код с истекшим сроком действия, пересоздайте код.';
      } else if (e instanceof NonPassportQrError) {
        this.errorMessage = 'Отсканируйте код со страницы-паспорта.';
      } else {
        this.errorMessage = 'Неподдерживаемый формат кода.';
      }
    }
  }
}
