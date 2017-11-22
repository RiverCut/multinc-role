import { Injectable } from '@angular/core';

import { AlertController, ToastController } from 'ionic-angular';

@Injectable()
export class NotificationService {

  constructor(private alertCtrl: AlertController, private toastCtrl: ToastController) {}

  public alert({ title, subTitle }) {
    this.alertCtrl.create({
      title: title || 'Alert',
      subTitle,
      buttons: ['OK']
    }).present();
  }

  public notify({ message }) {
    this.toastCtrl.create({
      message,
      duration: 3000,
      showCloseButton: true
    }).present();
  }

}
