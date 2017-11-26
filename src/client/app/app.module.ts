import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LobbyPage } from '../pages/lobby/lobby';

import { AuthService } from '../providers/auth.service';
import { DeepstreamService } from '../providers/deepstream.service';
import { NotificationService } from '../providers/notification.service';

import { SpriteComponent } from '../components/sprite.component';
import { ActionSpriteComponent } from '../components/action.component';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LobbyPage,

    SpriteComponent,
    ActionSpriteComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LobbyPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthService,
    DeepstreamService,
    NotificationService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
