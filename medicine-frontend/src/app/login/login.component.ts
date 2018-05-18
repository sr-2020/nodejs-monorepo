import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private _authService: AuthService) { }

  username: string;
  password: string;

  async login(): Promise<void> {
    const v = await this._authService.tryLoginAndGetViewmodel(this.username, this.password);
    console.log(JSON.stringify(v));
  }

}
