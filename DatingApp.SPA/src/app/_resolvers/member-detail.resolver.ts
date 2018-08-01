import { Injectable } from '@angular/core';
import { User } from '../_models/User';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


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

  resolve(route: ActivatedRouteSnapshot): Observable<User> {
        return this.userService.getUser(route.params['id']).pipe(
            catchError(error => {
                this.alertifyService.error('Problem retrieving data');
      this.router.navigate(['/members']);
                return of(null);
            })
        );
  }
}
