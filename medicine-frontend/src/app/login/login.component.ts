import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { currentTimestamp } from 'src/app/util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(
    private _router: Router,
    private _matSnackBar: MatSnackBar,
    private _authService: AuthService,
    private _dataService: DataService) { }

  username: string;
  password: string;

  public async login(): Promise<void> {
    try {
      const v = await this._authService.tryLoginAndGetViewmodel(this.username, this.password);
      this._dataService.setViewModel(v);
      this._router.navigate(['main']);
    }
    catch (err) {
      console.warn(JSON.stringify(err));
      if (err.status == 404)
        this.showLoginFailedAlert('Персонаж с данным ID не найден');
      else if (err.status == 401)
        this.showLoginFailedAlert('Неправильный пароль');
      else
        this.showLoginFailedAlert('Ошибка подключения к серверу, повторите попытку позже');
    }
  }

  private showLoginFailedAlert(msg: string) {
    this._matSnackBar.open(msg, '', { duration: 2000 });
  }
}
