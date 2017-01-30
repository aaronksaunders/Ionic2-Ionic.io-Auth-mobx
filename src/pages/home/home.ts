import { when } from 'mobx';
import { IonicDatabase } from './../../providers/database';
import { LoginPage } from './../login/login';
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { Authentication } from '../../providers/auth'
import { NavController } from 'ionic-angular';


@Component({
  selector: 'thing-list',
  template: `
    <ion-item *ngFor="let item of list; let i = index; trackBy:item?.id">
      <thing-item [item]="item"></thing-item>
      <button ion-button small (click)="doDeleteClicked(item, i)">DELETE</button>
    </ion-item>
`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThingListItemComponent {
  @Input() list;
  @Output() deleteClicked = new EventEmitter();
  constructor() {
    console.log("in ThingItemComponent")
  }

  doDeleteClicked(_item, _index) {
    console.log(_item.id);
    this.deleteClicked.emit({ id: _item.id, index: _index })
  }
}


@Component({
  selector: 'thing-item',
  template: `
      <div>{{item.title}}</div>
      <div>{{item.task}}</div>
      <p>{{item.id}}</p>
`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThingItemComponent {
  @Input() item;
  constructor() {
    console.log("in ThingItemComponent")
  }

}


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {

  something: any = { title: "Aaron" }
  fromWhen:any;

  constructor(
    public navCtrl: NavController,
    private auth: Authentication,
    public db: IonicDatabase,
    private zone: NgZone) {

    this.something.title = "Aaron"

    this.db.getAllStuff()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');

    this.fromWhen = when(
      () => {
        return this.auth.activeUser === null
      },
      () => {
        console.log("User GONE!!... goto login")
        this.navCtrl.setRoot(LoginPage)
      }
    )
  }

  doDeleteItem(_params) {
    console.log(_params)
    this.db.deleteStuff(_params.id, _params.index)
  }

  doAddStuff() {
    this.db.addStuff(this.something)
    this.zone.run(() => {
      this.something = { title: "", task: "" };
    });
  }

  doLogout() {
    this.auth.doLogout()
  }

  /**
   * this gets called whenever this.auth.activeUser changes
   */
  checkLoginStatus() {
    // get the user...
    if (!this.auth.activeUser) {
      this.navCtrl.setRoot(LoginPage)
    }
  }

}
