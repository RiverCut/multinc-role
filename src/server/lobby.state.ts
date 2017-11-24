
import { ServerState, SyncTo } from 'rivercut';
import { Lobby } from '../models/Lobby';

export class LobbyState extends ServerState {

  @SyncTo(Lobby) public lobby: Lobby = new Lobby();

  onInit() {
    this.lobby.users = [];
  }

  onUninit() {
    this.lobby.users = [];
  }

  onTick() {}
}
