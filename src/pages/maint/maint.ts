import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';
import { DatabaseProvider } from '../../providers/database/database';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-maint',
  templateUrl: 'maint.html',
})
export class MaintPage 
{
  iUserMaxLookups: any;
  iUserCurrentLookups: any;
  iUserRemainingLookups: any;
  sUserPassOk: any;

  constructor(public navCtrl: NavController, private storage: Storage, private dbProvider: DatabaseProvider, public comProvider: CommonProvider, public navParams: NavParams) 
  { 
    this.iUserMaxLookups = "0"; 
    this.iUserCurrentLookups = "0"; 
    this.iUserRemainingLookups = "0"; 
    this.sUserPassOk = "Unknown/No Network";
  }

  funcDropTableButton() { this.dbProvider.funcDropAllTables();}
  funcClearTableButton() { this.dbProvider.funcClearTable(); }
  funcAddRowToTable() { this.dbProvider.funcAddDataToTracker(); }
  funcGetTableRowCount() { Promise.all([this.dbProvider.funcGetTotalTrackedCount()]).then((iResult) => { alert("Total Rows: " + iResult.toString()); }); }
  funcGetAccountRow() { Promise.all([this.dbProvider.funcGetAccountRowMaint()]).then((sResult) => { alert("Row: " + sResult.toString()); }); }

  funcTestReggedManual()
  {
      this.storage.get('sReggedEmail').then((val) => 
      {
         alert('App registered to: ' + val);
      });

      this.storage.get('sReggedDeviceID').then((val) => 
      {
         alert('App registered to device: ' + val);
      });
  }

  ionViewDidLoad() 
  { 
     // Check and set max/current user lookups
     Promise.all([this.comProvider.funcGetThisUsersMaxLookups()]).then((iLookupResult) => { this.iUserMaxLookups = iLookupResult.toString(); });
     Promise.all([this.comProvider.funcGetThisUsersCurrentLookups()]).then((iLookupResult) => { this.iUserCurrentLookups = iLookupResult.toString(); });
     Promise.all([this.comProvider.funcCalcThisUsersRemainingLookups()]).then((iLookupResult) => { this.iUserRemainingLookups = iLookupResult.toString(); });

     // Check if login ok
     // sGetUserResult.toString() = Resutls in 0 = login failure, 1 = success, 2 = inactive, 3 = valid but payment issue, 4 = valid but out of lookups
//     Promise.all([this.comProvider.funcUserLogin(this.comProvider.userName, this.comProvider.userPass, this.comProvider.sDealerGroupID, this.comProvider.iUUID, this.comProvider.iCloseMoreAppVersion)]).then((sGetUserResult) => 
//     {
//       var aGetUserResult = sGetUserResult.toString().split(",");
//       // aGetUserResult[0] 1 or 0 for does_user_exists
//       // aGetUserResult[1] 1 or 0 for biasLat
//       // aGetUserResult[2] 1 or 0 for biasLong

//       if (aGetUserResult[0].toString() == "0") { this.sUserPassOk = "User missing or wrong password"; }
//       if (aGetUserResult[0].toString() == "1") { this.sUserPassOk = "User found and login ok"; }
//       if (aGetUserResult[0].toString() == "2") { this.sUserPassOk = "User found, login ok, but inactive"; }
//     });     
  }
}
