import { User } from '@ionic/cloud-angular';

import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Authentication } from '../../providers/auth'

import { when } from 'mobx';

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

  fromWhen: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: Authentication,
    private alertCtrl: AlertController) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');

    this.fromWhen = when(
      () => {
        return this.auth.activeUser && this.auth.activeUser.id !== null
      },
      () => {
        console.log("have User... goto home", this.auth.activeUser)
        this.navCtrl.setRoot(HomePage)
      }
    )
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
      .then((resp) => {
        console.log(resp);
        if (resp.response && resp.response.statusCode) {
          let r = JSON.parse(resp.response.text)
          this.alertCtrl.create({
            title: "Error Logging In User",
            subTitle: r.error.message,
            buttons: [
              'Dismiss'
            ]
          }).present();
        }
      }, (error) => {
        alert(error.message)
      })
  }



  /**
   * this is called when ever Auth.activeUser changes
   */
  checkLoginStatus() {
    // get the user...
    // if (this.auth.activeUser) {
    //   this.navCtrl.setRoot(HomePage)
    // }
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
