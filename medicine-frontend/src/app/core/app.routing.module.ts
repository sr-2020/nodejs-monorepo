import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChooseLabTestsComponent } from 'src/app/choose-lab-tests/choose-lab-tests.component';
import { HistoryComponent } from 'src/app/history/history.component';
import { LoginComponent } from 'src/app/login/login.component';
import { AuthGuardService } from 'src/services/auth.guard.service';

const routes: Routes = [
  {path : '', component : LoginComponent},
  {path : 'login', component : LoginComponent},
  {path : 'history', component : HistoryComponent, canActivate: [AuthGuardService]},
  {path : 'choose-lab-tests', component : ChooseLabTestsComponent, canActivate: [AuthGuardService]},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule,
  ],
  declarations: [],
})
export class AppRoutingModule { }
