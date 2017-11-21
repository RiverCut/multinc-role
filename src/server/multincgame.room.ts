
import { Room } from 'rivercut';
import { GameState } from './multiincgame.state';

export class GameRoom<GameState> extends Room {

  onSetup() {
    this.setState(new GameState());
  }

  onConnect(clientId: string) {
    this.sendMessage(clientId, { message: 'You joined!' });
    this.broadcast({ message: `${clientId} joined!`}, [clientId]);
  }

  onDisconnect(clientId: string) {
    this.sendMessage(clientId, { message: 'You left!' });
    this.broadcast({ message: `${clientId} left!`}, [clientId]);
  }

  onInit() {}
  onUninit() {}
  onDispose() {}
  onMessage() {}
  onTick() {}
}
