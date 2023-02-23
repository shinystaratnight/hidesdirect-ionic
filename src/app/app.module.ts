import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { DatePipe } from '@angular/common';
import { Device } from '@ionic-native/device';
import { Network } from '@ionic-native/network';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SQLite } from '@ionic-native/sqlite';
import { File } from '@ionic-native/file';
import { Media, MediaObject } from '@ionic-native/media';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { ManualPage } from '../pages/manual/manual';
import { ConnectPage } from '../pages/connect/connect';
import { MaintPage } from '../pages/maint/maint';
import { TabhomePage } from '../pages/tabhome/tabhome';
import { FeedbackPage } from '../pages/feedback/feedback';
import { SettingsPage } from '../pages/settings/settings';
import { FlyersPage } from '../pages/flyers/flyers';
import { LogoutPage} from '../pages/logout/logout';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CommonProvider } from '../providers/common/common';
import { DatabaseProvider } from '../providers/database/database';

import { HttpClientModule } from '@angular/common/http'
import { HttpModule } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';
import { IonicStorageModule } from '@ionic/storage';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';

import { PopoverComponent } from '../components/popover/popover';

@NgModule({
  declarations: 
  [
    MyApp,
    HomePage,
    ManualPage,
    MaintPage,
    ConnectPage,
    TabhomePage,
    FeedbackPage,
    SettingsPage,
    AboutPage,
    FlyersPage,
    LogoutPage,
    PopoverComponent
  ],
  imports: 
  [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    //IonicModule.forRoot(MyApp),
    IonicModule.forRoot(MyApp, { backButtonText: '', scrollAssist: true, autoFocusAssist: true }),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: 
  [
    MyApp,
    HomePage,
    MaintPage,
    ManualPage,
    ConnectPage,
    TabhomePage,
    FeedbackPage,
    AboutPage,
    LogoutPage,
    FlyersPage,
    PopoverComponent
  ],
  providers: 
  [
    StatusBar,
    SplashScreen,
    Network,
    File,
    Media,
    SQLite,
    DatePipe,
    Device,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    CommonProvider,
    ScreenOrientation,
    Geolocation,
    InAppBrowser,
    DatabaseProvider
  ]
})
export class AppModule {}
