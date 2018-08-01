import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {};
  navPhotoUrl: string;
  // make authService available in html component
  constructor(public authService: AuthService,
    private alertifyService: AlertifyService,
    private router: Router) { }

  ngOnInit() {
    // tell nav component to listen to changes on authService.currentPhotoUrl
    this.authService.currentPhotoUrl
      .subscribe(photoUrl => this.navPhotoUrl = photoUrl);
  }

  login() {
    this.authService.login(this.model).subscribe(data => {
      this.alertifyService.success('logged in successfully');
    }, error => {
      this.alertifyService.error('Failed to login');
    }, () => {
      // when completed
      this.router.navigate(['/members']);
    });
  }

  loggedIn() {
    // return this.authService.loggedIn();
    const token = localStorage.getItem('token');
    return !!token;
  }

  logout() {
    // avoid to logout without user confirmation
    if (localStorage.getItem('tryingToQuit') === 'true') {
      const discardChanges = confirm('Discard changes?');
      if (!discardChanges) {
        return;
      }
      localStorage.removeItem('tryingToQuit');
    }
    // reset localstorage
    this.authService.currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authService.decodedToken = null;
    this.authService.currentUser = null;
    this.alertifyService.message('logged out');
    this.router.navigate(['/home']);
  }


}
