
import { ClientState, SyncFrom } from 'rivercut';

import { Lobby } from '../../models/Lobby';

export class LobbyState extends ClientState {
  @SyncFrom(Lobby) public lobby: Lobby = new Lobby();
}
