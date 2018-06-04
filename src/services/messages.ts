import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Injectable()
export class MessagesService {
  constructor(
    private alertCtrl: AlertController,
  ){}

  public showError(message,
                   title='Erro',
                   buttons=[{
                     text: 'OK',
                     handler: () => {}
                   }]) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: buttons,
    });
    alert.present();
  }
}