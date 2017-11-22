import { Injectable } from '@angular/core';

import { Client } from 'rivercut';
import { ENV } from '../../../environments/environment.default';

@Injectable()
export class DeepstreamService {

  public client: Client;

  constructor() {
    this.client = new Client();
    this.client.onData$.subscribe(data => console.log('Received:', data));
  }

  async login(token): Promise<boolean> {
    try {
      await this.client.init(ENV.DeepstreamURL);
      await this.client.login({ token });
      return true;
    } catch(e) {
      throw e;
    }
  }

}
