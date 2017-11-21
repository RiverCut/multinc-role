
import { ServerState, SyncTo } from 'rivercut';

export class GameState extends ServerState {

  // @SyncTo(Board) public board: Board = new Board();

  onInit() {
  }

  onTick() {}
  onUninit() {}
}
