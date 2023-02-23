import { HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Nav, Platform } from 'ionic-angular';
import { NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import * as jQuery from 'jquery';

@Injectable()
export class DatabaseProvider 
{
  // Global/common variables
  private _db: SQLiteObject; 
  private dbReadyPromise;
  
  public bDatabaseInitComplete: any;
   
  get db(): Promise<SQLiteObject> 
  {
     return new Promise((resolve, reject) => 
     {
        if (this._db) { resolve(this._db); } else { this.dbReadyPromise.then(_ => resolve(this._db)).catch(error => reject(error)); }
     });
  }
  
  // db.executeSql("INSERT INTO Account (dealergroup_id, user_name, user_pass, connected) values ('GROUPID', 'user@domain.com', 'pass', 0)", <any>{}).then(() => { console.log('Empty connect row added to Account table'); }).catch(e => alert(e.message));
  constructor(public http: HttpClient, private toastCtrl: ToastController, public platform: Platform, private sqlite: SQLite)
  {
     // Variables
     var rootThis = this;
     this.bDatabaseInitComplete = false;

     this.platform.ready().then(() => 
     {
         this.dbReadyPromise = this.sqlite.create({ name: 'CloseMoreLocal.db', location: 'default' }).then((db: SQLiteObject) => 
         {
            this._db = db;
            this.db.then(db => db.executeSql('CREATE TABLE IF NOT EXISTS TrackerItems (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, first_name VARCHAR(24), last_name VARCHAR(255), car1_make VARCHAR(255), car1_model VARCHAR(255), car1_year VARCHAR(255))', <any>{}).then(() => console.log('Executed SQL')).catch(e => alert(e.message)));
            this.db.then(db => db.executeSql('CREATE TABLE IF NOT EXISTS Account (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, dealergroup_id VARCHAR(64), user_name VARCHAR(255), user_pass VARCHAR(32), mfr_type VARCHAR(255), bias_lat VARCHAR(32), bias_long VARCHAR(32), connected INTEGER)', <any>{}).then(() => { }).catch(e => alert(e.message)));
            rootThis.bDatabaseInitComplete = true;
         }).catch(e => alert(e.message));
     });     
  }

  funcDropAllTables()
  {
     this.db.then(db => 
     {
        db.executeSql("drop table TrackerItems", <any>{}).then(() => alert('Tracker table dropped...')).catch(e => alert(e.message));
     });
  }
  
  funcClearTable()
  {
     this.db.then(db => 
     {
        db.executeSql("delete from TrackerItems", <any>{}).then(() => console.log('All rows removed...')).catch(e => alert(e.message));
     });
  }

  funcAddDataToTracker()
  {
     this.db.then(db => 
     {    
        db.executeSql("INSERT INTO TrackerItems (first_name, last_name, car1_make) values ('Scott', 'Smith', 'Honda')", <any>{}).then(() => alert('Row added...')).catch(e => alert(e.message));
     });
  }  

  funcGetAccountRowMaint() : Promise<any>
  {
     return new Promise((resolve, reject) =>
     {
        this.db.then(db => 
        {      
            db.executeSql('SELECT * from Account', <any>{}).then((sqlReturnedData : any) =>
            {
               resolve(sqlReturnedData.rows.item(0).dealergroup_id + ", " + sqlReturnedData.rows.item(0).user_name + ", " + sqlReturnedData.rows.item(0).user_pass + ", " + sqlReturnedData.rows.item(0).bias_lat + ", " + sqlReturnedData.rows.item(0).bias_long + ", " + sqlReturnedData.rows.item(0).connected.toString());
            }).catch((error : any) => { reject(error); });
        });
     });
  }

  funcGetTotalTrackedCount() : Promise<any>
  {
     return new Promise((resolve, reject) =>
     {
        this.db.then(db => 
        {      
            db.executeSql('SELECT count(*) as total FROM TrackerItems', <any>{}).then((sqlReturnedData : any) =>
            {
               resolve(sqlReturnedData.rows.item(0).total);
            }).catch((error : any) => { reject(error); });
        });
     });
  }

  funcCheckIfAppConnected() : Promise<any>
  {
     var rootThis = this;

     return new Promise((resolve, reject) =>
     {
        this.db.then(db => 
        {      
            db.executeSql('SELECT count(*) as total FROM Account', <any>{}).then((sqlReturnedData : any) =>
            {
               // No row at all, add empty connect row
               if (sqlReturnedData.rows.item(0).total == 0)
               {
                   db.executeSql("INSERT INTO Account (dealergroup_id, user_name, user_pass, mfr_type, bias_lat, bias_long, connected) values ('GROUPID', 'user@domain.com', 'pass', '', '0', '0', 0)", <any>{}).then(() => { rootThis.bDatabaseInitComplete = true; }).catch(e => alert(e.message));
                   resolve('GROUPID,user@domain.com,pass,unknown,0,0,0');
               }
               else
               {
                   db.executeSql('SELECT * FROM Account', <any>{}).then((sqlReturnedData : any) =>
                   {
                       var aReturnValues = [sqlReturnedData.rows.item(0).dealergroup_id, sqlReturnedData.rows.item(0).user_name, sqlReturnedData.rows.item(0).user_pass, sqlReturnedData.rows.item(0).mfr_type, sqlReturnedData.rows.item(0).connected, sqlReturnedData.rows.item(0).bias_lat, sqlReturnedData.rows.item(0).bias_long];
                       resolve(aReturnValues);
                   }).catch((error : any) => { reject(error); });
               }
            }).catch((error : any) => { reject(error); });
        });
     });
  }

  // Will return "OK" when complete
  funcConnectAppDBProvider(sDealerGroupID: string, userName: string, userPass: string, sMfrType: string, sBiasLat: string, sBiasLong: string) : Promise<any>
  {
     var thisRoot = this;

     return new Promise((resolve, reject) =>
     {
        this.db.then(db => 
        {
            db.executeSql("delete from Account", <any>{}).then(() => 
            {
               db.executeSql("INSERT INTO Account (dealergroup_id, user_name, user_pass, mfr_type, bias_lat, bias_long, connected) values ('" + sDealerGroupID + "', '" + userName + "', '" + userPass + "', '" + sMfrType + "', '" + sBiasLat + "', '" + sBiasLong + "', 1)", <any>{}).then(() => { }).catch(e => alert(e.message));
               resolve('OK');
            }).catch(e => alert(e.message));
        });       
     });
  }

  funcDisconnectAppDBProvider()
  {
      this.db.then(db => 
      {
          db.executeSql("delete from Account", <any>{}).then(() => 
          {
              db.executeSql("INSERT INTO Account (dealergroup_id, user_name, user_pass, mfr_type, bias_lat, bias_long, connected) values ('GROUPID', 'user@domain.com', 'pass', '', '0', '0', 0)", <any>{}).then(() => { }).catch(e => alert(e.message));
          }).catch(e => alert(e.message));
      });       
  }

}
