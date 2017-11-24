
import { ClientState, SyncFrom } from 'rivercut';

import { Game } from '../../models/Game';

export class GameState extends ClientState {
  @SyncFrom(Game) public game: Game = new Game();
}
