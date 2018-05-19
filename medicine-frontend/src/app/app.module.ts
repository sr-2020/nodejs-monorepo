import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { AppComponent } from 'src/app/app.component';
import { LoginComponent } from 'src/app/login/login.component';
import { AppRoutingModule } from 'src/app/core/app.routing.module';
import { CustomMaterialModule } from 'src/app/core/material.module';
import { AuthService } from 'src/services/auth.service';
import { MainComponent } from 'src/app/main/main.component';
import { DataService } from 'src/services/data.service';
import { HistoryComponent } from 'src/app/history/history.component';
import { QrReaderComponent } from 'src/app/qrreader/qrreader.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    HistoryComponent,
    QrReaderComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
    FormsModule,
    AppRoutingModule,
    HttpModule,
    ZXingScannerModule,
  ],
  providers: [
    AuthService,
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
