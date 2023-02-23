import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Nav, Platform, Events } from 'ionic-angular';
import { App } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { DatabaseProvider } from '../../providers/database/database';
import { HomePage } from '../home/home';
import { Storage } from '@ionic/storage';
import * as jQuery from 'jquery';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { catchError, tap } from 'rxjs/operators';
import { Http, Headers } from '@angular/http';

@Component({
  selector: 'page-connect',
  templateUrl: 'connect.html',
})
export class ConnectPage 
{
  formConnect: FormGroup;

  constructor(public navCtrl: NavController, public platform: Platform, private storage: Storage, private events: Events, public app: App, private dbProvider: DatabaseProvider, public comProvider: CommonProvider, public http: HttpClient, private toastCtrl: ToastController, private formBuilder: FormBuilder, public navParams: NavParams) 
  {
    var rootThis = this;

    this.formConnect = this.formBuilder.group(
    {
      sFormFieldConnectEmail: [''],
      sFormFieldConnectPwd: [''],
      sFormFieldConnectPwdSet: [''],
      sFormFieldConnectDealerGroupID: ['']
    }); 

    // Check is app is connected already
    this.platform.ready().then(() => 
    {
    });
  }

  //funcLoginCheck() { if (this.comProvider.bAppConnected == true) { return true; } else { return false; } }
  // Always be disconnected if here
  funcContinueButton() 
  {
      this.comProvider.sUserNameEntered = this.formConnect.value['sFormFieldConnectEmail'];

      jQuery('#continuebutton').html('<i class="fa fa-circle-o-notch fa-spin"></i>').fadeIn();
      Promise.all([this.comProvider.funcCheckForUserName(this.comProvider.sUserNameEntered)]).then((resultUserCheck) => 
      {
           jQuery('#continuebutton').html('CONTINUE').fadeIn();

           if (resultUserCheck.toString() == "1") 
           {
              // User found - ask for password
              jQuery('#continuebox').fadeOut(100, function() { jQuery('#passwordbox').fadeIn(340); });
           }
           else if (resultUserCheck.toString() == "2") 
           {
              // User is disabled
              let toastDisabledUser = this.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_dark", duration: 3700, message: 'Account found but user is disabled, please contact support...', position: 'middle' }); 
              toastDisabledUser.present();
           }
           else
           {
              // User not found
              let toastNotFound = this.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_dark", duration: 3700, message: 'User not found, to create a user please contact support...', position: 'middle' }); 
              toastNotFound.present();
           }
      });
  }

  funcEmailTapped()
  {
      if (jQuery('#passwordbox').is(':visible')) { this.funcBackLinkFromLogin(); }
      if (jQuery('#createbox').is(':visible')) { this.funcBackLinkFromCreate(); }
  }

  funcBackLinkFromLogin()
  {
      jQuery('#passwordbox').css({'display':'none'});
      setTimeout(function() { jQuery('#continuebox').fadeIn(340); }, 100);
  }

  funcBackLinkFromCreate()
  {
      jQuery('#createbox').css({'display':'none'});
      setTimeout(function() { jQuery('#continuebox').fadeIn(340); }, 100);
  }

  funcFreeTrialButton()
  {
  }

  funcDisconnect() 
  {
     this.comProvider.bAppConnected = false;
     this.comProvider.userName = "";
     this.comProvider.userPass = "";
     this.comProvider.sMfrType = "";
     this.comProvider.sDealerGroupID = "";
     this.comProvider.biasLat = "";
     this.comProvider.biasLong = "";
     this.comProvider.sLicenseCurrent = this.comProvider.sLicenseConsumer; 

     let toastLogout = this.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_dark", duration: 1400, message: 'You have been logged out', position: 'middle' }); 
     toastLogout.present(); 

     this.comProvider.funcDisconnectApp();
  }

  funcContinue() 
  {
  }

  funcConnect(sPasswordToUse: string) 
  {
     jQuery('#loginbutton').html('<i class="fa fa-circle-o-notch fa-spin"></i>').fadeIn();
     
     var thisRoot = this;
     if (typeof sPasswordToUse != 'undefined') { this.formConnect.value['sFormFieldConnectPwd'] = sPasswordToUse; }

     if (this.comProvider.bNetworkOk == false)
     {
        jQuery('#loginbutton').html('LOGIN').fadeIn();
        let toastNoNet = this.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_dark", duration: 2200, message: 'No network, please connect...', position: 'middle' }); 
        toastNoNet.present();
     }
     else
     {
        // sGetUserResult.toString() = Results in 0 = login failure, 1 = success, 2 = inactive, 3 = valid but payment issue, 4 = valid but out of lookups, 5 = no cloud users, 6 = dealer group inactive
        Promise.all([this.comProvider.funcUserLogin(this.formConnect.value['sFormFieldConnectEmail'], this.formConnect.value['sFormFieldConnectPwd'])]).then((sGetUserResult) => 
        {
          var aGetUserResult = sGetUserResult.toString().split(",");
          // aGetUserResult[0] 1 or 0 for does_user_exists

          jQuery('#loginbutton').html('LOGIN').fadeIn();
          
          if (aGetUserResult[0].toString() == "0") { let toastNoNet = thisRoot.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_dark", duration: 3200, message: 'User not found or wrong password...', position: 'middle' }); toastNoNet.present(); }
          else if (aGetUserResult[0].toString() == "1") 
          {
              // User login ok, set app to be connected
              let toastNoNet = thisRoot.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_dark", duration: 1900, message: 'You are now logged in', position: 'middle' }); toastNoNet.present(); 
              
              // Remember user login/password
              thisRoot.storage.set('user_name', this.formConnect.value['sFormFieldConnectEmail']);
              thisRoot.comProvider.userName = this.formConnect.value['sFormFieldConnectEmail'];

              thisRoot.comProvider.funcConnectApp(); 
              setTimeout(function() 
              { 
                  thisRoot.comProvider.bAppConnected = true; 
                  thisRoot.app.getRootNav().setRoot(HomePage); 
              }, 1000);
          }
          else if (aGetUserResult[0].toString() == "2") { let toastNoNet = thisRoot.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_dark", duration: 3200, message: 'User found but currently inactive.', position: 'middle' }); toastNoNet.present(); }
          else { let toastNoNet = thisRoot.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_dark", duration: 3200, message: 'The hydes ordering app is currently unavailable.', position: 'middle' }); toastNoNet.present(); }
        });
     }
  }
}
