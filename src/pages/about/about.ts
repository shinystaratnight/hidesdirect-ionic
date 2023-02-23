import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MaintPage } from '../maint/maint';
import { CommonProvider } from '../../providers/common/common';
import { ToastController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage 
{

  constructor(public navCtrl: NavController, private toastCtrl: ToastController, public comProvider: CommonProvider, public navParams: NavParams) { }
  
  funcOpenMaintPage() { this.navCtrl.push(MaintPage); }

  ionViewDidLoad() { }
}
