import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { User } from '../_models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl + 'auth/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  currentUser: User;
  photoUrl = new BehaviorSubject<string>('../../assets/user.png'); // to hold main photo of authenticated user
  currentPhotoUrl = this.photoUrl.asObservable(); // our components can subscribe to this property to get the latest photo url

  constructor(private http: HttpClient) {}

  changeMemberPhoto(photoUrl: string) {
    // the next value of photo Url so nav component can listen to this change
    this.photoUrl.next(photoUrl);
  }

  login(model: any) {
    return this.http.post(this.baseUrl + 'login', model).pipe(
      map((response: any) => {
        const jsonResponse = response;
      if (jsonResponse) {
          localStorage.setItem('token', jsonResponse.token);
          localStorage.setItem('user', JSON.stringify(jsonResponse.user));
          this.decodedToken = this.jwtHelper.decodeToken(jsonResponse.token);
          this.currentUser = jsonResponse.user;
        // set default photo if there is none
          this.changeMemberPhoto(this.currentUser.photoUrl);
        }
      })
    );
  }

  register(user: User) {
    return this.http.post(this.baseUrl + 'register', user);
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }
}
