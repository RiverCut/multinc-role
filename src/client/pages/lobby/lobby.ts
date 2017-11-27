import { Component, ViewChild } from '@angular/core';
import { Select } from 'ionic-angular';
import { DeepstreamService } from '../../providers/deepstream.service';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-lobby',
  templateUrl: 'lobby.html',
})
export class LobbyPage {

  @ViewChild('scrollArea') private scrollArea;
  @ViewChild('styles') private styles: Select;

  public currentMessage: string;

  private update$;
  private roomUpdate$;
  private autoCheck$;

  public allRoomInfo: any[] = [];
  public player;
  public buyData;
  public selectedMove: number;

  public get levelupXP() {
    return this.player.levels[this.player.style] * 500;
  }

  public get filteredSkills() {
    return _.filter(this.buyData.skills, sk => sk.style === this.player.style || !sk.style);
  }

  get username() {
    return this.deepstreamService.ds.uid;
  }

  get isLeader() {
    return this.username === this.gameState.leader;
  }

  get state() {
    return this.deepstreamService.lobbyState;
  }

  get hasRoomInfo() {
    return this.allRoomInfo.length > 0;
  }

  get inGame() {
    return this.deepstreamService.gameOpts;
  }

  get gameState() {
    return this.deepstreamService.gameState.game;
  }

  constructor(
    private deepstreamService: DeepstreamService
  ) {}

  ngOnInit() {
    this.update$ = this.state.onUpdate$.subscribe(() => {
      this.scrollToBottom();
    });

    this.scrollToBottom();

    this.roomUpdate$ = this.deepstreamService.ds.onRoomUpdate$.subscribe(() => {
      const baseData = this.deepstreamService.ds.roomInfo;
      const newRoomInfo = [];

      _.each(baseData, (val, key) => {
        if(val.players <= 0 || val.players >= 4 || !val.leader || val.hasStarted) return;

        const baseRoomInfo = _.cloneDeep(val);
        baseRoomInfo.id = key;
        newRoomInfo.push(baseRoomInfo);
      });

      this.allRoomInfo = newRoomInfo || [];
    });

    this.autoCheck$ = Observable.timer(0, _.random(1000, 3000))
      .subscribe(() => {

        // no auto while in menu
        if(this.player) return;

        this.deepstreamService.ds.client.record.getRecord(`players/${this.deepstreamService.ds.uid}`)
          .whenReady(record => {
            const { alreadyInGame, automatic } = record.get();
            if(alreadyInGame || !automatic) return;

            const chosenRoom = _.sample(this.allRoomInfo);
            if(!chosenRoom) {
              this.joinGame(null, true);

              setTimeout(() => {
                this.startGame();
              }, 5000);

            } else {
              this.joinGame(chosenRoom.id);
            }
          });
      });
  }

  ngOnDestroy() {
    this.update$.unsubscribe();
    this.roomUpdate$.unsubscribe();
    this.autoCheck$.unsubscribe();
  }

  sendMessage() {
    if(!this.currentMessage || !this.currentMessage.trim()) return;
    this.deepstreamService.ds.emitFromState('message', { message: this.currentMessage }, this.state);
    this.currentMessage = '';
  }

  scrollToBottom() {
    setTimeout(() => {
      if(!this.scrollArea) return;
      this.scrollArea.nativeElement.scrollTop = this.scrollArea.nativeElement.scrollHeight;
    });
  }

  async joinGame(id?: string, createNew?: boolean) {
    try {
      await this.deepstreamService.joinGame(id, createNew);
    } catch(e) {
      console.error(e);
    }
  }

  async quitGame() {
    await this.deepstreamService.quitGame();
  }

  // tell the game server we're ready to roll
  startGame() {
    this.deepstreamService.startGame();
  }

  target(id: string) {
    this.deepstreamService.target(id);
  }

  hidePlayer() {
    this.player = null;
  }

  async loadCharacter() {
    const player = await this.deepstreamService.getStats();
    const buyData = await this.deepstreamService.getBuyData();
    this.player = player;
    this.buyData = buyData;
  }

  async _changeStyle($event) {
    const res = await this.deepstreamService.changeStyle($event);
    if(res) this.player = res;
  }

  changeStyle() {
    this.styles.open();
  }

  async levelUp() {
    const res = await this.deepstreamService.levelUp();
    if(res) this.player = res;
  }

  async buySkill(skill: string) {
    const res = await this.deepstreamService.buySkill(skill, this.selectedMove);
    if(res) this.player = res;
  }

  selectMove(i) {
    if(i <= 0) return;
    this.selectedMove = i;
  }

  async automatic() {
    const res = await this.deepstreamService.toggleAuto();
    if(res) this.player = res;
  }
}
