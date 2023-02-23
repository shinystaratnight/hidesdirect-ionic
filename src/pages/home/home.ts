import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Nav, Platform } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { DatabaseProvider } from '../../providers/database/database';
import { ManualPage } from '../manual/manual';
import { Storage } from '@ionic/storage';
import * as jQuery from 'jquery';
import { parse } from 'parse-usdl';
import 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

declare let cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage 
{
  constructor(public navCtrl: NavController, private storage: Storage, private dbProvider: DatabaseProvider, public app: App, public platform: Platform, public comProvider: CommonProvider, private alertCtrl: AlertController, private toastCtrl: ToastController, public navParams: NavParams) 
  { 
     var rootThis = this;

     this.platform.ready().then(() => 
     {
     });
  }

  funcCheckStringForEmpty(sString) 
  {
    if(typeof(sString) === 'object')
    {
        if(JSON.stringify(sString) === '{}' || JSON.stringify(sString) === '[]') { return true; }
        else if(!sString) { return true; }
        return false;
    }
    else if(typeof(sString) === 'string')
    {
        if(!sString.trim()) { return true; }
        return false;
    }
    else if(typeof(sString) === 'undefined') { return true; }
    else { return false; }
  }


  ionViewDidLoad() 
  { 
    let toastGetData = this.toastCtrl.create({ dismissOnPageChange: false, cssClass: "customtoastclass_dark", duration: 10000, message: 'Please wait, getting list of products...', position: 'bottom' }); 
    toastGetData.present();

    // Get all products from server
    Promise.all([this.comProvider.funcGetAllProducts()]).then((resultAllProducts) => 
    {
         // Decode all products from server
         var aAllProducts = JSON.parse(resultAllProducts.toString());

         if (aAllProducts) 
         {
              // Loop through all products to test
              aAllProducts.forEach((aProduct) => 
              {
                   // Eg. aProduct.mw_code = "3247872834834", aProduct.mw_description = "Test description", aProduct.mw_sellprice = "12.00"
                   
                   // Do something with products such as add to an autocomplete search box
                   alert('Code: ' + aProduct.mw_code + ' and Price: ' + aProduct.mw_sellprice.toString()); 
              }); 
         }

         // Done getting products and doing something with them
         toastGetData.dismiss();
    });

  }  
}