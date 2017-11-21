
import { GameRoom } from './multincgame.room';

require('dotenv').config();

import { Server } from 'rivercut';

import { LobbyRoom } from './lobby.room';

const server = new Server({
  namespace: 'multincrole',
  resetStatesOnReboot: true,
  serializeByRoomId: true
});

console.log('Initializing...');
server.init(process.env.DEEPSTREAM_URL, {});

console.log('Registering...');
server.registerRoom('lobby', LobbyRoom, {});
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
