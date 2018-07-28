import { JwtHelper } from 'angular2-jwt';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { User } from './_models/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
// added onInit and ngOnInit to load logged username on every page refresh
export class AppComponent implements OnInit {
  title = 'dating app';
  jwtHelper: JwtHelper = new JwtHelper();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const user: User = JSON.parse(localStorage.getItem('user'));
    if (token) {
      // nav component will always read authService.decodedToken even after page reload
      this.authService.decodedToken = this.jwtHelper.decodeToken(token);
    }

    // set user using object saved in local storage
    if (user) {
      this.authService.currentUser = user;
      if (this.authService.currentUser.photoUrl !== null) {
        this.authService.changeMemberPhoto(user.photoUrl);
      } else {
        this.authService.changeMemberPhoto(this.authService.DEFAULT_PHOTO);
      }
    }
  }
}
