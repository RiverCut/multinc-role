
import { ServerState, SyncTo } from 'rivercut';
import { Game } from '../models/Game';

export class GameState extends ServerState {
  @SyncTo(Game) public game: Game = new Game();

  onInit() {
  }

  onTick() {}
  onUninit() {}
}
