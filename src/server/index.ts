

require('dotenv').config();

import { Server } from 'rivercut';

import { LobbyRoom } from './lobby.room';
import { GameRoom } from './multincgame.room';

import * as cluster from 'cluster';
import * as os from 'os';

const numForks = process.env.NODE_ENV === 'dev' ? 1 : os.cpus().length;

process.on('uncaughtException', (err) => console.error(err));
process.on('unhandledRejection', (err) => console.error(err));

if(cluster.isMaster) {
  for(let i = 0; i < numForks; i++) {
    cluster.fork();
  }

} else {
  const server = new Server({
    namespace: 'multincrole',
    resetStatesOnReboot: ['Game'],
    serializeByRoomId: true
  });

  console.log(`${process.pid} | Initializing...`);
  server.init(process.env.DEEPSTREAM_URL, {});

  console.log(`${process.pid} | Registering...`);
  server.registerRoom('Lobby', LobbyRoom, { singleInstance: true, serializeByRoomId: false });
  server.registerRoom('Game', GameRoom, {});

  console.log(`${process.pid} | Logging in...`);
  server.login({ token: process.env.DEEPSTREAM_TOKEN })
    .then(() => {
      console.log(`${process.pid} | Logged In - Multinc Role - Server - ${server.uid}`);
    })
    .catch(err => {
      console.error(err);
    });
}
