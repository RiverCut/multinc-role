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

  constructor(private events: Events, private notificationService: NotificationService) {
    this.ds = new Client();
    this.ds.onData$.subscribe(data => console.log('Received:', data));

    // no no-rpc-provider, popup saying "no server was available to handle your request, try again later"
    this.ds.onServerDisconnect$.subscribe(data => {
      delete this.gameOpts;
      delete this.gameState;
      this.events.publish('multinc:deauthenticated', { retry: true });
    });
  }

  async login(token): Promise<boolean> {
    try {
      if(!this.ds.uid) {
        await this.ds.init(ENV.DeepstreamURL);
      }
      await this.ds.login({ token });
      await this.joinLobby();
      return true;
    } catch(e) {
      throw e;
    }
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

}
