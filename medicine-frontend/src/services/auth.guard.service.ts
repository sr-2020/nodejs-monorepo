import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router) {}

  canActivate(): boolean {
    if (!this._authService.getUserId()) {
      this._router.navigate(['login']);
      return false;
    }
    return true;
  }

}