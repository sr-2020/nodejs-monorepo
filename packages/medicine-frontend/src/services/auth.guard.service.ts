import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'medicine-frontend/src/services/auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router) {}

  public canActivate(): boolean {
    if (!this._authService.getUserId()) {
      this._router.navigate(['login']);
      return false;
    }
    return true;
  }
}
