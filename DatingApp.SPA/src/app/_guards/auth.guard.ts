// this was created by CLI command:
// ng g guard auth --spec=false
// do not forget to add AuthGuard to app.module
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  // add auth service to check if user is logged in
  constructor(private authService: AuthService, private router: Router,
  private alertify: AlertifyService) {}

  canActivate(): boolean {
      if (this.authService.loggedIn()) {
        return true;
      }
      this.alertify.error('You need to be logged in to access this area');
      this.router.navigate(['/home']);
      return false;
  }
}
