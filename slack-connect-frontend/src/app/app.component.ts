import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  channel = '';
  text = '';

  constructor(private auth: AuthService, private messageService: MessageService) {}

  connectSlack() {
    this.auth.connectSlack();
  }

  sendMessage() {
    this.messageService.sendMessage(this.channel, this.text)
      .subscribe(res => alert('Message sent!'));
  }
}