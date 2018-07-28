import { AlertifyService } from './../../services/alertify.service';
import { UserService } from './../../services/user.service';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../_models/User';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  // pass info to this child component
  @Input() user: User; // each card component represents a single user

  constructor(private authService: AuthService,
  private userService: UserService,
  private alertifyService: AlertifyService) { }

  ngOnInit() {

  }


  sendLike(recipientId: number) {
    this.userService.sendLike(this.authService.decodedToken.nameid, this.user.id).subscribe(data => {
      this.alertifyService.success('You have liked ' + this.user.knownAs);
    }, error => {
      this.alertifyService.error(error);
    });
  }
}
