import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { AuthModule } from './auth/auth.module';
import { MemberCardComponent } from './members/member-card/member-card.component';
import { UserService } from './services/user.service';
import { AuthGuard } from './_guards/auth.guard';
import { AlertifyService } from './services/alertify.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BsDropdownModule, TabsModule, BsDatepickerModule, PaginationModule, ButtonsModule } from 'ngx-bootstrap';
import { NgxGalleryModule } from 'ngx-gallery';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { AuthService } from './services/auth.service';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './routes';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberListResolver } from './_resolvers/member-list.resolver';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { PhotoEditorComponent } from './members/photo-editor/photo-editor.component';
import { PreventUnsavedChangesGuard } from './_guards/prevent-unsaved-changes-guard';
import { FileUploadModule } from 'ng2-file-upload';
import { TimeAgoPipe } from 'time-ago-pipe';
import { ListsResolver } from './_resolvers/lists.resolver';

@NgModule({
   declarations: [
      AppComponent,
      NavComponent,
      RegisterComponent,
      HomeComponent,
      ListsComponent,
      MessagesComponent,
      MemberCardComponent,
      MemberListComponent,
      MemberDetailComponent,
      MemberEditComponent,
      PhotoEditorComponent,
      TimeAgoPipe /* renders moments ago instead of showing date */
   ],
   imports: [
      BrowserModule,
      /* added for consuming restweb api */ HttpModule,
      /* useangularformsincomponents */ FormsModule,
      /* enable reactive forms in register component*/ ReactiveFormsModule,
      /* since we are not using jquery, added bootswatch for dropdowns */ BsDropdownModule.forRoot(),
      /* since we are not using jquery, added bootswatch for dates */ BsDatepickerModule.forRoot(),
      /* import TabsModule from ngxBootrap */ TabsModule.forRoot(),
      /* enable routing */ RouterModule.forRoot(appRoutes),
      /* use angular 2 jwt to send tokens to API */ AuthModule,
      /* third party component for gallery */ NgxGalleryModule,
      /* third party component for uploading photos */ FileUploadModule,
      /* use pagination from ngx bootstrap */ PaginationModule.forRoot(),
      /* use button for sorting from ngx bootstrap */ ButtonsModule.forRoot()
  ],
  providers: [
    AuthService, // add custom auth.service to be used by nav.component
    AlertifyService, // add alertify component that wraps alertifys lib
    AuthGuard, // manage url routes
    UserService, // get users information from API
    MemberDetailResolver, // and avoid safe navigation operator user?.aproperty when loading a page
    MemberListResolver, // and avoid safe navigation operator user?.aproperty when loading a page
    UserService, // get users information from API
    MemberEditResolver, // get id from decoded token and avoid safe navigation operator user?.aproperty when loading a page
    ListsResolver, // preload users data before redering a lists page
    PreventUnsavedChangesGuard, // guard to manage when leaving form page
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
