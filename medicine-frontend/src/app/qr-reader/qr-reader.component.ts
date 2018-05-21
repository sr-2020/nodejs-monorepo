import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef } from '@angular/material';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';

import { decode, QrData } from 'deus-qr-lib/lib/qr';
import { QrType } from 'deus-qr-lib/lib/qr.type';
import { currentTimestamp } from 'src/app/util';
import { DataService } from 'src/services/data.service';


class QrExpiredError extends Error {
}

class NonPassportQrError extends Error {
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

  availableDevices: MediaDeviceInfo[];
  selectedDevice: MediaDeviceInfo;


  constructor(
    private _dialogRef: MatDialogRef<QrReaderComponent>,
    private _dataService: DataService){};

  ngOnInit(): void {
    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
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

  public onDeviceSelectChange(selectedValue: string) {
    console.log('Selection changed: ', selectedValue);
    this.selectedDevice = this.scanner.getDeviceById(selectedValue);
  }

  public async handleQrCodeResult(qr: string) {
    try {
      const data: QrData = decode(qr);
      console.info('Decoded QR code: ' + JSON.stringify(data));
      if (data.validUntil < currentTimestamp() / 1000)
        throw new QrExpiredError();

      if (data.type != QrType.Passport)
        throw new NonPassportQrError();

      console.log('QR Code is valid');
      this._dialogRef.close(data.payload);
    } catch (e) {
      console.error('Unsupported QR code scanned, error: ' + e);
      if (e instanceof QrExpiredError)
        console.log('Expired');
      else
        console.log('Invalid Format');
    }
  }
}
