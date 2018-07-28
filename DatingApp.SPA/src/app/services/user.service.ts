import { PaginatedResult } from './../_models/PaginationHeader';
import { AuthHttp } from 'angular2-jwt';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from '../_models/User';
// handleError
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import { Message } from '../_models/message';
import { HttpParams } from '../../../node_modules/@angular/common/http';
import { map } from '../../../node_modules/rxjs/operators';

@Injectable()
export class UserService {
  baseUrl = environment.apiUrl;

  constructor(private authHttp: AuthHttp) { }

  /*removed return type because we are subscriing to PaginatedResult<User[]>: Observable<User[]>*/
  getUsers(page?: number, itemsPerPage?: number, userParams?, likesParam?) {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
    let queryString = '?';
    if (page != null && itemsPerPage != null) {
      queryString += 'pageNumber=' + page + '&pageSize=' + itemsPerPage;
    }

    if (userParams != null) {
      queryString += '&minAge=' + userParams.minAge;
      queryString += '&maxAge=' + userParams.maxAge;
      queryString += '&gender=' + userParams.gender;
      queryString += '&orderBy=' + userParams.orderBy;
    }

    if (likesParam === 'Likers') {
      queryString += '&likers=true';
    } else if (likesParam === 'Likees') {
      queryString += '&likees=true';
    }

    return this.authHttp
      .get(this.baseUrl + 'users' + queryString/*, this.jwt()*/)
      /*replaced by pagination .map(response => <User[]>response.json())*/
      .map((response: Response) => {
        // get paginated user array as json
        paginatedResult.result = response.json();

        // check if there is Pagination
        const paginationHeader = response.headers.get('Pagination');
        if (paginationHeader != null) {
          paginatedResult.paginationHeader = JSON.parse(paginationHeader);
        }
        // return paginated result of User[]
        return paginatedResult;
      })
      .catch(this.handleError);
  }

  getUser(id): Observable<User> {
    return this.authHttp
      .get(this.baseUrl + 'users/' + id/*, this.jwt()*/)
      .map(response => <User>response.json())
      .catch(this.handleError);
  }


  getAlreadyLikedUser(userId: number, recipientId: number): Observable<boolean> {
    return this.authHttp
      .get(this.baseUrl + 'users/' + userId + '/alreadyliked/' + recipientId)
      .map(response => <boolean>response.json())
      .catch(this.handleError);
  }


  updateUser(id: number, user: User) {
    return this.authHttp.put(this.baseUrl + 'users/' + id, user)
      .catch(this.handleError);
  }

  setMainPhoto(userId: number, photoId: number) {
    return this.authHttp.post(this.baseUrl + 'users/' + userId + '/photos/' + photoId + '/setMain',
      {}).catch(this.handleError);

  }
  deletePhoto(userId: number, photoId: number) {
    return this.authHttp.delete(this.baseUrl + 'users/' + userId + '/photos/' + photoId).catch(this.handleError);
  }

  sendLike(userId: number, recipientId: number) {
    return this.authHttp.post(this.baseUrl + 'users/' + userId + '/like/' + recipientId, {}).catch(this.handleError);
  }

  // getMessages(userId: number, page?, itemsPerPage?, messageContainer?): Observable<PaginatedResult<Message[]>> {
  //   const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();
  //   let params = new HttpParams();
  //   params = params.append('MessageContainer', messageContainer);

  //   if (page != null && itemsPerPage != null) {
  //     params = params.append('pageNumber', page);
  //     params = params.append('pageSize', itemsPerPage);
  //   }
  //   return this.authHttp.get(this.baseUrl + 'users/' + userId + '/messages', {observe: 'response', params})
  //     .pipe(
  //       map(response => {
  //         paginatedResult.result = response.body;
  //         if (response.headers.get('Pagination') != null) {
  //           paginatedResult.paginationHeader = JSON.parse(response.headers.get('Pagination'));
  //         }

  //         return paginatedResult;
  //       })
  //     )
  //     .catch(this.handleError);
  // }

  /**With angular2jwt you do not need to send token along with the request using http: Http get
   * this.authHttp.get(this.baseUrl + 'users', jwt())*/
  /*private jwt() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new Headers({'Authorization': 'Bearer ' + token});
      headers.append('Content-type', 'application-json');
      return new RequestOptions({headers: headers});
    }
  }*/


  private handleError(error: any) {
    const applicationError = error.headers.get('Application-Error');
    if (applicationError) {
      return Observable.throw(applicationError);
    }
    // if error is a plain text convert it to json?
    let serverError = null;
    serverError = error.json();

    let modelStateErrors = '';
    if (serverError) {
      for (const key in serverError) {
        if (serverError[key]) {
          console.log('found error:', serverError[key]);
          modelStateErrors += serverError[key] + '\n';
        }
      }
    }
    return Observable.throw(
      modelStateErrors || 'Server error'
    );
  }
}
