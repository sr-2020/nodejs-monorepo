import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSelectChange } from '@angular/material';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';

import { decode, QrData } from 'alice-qr-lib/qr';
import { QrType } from 'alice-qr-lib/qr.type';
import { currentTimestamp } from 'src/app/util';

class QrExpiredError {
}

class NonPassportQrError {
}

class NonLabTerminalRefillQrError {
}

interface QrDialogData {
  title: string;
  qrType: QrType;
}

@Component({
  selector: 'app-qr-reader',
  templateUrl: './qr-reader.component.html',
  styleUrls: ['./qr-reader.component.css'],
})
export class QrReaderComponent implements OnInit {
  @ViewChild('scanner')
  public scanner!: ZXingScannerComponent;

  public hasCameras = false;
  public hasPermission: boolean = false;

  public errorMessage = ' ';

  public availableDevices: MediaDeviceInfo[] = [];
  public selectedDevice!: MediaDeviceInfo;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: QrDialogData,
    private _dialogRef: MatDialogRef<QrReaderComponent>) { }

  public ngOnInit(): void {
    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      if (devices.length == 0) { return; }
      this.hasCameras = true;
      console.log('Devices: ', devices);
      this.availableDevices = devices;
      this.selectedDevice = this.availableDevices[0];
    });

    this.scanner.camerasNotFound.subscribe((_devices: MediaDeviceInfo[]) => {
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

      if (this.data.qrType != data.type) {
        console.error(`Scanned QR data type: ${data.type} while expecting ${this.data.qrType}`);
        switch (this.data.qrType) {
          case QrType.Passport:
            throw new NonPassportQrError();

          case QrType.LabTerminalRefill:
            throw new NonLabTerminalRefillQrError();

          default:
            throw Error('Unsupported QrType passed to QrReaderComponent');
        }
      }

      this._dialogRef.close(data);
    } catch (e) {
      console.error('Unsupported QR code scanned, error: ' + JSON.stringify(e));
      if (e instanceof QrExpiredError) {
        this.errorMessage = 'Отсканирован код с истекшим сроком действия, пересоздайте код.';
      } else if (e instanceof NonPassportQrError) {
        this.errorMessage = 'Отсканируйте код со страницы-паспорта.';
      } else if (e instanceof NonLabTerminalRefillQrError) {
        this.errorMessage = 'Отсканируйте код контейнера с реактивами.';
      } else {
        this.errorMessage = 'Неподдерживаемый формат кода.';
      }
    }
  }
}
