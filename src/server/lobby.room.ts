
import { Room } from 'rivercut';
import { LobbyState } from './lobby.state';

export class LobbyRoom<LobbyState> extends Room {

  onSetup() {
    this.setState(new LobbyState());
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
