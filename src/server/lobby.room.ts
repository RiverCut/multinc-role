
import { Room } from 'rivercut';
import { LobbyState } from './lobby.state';

import * as _ from 'lodash';

export class LobbyRoom<LobbyState> extends Room {

  async canJoin(userId) {
    return !_.includes(this.connectedClients, userId);
  }

  onSetup() {
    this.setState(new LobbyState());
  }

  onConnect(clientId: string) {
    this.state.lobby.users.push(clientId);
    this.ds.record.getRecord(`players/${clientId}`).set('alreadyInGame', false);
  }

  onDisconnect(clientId: string) {
    this.state.lobby.users.splice(this.state.lobby.users.indexOf(clientId), 1);
  }

  onInit() {
    this.state.lobby.users = [];

    this.on('message', (data) => {
      const { message, $$userId } = data;

      this.state.lobby.messages.push({
        timestamp: Date.now(),
        message: _.truncate(message, { length: 280 }),
        sender: $$userId });

      while(this.state.lobby.messages.length > 500) {
        this.state.lobby.messages.unshift();
      }

      return true;
    });
  }

  onUninit() {
    this.off('message');
  }

  onDispose() {}
  onTick() {}
}
