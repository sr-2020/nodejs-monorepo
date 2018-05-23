import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { AppComponent } from 'src/app/app.component';
import { LoginComponent } from 'src/app/login/login.component';
import { AppRoutingModule } from 'src/app/core/app.routing.module';
import { CustomMaterialModule } from 'src/app/core/material.module';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { HistoryComponent } from 'src/app/history/history.component';
import { QrReaderComponent } from 'src/app/qr-reader/qr-reader.component';
import { ChooseLabTestsComponent } from 'src/app/choose-lab-tests/choose-lab-tests.component';
import { AuthGuardService } from 'src/services/auth.guard.service';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HistoryComponent,
    QrReaderComponent,
    ChooseLabTestsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpModule,
    HttpClientModule,
    ZXingScannerModule,
  ],
  providers: [
    AuthService,
    AuthGuardService,
    DataService
  ],
  entryComponents: [QrReaderComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
