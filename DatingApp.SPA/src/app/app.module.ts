import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule, TabsModule, BsDatepickerModule, PaginationModule, ButtonsModule } from 'ngx-bootstrap';
import { RouterModule } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxGalleryModule } from 'ngx-gallery';
import { FileUploadModule } from 'ng2-file-upload';
import {TimeAgoPipe} from 'time-ago-pipe';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { AuthService } from './_services/auth.service';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { ErrorInterceptorProvider } from './_services/error.interceptor';
import { AlertifyService } from './_services/alertify.service';
import { MemberListComponent } from './members/member-list/member-list.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { appRoutes } from './routes';
import { AuthGuard } from './_guards/auth.guard';
import { UserService } from './_services/user.service';
import { MemberCardComponent } from './members/member-card/member-card.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberListResolver } from './_resolvers/member-list.resolver';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { PreventUnsavedChangesGuard } from './_guards/prevent-unsaved-changes-guard';
import { PhotoEditorComponent } from './members/photo-editor/photo-editor.component';
import { ListsResolver } from './_resolvers/lists.resolver';
import { MessagesResolver } from './_resolvers/messages.resolver';
import { MemberMessagesComponent } from './members/member-messages/member-messages.component';

export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
   declarations: [
      AppComponent,
      NavComponent,
      HomeComponent,
    RegisterComponent,
    MemberListComponent,
      ListsComponent,
      MessagesComponent,
      MemberCardComponent,
      MemberDetailComponent,
      MemberEditComponent,
      PhotoEditorComponent,
      TimeAgoPipe, /* renders moments ago instead of showing date */
      MemberMessagesComponent
   ],
   imports: [
      BrowserModule,
      /* added for consuming restweb api with angular 6 */
      HttpClientModule,
      /* use angular forms in components */
      FormsModule,
      /* enable reactive forms in register component*/
      ReactiveFormsModule,
      /* since we are not using jquery, added bootswatch for dropdowns */
      BsDropdownModule.forRoot(),
      /* since we are not using jquery, added bootswatch for dates */
      BsDatepickerModule.forRoot(),
      /* use button for sorting from ngx bootstrap */
      ButtonsModule.forRoot(),
      /* use pagination from ngx bootstrap */
      PaginationModule.forRoot(),
      /* import TabsModule from ngxBootrap */
      TabsModule.forRoot(),
      /* enable routing */
      RouterModule.forRoot(appRoutes),
      /* third party component for gallery */
      NgxGalleryModule,
      /* third party component for uploading photos */
      FileUploadModule,
      /*this whitelistedDomains URL should be from environment or a global variable */
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:5001'],
        blacklistedRoutes: ['localhost:5001/api/auth']
      }
    })

  ],
  providers: [
    AuthService, // add custom auth.service to be used by nav.component
    ErrorInterceptorProvider,
    AlertifyService, // add alertify component that wraps alertifys lib
    AuthGuard, // manage url routes
    UserService, // get users information from API
    MemberDetailResolver, // and avoid safe navigation operator user?.aproperty when loading a page
    MemberListResolver, // and avoid safe navigation operator user?.aproperty when loading a page
    MemberEditResolver, // get id from decoded token and avoid safe navigation operator user?.aproperty when loading a page
    PreventUnsavedChangesGuard, // guard to manage when leaving form page
    ListsResolver, // preload users data before redering a lists page
    MessagesResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
