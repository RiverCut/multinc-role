
import { Model } from 'rivercut';

import * as _ from 'lodash';

export class Combatant extends Model {
  public moves: string[];
  public gold: number;
  public xp: number;
  public name: string;
  public maxHp: number;
  public hp: number;
  public id: string;

  public defense: number;
  public attack: number;

  public isAlive(): boolean {
    return this.hp > 0;
  }
}

export class Monster extends Combatant {
  public spriteKey: string;
  public level: number;
}

export type Style = 'Mage' | 'Fighter' | 'Thief';

export class Player extends Combatant {
  public style: Style;
  public levels: { [key: string]: number };
  public styleMoves: { [key: string]: string[] };

  get level() {
    return this.levels[this.style];
  }
}

export class Game extends Model {
  adventureLog: string[] = [];
  players: Player[] = [];
  currentMonsters: Monster[] = [];
  currentStep = 0;
  status: string;

  playerActions: any = {};
  playerTargets: any = {};

  // clientId
  leader: string;
  environment: string;

  adventureStarted: boolean;
  doMonstersGoFirstNextTurn: boolean;

  findTarget(name: string) {
    const monster = _.find(this.currentMonsters, { id: name });
    if(monster) return monster;

    const player = _.find(this.players, { name });
    if(player) return player;

    return null;
  }

  deserializeFrom(opts?) {
    super.deserializeFrom(opts);

    this.players = this.players.map(player => {
      const model = new Player();
      model.deserializeFrom(player);
      return model;
    });

    this.currentMonsters = this.currentMonsters.map(monster => {
      const model = new Monster();
      model.deserializeFrom(monster);
      return model;
    });
  }
}
