import { Auth } from '@ionic/cloud-angular';
import { HomePage } from './../home/home';
import { MyApp } from './../../app/app.component';
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Authentication } from '../../providers/auth'

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: Authentication,
    private alertCtrl: AlertController) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  /**
   * 
   */
  doCreateAccount(_email, _password) {
    // we want a user name when creating an account so lets display an alert
    this.presentUserNamePrompt(_email, _password)

  }
  doLogin(_email, _password) {
    this.auth.doLogin(_email.value, _password.value)
  }

/**
 * this is called when ever Auth.activeUser changes
 */
  checkLoginStatus() {
    // get the user...
    if (this.auth.activeUser) {
      this.navCtrl.setRoot(HomePage)
    }
  }

  presentUserNamePrompt(_email, _password) {
    let alert = this.alertCtrl.create({
      title: 'Please provide username when create a new account',
      inputs: [
        {
          name: 'username',
          placeholder: 'Username'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Continue',
          handler: data => {
            this.auth.doCreateUser({
              username: data.username,
              email: _email.value,
              password: _password.value
            })
          }
        }
      ]
    });
    alert.present();
  }
}
