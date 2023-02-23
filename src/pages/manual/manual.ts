import { Component, ViewChild, ElementRef, NgZone} from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Nav, Platform } from 'ionic-angular';
import { App } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonProvider } from '../../providers/common/common';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { HomePage } from '../home/home';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import { Http, Headers } from '@angular/http';
import * as jQuery from 'jquery';
import 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Component({
  selector: 'page-manual',
  templateUrl: 'manual.html',
})
export class ManualPage 
{
  objectGoogleAutoComplete: any;
  objectGeoCoder: any;
  itemsAutoComplete: any[];

  private inputAutoComplete: any = {};
  private place: any = {};

  private sTrialUserLat: any;
  private sTrialUserLong: any;

  public disableButton: any; // To turn button off
  
  iZIPCodeAddition: any;

  constructor(public navCtrl: NavController, private storage: Storage, public app: App, public platform: Platform, public comProvider: CommonProvider, public http: HttpClient, private toastCtrl: ToastController, private formBuilder: FormBuilder, public navParams: NavParams, private geolocation : Geolocation, private zone: NgZone) 
  {
     var rootThis = this;

     this.objectGoogleAutoComplete = new google.maps.places.AutocompleteService();
     this.objectGeoCoder = new google.maps.Geocoder;
     this.inputAutoComplete.input = '';
     this.itemsAutoComplete = [];

     this.sTrialUserLat = "";
     this.sTrialUserLong = "";
     if (this.comProvider.bAppRegistered == true && this.comProvider.bAppConnected == false)
     {
        Promise.all([this.storage.get("sReggedLat"), this.storage.get("sReggedLong")]).then(values => 
        {
             rootThis.sTrialUserLat = values[0];
             rootThis.sTrialUserLong = values[1];
        });       
     }
  }

  funcBackToHome() { this.app.getRootNav().setRoot(HomePage); }

  funcUpdateSearch()
  {
    // Update autocomplete results per character entered
    if (this.inputAutoComplete.input == '') { this.itemsAutoComplete = []; return; }

    // radius 60000 = 60Km, default to New York if no lat/long
    var latlongObject = new google.maps.LatLng(40.770240, -73.966840);
    if (this.comProvider.bAppRegistered == true && this.comProvider.bAppConnected == false)
    {
        // Use trial lat/long
        if (this.sTrialUserLat === "" || this.sTrialUserLat === null || typeof this.sTrialUserLat === "undefined") { } else { latlongObject = new google.maps.LatLng(this.sTrialUserLat, this.sTrialUserLong); }
    }
    else
    {
        // Use connected lat/long
        if (this.comProvider.biasLat === "" || this.comProvider.biasLat === null || typeof this.comProvider.biasLat === "undefined") { } else { latlongObject = new google.maps.LatLng(this.comProvider.biasLat, this.comProvider.biasLong); }
    }

    this.objectGoogleAutoComplete.getPlacePredictions({ input: this.inputAutoComplete.input, location: latlongObject, radius: 60000, types: ['address'], componentRestrictions: { country: 'us' } }, (predictions, status) => 
    {
       this.itemsAutoComplete = [];
       this.zone.run(() => 
       {
          // Debug
          // var debugJSONObject = JSON.stringify(prediction); alert(debugJSONObject);
          if (predictions) { predictions.forEach((prediction) => { this.itemsAutoComplete.push(prediction); }); }
       });
    });
  }

  funcSelectAddress(itemAutoCompleteSelected)
  {
    //var debugJSONObject = JSON.stringify(itemAutoCompleteSelected);
    //this.clearMarkers();

    // Turn on spinner
    jQuery('.searchbar-search-icon').addClass("remove_starting_bg");
    jQuery('.searchbar-search-icon').html("<i class='fa fa-fw fa-circle-o-notch fa-spin spincolor'></i>");
      
    this.itemsAutoComplete = [];
    this.iZIPCodeAddition = "";
  
    this.objectGeoCoder.geocode({'placeId': itemAutoCompleteSelected.place_id}, (results, status) => 
    {
        if (status === 'OK' && results[0])
        {
          let position = { lat: results[0].geometry.location.lat, lng: results[0].geometry.location.lng };

          if(results[0].address_components.length <= 7)
          {
              // eg. 1900 South Military Trail, West Palm Beach...
              //this.place.address = results[0].address_components[0].short_name + " " + results[0].address_components[1].short_name+" "+results[0].address_components[2].short_name;
              //this.place.city = results[0].address_components[3].short_name
              //this.place.state = results[0].address_components[4].short_name;
              //this.place.zip = results[0].address_components[6].short_name;
              //this.place.country=results[0].address_components[5].short_name;

              // Cut ", USA" and put in input
              var itemAutoCompleteSelectedTemp1 = results[0].formatted_address;
              this.inputAutoComplete.input = itemAutoCompleteSelectedTemp1.replace(/, USA$/g, "");
          }
          else
          {
              // eg. 1900 Military Road, Niagara Falls...
              //this.place.address = results[0].address_components[0].short_name + " " + results[0].address_components[1].short_name+" "+results[0].address_components[2].short_name;
              //this.place.city = results[0].address_components[3].short_name
              //this.place.state = results[0].address_components[5].short_name;
              //this.place.zip = results[0].address_components[7].short_name;
              //this.place.country = results[0].address_components[6].short_name;

              // Cut ", USA" and put in input
              var itemAutoCompleteSelectedTemp2 = results[0].formatted_address;
              this.inputAutoComplete.input = itemAutoCompleteSelectedTemp2.replace(/, USA$/g, "");
          }
          this.itemsAutoComplete = [];
        }

        // Off spinner
        jQuery('.searchbar-search-icon').html("");
        jQuery('.searchbar-search-icon').removeClass("remove_starting_bg");
    })

    // Clear it for not refreshing the same bug
    this.inputAutoComplete.input = "";
  }

  funcGetProfileButton()
  {
     var rootThis = this;
     rootThis.disableButton = true; jQuery('#loading_spinner').show();
     //jQuery('#getprofilebutton').html('<i class="fa fa-circle-o-notch fa-spin"></i>').fadeIn();
     
     // Set PDF417 text to nothing
     rootThis.comProvider.sPDF417LastScanObject = "";

     Promise.all([this.comProvider.funcGetProfileAPI(this.inputAutoComplete.input, 'A', "")]).then((sGetProfileResult) => 
     {
        // rootThis.comProvider.sProfileResultObject.lookup_result_text and object already set from common.ts
        rootThis.disableButton = false;

        if (sGetProfileResult.toString() === "OK") 
        {
          // All ok
          // toastGetProfile.dismiss();
          jQuery('#loading_spinner').hide();

          rootThis.comProvider.sProfileLookupAddressForProspect = this.inputAutoComplete.input;
          jQuery('#getprofilebutton').html('GET PROFILE').fadeIn(); // Turn off spinner
        }
        else if (sGetProfileResult.toString() === "FAIL1") 
        {
          // Cannot get proper response from ext_source (empty or no val)
          // toastGetProfile.dismiss();
          jQuery('#loading_spinner').hide();

          jQuery('#getprofilebutton').html('GET PROFILE').fadeIn(); // Turn off spinner
          let toastFail = this.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_getprofile", duration: 3500, message: rootThis.comProvider.sProfileResultObject.lookup_result_text, position: 'middle' }); 
          toastFail.present();
        }
        else if (sGetProfileResult.toString() === "TRIAL_UNCONFIRMED") 
        {
          // Can connect to api.closemore.io, but the trial user has not confirmed their email
          // toastGetProfile.dismiss();
          jQuery('#loading_spinner').hide();

          jQuery('#getprofilebutton').html('GET PROFILE').fadeIn(); // Turn off spinner
        }
        else if (sGetProfileResult.toString() === "TRIAL_MISSING") 
        {
          // Can connect to api.closemore.io, but the trial user is missing
          // toastGetProfile.dismiss();
          jQuery('#loading_spinner').hide();

          jQuery('#getprofilebutton').html('GET PROFILE').fadeIn(); // Turn off spinner
          let toastFail = this.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_getprofile", duration: 3500, message: rootThis.comProvider.sProfileResultObject.lookup_result_text, position: 'middle' }); 
          toastFail.present();
          rootThis.storage.remove('sReggedEmail');
          rootThis.storage.remove('sReggedDeviceID');
          rootThis.comProvider.bAppRegistered = false;
        }
        else if (sGetProfileResult.toString() === "TRIAL_OVER") 
        {
          // Can connect to api.closemore.io, trial users trial is over
          // toastGetProfile.dismiss();
          jQuery('#loading_spinner').hide();

          jQuery('#getprofilebutton').html('GET PROFILE').fadeIn(); // Turn off spinner
        }
        else if (sGetProfileResult.toString() === "EMPTY1") 
        {
          // Can connect to api.closemore.io, but got empty response from closemore API
          // toastGetProfile.dismiss();
          jQuery('#loading_spinner').hide();

          jQuery('#getprofilebutton').html('GET PROFILE').fadeIn(); // Turn off spinner
          let toastFail = this.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_getprofile", duration: 3000, message: 'Server response empty, try again...', position: 'middle' }); 
          toastFail.present();
        }
        else if (sGetProfileResult.toString() === "INVALID_JSON") 
        {
          // Can connect to api.closemore.io, but got invalid JSON from closemore API
          // toastGetProfile.dismiss();
          jQuery('#loading_spinner').hide();

          jQuery('#getprofilebutton').html('GET PROFILE').fadeIn(); // Turn off spinner
          let toastFail = this.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_getprofile", duration: 3000, message: 'Server response invalid, try again...', position: 'middle' }); 
          toastFail.present();
        }
        else 
        {
          // Cannot connect to api.closemore.io outright, server or network error
          // toastGetProfile.dismiss();
          jQuery('#loading_spinner').hide();

          jQuery('#getprofilebutton').html('GET PROFILE').fadeIn(); // Turn off spinner
          let toastFail = this.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_getprofile", duration: 3000, message: 'There seems to be a network problem, try again', position: 'middle' }); 
          toastFail.present();
        }
    });
  }

  ionViewDidLoad() 
  { 
    // Set prospect values as empty
    this.comProvider.sProfileLookupAddressForProspect = "";
    this.comProvider.sProfileLookupFirstNameForProspect = "";
    this.comProvider.sProfileLookupLastNameForProspect = "";
    this.comProvider.sProfileLookupShowIcon = true;
    this.comProvider.sFullCosmeticName = "";
  }
}
