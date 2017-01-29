![header-image.png](header-image.png)

Simple Ionic2 App Using Ionic.io Auth And Mobx To Manage Authentication State
==


### Setup your application to use the [Ionic.io Auth Service for Authentication](https://docs.ionic.io/services/auth/); I am only touching on the key changes in the application to support the use of [ng2-mobx](https://github.com/500tech/ng2-mobx) to managing authentication state

Lets add mobx to your project, **More Information on Mobx in Angular2 can be found here [https://github.com/500tech/ng2-mobx](https://github.com/500tech/ng2-mobx)**
```Javascript
npm install --save ng2-mobx
```
Import the Ng2MobxModule in `app.module.ts`
```Javascript
import { Ng2MobxModule } from 'ng2-mobx'; // <== ADDED TO SUPPORT MOBX

@NgModule({
  declarations: [ ... ],
  imports: [
    FormsModule,
    IonicModule.forRoot(MyApp),
    CloudModule.forRoot(cloudSettings),
    Ng2MobxModule // <== ADDED TO SUPPORT MOBX
  ],
  bootstrap: [IonicApp],
  entryComponents: [ ... ],
  providers: [ ... ]
})
export class AppModule { }
```

Lets get into the code changes to get the app working for us; starting with our authentication service in `auth.ts`
```Javascript
// src/providers/auth.ts
//

import { observable, computed, action } from 'mobx'; // <== ADDED TO SUPPORT MOBX

@Injectable()
export class Authentication {

  // this will hold the user object when we have one, we can subscribe
  // to changes of this object to determine of we are logged in or not
  @observable activeUser: any // <== ADDED TO SUPPORT MOBX, notice the @observable annotation
```

We us the Ionic.io Service to login a user and when the user is logged in we set the value of the `activeUser` using the values from the Ionic User object.
See the ionic documentation for additional information [https://docs.ionic.io/services/auth/](https://docs.ionic.io/services/auth/)
```Javascript
// src/providers/auth.ts
//
@action doCheckAuth() {
  if (this.auth.isAuthenticated()) {
    this.activeUser = Object.assign({}, this.user.details, { id: this.user.id });
  }
}
````
We have this helper computed function which will get updated anything the user changes
```Javascript
// src/providers/auth.ts
/**
  * here we check to see if ionic saved a user for us
  */
@computed get authenticatedUser() {
  return this.activeUser || null
}
```
Next we have the actual login function, which is maked as an action which will make the magic ove updating state work
```Javascript
// src/providers/auth.ts
@action doLogin(_username, _password?) {
  if (_username.length) {

    let details = { 'email': _username, 'password': _password };

    this.auth.login('basic', details).then((_result) => {
      // create the user object based on the data retrieved...
      // update the activeUser
      this.activeUser = Object.assign({}, this.user.details, { id: this.user.id });
    }, (err) => {
      console.log(err)
    });

  }
}
```
## Handling Login When App Starts Up
Inside of the `app.component.ts` is where the real work is happening, we call `this.auth.doCheckAuth()` from the Authentication 
Service to see if we have a user at start up, otherwise go to `LoginPage`
```Javascript
// src/app/app.component.ts

// check to see if there is already a user... Ionic saves it for you,
// this will automatically log the user in when you restart the application
this.rootPage = this.auth.doCheckAuth() ? HomePage : LoginPage;

}
```
## Handling Login On The Login Page
On the `LoginPage`, we need to check to see when the state of the activeUser changes so we update the `login.html` to use the `mobxReaction` directive.
This function will be called if any of the observable properties in the function are changed
```html
<!-- src/pages/login/login.html -->
<ion-content padding  *mobxReaction="checkLoginStatus.bind(this)">
```
So lets take a look at the `checkLoginStatus` function, if `this.auth.activeUser` is updated in the Authentication Service, then the function is called and if we have a user, we go to the `HomePage`
```Javascript
// src/pages/login/login.ts
/**
 * this is called when ever Auth.activeUser changes
 */
checkLoginStatus() {
  // get the user...
  if (this.auth.activeUser) {
    this.navCtrl.setRoot(HomePage)
  }
}
```
## Handling Logout On The Home Page
On the `HomePage` much like on the `LoginPage`, we need to check to see when the state of the activeUser changes so we update the `home.html` to use the `mobxReaction` directive.
This function will be called if any of the observable properties in the function are changed
```Javascript
<!-- src/pages/home/home.html -->
<ion-content padding  *mobxReaction="checkLoginStatus.bind(this)">
```
The function in `home.ts` is very similar to the `login.ts` except we want to logout; So lets take a look at the `checkLoginStatus` function. If `this.auth.activeUser` is updated in the Authentication Service, then the function is called and if we do not have a user, we go to the `LoginPage`
```Javascript
// src/pages/home/home.ts
/**
 * this is called when ever Auth.activeUser changes
 */
checkLoginStatus() {
  // get the user...
  if (!this.auth.activeUser) {
    this.navCtrl.setRoot(LoginPage)
  }
}
```

#### More Information

- [http://docs.ionic.io/services/auth/](http://docs.ionic.io/services/auth/)
- [https://mobx.js.org/](https://mobx.js.org/)
- [https://github.com/500tech/ng2-mobx](https://github.com/500tech/ng2-mobx)

