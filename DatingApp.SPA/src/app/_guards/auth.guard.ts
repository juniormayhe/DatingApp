// this was created by CLI command:
// ng g guard auth --spec=false
// do not forget to add AuthGuard to app.module
import { AlertifyService } from '../services/alertify.service';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate {

  // add auth service to check if user is logged in
  constructor(private authService: AuthService,
  private router: Router,
  private alertify: AlertifyService) {}
  canActivate(
    /* removed not needed arguments:
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot*/): Observable<boolean> | Promise<boolean> | boolean {
      if (this.authService.loggedIn()) {
        return true;
      }
      this.alertify.error('You need to be logged in to access this area');
      this.router.navigate(['/home']);
      return false;
  }
}
