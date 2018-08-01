import { Component, OnInit } from '@angular/core';
import { AuthService } from './_services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from './_models/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
// added onInit and ngOnInit to load logged username on every page refresh
export class AppComponent implements OnInit {

  jwtHelper = new JwtHelperService();

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
        this.authService.changeMemberPhoto(user.photoUrl);
    }
  }
}
