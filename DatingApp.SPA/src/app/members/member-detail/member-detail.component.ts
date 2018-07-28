import { AuthService } from './../../services/auth.service';
import { AlertifyService } from '../../services/alertify.service';
import { UserService } from '../../services/user.service';
// since this component is nested within a members subfolder,
// you must add this component manually in app.module.ts
// add this component to route.ts
import { Component, OnInit } from '@angular/core';
import { User } from '../../_models/User';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryImage, NgxGalleryOptions, NgxGalleryAnimation } from 'ngx-gallery';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  alreadyLiked: boolean;

  constructor(private authService: AuthService,
    private userService: UserService,
    private alertifyService: AlertifyService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    // brings data from observable returned by MemberDetailResolver
    this.route.data.subscribe(data => {
      this.user = data['user'];
      this.setAlreadyLiked(this.user.id);
    });
    // this.loadUser();

    this.galleryOptions = [{
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
    }];
    this.galleryImages = this.getImages();
  }

  setAlreadyLiked(recipientId: number) {
    this.userService.getAlreadyLikedUser(this.authService.decodedToken.nameid, recipientId).subscribe(data => {
      this.alreadyLiked = data;
    }, error => {
      this.alreadyLiked = false;
      this.alertifyService.error(error);
    });
  }

  getImages() {
    const imageUrls = [];
    for (let i = 0; i < this.user.photos.length; i++) {
      imageUrls.push({
        small: this.user.photos[i].url,
        medium: this.user.photos[i].url,
        large: this.user.photos[i].url,
        description: this.user.photos[i].description
      });

    }
    return imageUrls;
  }
  /*
  we no longer need to use a this method since resolver loads the data in routes.ts
  to avoid safe navigation operator
  loadUser() {
    // cast snapshot params to number with +
    this.userService.getUser(+this.route.snapshot.params['id'])
      .subscribe((user: User) => this.user = user,
        error => this.alertifyService.error(error)); // return response to user Property
  }
  */

 sendLike(recipientId: number) {
    this.userService.sendLike(this.authService.decodedToken.nameid, this.user.id).subscribe(data => {
      this.alertifyService.success('You have liked ' + this.user.knownAs);

      // any way to update UI without this trash?
      const btnLikeMe = <HTMLInputElement> document.getElementById('btnLikeMe');
      btnLikeMe.classList.remove('btn-primary');
      btnLikeMe.classList.add('btn-success');
      btnLikeMe.classList.add('active');
      btnLikeMe.disabled = true;

    }, error => {
      this.alertifyService.error(error);
    });
  }
}
