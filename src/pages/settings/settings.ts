import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CommonProvider } from '../../providers/common/common';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage 
{
  checkboxSettingVoiceChange: boolean;

  constructor(public navCtrl: NavController, public comProvider: CommonProvider, private storage: Storage, public navParams: NavParams) 
  {
      this.checkboxSettingVoiceChange = this.comProvider.bSettingAudioIntro;
  }

  funcSettingVoiceChange(e:any)
  {
      if (e.checked == false)
      {
         this.comProvider.bSettingAudioIntro = false;
         this.storage.set('bSettingAudioIntro', false);
      }
      else
      {
         this.comProvider.bSettingAudioIntro = true;
         this.storage.set('bSettingAudioIntro', true);
      }
  }
}
