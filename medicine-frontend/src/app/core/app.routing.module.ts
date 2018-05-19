import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from "src/app/login/login.component";
import { MainComponent } from 'src/app/main/main.component';
import { HistoryComponent } from 'src/app/history/history.component';


// TODO: Set route guards to check if user logged in
const routes: Routes = [
  {path : '', component : LoginComponent},
  {path : 'login', component : LoginComponent},
  {path : 'main', component : MainComponent},
  {path : 'history', component : HistoryComponent},
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
