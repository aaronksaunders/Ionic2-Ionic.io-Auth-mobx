import { ThingItemComponent, ThingListItemComponent } from './../pages/home/home';
import { IonicDatabase } from './../providers/database';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { Authentication } from '../providers/auth';

import { FormsModule } from '@angular/forms';

import { CloudSettings, CloudModule } from '@ionic/cloud-angular';


import { Ng2MobxModule } from 'ng2-mobx'

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': 'YOUR-APP-ID'
  }
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    ThingListItemComponent,
    ThingItemComponent
  ],
  imports: [
    FormsModule,
    IonicModule.forRoot(MyApp),
    CloudModule.forRoot(cloudSettings),
    Ng2MobxModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage
  ],
  providers: [IonicDatabase, Authentication, { provide: ErrorHandler, useClass: IonicErrorHandler }]
})
export class AppModule { }
