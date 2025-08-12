import { Component } from '@angular/core';
import { MessageService } from './service/message.service';

@Component({ selector: 'app-scheduled-list', template: `
  <div>
    <label>Team ID</label><input [(ngModel)]="teamId"/><button (click)="load()">Load</button>
    <div *ngIf="messages.length>0"><div *ngFor="let m of messages">{{m.channel}} - {{m.text}} - {{m.send_at}} <button (click)='cancel(m._id)'>Cancel</button></div></div>
    <div *ngIf="status">{{status}}</div>
  </div>` })
export class ScheduledListComponent {
  teamId=''; messages:any[]=[]; status='';
  constructor(private ms: MessageService){}
  async load(){ try{ const r:any=await this.ms.listScheduled(this.teamId); this.messages=r.scheduled||[]; } catch(e:any){ this.status='Error '+e?.message; } }
  async cancel(id:string){ try{ await this.ms.cancelScheduled(this.teamId,id); this.load(); } catch(e:any){ this.status='Cancel error'; } }
}
