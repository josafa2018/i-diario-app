import { Observable } from 'rxjs/Observable';
import { ConnectionService } from './connection';
import { ApiService } from './api';
import { Http, Response } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';

@Injectable()
export class ClassroomsService {
  constructor(
    private http: Http,
    private storage: Storage,
    private connection: ConnectionService,
    private api: ApiService
  ){}

  getOnlineClassrooms(teacherId: number, unityId: number){
    const request = this.http.get(this.api.getTeatcherClassroomsUrl(), { params: { teacher_id: teacherId, unity_id: unityId } } );
    return request.map((response: Response) => {
      return {
        data: response.json(),
        unityId: unityId
      }
    });
  }

  getOfflineClassrooms(unityId: number){
    return new Observable((observer) => {
      this.storage.get('classrooms').then((classrooms) => {
        var currentYear = (new Date()).getFullYear();
        classrooms.forEach((classroom) => {
          if (classroom.unityId == unityId){
            classroom.data = classroom.data.filter((value) => {
              return (value.year || currentYear) == currentYear
            })
            observer.next(classroom);
            observer.complete();
          }
        })
      })
    })
  }
}