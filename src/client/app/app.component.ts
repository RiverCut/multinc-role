import { Component, ViewChild } from '@angular/core';
import { Events, Nav, NavController, Platform } from 'ionic-angular';
// import { StatusBar } from '@ionic-native/status-bar';
// import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { AuthService } from '../providers/auth.service';
import { DeepstreamService } from '../providers/deepstream.service';
import { NotificationService } from '../providers/notification.service';
import { LobbyPage } from '../pages/lobby/lobby';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/timer';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: NavController;

  rootPage = HomePage;

  private reconnect$: any;

  constructor(
    private platform: Platform,
    // private statusBar: StatusBar,
    // private splashScreen: SplashScreen,
    private notificationService: NotificationService,
    private authService: AuthService,
    private deepstreamService: DeepstreamService,
    private events: Events
  ) {

    this.listenForEvents();

    this.authService.handleAuthentication()
      .then(() => {
        this.events.publish('multinc:authenticated');
      });

    this.platform.ready().then(() => {
      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
    });
  }

  public listenForEvents() {
    this.events.subscribe('multinc:authenticated', async () => {

      try {
        const loggedIn = await this.deepstreamService.login(this.authService.token);

        if(!loggedIn) {
          this.notificationService.alert({
            title: 'Unable to Connect',
            subTitle: 'Please refresh the page and try again'
          });
          return;
        }

        this.handleDeepstreamAuth();

      } catch(e) {
        this.notificationService.alert({
          title: 'Unable to Connect',
          subTitle: 'Please refresh the page and try again'
        });
      }
    });

    this.events.subscribe('multinc:deauthenticated', async (opts) => {
      this.nav.setRoot(HomePage);

      try {
        await this.deepstreamService.ds.leaveAll();
      } catch(e) {}

      if(opts.retry) {
        this.reconnect$ = Observable.timer(0, 3000)
          .subscribe(async () => {
            try {
              await this.deepstreamService.joinLobby();
              this.reconnect$.unsubscribe();
              this.handleDeepstreamAuth();
            } catch(e) {}
          });
      }
    });
  }

  private handleDeepstreamAuth() {
    this.nav.setRoot(LobbyPage);
  }

}

