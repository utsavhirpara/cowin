import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, delay, elementAt, map } from 'rxjs/operators';
import { Center } from '../model/Centers';
import { Sessions } from '../model/Sessions';

const baseApiUrl = 'http://localhost:8080/app/v1/';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({
  providedIn: 'root'
})

export class CowinService {
  sendedMsg:Array<string>=new Array();
  pendingMsg:Array<string>=new Array();

  constructor(private http: HttpClient) { }

  getInfoByPin(pinCode:number,date:string): Observable<any> {
    const get_url = baseApiUrl + 'calenderByPin/'+pinCode+"/"+date;
    return this.http.get<any>(get_url,{ headers: httpOptions.headers}).pipe(
        map((res: any) => {
          return res.data;
        }),
        catchError((error: any) => {
          return throwError(error);
        })
      );
  }

  getInfoByDistrict(districtId:number,date:string): Observable<any> {
    const get_url = baseApiUrl + 'calenderByDistrict/'+districtId+"/"+date;
    return this.http.get<any>(get_url,{ headers: httpOptions.headers}).pipe(
        map((res: any) => {
          //console.log('res',res);
          return res.data;          
        }),
        catchError((error: any) => {
          return throwError(error);
        })
      );
  }

  getInfoByCowin(districtId:number,date:string){
    //const get_url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id="+districtId+"&date="+date+"";
    const get_url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id="+districtId+"&date="+date+"";
    return this.http.get<any>(get_url,{ headers: httpOptions.headers}).pipe(
        map((res: any) => {
          return res;          
        }),
        catchError((error: any) => {
          return throwError(error);
        })
      );
  }

  sendNotification(center:Center){
    let msg:string;
    let sessionList:Array<Sessions>=new Array();
    center.sessions.forEach((element)=>{
      if(element.available_capacity>0){
        sessionList.push(element);
      }
    })

    if(sessionList.length>0){
      sessionList.forEach((element)=>{
        msg = 'Date : '+element.date+',\nCenter : '+center.name+',\nPincode : '+center.pincode+',\nVaccine : '+element.vaccine+',\nAvailable Capacity: '+element.available_capacity+',\nAge Limit : '+element.min_age_limit+' Plus,\nFee Type : '+center.fee_type+'\n\n selfregistration.cowin.gov.in/';
        // this.sendMsg(msg).subscribe((res)=>{
        // });
      })
    }
    
    console.log('Sended ',this.sendedMsg);
    console.log('Pending ',this.pendingMsg);
  }

  sendMsg(msg:string){
    let encode_URI = encodeURI(msg);
    const get_url : string= "https://api.telegram.org/bot1818916639:AAG4RCNTWYUtehUPnoPIc9slYgmEUv2q7nI/sendMessage?chat_id=-1001258374456&text="+encode_URI+"";
    
    return this.http.get<any>(get_url,{ headers: httpOptions.headers}).pipe(
        map((res: any) => {
          this.sendedMsg.push(msg);
          return res;          
        }),
        catchError((error: any) => {
            if(error.status==429){
              this.pendingMsg.push(msg);
            }
            return error;
        })
      );
  }
}
