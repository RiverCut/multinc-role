
import { Player } from '../models/Game';


export const getHPForStyle = (style, level = 1) => {
  const styles = {
    Fighter: 150,
    Mage: 50,
    Thief: 100
  };

  const mults = {
    Fighter: 5,
    Mage: 3,
    Thief: 4
  };

  return (styles[style] || 100) + ((mults[style] || 0) * (level - 1));
};

export const InitializePlayer = (player: Player) => {
  if(!player.moves)       player.moves = ['Attack', 'Attack', 'Attack', 'Attack', 'Attack', 'Attack'];
  if(!player.style)       player.style = 'Fighter';
  if(!player.gold)        player.gold = 0;
  if(!player.levels)      player.levels = { };
  if(!player.xp)          player.xp = 0;
  if(!player.styleMoves)  player.styleMoves = { };

  if(!player.levels[player.style])     player.levels[player.style] = 1;
  if(!player.styleMoves[player.style]) player.styleMoves[player.style] = ['Attack', 'Attack', 'Attack', 'Attack', 'Attack', 'Attack'];

  player.maxHp = player.hp = getHPForStyle(player.style, player.level);
  player.attack = player.defense = 0;
};
