import { AuthService } from './../../_services/auth.service';
// since this component is nested within a members subfolder,
// you must add this component manually in app.module.ts
// add this component to route.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../../_models/User';
import { UserService } from '../../_services/user.service';
import { AlertifyService } from '../../_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs') memberTabs: TabsetComponent;
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

    // get querystring from messages component
    this.route.queryParams.subscribe(params => {
      const selectedTab = params['tab'];
      this.memberTabs.tabs[selectedTab > 0 ? selectedTab : 0].active = true;
    });

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];
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
        big: this.user.photos[i].url,
        description: this.user.photos[i].description
      });

    }
    return imageUrls;
  }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
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
