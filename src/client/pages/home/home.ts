import { Component } from '@angular/core';
import { Events, NavParams } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';

import { ENV } from '../../../../environments/environment.default';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public events: Events,
    public navParams: NavParams,
    public authService: AuthService
  ) {}

  ngOnInit() {
    if(ENV.AutoLogin && !this.navParams.get('ignoreAutoLogin')) this.handleLogin();
  }

  handleLogin() {
    if(this.authService.isAuthenticated()) {
      this.events.publish('multinc:authenticated');
    } else {
      this.authService.login();
    }
  }

}
