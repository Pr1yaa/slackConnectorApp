import { Component } from '@angular/core';
import { MessageService } from './service/message.service';

@Component({ selector: 'app-compose', template: `
  <div>
    <label>Team ID</label><input [(ngModel)]="teamId"/>
    <label>Channel</label><input [(ngModel)]="selectedChannel"/>
    <label>Message</label><textarea [(ngModel)]="text"></textarea>
    <button (click)="sendNow()">Send Now</button>
    <h4>Schedule</h4>
    <label>Send at (ISO)</label><input [(ngModel)]="sendAt"/>
    <button (click)="schedule()">Schedule</button>
    <div *ngIf="status">{{status}}</div>
  </div>` })
export class ComposeComponent {
  teamId=''; selectedChannel=''; text=''; sendAt=''; status='';
  constructor(private ms: MessageService){}
  async sendNow(){ try{ await this.ms.sendMessage(this.teamId,this.selectedChannel,this.text); this.status='Sent'; } catch(e:any){ this.status='Error '+e?.message; } }
  async schedule(){ try{ await this.ms.scheduleMessage(this.teamId,this.selectedChannel,this.text,this.sendAt); this.status='Scheduled'; } catch(e:any){ this.status='Error '+e?.message; } }
}
