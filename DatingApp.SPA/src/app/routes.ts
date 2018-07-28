import { PreventUnsavedChangesGuard } from './_guards/prevent-unsaved-changes-guard';
import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { MemberListResolver } from './_resolvers/member-list.resolver';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { AuthGuard } from './_guards/auth.guard';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { Routes } from '@angular/router';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { ListsResolver } from './_resolvers/lists.resolver';

export const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  // dummy route to apply canActivate globally to protect all remaining routes
  { path: '',
    runGuardsAndResolvers: 'always',
    // canActivate protect routes. If user is logged in, if AuthGuard returns true, the route can be browsed
    canActivate: [AuthGuard],
    children: [
      // inner routes we want to protect
      { path: 'members', component: MemberListComponent, resolve: {users: MemberListResolver}},
      // add MemberDetailResolver to avoid safe navigation opeator when loading page
      { path: 'members/:id', component: MemberDetailComponent, resolve: {user:  MemberDetailResolver}},
      // we get the id to edit from the decoded token
      { path: 'member/edit', component: MemberEditComponent,
        canDeactivate: [PreventUnsavedChangesGuard], // protect from leaving dirty form
        resolve: {user: MemberEditResolver}},
      { path: 'messages', component: MessagesComponent },
      { path: 'lists', component: ListsComponent, resolve: { users: ListsResolver} } // you must add resolvers in app.module file
    ]
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
