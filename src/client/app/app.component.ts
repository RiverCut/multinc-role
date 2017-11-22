import { Component, ViewChild } from '@angular/core';
import { Events, Nav, NavController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { AuthService } from '../providers/auth.service';
import { DeepstreamService } from '../providers/deepstream.service';
import { NotificationService } from '../providers/notification.service';
import { LobbyPage } from '../pages/lobby/lobby';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: NavController;

  rootPage = HomePage;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
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
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  public listenForEvents() {
    this.events.subscribe('multinc:authenticated', async (token) => {

      try {
        const loggedIn = await this.deepstreamService.login(token);
        if(!loggedIn) {
          this.notificationService.alert({
            title: 'Unable to Connect',
            subTitle: 'Please refresh the page and try again'
          });
          return;
        }

        this.nav.setRoot(LobbyPage);
      } catch(e) {
        this.notificationService.alert({
          title: 'Unable to Connect',
          subTitle: 'Please refresh the page and try again'
        });
      }
    });

    this.events.subscribe('multinc:deauthenticated', () => {
      this.nav.setRoot(HomePage);
    });
  }

}

