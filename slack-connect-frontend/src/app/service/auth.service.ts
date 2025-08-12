import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  backend = environment.backendUrl;
  constructor(private http: HttpClient) {}
  startInstall(){ window.location.href = `${this.backend}/auth/install`; }
  installed(){ return this.http.get(`${this.backend}/auth/status`).toPromise().catch(()=>null); }
}
