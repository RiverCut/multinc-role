
import { Model } from 'rivercut';

export class Message extends Model {
  sender: string;
  message: string;
  timestamp: number;
}

export class Lobby extends Model {
  messages: Message[] = [];
  users: string[] = [];

  deserializeFrom(opts?) {
    super.deserializeFrom(opts);

    this.messages = this.messages.map(msg => {
      const model = new Message();
      model.deserializeFrom(msg);
      return model;
    });
  }
}
