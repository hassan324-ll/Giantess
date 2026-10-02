import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    const token = this.authService.getToken();
    if (!token) {
      return of(this.router.parseUrl('/admin-login'));
    }

    return of(true);
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.canActivate();
  }
}
