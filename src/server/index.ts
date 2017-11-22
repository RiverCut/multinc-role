

require('dotenv').config();

import { Server } from 'rivercut';

import { LobbyRoom } from './lobby.room';
import { GameRoom } from './multincgame.room';

const { ENV } = require(`../../environments`);

const server = new Server({
  namespace: 'multincrole',
  resetStatesOnReboot: true,
  serializeByRoomId: true
});

console.log('Initializing...');
server.init(ENV.DeepstreamURL, {});

console.log('Registering...');
server.registerRoom('lobby', LobbyRoom, { singleInstance: true, serializeByRoomId: false });
server.registerRoom('game', GameRoom, {});

console.log('Logging in...');
server.login({ token: process.env.DEEPSTREAM_TOKEN })
  .then(() => {
    console.log(`Logged In - Multinc Role - Server - ${server.uid}`);
  })
  .catch(err => {
    console.error(err);
  });

process.on('uncaughtException', (err) => console.error(err));
process.on('unhandledRejection', (err) => console.error(err));
