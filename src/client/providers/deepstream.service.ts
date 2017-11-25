import { Injectable } from '@angular/core';

import { Client } from 'rivercut';
import { ENV } from '../../../environments/environment.default';
import { Events } from 'ionic-angular';
import { NotificationService } from "./notification.service";
import { LobbyState } from './lobby.clientstate';
import { GameState } from './game.clientstate';

@Injectable()
export class DeepstreamService {

  public ds: Client;
  public lobbyOpts: any = {};
  public lobbyState: LobbyState;

  public gameOpts: any;
  public gameState: GameState;

  private data$;
  private disconnect$;

  constructor(
    private events: Events,
    private notificationService: NotificationService
  ) {}

  initClient(): void {
    if(this.data$) this.data$.unsubscribe();
    if(this.disconnect$) this.disconnect$.unsubscribe();

    this.ds = new Client();
    this.data$ = this.ds.onData$.subscribe(data => console.log('Received:', data));

    // no no-rpc-provider, popup saying "no server was available to handle your request, try again later"
    this.disconnect$ = this.ds.onServerDisconnect$.subscribe(async () => {
      this.events.publish('multinc:deauthenticated', { retry: true });
      try {
        await this.cleanup();
      } catch(e) {}

    });
  }


  async login(token): Promise<boolean> {
    try {
      if(!this.ds || !this.ds.uid) {
        this.initClient();
        await this.ds.init(ENV.DeepstreamURL);
        await this.ds.login({ token });
      }

      await this.joinLobby();
      return true;
    } catch(e) {
      throw e;
    }
  }

  async cleanup(): Promise<any> {
    this.lobbyState.uninit();
    this.gameState.uninit();
    delete this.lobbyOpts;
    delete this.lobbyState;
    delete this.gameOpts;
    delete this.gameState;
    // this.disconnect$.unsubscribe();
    // this.data$.unsubscribe();
    this.ds.leaveAll();
    this.ds.close();
  }

  private join(room: string, id?: string, opts?: any): Promise<any> {
    try {
      return this.ds.join(room, id, opts);
    } catch(e) {
      this.notificationService.alert({
        title: 'No Servers Available',
        subTitle: 'There were no servers able to handle your request. Please try again, and if the problem persists, refresh the page.'
      });
    }
  }

  async joinLobby(): Promise<any> {
    const lobbyOpts = await this.join('Lobby');
    this.lobbyOpts = lobbyOpts;
    if(!this.lobbyState) {
      this.lobbyState = this.ds.createState<LobbyState>(LobbyState, this.lobbyOpts);
     }
    return lobbyOpts;
  }

  async joinGame(id?: string, createNewRoom?: boolean): Promise<any> {
    if(this.gameOpts) return;

    const gameOpts = await this.join('Game', id, { createNewRoom });
    this.gameOpts = gameOpts;
    this.gameState = this.ds.createState<GameState>(GameState, this.gameOpts);
    return gameOpts;
  }

  async quitGame(): Promise<any> {
    if(!this.gameOpts) return;

    await this.ds.leave('Game');
    delete this.gameOpts;
    delete this.gameState;
  }

  startGame() {
    this.ds.emitFromState('start-game', {}, this.gameState);
  }

}
