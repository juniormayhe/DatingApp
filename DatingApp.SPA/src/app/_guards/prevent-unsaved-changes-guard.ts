// this was created by CLI command:
// ng g guard auth --spec=false
// do not forget to add PreventUnsavedChangesGuard to app.module
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';

@Injectable()
export class PreventUnsavedChangesGuard implements CanDeactivate<MemberEditComponent> {

  canDeactivate(component: MemberEditComponent) {
    if (component.editForm.dirty) {
      localStorage.setItem('tryingToQuit', 'true');
      const response = confirm('Are you sure you want to continue?\nAny unsaved changes will be lost');
      return response;
    }
    // can leave form page if form is not dirty
    return true;
  }
}
