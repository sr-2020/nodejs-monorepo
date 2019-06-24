import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChooseLabTestsComponent } from 'medicine-frontend/src/app/choose-lab-tests/choose-lab-tests.component';
import { HistoryComponent } from 'medicine-frontend/src/app/history/history.component';
import { LoginComponent } from 'medicine-frontend/src/app/login/login.component';
import { AuthGuardService } from 'medicine-frontend/src/services/auth.guard.service';

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
