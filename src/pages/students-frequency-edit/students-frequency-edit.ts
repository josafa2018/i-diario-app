import { ConnectionService } from './../../services/connection';
import { UtilsService } from './../../services/utils';
import { DailyFrequencyStudentsSynchronizer } from './../../services/offline_data_synchronization/daily_frequency_students_synchronizer';
import { DailyFrequenciesSynchronizer } from './../../services/offline_data_synchronization/daily_frequencies_synchronizer';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { DailyFrequencyStudentService } from '../../services/daily_frequency_student';
import { AuthService } from '../../services/auth';

@IonicPage()
@Component({
  selector: 'page-students-frequency-edit',
  templateUrl: 'students-frequency-edit.html',
})
export class StudentsFrequencyEditPage {

  private studentsFrequency: any = []
  private classes: any = []
  private globalAbsence: boolean = false
  private students: any = []
  private unityName: string = null
  private unityId: number = null
  private classroomName: string = null
  private classroomId: number = null
  private disciplineName: string = null
  private disciplineId: number = null
  private frequencyDate: string = null
  private isSavingFrequencies : boolean = false
  private loadingCount: number = 0
  formatDate = null

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private dailyFrequencyStudentService: DailyFrequencyStudentService,
    private loadingCtrl: LoadingController,
    private utilsService: UtilsService,
    private auth: AuthService,
    private storage: Storage,
    private dailyFrequenciesSynchronizer: DailyFrequenciesSynchronizer,
    private dailyFrequencyStudentsSynchronizer: DailyFrequencyStudentsSynchronizer,
    private connection: ConnectionService) {
  }

  ionViewDidLoad() {
    this.globalAbsence = this.navParams.get('global')

    if(this.globalAbsence){
      this.studentsFrequency = this.navParams.get('frequencies').daily_frequency
    }else{
      this.studentsFrequency = this.navParams.get('frequencies').daily_frequencies
    }

    this.classes = this.mountClassNumbers();
    this.setCurrentClassroom();
    this.setCurrentDiscipline();
    this.setCurrentUnity();
    this.setCurrentFrequencyDate();
    this.students = this.mountStudentList();
    let date = this.utilsService.getDate(this.frequencyDate);
    date.setHours(24,0,0,0);
    this.formatDate = this.utilsService.toBrazilianFormat(date);
  }

  updateFrequency(frequency, classNumber = null){
    this.auth.currentUser().then((user) => {
      const params = {
        id: frequency.id,
        present: frequency.present,
        classroomId: this.classroomId,
        disciplineId: this.disciplineId,
        studentId: frequency.student.id,
        classNumber: classNumber,
        userId: user.id,
        frequencyDate: this.frequencyDate
      }

      this.dailyFrequencyStudentService.updateFrequency(params).subscribe(
        (dailyFrequencyStudentsToSync) => {
          if(this.connection.isOnline && this.connection.getNetworkType() === "wifi"){
            this.loadingCount++
            let loadingCountLocal = this.loadingCount
            this.isSavingFrequencies = true

            this.dailyFrequencyStudentsSynchronizer.sync(dailyFrequencyStudentsToSync).subscribe(
              () => {
              },
              () => {
              },
              () => {
                if (this.loadingCount == loadingCountLocal){
                  this.isSavingFrequencies = false
                }
              })
            }
          }
        )
    })
  }

  private sortStudents(studentA, studentB){
    if(studentA.sequence > studentB.sequence){
      return 1;
    }else if(studentA.sequence < studentB.sequence){
      return -1;
    }else if((studentA.name||studentA.student.name).toUpperCase() > (studentB.name||studentB.student.name).toUpperCase()){
      return 1;
    }else if((studentA.name||studentA.student.name).toUpperCase() < (studentB.name||studentB.student.name).toUpperCase()){
      return -1;
    }else{
      return 0;
    }
  }

  private mountStudentList(){
    let students = [];

    if(this.globalAbsence){
      students = this.studentsFrequency.students;
    }else{
      students = this.studentsFrequency[0].students.map((student) => {
        let obj = student.student;
        obj.sequence = student['sequence'];
        return obj;
      });

      students.forEach((student) => {
        let studentFrequencies = []
        this.studentsFrequency.forEach((dailyFrequency) => {
          dailyFrequency.students.map((dailyFrequencyStudent) => {
            if(dailyFrequencyStudent.student.id == student.id){
              studentFrequencies.push(dailyFrequencyStudent)
            }
          })
        })
        student["frequencies"] = JSON.parse(JSON.stringify(studentFrequencies))
      });
    }
    students = students.sort(this.sortStudents);

    return students
  }

  private mountClassNumbers(){
    if(this.globalAbsence){ return [] }

    return this.studentsFrequency.map((studentFrequency) => {
      return studentFrequency.class_number;
    })
  }

  private setCurrentDiscipline(){
    if(this.globalAbsence){
      this.disciplineId = this.studentsFrequency.discipline_id;
      this.disciplineName = this.studentsFrequency.discipline_name;
    }else{
      this.disciplineId = this.studentsFrequency[0].discipline_id;
      this.disciplineName = this.studentsFrequency[0].discipline_name;
    }
  }

  private setCurrentUnity(){
    if(this.globalAbsence){
      this.unityId = this.studentsFrequency.unity_id;
      this.unityName = this.studentsFrequency.unity_name;
    }else{
      this.unityId = this.studentsFrequency[0].unity_id;
      this.unityName = this.studentsFrequency[0].unity_name;
    }
  }

  private setCurrentClassroom(){
    if(this.globalAbsence){
      this.classroomId = this.studentsFrequency.classroom_id;
      this.classroomName = this.studentsFrequency.classroom_name;
    }else{
      this.classroomId = this.studentsFrequency[0].classroom_id;
      this.classroomName = this.studentsFrequency[0].classroom_name;
    }
  }
  private setCurrentFrequencyDate(){
    if(this.globalAbsence){
      this.frequencyDate = this.studentsFrequency.frequency_date;
    }else{
      this.frequencyDate = this.studentsFrequency[0].frequency_date;
    }
  }

  goBack() {
    this.navCtrl.pop();
  }
}
