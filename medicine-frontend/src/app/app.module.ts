import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { AppComponent } from 'medicine-frontend/src/app/app.component';
import { ChooseLabTestsComponent } from 'medicine-frontend/src/app/choose-lab-tests/choose-lab-tests.component';
import { AppRoutingModule } from 'medicine-frontend/src/app/core/app.routing.module';
import { CustomMaterialModule } from 'medicine-frontend/src/app/core/material.module';
import { HistoryComponent } from 'medicine-frontend/src/app/history/history.component';
import { LoginComponent } from 'medicine-frontend/src/app/login/login.component';
import { QrReaderComponent } from 'medicine-frontend/src/app/qr-reader/qr-reader.component';
import { AuthGuardService } from 'medicine-frontend/src/services/auth.guard.service';
import { AuthService } from 'medicine-frontend/src/services/auth.service';
import { DataService } from 'medicine-frontend/src/services/data.service';

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
