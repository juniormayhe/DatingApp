import { Injectable } from '@angular/core';

declare let alertify: any; // a global block-scoped variable

@Injectable()
export class AlertifyService {
  // AlertifyService must be added in app.module.ts

  constructor() { }

  confirm(message: string, okCallback: () => any) {
    alertify.confirm(message, function(e) {
      // if there is a function, call the callback
      if (e) {
        okCallback();
      }
    });
  }

  success(message: string) {
    alertify.success(message);
  }


  error(message: string) {
    alertify.error(message);
  }


  warning(message: string) {
    alertify.warning(message);
  }

  message(message: string) {
    alertify.message(message);
  }

}
