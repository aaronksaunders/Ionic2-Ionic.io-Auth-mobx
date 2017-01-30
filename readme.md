![header-image.png](header-image.png)

Simple Ionic2 App Using Ionic.io Auth And Mobx To Manage Authentication State
==


### Setup your application to use the [Ionic.io Auth Service for Authentication](https://docs.ionic.io/services/auth/); I am only touching on the key changes in the application to support the use of [ng2-mobx](https://github.com/500tech/ng2-mobx) to managing authentication state

Lets add mobx to your project, **More Information on Mobx in Angular2 can be found here [https://github.com/500tech/ng2-mobx](https://github.com/500tech/ng2-mobx)**
```javascript
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

Lets get into the code changes to get the app working for us; starting with our authentication service in `auth.ts` The first thing is to set a variable to hold the activeUser when we get it
That user is critical to determining the login state so we want to observe it using the [mobx `observable` decorator](https://mobx.js.org/refguide/observable-decorator.html)

```javascript
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

We mainly use this function at startup to see if there was a user from the previous session that should be activated.

It is important to notice the use of the [mobx `action` decorator](https://mobx.js.org/refguide/action.html) this is used for any function that we believe will modify action state.
```javascript
// src/providers/auth.ts
//
@action doCheckAuth() {
  if (this.auth.isAuthenticated()) {
    this.activeUser = Object.assign({}, this.user.details, { id: this.user.id });
  }
}
````
We have this helper computed function which will get updated anytime the user changes. It is a [mobx computed decorated function](https://mobx.js.org/refguide/computed-decorator.html) they are derived from the existing state of the application and get updated when the state changed
```javascript
// src/providers/auth.ts
/**
  * here we check to see if ionic saved a user for us
  */
@computed get authenticatedUser() {
  return this.activeUser || null
}
```
Next we have the actual login function, which is maked as an action which will make the magic of updating state work. Notice one again the use of the [mobx `action` decorator](https://mobx.js.org/refguide/action.html) this is used for any function that will modify action state. If the user is logged in successfully then the state will be modified.
```javascript
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
```javascript
// src/app/app.component.ts

// check to see if there is already a user... Ionic saves it for you,
// this will automatically log the user in when you restart the application
this.rootPage = this.auth.doCheckAuth() ? HomePage : LoginPage;

}
```
## Handling Login On The Login Page
On the `LoginPage`, we need to check to see when the state of the activeUser changes so we use the [`mobx.when`](https://mobx.js.org/refguide/when.html) functionality.
This function will be called if any of the observable properties in the function are changed

So lets take a look at the use of the [`mobx.when`](https://mobx.js.org/refguide/when.html) function, if `this.auth.activeUser` is updated in the Authentication Service, then the function is called and if we have a user, we go to the `HomePage`
```Javascript
// src/pages/login/login.ts
ionViewDidLoad() {
  console.log('ionViewDidLoad LoginPage');

  this.fromWhen = when(
    () => {
      // when I have an activeUser, return true
      return this.auth.activeUser && this.auth.activeUser.id !== null
    },
    () => {
      // this function is called when previous function is true
      console.log("have User... goto home", this.auth.activeUser)
      this.navCtrl.setRoot(HomePage)
    }
  )
}
```
## Handling Logout On The Home Page
On the `HomePage` much like on the `LoginPage`, we need to check to see when the state of the activeUser changes so we use the [`mobx.when()`](https://mobx.js.org/refguide/when.html) functonality again.

The function in `home.ts` is very similar to the `login.ts` except we want to logout; So lets take a look at the code. If `this.auth.activeUser` is updated in the Authentication Service, then the function is called and if we do not have a user, we go to the `LoginPage`
```Javascript
// src/pages/home/home.ts
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
```

## Weird Error Handling with Ionic Cloud Auth when Logging In A User
So the Ionic Cloud service resolves the promise successfully when there are bad credentials passed to the login function. So we need to check the response code to see how to handle the response
```Javascript
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
        this.alertCtrl.create({
          title: "Error Logging In User",
          subTitle: error.message,
          buttons: [
            'Dismiss'
          ]
        }).present();
    })
}
```
#### More Information

- [http://docs.ionic.io/services/auth/](http://docs.ionic.io/services/auth/)
- [https://mobx.js.org/](https://mobx.js.org/)
- [https://github.com/500tech/ng2-mobx](https://github.com/500tech/ng2-mobx)
