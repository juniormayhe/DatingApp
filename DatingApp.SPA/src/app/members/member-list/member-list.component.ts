import { PaginationHeader, PaginatedResult } from '../../_models/PaginationHeader';
import { AlertifyService } from '../../services/alertify.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../../_models/User';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  users: User[];
  user: User = JSON.parse(localStorage.getItem('user'));
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];
  userParams: any = {};
  paginationHeader: PaginationHeader;

  constructor(private userService: UserService,
    private alertifyService: AlertifyService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    // a route resolver helps on loading data before rendering component
    // user[] come from member-list-resolver route data
    this.route.data.subscribe(data => {
       // when using pagination data[users] is pagedlist and result is User[]
       this.users = data['users'].result;
       this.paginationHeader = data['users'].paginationHeader;
    });
    // setup filtering
    console.log('user ngOnInit:', this.user);
    this.userParams.gender = this.user.gender === 'female' ? 'male' : 'female';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = 'lastActive';
    // if you are not using route resolver, uncomment
    // this.loadUsers();
  }

  loadUsers() {
    /* if you are not using member list route resolver: in the first load, setup default values
    if (!this.paginationHeader) {
      this.paginationHeader = new PaginationHeader();
      this.paginationHeader.currentPage = 1;
      this.paginationHeader.itemsPerPage = 5;
    }*/

    // call user service
    this.userService.getUsers(this.paginationHeader.currentPage, this.paginationHeader.itemsPerPage, this.userParams)
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

  resetFilters() {
        // setup filtering
        console.log(this.user);
        this.userParams.gender = this.user.gender === 'female' ? 'male' : 'female';
        this.userParams.minAge = 18;
        this.userParams.maxAge = 99;
        this.userParams.orderBy = 'lastActive';
        this.loadUsers();
  }

  /*
  loading users without pagination
  loadUsers() {
    console.log('loading users');
    this.userService.getUsers().subscribe((users: User[]) => {
      this.users = users;
    }, error => {
      this.alertifyService.error(error);
    });
  }*/

}
