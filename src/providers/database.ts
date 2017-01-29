import { Database } from '@ionic/cloud-angular';

import { Injectable, NgZone } from '@angular/core';
import { observable, computed, action, runInAction } from 'mobx';
import 'rxjs/add/operator/map';

@Injectable()
export class IonicDatabase {
    @observable myStuff

    // this will hold the user object when we have one, we can subscribe
    // to changes of this object to determine of we are logged in or not
    @observable activeUser: any

    constructor(private db: Database, private zone: NgZone) {
        this.db.connect();
    }

    @action getAllStuff() {
        let store = this.db.collection('someStuff')
        store.order("id").fetch().subscribe(
            _data => this.myStuff = _data
        );

    }

    @action.bound addStuff(_data) {
        var newItem = Object.assign(_data, { time: Date.now() });
        let s = this.db.collection('someStuff').store(newItem)
            .subscribe(
            (id) => {
                newItem.id = id.id;
                console.log(" value:", newItem);
                //runInAction('addStuff update local store', () => {
                //    this.zone.run(() => {
                        this.myStuff = [...this.myStuff, newItem]
                //    });
                //}, this)
            },
            (err) => console.error(err)
            );
    }

    @action deleteStuff(_id, _index) {
        this.db.collection('someStuff').remove(_id);
        this.myStuff = [
            ...this.myStuff.slice(0, _index),
            ...this.myStuff.slice(_index + 1)
        ]
    }

    @computed get stuffList() {
        return this.myStuff;
    }
}