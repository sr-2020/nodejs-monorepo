import { Component, OnInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-qrreader',
  templateUrl: './qrreader.component.html',
  styleUrls: ['./qrreader.component.css']
})
export class QrReaderComponent implements OnInit {
  @ViewChild('scanner')
  scanner: ZXingScannerComponent;

  hasCameras = false;
  hasPermission: boolean;

  availableDevices: MediaDeviceInfo[];
  selectedDevice: MediaDeviceInfo;

  ngOnInit(): void {
    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      this.hasCameras = true;
      console.log('Devices: ', devices.length);
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

  public handleQrCodeResult(resultString: string) {
    // TODO: Validate QR, navigate to next page
    console.log('Result: ', resultString);
  }
}
