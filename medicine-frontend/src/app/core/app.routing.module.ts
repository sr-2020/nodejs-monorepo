import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from "src/app/login/login.component";
import { MainComponent } from 'src/app/main/main.component';
import { HistoryComponent } from 'src/app/history/history.component';
import { QrReaderComponent } from 'src/app/qr-reader/qr-reader.component';
import { ChooseLabTestsComponent } from 'src/app/choose-lab-tests/choose-lab-tests.component';
import { AuthGuardService } from 'src/services/auth.guard.service';


const routes: Routes = [
  {path : '', component : LoginComponent},
  {path : 'login', component : LoginComponent},
  {path : 'main', component : MainComponent, canActivate: [AuthGuardService]},
  {path : 'history', component : HistoryComponent, canActivate: [AuthGuardService]},
  {path : 'choose-lab-tests', component : ChooseLabTestsComponent, canActivate: [AuthGuardService]},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
