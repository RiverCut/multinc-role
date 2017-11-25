
import { Room } from 'rivercut';
import { GameState } from './multincgame.state';

import * as _ from 'lodash';
import { Player } from '../models/Game';

export class GameRoom<GameState> extends Room {

  private players: any = {};

  async canJoin() {
    return this.connectedClients.length < 4 && !this.state.game.adventureStarted;
  }

  onSetup() {
    this.setGameLoopInterval(250);
    this.setState(new GameState());
  }

  onConnect(clientId: string) {
    this.players[clientId] = this.ds.record.getRecord(`players/${clientId}`);
    this.players[clientId].whenReady(record => {
      const player = this.initPlayerRecord(record);
      player.name = clientId;
      this.updateLog(`${clientId} the ${player.style} joined!`);
    });

    this.updateLeader();
    this.updateThisRoomInfo();
  }

  onDisconnect(clientId: string) {
    this.updateLog(`${clientId} left!`);

    const playerRef = _.find(this.state.game.players, { name: clientId });
    if(playerRef && this.players[clientId]) {
      this.players[clientId].set(playerRef);
    }

    _.pull(this.state.game.players, playerRef);

    this.updateLeader();
    this.updateThisRoomInfo();
  }

  onInit() {
    this.on('start-game', (data) => {
      console.log(data);

      this.updateThisRoomInfo();
    });
  }

  onUninit() {
    this.off('start-game');
  }

  onDispose() {}
  onMessage() {}
  onTick() {
    if(!this.state.game.adventureStarted) return;

  }

  updateLeader() {
    this.state.game.leader = this.connectedClients[0];
  }

  updateThisRoomInfo() {
    this.updateRoomInfo({
      players: this.connectedClients.length,
      leader: this.state.game.leader,
      hasStarted: this.state.game.adventureStarted
    });
  }

  updateLog(message: string) {
    this.state.game.adventureLog.unshift(message);
    if(this.state.game.adventureLog.length > 15) this.state.game.adventureLog.length = 15;
  }

  getHPForStyle(style) {
    const styles = {
      Fighter: 150,
      Mage: 50,
      Thief: 100
    };

    return styles[style] || 100;
  }

  initPlayerRecord(record): Player {
    const model = new Player();
    model.deserializeFrom(record.get());
    return this.initPlayer(model);
  }

  initPlayer(player: Player): Player {
    if(!player.moves) player.moves = ['Attack', 'Attack', 'Attack', 'Attack', 'Attack', 'Attack'];
    if(!player.style) player.style = 'Fighter';
    if(!player.gold)  player.gold = 0;
    if(!player.levels)player.levels = { Fighter: 1 };
    if(!player.xp)    player.xp = 0;

    player.maxHp = player.hp = this.getHPForStyle(player.style);

    this.state.game.players.push(player);

    return player;
  }
}
