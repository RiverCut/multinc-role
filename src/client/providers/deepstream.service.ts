import { Injectable } from '@angular/core';

import { Client } from 'rivercut';
import { ENV } from '../../../environments/environment.default';
import { Events } from 'ionic-angular';
import { NotificationService } from "./notification.service";
import { LobbyState } from './lobby.clientstate';

@Injectable()
export class DeepstreamService {

  public ds: Client;
  public lobbyOpts: any = {};
  public lobbyState: LobbyState;

  constructor(private events: Events, private notificationService: NotificationService) {
    this.ds = new Client();
    this.ds.onData$.subscribe(data => console.log('Received:', data));

    // no no-rpc-provider, popup saying "no server was available to handle your request, try again later"
    this.ds.onServerDisconnect$.subscribe(data => this.events.publish('multinc:deauthenticated', { retry: true }));
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

  private join(room: string): Promise<any> {
    try {
      return this.ds.join(room);
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

}
