import { Component, OnInit } from '@angular/core';
import { User } from '../_models/User';
import { PaginationHeader, PaginatedResult } from '../_models/PaginationHeader';
import { AuthService } from '../_services/auth.service';
import { UserService } from '../_services/user.service';
import { ActivatedRoute } from '../../../node_modules/@angular/router';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {

  // this will hold data from resolver
  users: User[];
  paginationHeader: PaginationHeader;
  likesParam: string;

  constructor(private authService: AuthService,
    private userService: UserService,
  private activatedRoute: ActivatedRoute,
private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      // preloaded users from ListsResolver
      this.users = data['users'].result;
      this.paginationHeader = data['users'].paginationHeader;
    });
    this.likesParam = 'Likers';
  }

  loadUsers() {

    // call user service
    this.userService.getUsers(this.paginationHeader.currentPage, this.paginationHeader.itemsPerPage, null, this.likesParam)
      .subscribe((response: PaginatedResult<User[]>) => {
        this.users = response.result;
        this.paginationHeader = response.paginationHeader;
      }, error => {
        this.alertifyService.error(error);
      });
  }

  pageChanged(event: any): void {
    // console.log('Page changed to ' + event.page);
    // console.log('Items per Page ' + event.itemsPerPage);
    // set the new page
    this.paginationHeader.currentPage = event.page;
    this.loadUsers();
  }

}
