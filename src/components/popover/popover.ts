import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { CommonProvider } from '../../providers/common/common';

@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class PopoverComponent 
{
  sPopupText: string;
  sPopupAccuracy: string;
  sPopupAccuracyClass: string;
  sPopupAccuracyIcon: string;

  constructor(public comProvider: CommonProvider, public viewController: ViewController) 
  { 
      this.sPopupText = this.comProvider.sPopOverText; 
      this.sPopupAccuracy = this.comProvider.sPopOverAccuracy; 

      if (this.sPopupAccuracy === "X") { }
      else
      {
          if (this.comProvider.sPopOverAccuracy >= 95) { this.sPopupAccuracyIcon = "fa-check"; this.sPopupAccuracyClass = "progress_95"; }
          else if (this.comProvider.sPopOverAccuracy >= 90) { this.sPopupAccuracyIcon = "fa-check"; this.sPopupAccuracyClass = "progress_90"; }
          else if (this.comProvider.sPopOverAccuracy >= 85) { this.sPopupAccuracyIcon = "fa-check"; this.sPopupAccuracyClass = "progress_85"; }
          else if (this.comProvider.sPopOverAccuracy >= 80) { this.sPopupAccuracyIcon = "fa-check"; this.sPopupAccuracyClass = "progress_80"; }
          else if (this.comProvider.sPopOverAccuracy >= 75) { this.sPopupAccuracyIcon = "fa-check"; this.sPopupAccuracyClass = "progress_75"; }
          else if (this.comProvider.sPopOverAccuracy >= 70) { this.sPopupAccuracyIcon = "fa-exclamation-triangle"; this.sPopupAccuracyClass = "progress_70"; }
          else if (this.comProvider.sPopOverAccuracy >= 65) { this.sPopupAccuracyIcon = "fa-exclamation-triangle"; this.sPopupAccuracyClass = "progress_65"; }
          else if (this.comProvider.sPopOverAccuracy >= 60) { this.sPopupAccuracyIcon = "fa-exclamation-triangle"; this.sPopupAccuracyClass = "progress_60"; }
          else if (this.comProvider.sPopOverAccuracy >= 55) { this.sPopupAccuracyIcon = "fa-exclamation-triangle"; this.sPopupAccuracyClass = "progress_55"; }
          else if (this.comProvider.sPopOverAccuracy >= 50) { this.sPopupAccuracyIcon = "fa-exclamation-triangle"; this.sPopupAccuracyClass = "progress_50"; }
          else if (this.comProvider.sPopOverAccuracy >= 40) { this.sPopupAccuracyIcon = "fa-exclamation-triangle"; this.sPopupAccuracyClass = "progress_40"; }
          else if (this.comProvider.sPopOverAccuracy >= 30) { this.sPopupAccuracyIcon = "fa-exclamation-triangle"; this.sPopupAccuracyClass = "progress_30"; }
          else if (this.comProvider.sPopOverAccuracy >= 20) { this.sPopupAccuracyIcon = "fa-exclamation-triangle"; this.sPopupAccuracyClass = "progress_20"; }
          else if (this.comProvider.sPopOverAccuracy >= 10) { this.sPopupAccuracyIcon = "fa-exclamation-triangle"; this.sPopupAccuracyClass = "progress_10"; }
          else { this.sPopupAccuracyClass = "progress_0"; }
      }
  }

  funcClosePopover()
  {
     this.viewController.dismiss();
  }
}
