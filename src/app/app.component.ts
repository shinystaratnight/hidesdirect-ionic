import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { HomePage } from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { FeedbackPage } from '../pages/feedback/feedback';
import { ConnectPage } from '../pages/connect/connect';
import { ManualPage } from '../pages/manual/manual';
import { FlyersPage } from '../pages/flyers/flyers';
import { LogoutPage } from '../pages/logout/logout';
import { TabhomePage } from '../pages/tabhome/tabhome';
import { Storage } from '@ionic/storage';
import { CommonProvider } from '../providers/common/common';
import {} from '@types/googlemaps';

declare var google;

@Component({
  templateUrl: 'app.html'
})
export class MyApp 
{
  @ViewChild(Nav) nav: Nav;

  //rootPage: any = HomePage;
  rootPage: any = ConnectPage;

  pages: Array<{title: string, icon: any, component: any}>;

  constructor(public platform: Platform, public comProvider: CommonProvider, private storage: Storage, private events: Events, public statusBar: StatusBar, private screenOrientation: ScreenOrientation, public splashScreen: SplashScreen) 
  {
    this.initializeApp();

    this.pages = 
    [
       { title: 'Login', icon: 'fa fa-sign-in fa-fw', component: ConnectPage },
       { title: 'Feedback', icon: 'fa fa-comment-o fa-fw', component: FeedbackPage },
       { title: 'About', icon: 'fa fa-question-circle-o fa-fw', component: AboutPage }
    ];

    //this.events.subscribe('set-menu-logout', () => 
    //{
    //   this.pages.splice(2, 1, { title: 'Logout', icon: 'fa fa-sign-out fa-fw', component: ConnectPage })
    //});

    this.events.subscribe('set-menu-loggedin', () => 
    {
       // this.pages.splice(2, 1, { title: 'Login!', icon: 'fa fa-sign-in fa-fw', component: ConnectPage })
       this.pages = 
       [
          { title: 'Browse Products', icon: 'fa fa-shopping-basket fa-fw', component: HomePage },
          { title: 'eFlyers & Sales', icon: 'fa fa-file-text fa-fw', component: FlyersPage },
          { title: 'Feedback', icon: 'fa fa-comment-o fa-fw', component: FeedbackPage },
          { title: 'Logout', icon: 'fa fa-sign-out fa-fw', component: LogoutPage },
          { title: 'About', icon: 'fa fa-question-circle-o fa-fw', component: AboutPage }
       ];
    });

    this.events.subscribe('set-menu-loggedout', () => 
    {
       // this.pages.splice(2, 1, { title: 'Login!', icon: 'fa fa-sign-in fa-fw', component: ConnectPage })
       this.pages = 
       [
          { title: 'Login', icon: 'fa fa-sign-in fa-fw', component: ConnectPage },
          { title: 'Feedback', icon: 'fa fa-comment-o fa-fw', component: FeedbackPage },
          { title: 'About', icon: 'fa fa-question-circle-o fa-fw', component: AboutPage }
       ];
    });
  }

  initializeApp() 
  {
    var thisRoot = this;

    this.platform.ready().then(() => 
    {
      this.statusBar.styleDefault();

      // Force portrait
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);      

      // Hide splash screen
      this.splashScreen.hide();

      thisRoot.storage.get('user_name').then((sReturnedVal) => 
      {
         if (sReturnedVal === null || sReturnedVal.toString() == "false" || sReturnedVal.trim().length == 0) 
         { 
            thisRoot.comProvider.userName = "";
         }
         else 
         {
            thisRoot.comProvider.userName = sReturnedVal;
         }
      });
    });
  }

  openPage(page) 
  {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
