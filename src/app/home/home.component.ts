import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { Center } from './model/Centers';
import { Check } from './model/Check';
import { Sessions } from './model/Sessions';
import { CowinService } from './service/cowin.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public date:Date = new Date();
  public centers: Array<Center>;
  public availableCenters45: Array<Center>;
  public availableCenters18: Array<Center>;
  private updateSubscription: Subscription;
  public refresh :number=0;
  public playSound:boolean=false;
  public sound:string;
  public allsoundFlag:boolean=false;
  public allsoundFlagCount:number=0;
  public allsound:string="../../assets/alarm_alarm_alarm.mp3";

  public tdate=new Date();
  public day = this.tdate.getDate();
  public month = this.tdate.getMonth()+1;
  public year= this.tdate.getFullYear();
  public today:string = this.day+'-05-2021';
  public sessionList :Array<Check>=new Array();

  constructor(private cowinService : CowinService,private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.updateSubscription = interval(5050).subscribe(
      (val) => { this.getByDistrict();
        this.refresh++;
      }
    );
    //this.playAudio();
    this.getByDistrict();
  }

  getByPin(){
    let pinCode:number = 382350;
    let date:string = "10-05-2021";
    //let fetchSettingData = { page:gridSetting.page, size: gridSetting.perPage };
    this.cowinService.getInfoByPin(pinCode,date).subscribe(result => {
      this.centers = result.centers;  
      // console.log(this.centers); 
    });
  }

  getByDistrict(){
    this.availableCenters45= new Array();
    this.availableCenters18= new Array();
    this.playSound=false;
    let districtId:number = 770;
    //let fetchSettingData = { page:gridSetting.page, size: gridSetting.perPage };
    this.cowinService.getInfoByCowin(districtId,this.today).subscribe(result => {
      this.centers = result.centers;  
      this.centers.forEach((element)=>{        
        element.sessions.forEach((element2)=>{
          
          // ---------------- Play Sound ------------------ //
          if(element2.min_age_limit==18 && element2.available_capacity_dose1>1 && element2.vaccine=="COVISHIELD" && element.fee_type=="Free"){
            this.playSound=true;
            this.sound="../../assets/Covishield18.mp3"
          }
          if(element2.min_age_limit==18 && element2.available_capacity_dose1>1 && element2.vaccine=="COVAXIN" && element.fee_type=="Free"){
            this.playSound=true;
            this.sound="../../assets/Covaxine18.mp3"
          }
          // ---------------- Play Sound End------------------ //


          //------------------For age 18------------------------//
          if(element2.min_age_limit==18 && element2.available_capacity_dose1>1 && element.fee_type=="Free"){
            console.log('For 18',element2);
            
            let checkEle:Check  = this.sessionList.find(sees=> sees.sessionId===element2.session_id);
            let checkCount:number=0;
            
            if(checkEle===null || checkEle===undefined){
              checkCount=1;
              let count:number=1;
              let check :Check= new Check();
              check.sessionId=element2.session_id;
              check.count=count;
              this.sessionList.push(check);
            }
            else{
              checkEle.count++;
              checkCount=checkEle.count;
              if(checkEle.count>=100){
                let index : number= this.sessionList.indexOf(checkEle);
                this.sessionList.splice(index,1);
              }
            }            
            this.sessionList.forEach(ele=>{
              if((ele.sessionId===element2.session_id) && ele.count<=1){
                if(element2.available_capacity>1){
                  this.cowinService.sendNotification(element);
                }
              }
            })
            this.availableCenters18.push(element);
          }          

          //---------------------- For age 45---------------//
          // if(element2.min_age_limit==45 && element2.available_capacity_dose2>1){
          //   let checkEle:Check  = this.sessionList.find(sees=> sees.sessionId===element2.session_id);
          //   let checkCount:number=0;            
          //   if(checkEle===null || checkEle===undefined){
          //     checkCount=1;
          //     let count:number=1;
          //     let check :Check= new Check();
          //     check.sessionId=element2.session_id;
          //     check.count=count;
          //     this.sessionList.push(check);
          //   }
          //   else{
          //     checkEle.count++;
          //     checkCount=checkEle.count;
          //     if(checkEle.count>=100){
          //       let index : number= this.sessionList.indexOf(checkEle);
          //       this.sessionList.splice(index,1);
          //     }
          //   }            
          //   this.sessionList.forEach(ele=>{
          //     if((ele.sessionId===element2.session_id) && ele.count<=1){
          //       this.cowinService.sendNotification(element);
          //     }
          //   })
          //   this.availableCenters45.push(element);
          // }
        })
      })
    });
    console.log(this.availableCenters18);
    
    this.availableCenters45= new Array();
    this.availableCenters18= new Array();
  }

  // checkServcie(){
  //   this.cowinService.getInfoByCowin().subscribe((res)=>{

  //   })
  // }

  notifyFor(){
    let center = new Center();
    let ses = new Sessions();

    ses.available_capacity=5;
    ses.date="10-05-2021";
    ses.min_age_limit=18;
    center.name="abc";
    center.address="bcd";
    center.district_name="amd";
    center.fee_type="free;"
    center.pincode=382350;
    center.sessions = new Array();
    center.sessions.push(ses);
    this.cowinService.sendNotification(center);
  }
}
