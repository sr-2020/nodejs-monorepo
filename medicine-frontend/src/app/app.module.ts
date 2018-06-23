import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { AppComponent } from 'src/app/app.component';
import { ChooseLabTestsComponent } from 'src/app/choose-lab-tests/choose-lab-tests.component';
import { AppRoutingModule } from 'src/app/core/app.routing.module';
import { CustomMaterialModule } from 'src/app/core/material.module';
import { HistoryComponent } from 'src/app/history/history.component';
import { LoginComponent } from 'src/app/login/login.component';
import { QrReaderComponent } from 'src/app/qr-reader/qr-reader.component';
import { AuthGuardService } from 'src/services/auth.guard.service';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';

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
    DataService,
  ],
  entryComponents: [QrReaderComponent],
  bootstrap: [AppComponent],
})
export class AppModule { }
