import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { CommonProvider } from '../../providers/common/common';
import { DatabaseProvider } from '../../providers/database/database';
import * as jQuery from 'jquery';

@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage 
{
  formFeedback: FormGroup;

  constructor(public navCtrl: NavController, private dbProvider: DatabaseProvider, public comProvider: CommonProvider, public http: HttpClient, private toastCtrl: ToastController, private formBuilder: FormBuilder) 
  { 
     this.formFeedback = this.formBuilder.group(
     {
        sFormFieldFeedback: ['']
     });       
  }

  funcSendFeedback() 
  {
     jQuery('#feedbackbutton').html('<i class="fa fa-circle-o-notch fa-spin"></i>').fadeIn();
    
     var thisRoot = this;

     if (this.comProvider.bNetworkOk == false)
     {
        let toastNoNet = this.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass", duration: 2200, message: 'No network, please connect...', position: 'middle' }); 
        toastNoNet.present();
     }
     else
     {
        Promise.all([this.comProvider.funcSendFeedback(this.formFeedback.value['sFormFieldFeedback'], this.comProvider.userName, this.comProvider.sDealerGroupID, this.comProvider.iCloseMoreAppVersion, this.comProvider.bAppConnected)]).then((resultFeedback) => 
        {
             jQuery('#feedbackbutton').html('SEND FEEDBACK').fadeIn();

             if (resultFeedback.toString() == "1") 
             {
                 let toastSent = thisRoot.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_dark", duration: 2900, message: 'Feedback sent, thank you.', position: 'middle' }); 
                 toastSent.present(); 
             }
             else
             {
                 let toastSent = thisRoot.toastCtrl.create({ dismissOnPageChange: true, cssClass: "customtoastclass_dark", duration: 2900, message: 'Feedback failed to send... please try again.', position: 'middle' }); 
                 toastSent.present(); 
             }
        });
     }
  }  
}
