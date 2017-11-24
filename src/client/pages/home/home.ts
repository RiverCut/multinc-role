import { Component } from '@angular/core';
import { Events } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';

import { ENV } from '../../../../environments/environment.default';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public events: Events,
    public authService: AuthService
  ) {}

  ngOnInit() {
    if(ENV.AutoLogin) this.handleLogin();
  }

  handleLogin() {
    if(this.authService.isAuthenticated()) {
      this.events.publish('multinc:authenticated', this.authService.token);
    } else {
      this.authService.login();
    }
  }

}
