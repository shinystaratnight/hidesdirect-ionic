import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Nav, Platform, Events } from 'ionic-angular';
import { App } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonProvider } from '../../providers/common/common';
import { DatabaseProvider } from '../../providers/database/database';
import { HomePage } from '../home/home';
import { ConnectPage } from '../connect/connect';

@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html',
})
export class LogoutPage 
{
  constructor(public navCtrl: NavController, private storage: Storage, private events: Events, public app: App, private dbProvider: DatabaseProvider, public comProvider: CommonProvider, public navParams: NavParams) 
  {  
      this.storage.set('user_name', "");
      this.comProvider.userName = "";

      this.app.getRootNav().setRoot(ConnectPage);   
  }

  ionViewDidLoad() 
  {
  }
}
