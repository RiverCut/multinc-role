
import { Room } from 'rivercut';
import { GameState } from './multincgame.state';

import * as uuid from 'uuid/v4';
import * as _ from 'lodash';
import { Combatant, Game, Monster, Player } from '../models/Game';
import { EnemyCodex, RegionCodex } from './enemies';
import { SkillsCodex } from './skills';
import { InitializePlayer } from './initializer';

// TODO test with forks

export class GameRoom<GameState> extends Room {

  private players: any = {};
  private tickOperation: { ticks: number, whenDone: Function, earlyCheck?: Function };

  async canJoin() {
    return this.connectedClients.length < 4 && !this.state.game.adventureStarted;
  }

  onSetup() {
    const intervalMod = process.env.NODE_ENV === 'dev' ? 1 : 1;
    this.setGameLoopInterval(250 / intervalMod);
    this.setState(new GameState());
  }

  onConnect(clientId: string) {
    const playerRecord = this.ds.record.getRecord(`players/${clientId}`);
    playerRecord.whenReady(record => {
      const data = record.get();
      if(data.alreadyInGame) {
        this.forciblyDisconnect(clientId);
        return;
      }

      this.players[clientId] = playerRecord;
      this.players[clientId].set('alreadyInGame', true);

      const player = this.initPlayerRecord(record);
      player.name = clientId;
      player.id = clientId;
      this.updateLog(`${clientId} the ${player.style} joined!`);
      this.updateLeader();
      this.updateThisRoomInfo();
    });

  }

  onDisconnect(clientId: string) {
    this.updateLog(`${clientId} left!`);

    const playerRef = _.find(this.state.game.players, { name: clientId });
    if(playerRef && this.players[clientId]) {
      this.players[clientId].set(playerRef);
      this.players[clientId].set('alreadyInGame', false);
    }

    _.pull(this.state.game.players, playerRef);

    this.updateLeader();
    this.updateThisRoomInfo();
  }

  onInit() {
    this.on('start-game', (data) => {
      if(this.state.game.leader !== data.$$userId) return false;

      this.state.game.adventureStarted = true;
      this.pickEnvironment();
      this.state.game.status = `Adventuring to ${this.state.game.environment}...`;
      this.updateThisRoomInfo();

      this.tickOperation = {
        ticks: 20,
        whenDone: () => {
          this.pickMonsters();
          this.setCombatTick();
        }
      };

      return true;
    });

    this.on('select-target', (data) => {
      if(!this.state.game.adventureStarted) return;
      const curTarget = this.state.game.playerTargets[data.$$userId];
      if(curTarget === 'all' || curTarget === 'self') return;

      this.state.game.playerTargets[data.$$userId] = data.id;
      return true;
    });
  }

  onUninit() {
    this.off('start-game');
  }

  onDispose() {}

  onTick() {
    if(!this.state.game.adventureStarted) return;

    if(this.tickOperation) {
      const { whenDone, earlyCheck } = this.tickOperation;

      if(earlyCheck && earlyCheck()) {
        whenDone();
        return;
      }

      this.tickOperation.ticks--;

      if(this.tickOperation.ticks <= 0) {
        whenDone();
      }
    }
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

  savePlayer(player: Player): void {
    this.players[player.name].set(player);
  }

  initPlayerRecord(record): Player {
    const model = new Player();
    model.deserializeFrom(record.get());
    return this.initPlayer(model);
  }

  initPlayer(player: Player): Player {
    InitializePlayer(player);

    this.state.game.players.push(player);

    return player;
  }

  pickEnvironment() {
    const environment = _(RegionCodex)
      .keys()
      .reject(region => {
        const highestLeveledPlayer = _.maxBy(this.state.game.players, 'level');
        const highestLevel = highestLeveledPlayer.level;
        return RegionCodex[region].maxLevel < highestLevel;
      })
      .sample();

    this.state.game.environment = environment;
  }

  pickMonsters() {
    const chosenMonsters = [];

    const step = this.state.game.currentStep;

    const { num, choices } = RegionCodex[this.state.game.environment].encounterRates[step];

    const playerAvgLevel = _.sumBy(this.state.game.players, 'level') / this.state.game.players.length;

    for(let i = 0; i < num; i++) {
      const chosenKey = _.sample(choices);
      const monster = new Monster();
      monster.deserializeFrom(EnemyCodex[chosenKey]);
      monster.id = uuid();
      monster.spriteKey = chosenKey;
      monster.hp = monster.maxHp;
      monster.attack = monster.defense = 0;
      monster.level = Math.floor(Math.max(monster.level, playerAvgLevel));
      chosenMonsters.push(monster)
    }

    this.state.game.currentMonsters = chosenMonsters;
  }

  reset(target: Combatant) {
    target.attack = 0;
    target.defense = 0;
  }

  getTargets(skillPreference: string, gameState: Game, alliance: 'player'|'enemy') {

    let array = [];

    if(alliance === 'player') {
      if(_.includes(skillPreference, 'enemy')) array = gameState.currentMonsters;
      if(_.includes(skillPreference, 'ally'))  array = gameState.players;
      if(_.includes(skillPreference, 'self'))  array = gameState.players;
    } else {
      if(_.includes(skillPreference, 'enemy')) array = gameState.players;
      if(_.includes(skillPreference, 'ally'))  array = gameState.currentMonsters;
      if(_.includes(skillPreference, 'self'))  array = gameState.currentMonsters;
    }

    if(_.includes(skillPreference, 'alive')) {
      array = _.filter(array, m => m.isAlive());
    }

    if(_.includes(skillPreference, 'dead')) {
      array = _.reject(array, m => m.isAlive());
    }

    return array;
  }

  setCombatTick() {

    if(this.checkLoss()) {
      this.state.game.status = 'Everyone died! Returning to lobby...';
      this.state.game.playerTargets = {};
      this.tickOperation = {
        ticks: 12,
        whenDone: () => {
          this.kickPlayers();
        }
      };
      return;
    }

    if(this.checkCombatVictory()) {
      this.state.game.status = 'Combat won!';
      this.state.game.playerTargets = {};
      this.tickOperation = {
        ticks: 12,
        whenDone: () => {
          this.wonCombat();
          this.nextFloor();
        }
      };
      return;
    }

    const nonTargets = _(this.state.game.players)
      .reject(p => this.state.game.playerTargets[p])
      .map('id')
      .value()
      .join(', ');

    this.state.game.status = `Choose your target: ${nonTargets}.`;

    const gameState = this.state.game;

    gameState.playerTargets = {};
    gameState.playerActions = {};

    gameState.players.forEach(p => {
      gameState.playerActions[p.name] = _.sample(p.moves);
      const skill = SkillsCodex[gameState.playerActions[p.name]];
      if(_.includes(skill.preference, 'party')) gameState.playerTargets[p.name] = 'all';
      if(_.includes(skill.preference, 'self'))  gameState.playerTargets[p.name] = 'self';
    });

    this.tickOperation = {
      ticks: 40,
      earlyCheck: () => {
        return _.every(gameState.players, p => !p.isAlive() || gameState.playerTargets[p.name] || p.automatic);
      },
      whenDone: () => {
        _.each(gameState.players, p => {
          const target = gameState.playerTargets[p.name];
          if(!target || target === 'all' || target === 'self' || !gameState.findTarget(target)) {
            const skill = SkillsCodex[gameState.playerActions[p.name]];
            const targets = this.getTargets(skill.preference, gameState, 'player');
            if(targets.length === 0) return;

            const choice = skill.automatic(p, targets, gameState);
            gameState.playerTargets[p.name] = choice;
          }
        });

        if(this.state.game.doMonstersGoFirstNextTurn) {
          this.updateLog('First strike for monsters!');
          this.state.game.doMonstersGoFirstNextTurn = false;
          this.enemyTurn();
          this.playerTurn();
        } else {
          this.playerTurn();
          this.enemyTurn();
        }
        this.setCombatTick();
      }
    };

  }

  playerTurn() {
    const gameState = this.state.game;
    _.each(gameState.players, player => {
      if(!player.isAlive()) {
        this.reset(player);
        return;
      }

      let { attack, defense } = player;

      const actionName = gameState.playerActions[player.name];
      const action = SkillsCodex[actionName];

      const targets = gameState.playerTargets[player.name];
      if(!targets || targets.length === 0) {
        this.updateLog(`${player.name}'s turn was skipped due to a dead target!`);
        return;
      }

      const targetList = _.isArray(targets) ? targets : [targets];

      targetList.forEach(targetId => {
        const target = gameState.findTarget(targetId);
        const opts = action.effect(player, target);
        this.updateLog(action.message(player, target, opts || {}));
      });

      if(actionName !== 'DoNothing') {
        player.attack -= attack;
        player.defense -= defense;
      }
    });
  }

  enemyTurn() {
    const gameState = this.state.game;
    _.each(gameState.currentMonsters, monster => {
      if(!monster.isAlive()) {
        this.reset(monster);
        return;
      }

      let { attack, defense } = monster;
      const actionName = _.sample(EnemyCodex[monster.spriteKey].moves);
      const action = SkillsCodex[actionName];
      const targets = this.getTargets(action.preference, gameState, 'enemy');
      if(!targets || targets.length === 0) {
        this.updateLog(`${monster.name}'s turn was skipped due to a dead target!`);
        return;
      }

      const autoTargets = action.automatic(monster, targets);
      const targetList = _.isArray(autoTargets) ? autoTargets : [autoTargets];

      targetList.forEach(targetId => {
        const target = gameState.findTarget(targetId);
        const opts = action.effect(monster, target);
        this.updateLog(action.message(monster, target, opts || {}));
      });

      if(actionName !== 'DoNothing') {
        monster.attack -= attack;
        monster.defense -= defense;
      }
    });
  }

  nextFloor() {
    this.state.game.currentStep++;

    if(this.checkDungeonVictory()) {
      this.state.game.status = 'You cleared the dungeon! Returning to lobby...';
      this.state.game.playerTargets = {};

      this.state.game.players.forEach(p => {
        const regionLevel = RegionCodex[this.state.game.environment].level;
        p.xp += 50 * regionLevel;
        p.gold += 20 * regionLevel;
        this.savePlayer(p);
      });

      this.tickOperation = {
        ticks: 12,
        whenDone: () => {
          this.kickPlayers();
        }
      };
      return true;
    }

    this.state.game.players.forEach(p => {
      if(p.hp <= 0) p.hp = 1;
    });

    this.state.game.doMonstersGoFirstNextTurn = _.sample([true, false]);
    this.pickMonsters();
    this.setCombatTick();
  }

  checkCombatVictory(): boolean {
    return _.every(this.state.game.currentMonsters, p => !p.isAlive());
  }

  // currentStep >= steps.length (meaning we ran out of steps, so we win)
  checkDungeonVictory(): boolean {
    return this.state.game.currentStep >= RegionCodex[this.state.game.environment].encounterRates.length;
  }

  checkLoss(): boolean {
    return _.every(this.state.game.players, p => !p.isAlive());
  }

  wonCombat(): void {
    let gainedXP = 0;
    let gainedGold = 0;

    this.state.game.currentMonsters.forEach(mon => {
      gainedXP += mon.xp;
      gainedGold += mon.gold;
    });

    this.state.game.players.forEach(p => {
      p.xp += gainedXP;
      p.gold += gainedGold;
      this.savePlayer(p);
    });

    this.updateLog(`The party gained ${gainedXP} XP and ${gainedGold} Gold!`);
  }

  kickPlayers(): void {
    this.setGameLoopInterval(-1);

    this.connectedClients.forEach(client => {
      this.sendMessage(client, 'leave-game');

      setTimeout(() => {
        this.forciblyDisconnect(client);
      });
    });
  }
}
