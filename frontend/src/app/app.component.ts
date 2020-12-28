import { Component, OnInit, Input } from '@angular/core';
import { Message } from './models/message';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Create WebSocket connection.
  socket = new WebSocket('ws://localhost:8080/ws');
  messages: Message[] = [];
  userName: string = "";
  nameSubmitted = false;
  isInvalidName = false;
  @Input() inputText: string = "";

  constructor() { }


  ngOnInit(): void {
    // Connection opened
    this.socket.addEventListener('open', () => {
    });

    // Listen for messages
    this.socket.addEventListener('message', (event) => {
      let message = JSON.parse(event.data)
      message.isIncomming = true;
      this.messages.push(message);
    });

  }

  sendText() {
    console.log(this.inputText);
    let message = { text: this.inputText, isIncomming: false, sender: this.userName };
    this.messages.push(message)
    this.inputText = "";
    this.socket.send(JSON.stringify(message));
  }

  submitName() {
    if (this.userName.length > 0) {
      this.nameSubmitted = true;
    }
    else {
      this.isInvalidName = true;
    }
  }


}
