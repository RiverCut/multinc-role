
import { Room } from 'rivercut';
import { LobbyState } from './lobby.state';

import * as _ from 'lodash';
import { Player, Style } from '../models/Game';
import { getHPForStyle, InitializePlayer } from './initializer';
import { StylesCodex } from './styles';
import { SkillsCodex } from './skills';

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

    this.on('get-stats', async (data, response) => {
      const player = await this.loadPlayer(data.$$userId);
      if(player.alreadyInGame) return response.send(false);
      return response.send(player);
    });

    this.on('get-buy-data', async () => {
      const skills = _.reduce(SkillsCodex,
        (result, value, key) => {
          result.push({
            name: key,
            level: value.level,
            style: value.style,
            cost: value.cost,
            desc: value.desc
          });
          return result;
        }, []);
      const styles = StylesCodex;
      return { skills, styles };
    });

    this.on('change:style', async (data, response) => {
      response.ack();
      const player = await this.loadPlayer(data.$$userId);

      if(!player.levels[data.style]) {
        const styleRef = _.find(StylesCodex, { name: data.style });
        if(!styleRef) return player;

        if(player.gold < styleRef.cost) return player;

        player.gold -= styleRef.cost;
      }

      this.setStyle(player, data.style);
      this.savePlayer(player);
      return player;
    });

    this.on('change:levelup', async (data, response) => {
      response.ack();
      const player = await this.loadPlayer(data.$$userId);

      const cost = player.level * 100;

      if(player.xp < cost) return player;

      player.xp -= cost;
      player.levels[player.style]++;

      this.savePlayer(player);
      return player;
    });

    this.on('change:skill', async (data, response) => {
      response.ack();
      const player = await this.loadPlayer(data.$$userId);

      const { skill, index } = data;

      if(index === 0) return player;
      if(!player.moves[index]) return player;
      if(player.moves[index] === skill) return player;

      const skillData = SkillsCodex[skill];
      if(!skillData) return player;

      if(skillData.style && skillData.style !== player.style) return player;
      if(skillData.level > player.levels[player.style]) return player;
      if(skillData.cost > player.gold) return player;

      player.gold -= skillData.cost;
      player.moves[index] = skill;

      this.savePlayer(player);
      return player;
    });

    this.on('change:auto', async (data, response) => {
      response.ack();
      const player = await this.loadPlayer(data.$$userId);

      player.automatic = !player.automatic;

      this.savePlayer(player);
      return player;
    });
  }

  onUninit() {
    this.off('message');
    this.off('get-stats');
    this.off('get-buy-data');
    this.off('change:style');
    this.off('change:levelup');
    this.off('change:skill');
  }

  onDispose() {}
  onTick() {}

  private setStyle(player: Player, style: Style) {
    if(!player.styleMoves[style]) player.styleMoves[style] = ['Attack', 'Attack', 'Attack', 'Attack', 'Attack', 'Attack'];
    if(!player.levels[style])     player.levels[style] = 1;
    player.styleMoves[player.style] = player.moves;

    player.style = style;
    player.moves = player.styleMoves[style];
    player.maxHp = player.hp = getHPForStyle(style);
  }

  private savePlayer(player: Player) {
    this.ds.record.getRecord(`players/${player.id}`).set(player);
  }

  private async loadPlayer(id: string): Promise<any> {
    const playerRecord = this.ds.record.getRecord(`players/${id}`);

    return new Promise(resolve => {
      playerRecord.whenReady(record => {
        const player = new Player();
        player.deserializeFrom(record.get());
        player.name = id;
        player.id = id;
        InitializePlayer(player);
        this.savePlayer(player);
        resolve(player);
      });
    });
  }
}
