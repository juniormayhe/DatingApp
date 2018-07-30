import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { User } from '../../_models/User';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../../_services/alertify.service';
import { NgForm } from '@angular/forms';
import { UserService } from '../../_services/user.service';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {

  // the way to access methods and properties on child component with ViewChild decorator
  @ViewChild('editForm') editForm: NgForm;
  user: User;
  navPhotoUrl: string;
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(private route: ActivatedRoute,
    private alertifyService: AlertifyService,
    private userService: UserService,
    private authService: AuthService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data['user'];
    });
    // subscribe to changes on authService.currentPhotoUrl
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.navPhotoUrl = photoUrl);
  }

  updateUser() {
    this.userService.updateUser(this.authService.decodedToken.nameid, this.user).subscribe(next => {
      this.alertifyService.success('Profile updated successfully');
        this.editForm.reset(this.user);
    }, error => {
      this.alertifyService.error(error);
    });
  }

  // emitted from Output child component photo-editor after a main photo is set
  updateMainPhoto(photoUrl) {
    this.user.photoUrl = photoUrl;
  }

}
