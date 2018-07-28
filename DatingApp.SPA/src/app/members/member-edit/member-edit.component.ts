import { AuthService } from './../../services/auth.service';
import { UserService } from './../../services/user.service';
import { AlertifyService } from './../../services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../../_models/User';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  user: User;
  // the way to access methods and properties on child component with ViewChild decorator
  @ViewChild('editForm') editForm: NgForm;
  navPhotoUrl: string;

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
    this.userService.updateUser(this.authService.decodedToken.nameid, this.user)
      .subscribe(next => {
        this.alertifyService.success('Profile updated successfully');
        this.editForm.reset(this.user);
      }, error => this.alertifyService.error(error));
  }

  // emitted from Output child component photo-editor after a main photo is set
  updateMainPhoto(photoUrl) {
    this.user.photoUrl = photoUrl;
  }

}
