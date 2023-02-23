import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpModule } from '@angular/http';
import { App } from 'ionic-angular';
import { Nav, Platform, Events } from 'ionic-angular';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { Network } from '@ionic-native/network';
import { DatabaseProvider } from '../database/database';
import { Storage } from '@ionic/storage';
import { HomePage } from '../../pages/home/home';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import * as jQuery from 'jquery';

@Injectable()
export class CommonProvider 
{
  // Global/common variables
  public userName: any;
  public userPass: any;
  public sDealerGroupID: any;
  public bAppConnected: any; // If false user is trial
  public bAppRegistered: any; // If false user is trial
  public sTrialEmailAddress: any; // If set user is trial
  public biasLat: any;
  public biasLong: any;
  public sUserNameEntered: any; // Temp username for login form for checking if exists or passing

  public iTotalProspects: any;
  public iProspectToEdit: any;

  public sPopOverText: any;
  public sPopOverAccuracy: any;

  public bSettingAudioIntro: any;
  public sSettingAudioData: any;

  public bSettingAudioWelcomeIncluded: any;
  public sSettingAudioWelcomeData: any;

  public iUUID: any;
  public devicePlatform: any;
  public deviceVersion: any;
  public deviceModel: any;
  public deviceManufacturer: any;
  public bNetworkOk: any;
  public iUserNum: any;
  public iCloseMoreAppVersion: any;
  public sMfrType: any;

  public sProfileResultObject: any;
  public iLastSearchNum: any;
  public sPDF417LastScanObject: any;
  public sFullCosmeticName: any;

  public sProfileLookupAddressForProspect: any;
  public sProfileLookupFirstNameForProspect: any;
  public sProfileLookupLastNameForProspect: any;
  public sProfileLookupShowIcon: any;

  public sLicenseConsumer: any;
  public sLicenseBusiness: any;
  public sLicenseCurrent: any;

  public iIntroSource: any;
  public bFreeModeOn: any;

  constructor(public http: HttpClient, public app: App, private storage: Storage, private events: Events, public dbProvider: DatabaseProvider, private toastCtrl: ToastController, private network: Network, public platform: Platform, private device: Device) 
  {
    // Root this
    var rootThis = this;
    
    // Variables
    this.iTotalProspects = 0;
    this.iCloseMoreAppVersion = "1.0.4";
    this.sProfileResultObject = "";
    this.iUserNum = "0";
    this.sDealerGroupID = "";
    this.iUUID = "0";
    this.bNetworkOk = false;
    this.devicePlatform = "unknown";
    this.deviceVersion = "unknown";
    this.deviceModel = "unknown";
    this.deviceManufacturer = "unknown";
    this.sMfrType = "";
    this.sUserNameEntered = "";

    // Pre set user as empty and disconnected
    this.sDealerGroupID = "";
    this.userName = "";
    this.userPass = "";
    this.sMfrType = "";
    this.bAppConnected = false;
    this.bAppRegistered = false;
    this.sTrialEmailAddress = "";
    this.biasLat = "";
    this.biasLong = "";

    this.sPDF417LastScanObject = "";

    // Settings
    this.bSettingAudioIntro = false;
    this.sSettingAudioData = "";

    this.bSettingAudioWelcomeIncluded = false;
    this.sSettingAudioWelcomeData = "";
    
    // Stuff
    this.iProspectToEdit = 0;
    this.iLastSearchNum = 0;
    this.sPopOverText = "";
    this.sPopOverAccuracy = "";
    this.sFullCosmeticName = "";
    this.sLicenseConsumer = "XXXXXXXX";
    this.sLicenseBusiness = "XXXXXXXX";
    this.sLicenseCurrent = "";

    this.iIntroSource = 0;
    this.bFreeModeOn = false;

    // Set prospect values as empty
    this.sProfileLookupAddressForProspect = "";
    this.sProfileLookupFirstNameForProspect = "";
    this.sProfileLookupLastNameForProspect = "";
    this.sProfileLookupShowIcon = true;

    this.platform.ready().then(() => 
    {
       // Network online checks
       rootThis.bNetworkOk = navigator.onLine;
       let disconnectSubscription = this.network.onDisconnect().subscribe(() => { rootThis.bNetworkOk = false; });
       let connectSubscription = this.network.onConnect().subscribe(() => { rootThis.bNetworkOk = true; });

       // Set unique device ID
       rootThis.devicePlatform = this.device.platform;
       rootThis.deviceVersion = this.device.version;
       rootThis.deviceModel = this.device.model;
       rootThis.deviceManufacturer = this.device.manufacturer;
       rootThis.iUUID = this.device.uuid;

       // See if app is connected
       Promise.all([this.dbProvider.funcCheckIfAppConnected()]).then((sConnectCheckResult) => 
       { 
           // Run on startup
           var aConnectCheckResult = sConnectCheckResult.toString().split(',');

           if (aConnectCheckResult[4] == "1") 
           {
              // App is connected/logged in
              rootThis.sDealerGroupID = aConnectCheckResult[0].trim();
              rootThis.userName = aConnectCheckResult[1].trim();
              rootThis.userPass = aConnectCheckResult[2].trim();
              rootThis.sMfrType = aConnectCheckResult[3].trim();
              rootThis.biasLat = aConnectCheckResult[5].trim();
              rootThis.biasLong = aConnectCheckResult[6].trim();
              rootThis.bAppConnected = true;

              // Set license type
              rootThis.storage.get('sLicenseCurrentStored').then((sReturnedVal) => 
              {
                 if (sReturnedVal === null) { rootThis.sLicenseCurrent = ""; }
                 else { rootThis.sLicenseCurrent = sReturnedVal; }
              });

              rootThis.events.publish('set-menu-loggedin');

              // If already connect then jump to HomePage
              rootThis.app.getRootNav().setRoot(HomePage); 
           } 
           else 
           {
              rootThis.sDealerGroupID = "";
              rootThis.userName = "";
              rootThis.userPass = "";
              rootThis.sMfrType = "";
              rootThis.bAppConnected = false;

              // Set license type
              rootThis.storage.get('sLicenseCurrentStored').then((sReturnedVal) => 
              {
                 if (sReturnedVal === null) { rootThis.sLicenseCurrent = ""; }
                 else { rootThis.sLicenseCurrent = sReturnedVal; }
              });

              rootThis.events.publish('set-menu-loggedout');
           }
       }); 

    });     
  }

  isOnline(): boolean { return this.bNetworkOk; }

  funcConnectApp()
  {
     var thisRoot = this;

     // This executes when someone logs in
     Promise.all([this.dbProvider.funcConnectAppDBProvider(this.sDealerGroupID, this.userName, this.userPass, this.sMfrType, this.biasLat, this.biasLong)]).then((sConnectResult) => 
     {
        thisRoot.storage.set('bAppConnected', "true");
        this.events.publish('set-menu-loggedin');
     });
  }

  funcDisconnectApp()
  {
     var thisRoot = this;

     // This executes when someone logs out
     thisRoot.storage.set('bAppConnected', "false");
     this.dbProvider.funcDisconnectAppDBProvider();
     this.events.publish('set-menu-loggedout');
  }


  // Do actual lookup
  funcGetProfileAPI(sProfileAddress: string, sLookupType: string, sLicenseFullName: string) : Promise<any>
  {
     var thisRoot = this;

     return new Promise((resolve, reject) =>
     {
        var sUserType = "";
        if (thisRoot.bAppRegistered == true && thisRoot.bAppConnected == true) { sUserType = "DEALER_SINGLE"; } 
        else if (thisRoot.bAppRegistered == true && thisRoot.bAppConnected == false) { sUserType = "TRIAL"; } 
        else if (thisRoot.bAppRegistered == false && thisRoot.bAppConnected == true) { sUserType = "DEALER_SINGLE"; } 

        // Address that gets posted is this.inputAutoComplete.input -> now sProfileAddress
        let formPostData = new FormData();
        formPostData.append('postGetProfile', '1');
        formPostData.append('address', sProfileAddress);
        formPostData.append('full_name', sLicenseFullName);
        formPostData.append('user_type', sUserType);
        formPostData.append('dealergroup_id', this.sDealerGroupID);
        formPostData.append('user_name', this.userName);
        formPostData.append('user_pass', this.userPass);
        formPostData.append('app_version', this.iCloseMoreAppVersion);
        formPostData.append('device_uuid', this.iUUID);
        formPostData.append('trial_email_address', this.sTrialEmailAddress);
        formPostData.append('lookup_type', sLookupType);
        formPostData.append('device_agent', this.deviceManufacturer + "-" + this.devicePlatform + "-" + this.deviceModel + "-" + this.deviceVersion);
        formPostData.append('pdf_417', this.sPDF417LastScanObject);
        formPostData.append('setting_audio_intro', this.bSettingAudioIntro);
        
        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(14000).subscribe(responseServer => 
        {
          if (responseServer === "") { resolve("EMPTY1"); } 
          else if (!thisRoot.funcCheckForValidJSON(responseServer)) { resolve("INVALID_JSON"); } // Check for valid JSON response
          else 
          { 
              // Set and check what happened
              this.sProfileResultObject = JSON.parse(responseServer);

              // Set notification if on
              if (this.sProfileResultObject.inapp_notify_on == "1") 
              {
                  this.storage.set('sInAppNotificationTitle', this.sProfileResultObject.inapp_notify_title);
                  this.storage.set('sInAppNotificationText', this.sProfileResultObject.inapp_notify_text);
                  this.storage.set('sInAppNotificationIcon', this.sProfileResultObject.inapp_notify_icon);
              }

              // Return proper result
              if (this.sProfileResultObject.lookup_result_code === "1" || this.sProfileResultObject.lookup_result_name == "ok") 
              { 
                 thisRoot.sProfileLookupFirstNameForProspect = this.sProfileResultObject.profile_firstname;
                 thisRoot.sProfileLookupLastNameForProspect = this.sProfileResultObject.profile_lastname;
                 thisRoot.iLastSearchNum = this.sProfileResultObject.search_num; 

                 // Get and set audio file
                 if (thisRoot.bSettingAudioIntro == true) { thisRoot.sSettingAudioData = this.sProfileResultObject.voiceover_data; }
                 resolve("OK"); 
              }
              else if (this.sProfileResultObject.lookup_result_code === "2") { resolve("TRIAL_UNCONFIRMED"); }
              else if (this.sProfileResultObject.lookup_result_code === "3") { resolve("TRIAL_OVER"); }
              else if (this.sProfileResultObject.lookup_result_code === "4") { resolve("TRIAL_MISSING"); }
              else { resolve("FAIL1"); }
          }
        },
        err => 
        {
           resolve(""); // resolve(err.name + " " + err.message + " " + err.status);
        });
    });
  }


  // Get existing profile for prospect tracker
  funcGetProfileForProspectAPI(iProspectNum: string) : Promise<any>
  {
     var thisRoot = this;

     return new Promise((resolve, reject) =>
     {
        // Address that gets posted is this.inputAutoComplete.input -> now sProfileAddress
        let formPostData = new FormData();
        formPostData.append('postGetExistingProfile', '1');
        formPostData.append('prospect_num', iProspectNum);
        formPostData.append('app_version', this.iCloseMoreAppVersion);

        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = ""; } // Check for valid JSON response

          if (responseServer === "") { resolve("EMPTY1"); } 
          else 
          { 
              // Set and check what happened
              this.sProfileResultObject = JSON.parse(responseServer);

              // Return proper result
              if (this.sProfileResultObject.lookup_result_code === "1" || this.sProfileResultObject.lookup_result_name == "ok") { resolve("OK"); }
              else { resolve("FAIL1"); }
          }
        },
        err => 
        {
           resolve(""); // resolve(err.name + " " + err.message + " " + err.status);
        });
    });
  }


  // Return common HTML blocks - not used now
  blockResultsHeader()
  {
     return '<div class="resultsboxtop">' + this.sProfileResultObject.profile_name + '<BR><div class="resultsaddresstop">' + this.sProfileResultObject.full_address + '</div></div>';
  }


  // Returns 0 = login failure, 1 = success, 2 = inactive, 3 = valid but payment issue, 4 = valid but out of lookups, 5 = user valid but incorrect type
  funcUserLogin(sUser: string, sPass: string) : Promise<any>
  {
     var thisRoot = this;

     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postLogin', '1');
        formPostData.append('user_name', sUser);
        formPostData.append('password', sPass);

        this.http.post("https://api.hydesdirect.com/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else 
          {  
              resolve(JSON.parse(responseServer).login_result); 
          }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }

 
  // Returns 0 = reg failure, 1 = success, 2 = email address invalid, 3 = email already registered, 4 = , 5 = 
  funcRegisterDevice(sFirstName: string, sLastName: string, sEmailAddress: string, sDeviceUUID: string, sAppVersion: string, sDealershipName: string, sStateName: string, sCityName: string, sEmailAddressVerify: string, sPassword: string) : Promise<any>
  {
     var thisRoot = this;

     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postRegDevice', '1');
        formPostData.append('first_name', sFirstName);
        formPostData.append('last_name', sLastName);
        formPostData.append('dealership_name', sDealershipName);
        formPostData.append('email_address', sEmailAddress);
        formPostData.append('email_address_verify', sEmailAddressVerify);
        formPostData.append('password', sPassword);
        formPostData.append('app_version', this.iCloseMoreAppVersion);
        formPostData.append('last_device_id', sDeviceUUID);
        formPostData.append('app_version', sAppVersion);
        formPostData.append('state', sStateName);
        formPostData.append('city', sCityName);

        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(14000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else 
          { 
              var aResolve = new Array();
              aResolve[0] = JSON.parse(responseServer).reg_user_result;
              aResolve[1] = JSON.parse(responseServer).reg_user_lat;
              aResolve[2] = JSON.parse(responseServer).reg_user_long; 
              aResolve[3] = JSON.parse(responseServer).barcode_license; 

              thisRoot.bSettingAudioWelcomeIncluded = true;
              thisRoot.sSettingAudioWelcomeData = JSON.parse(responseServer).intro_voiceover_data;
              resolve(aResolve); 
          }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Users switches to free version from trialover page
  funcSwitchToFree(sUsername: string) : Promise<any>
  {
     var thisRoot = this;

     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postSwitchToFree', '1');
        formPostData.append('user_name', sUsername);
                
        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else { resolve(JSON.parse(responseServer).free_update_result); }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Send feedback
  funcSendFeedback(sFeedbackText: string, sUsername: string, sDealerGroupID: string, iVerNum: string, iAppConnected: string) : Promise<any>
  {
     var thisRoot = this;

     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postSendFeedback', '1');
        formPostData.append('feedback_text', sFeedbackText);
        formPostData.append('user_name', sUsername);
                
        this.http.post("https://api.hydesdirect.com/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else { resolve(JSON.parse(responseServer).feedbacksend_result); }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Add prospect to prospect tracker 
  funcAddProspectTrackerItem(sSourceAddress: string, sProspectFirstName: string, sProspectLastName: string, sProspectEmail: string, sProspectMobileNum: string, sCarMake: string, sCarYear: string, sCarModel: string, sAppVersion: string, sNote: string) : Promise<any>
  {
     var thisRoot = this;

     var sUserType = "";
     if (thisRoot.bAppConnected == false && thisRoot.bAppRegistered == true) { sUserType = "TRIAL"; }
     else { sUserType = "DEALER_SINGLE"; }

     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postAddProspectTrackerItemFromApp', '1');
        formPostData.append('source_address', sSourceAddress);
        formPostData.append('prospect_first_name', sProspectFirstName);
        formPostData.append('prospect_last_name', sProspectLastName);
        formPostData.append('prospect_mobile_num', sProspectMobileNum);
        formPostData.append('prospect_email_address', sProspectEmail);
        formPostData.append('dealergroup_id', this.sDealerGroupID);
        formPostData.append('user_name', this.userName);
        formPostData.append('trial_user_name', this.sTrialEmailAddress);
        formPostData.append('user_type', sUserType);
        formPostData.append('car_year', sCarYear);
        formPostData.append('car_make', sCarMake);
        formPostData.append('car_model', sCarModel);
        formPostData.append('prospect_note', sNote);
        formPostData.append('app_version', this.iCloseMoreAppVersion);
        formPostData.append('search_num', this.iLastSearchNum);
        
        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else 
          { 
              resolve(JSON.parse(responseServer).prospect_add_result); 
          }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Update prospect 
  funcUpdateProspectTrackerItem(iProspectNum: string, sProspectFirstName: string, sProspectLastName: string, sProspectEmail: string, sProspectMobileNum: string, sCarMake: string, sCarYear: string, sCarModel: string, sAppVersion: string, sNote: string) : Promise<any>
  {
     var thisRoot = this;

     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postUpdateProspectTrackerItemFromApp', '1');
        formPostData.append('prospect_num', iProspectNum);
        formPostData.append('prospect_first_name', sProspectFirstName);
        formPostData.append('prospect_last_name', sProspectLastName);
        formPostData.append('prospect_mobile_num', sProspectMobileNum);
        formPostData.append('prospect_email_address', sProspectEmail);
        formPostData.append('app_version', this.iCloseMoreAppVersion);
        formPostData.append('car_year', sCarYear);
        formPostData.append('car_make', sCarMake);
        formPostData.append('car_model', sCarModel);
        formPostData.append('prospect_note', sNote);
        
        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else 
          { 
              resolve(JSON.parse(responseServer).prospect_update_result); 
          }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Delete prospect
  funcDelProspectItem(iProspectNum: string) : Promise<any>
  {
     var thisRoot = this;

     var sUserType = "";
     if (thisRoot.bAppConnected == false && thisRoot.bAppRegistered == true) { sUserType = "TRIAL"; }
     else { sUserType = "DEALER_SINGLE"; }

     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postDelProspectItem', '1');
        formPostData.append('user_name', this.userName);
        formPostData.append('trial_user_name', this.sTrialEmailAddress);
        formPostData.append('user_type', sUserType);   
        formPostData.append('prospect_num', iProspectNum);
        formPostData.append('app_version', this.iCloseMoreAppVersion);
                
        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else { resolve(responseServer); }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Get all products
  funcGetAllProducts() : Promise<any>
  {
     var thisRoot = this;

     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postGetAllProducts', '1');
        formPostData.append('user_name', this.userName);
                
        this.http.post("https://api.hydesdirect.com/service/api.php", formPostData, { responseType: 'text' }).timeout(10000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else { resolve(JSON.parse(responseServer).all_products); }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Close prospect
  funcCloseProspectItem(iProspectNum: string) : Promise<any>
  {
     var thisRoot = this;

     var sUserType = "";
     if (thisRoot.bAppConnected == false && thisRoot.bAppRegistered == true) { sUserType = "TRIAL"; }
     else { sUserType = "DEALER_SINGLE"; }

     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postCloseProspectItem', '1');
        formPostData.append('user_name', this.userName);
        formPostData.append('trial_user_name', this.sTrialEmailAddress);
        formPostData.append('user_type', sUserType);           
        formPostData.append('prospect_num', iProspectNum);
        formPostData.append('app_version', this.iCloseMoreAppVersion);
                
        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else { resolve(responseServer); }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // SendPDF
  funcSendPDF(iProspectNum: string, iSearchNum: string) : Promise<any>
  {
     var thisRoot = this;
 
     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postSendPDF', '1');
        formPostData.append('search_num', this.iLastSearchNum);
        formPostData.append('prospect_num', iProspectNum);
        formPostData.append('user_name', this.userName);
        formPostData.append('trial_user_name', this.sTrialEmailAddress);
        formPostData.append('dealergroup_id', "");
        formPostData.append('app_version', this.iCloseMoreAppVersion);
                
        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(14000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else { resolve(JSON.parse(responseServer).send_pdf); }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Get prospects
  funcGetAllProspectItems() : Promise<any>
  {
     var thisRoot = this;

     return new Promise((resolve, reject) =>
     {
        var sUserType = "";
        if (thisRoot.bAppConnected == false && thisRoot.bAppRegistered == true) { sUserType = "TRIAL"; }
        else { sUserType = "DEALER_SINGLE"; }

        let formPostData = new FormData();
        formPostData.append('postGetAllProspectItemsFromApp', '1');
        formPostData.append('user_name', this.userName);
        formPostData.append('trial_user_name', this.sTrialEmailAddress);
        formPostData.append('user_type', sUserType);
        formPostData.append('app_version', this.iCloseMoreAppVersion);
        
        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else if (JSON.parse(responseServer).all_prospects_returned_count == "0") { resolve("NONE"); } 
          else 
          {   
             var jsonTemp = JSON.parse(responseServer).all_prospects_returned_json;
             resolve(jsonTemp);
          }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Get single prospect
  funcGetProspectTrackerItem(iProspectNum) : Promise<any>
  {
     var thisRoot = this;
     
     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postGetSingleProspectItemsFromApp', '1');
        formPostData.append('prospect_num', iProspectNum);
        formPostData.append('app_version', this.iCloseMoreAppVersion);
        
        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else 
          { 
              var jsonTemp = JSON.parse(responseServer).prospect_returned_json;
              resolve(jsonTemp);
          }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Returns 1 if user exists 
  funcCheckForUserName(sUserName: string) : Promise<any>
  {
     var thisRoot = this;
     
     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postCheckForUser', '1');
        formPostData.append('user_name', sUserName);

        this.http.post("https://api.hydesdirect.com/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else if(JSON.parse(responseServer).user_exists == "1")
          { 
              resolve(1); 
          }
          else if(JSON.parse(responseServer).user_exists == "2")
          { 
              resolve(2); 
          }
          else 
          { 
              resolve(0); 
          }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Returns current user's (even if not logged in) max number of lookups for given period 
  funcGetThisUsersMaxLookups() : Promise<any>
  {
     var thisRoot = this;
     
     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postGetUserMaxLookups', '1');
        formPostData.append('user_name', this.userName);
        formPostData.append('user_pass', this.userPass);

        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else { resolve(JSON.parse(responseServer).user_max_lookups); }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Returns user's (even if not logged in) current number of lookups for given period 
  funcGetThisUsersCurrentLookups() : Promise<any>
  {
     var thisRoot = this;
     
     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postCheckUserCurrentLookups', '1');
        formPostData.append('user_name', this.userName);
        formPostData.append('user_pass', this.userPass);
        formPostData.append('device_uuid', this.iUUID);

        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else { resolve(JSON.parse(responseServer).user_current_lookups); }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  // Returns user's (even if not logged in) current number of lookups remaing (for given period) after all calculations 
  funcCalcThisUsersRemainingLookups() : Promise<any>
  {
     var thisRoot = this;
 
     return new Promise((resolve, reject) =>
     {
        let formPostData = new FormData();
        formPostData.append('postCalcUserRemainingLookups', '1');
        formPostData.append('user_name', this.userName);
        formPostData.append('user_pass', this.userPass);
        formPostData.append('device_uuid', this.iUUID);

        this.http.post("https://api.closemore.io/service/api.php", formPostData, { responseType: 'text' }).timeout(7000).subscribe(responseServer => 
        {
          if (!thisRoot.funcCheckForValidJSON(responseServer)) { responseServer = "FAIL"; } // Check for valid JSON response

          if (responseServer === "") { resolve("FAIL"); } 
          else { resolve(JSON.parse(responseServer).user_remaining_lookups); }
        }, err => { resolve("FAIL"); }); // resolve(err.name + " " + err.message + " " + err.status);
     });
  }


  funcCheckForValidJSON(str) 
  {
     if (typeof str !== 'string') return false;
     try { const result = JSON.parse(str); return Object.prototype.toString.call(result) === '[object Object]' || Array.isArray(result); } 
     catch (err) { return false; }
  }
}