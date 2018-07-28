import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';
import { User } from '../_models/User';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class AuthService {
  baseUrl = 'https://localhost:5001/api/auth/';
  userToken: any;
  decodedToken: any;
  public currentUser: User; // to hold main photo of authenticated user
  public readonly DEFAULT_PHOTO = '../../assets/user.png';
  jwtHelper: JwtHelper = new JwtHelper();

  // communication between components
  private photoUrl = new BehaviorSubject<string>(this.DEFAULT_PHOTO);
  currentPhotoUrl = this.photoUrl.asObservable(); // our components can subscribe to this property to get the latest photo url

  constructor(private http: Http) { }

  changeMemberPhoto(photoUrl: string) {
    // the next value of photo Url so nav component can listen to this change
    this.photoUrl.next(photoUrl);
  }

  login(model: any) {
    return this.http.post(this.baseUrl + 'login', model, this.requestOptions()).map((response: Response) => {
      const jsonResponse = response.json();
      if (jsonResponse) {
        localStorage.setItem('token', jsonResponse.tokenString);
        localStorage.setItem('user', JSON.stringify(jsonResponse.filteredUser));
        this.decodedToken = this.jwtHelper.decodeToken(jsonResponse.tokenString);
        this.currentUser = jsonResponse.filteredUser;
        // console.log(this.currentUser);
        // console.log(this.decodedToken);
        this.userToken = jsonResponse.tokenString;

        // set default photo if there is none
        if (this.currentUser.photoUrl !== null) {
          this.changeMemberPhoto(this.currentUser.photoUrl);
        } else {
          this.changeMemberPhoto(this.DEFAULT_PHOTO);
        }
      }
    }).catch(this.handleError);
  }

  loggedIn() {
    return tokenNotExpired('token');
  }

  register(user: User) {
    return this.http.post(this.baseUrl + 'register', user, this.requestOptions()).catch(this.handleError);
  }

  private requestOptions() {
    const headers = new Headers({'Content-type': 'application/json'});
    return new RequestOptions({headers: headers});
  }

  private handleError(error: any) {
    const applicationError = error.headers.get('Application-Error');
    if (applicationError) {
      return Observable.throw(applicationError);
    }

    const serverError = error.json();
    let modelStateErrors = '';
    if (serverError) {
      for (const key in serverError) {
        if (serverError[key]) {
          console.log(serverError[key]);
          modelStateErrors += serverError[key] + '\n';
        }
      }
    }
    return Observable.throw(
      modelStateErrors || 'Server error'
    );
  }

}
