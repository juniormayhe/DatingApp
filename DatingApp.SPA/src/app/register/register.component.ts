import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { User } from '../_models/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();

  user: User;
  // add reactive forms in app.module
  registerForm: FormGroup;
  // add a configuration for ngx Datepicker
  bsConfig: Partial<BsDatepickerConfig>;


  constructor(private authService: AuthService,
    private alertifyService: AlertifyService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    /** replaced by formBuilder
    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]),
      confirmPassword: new FormControl('', Validators.required)
    }, this.passwordMatchValidator);
     */
    this.createRegisterForm();
    // setup date picker options
    this.bsConfig = {
      containerClass: 'theme-blue'
    };
  }

  // formbuilder simplifies form creation and encapsulates a FormGroup with FormControls
  createRegisterForm() {
    // we no longer need to instantiate FormControl for each field
    this.registerForm = this.formBuilder.group({
      gender: ['male'] /*required wont work on radio button, you must set a default value*/,
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {validator: this.passwordMatchValidator});
  }
  passwordMatchValidator(formGroup: FormGroup) {
    // returns null if validation passed
    return formGroup.get('password').value === formGroup.get('confirmPassword').value ? null : { 'mismatch' : true };
  }

  register() {
    // this.authService.register(this.model).subscribe(() => {
    //   this.alertifyService.success('registration successful');
    // }, error => {
    //   this.alertifyService.error('cannot register this user');
    //   alert(error);
    // });
    console.log(this.registerForm.value);
    if (this.registerForm.valid) {
      // copy properties to {} and return the target object
      this.user = Object.assign({}, this.registerForm.value);
      this.authService.register(this.user).subscribe(() => {
        this.alertifyService.success('Registration successful');
      }, error => {
        this.alertifyService.error(error);
      }, /*automatically login user and redirect him to home page*/() => {
        this.authService.login(this.user).subscribe(() => {
          this.router.navigate(['/members']);
        });
      });
    }
  }

  cancel() {
    this.cancelRegister.emit(false); // pass false to parent component
    // this.alertifyService.message('cancelled');
  }

}
