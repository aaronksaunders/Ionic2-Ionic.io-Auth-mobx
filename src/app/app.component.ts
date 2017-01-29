import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { Authentication } from '../providers/auth';


@Component({
  templateUrl: 'app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyApp {
  rootPage; // = HomePage;
  currentUser;

  constructor(platform: Platform, private auth: Authentication) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });

    // check to see if there is already a user... Ionic saves it for you,
    // this will automatically log the user in when you restart the application
    this.rootPage = this.auth.doCheckAuth() ? HomePage : LoginPage;
  }

}
