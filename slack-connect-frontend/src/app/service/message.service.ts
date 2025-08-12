import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessageService {
  backend = environment.backendUrl;
  constructor(private http: HttpClient) {}
  sendMessage(teamId: string, channel: string, text: string, thread_ts?: string){ return this.http.post(`${this.backend}/messages/send`, { team_id: teamId, channel, text, thread_ts }).toPromise(); }
  scheduleMessage(teamId: string, channel: string, text: string, send_at: string, thread_ts?: string){ return this.http.post(`${this.backend}/messages/schedule`, { team_id: teamId, channel, text, send_at, thread_ts }).toPromise(); }
  listScheduled(teamId: string){ const params = new HttpParams().set('team_id', teamId); return this.http.get(`${this.backend}/messages/scheduled`, { params }).toPromise(); }
  cancelScheduled(teamId: string, id: string){ return this.http.delete(`${this.backend}/messages/${id}`, { headers: { 'x-team-id': teamId } }).toPromise(); }
  listChannels(teamId: string, cursor?: string){ const params = cursor ? new HttpParams().set('cursor', cursor) : undefined; return this.http.get(`${this.backend}/channels`, { params, headers: { 'x-team-id': teamId } }).toPromise(); }
}
