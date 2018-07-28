// import { Observable } from 'rxjs/Observable'; // importing Observable does not work with ngx-bootstrap 2.0.5
import { Observable } from 'rxjs/'; // this works with ngx-bootstrap 2.0.5
import { AlertifyService } from '../services/alertify.service';
import { UserService } from '../services/user.service';

import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '../_models/User';

import 'rxjs/add/operator/catch';

/**Since this is not a component (which is already injectable)
 * we add injectable here.
 * Component is already a subtype of Injectable
 * but his resolver is not.
 *
 * This class must be a provider in app.module.ts and must be on routes.ts
*/
@Injectable ()
export class MemberDetailResolver implements Resolve<User> {
  constructor(private userService: UserService,
    private router: Router,
    private alertifyService: AlertifyService) {
  }

  // route resolver already subscribe you do not need to subscribe to the observable after getUSer
  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    return this.userService.getUser(+route.params['id']).catch(error => {
      this.alertifyService.error('Problem retrieving data');
      this.router.navigate(['/members']);
      return Observable.of(null);
    });
  }
}
