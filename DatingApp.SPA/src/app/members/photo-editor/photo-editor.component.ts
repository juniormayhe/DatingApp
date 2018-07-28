import { AlertifyService } from './../../services/alertify.service';
import { UserService } from './../../services/user.service';
import { AuthService } from './../../services/auth.service';
import { environment } from './../../../environments/environment';
// this is child component of member-edit component
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Photo } from '../../_models/Photo';
import { FileUploader } from 'ng2-file-upload';
import * as _ from 'underscore';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {

  @Input() photos: Photo[];
  public uploader: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  currentMainPhoto: Photo;
  // output to affect the main photo on Your Profile on parent component (member-edit-component)
  @Output() getMemberPhotoChange = new EventEmitter<string>();

  constructor(private authService: AuthService,
    private userService: UserService,
    private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.initializeUploader();
  }

  public fileOverBase(e: any): void {
      this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photos',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true, /* remove from queue */
      autoUpload: false, /* user must start manually upload*/
      maxFileSize: 10 * 1024 * 1024 /* 10 mb */
    });

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const jsonResponse: Photo = JSON.parse(response);
        const photo = {
          id: jsonResponse.id,
          url: jsonResponse.url,
          dateAdded: jsonResponse.dateAdded,
          description: jsonResponse.description,
          isMain: jsonResponse.isMain
        };
        this.photos.push(photo);

        // if user has uploaded a photo
        if (photo.isMain) {
          this.authService.changeMemberPhoto(photo.url); // changes BehaviorSubject photoUrl and notify subscribers
          // keep value after user refreshes page
          this.authService.currentUser.photoUrl = photo.url;
          // update user object in local storage
          localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
        }
      }
    }; // onSuccessItem
  }

  setMainPhoto(newMainPhoto: Photo) {
    this.userService.setMainPhoto(this.authService.decodedToken.nameid,
      newMainPhoto.id).subscribe(() => {
        // after setting main photo in db, use underscore to toggle button color in UI
        // set currentMainPhoto.isMain = false and the newMainPhoto.isMain=true
      this.currentMainPhoto = _.findWhere(this.photos, {isMain: true});
      this.currentMainPhoto.isMain = false;
      newMainPhoto.isMain = true;
      // send new main photo url to parent component (member-edit-component)
      // in member-edit html you must add on app-photo-editor tag:
      // (getMemberPhotoChange)="method_to_call_from_parent_component_member-edit($event)"
      // this.getMemberPhotoChange.emit(newMainPhoto.url); --> replaced by BehaviorSubject
      this.authService.changeMemberPhoto(newMainPhoto.url); // changes BehaviorSubject photoUrl and notify subscribers
        // keep value after user refreshes page
        this.authService.currentUser.photoUrl = newMainPhoto.url;
        // update user object in local storage
        localStorage.setItem('user', JSON.stringify(this.authService.currentUser));

    }, error => {
        this.alertifyService.error(error);
    });
  }

  deletePhoto(photoId: number) {
    this.alertifyService.confirm('Are you sure you want to delete this photo?', () => {
      this.userService.deletePhoto(this.authService.decodedToken.nameid, photoId).subscribe(() => {
        // remove selected element from photos array
        this.photos.splice(_.findIndex(this.photos, { id: photoId }), 1);
        this.alertifyService.success('Photo has been deleted');
      }, error => {
        this.alertifyService.error('Failed to delete photo');
      });
    });
  }
}
