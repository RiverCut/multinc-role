
import { Model } from 'rivercut';

export type Style = 'Mage' | 'Fighter' | 'Thief';

export class Player extends Model {
  public style: Style;
  public moves: string[];
  public gold: number;
  public name: string;
  public maxHp: number;
  public hp: number;
  public xp: number;
  public levels: { [key: string]: number };
}

export class Game extends Model {
  adventureLog: string[] = [];
  players: Player[] = [];

  // clientId
  leader: string;

  adventureStarted: boolean;

  deserializeFrom(opts?) {
    super.deserializeFrom(opts);

    this.players = this.players.map(player => {
      const model = new Player();
      model.deserializeFrom(player);
      return model;
    });
  }
}
