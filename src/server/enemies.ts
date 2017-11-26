
export const RegionCodex = {
  Cave: {
    maxLevel: 5,
    encounterRates: [
      { num: 1, choices: ['GOBLIN'] },
      { num: 2, choices: ['GOBLIN', 'SHIELDGOBLIN', 'CASTGOBLIN'] },
      { num: 3, choices: ['GOBLIN', 'SHIELDGOBLIN', 'CASTGOBLIN'] },
      { num: 1, choices: ['GOBLIN', 'SHIELDGOBLIN', 'CASTGOBLIN', 'STINKGOBLIN', 'GOBLINSHAMAN', 'GOBLINBRUISER'] },
      { num: 1, choices: ['GOBLIN', 'SHIELDGOBLIN', 'CASTGOBLIN', 'STINKGOBLIN', 'GOBLINSHAMAN', 'GOBLINBRUISER'] },

      { num: 1, choices: ['GOBLIN'] },
      { num: 2, choices: ['SHIELDGOBLIN', 'STINKGOBLIN', 'GOBLINSHAMAN'] },
      { num: 3, choices: ['SHIELDGOBLIN', 'STINKGOBLIN', 'GOBLINSHAMAN'] },
      { num: 1, choices: ['GOBLINBRUISER'] },
      { num: 2, choices: ['GOBLINBRUISER'] },
    ]
  }
};

export const EnemyCodex = {
  GOBLIN: {
    name: 'Goblin',
    maxHp: 10,
    gold: 1,
    level: 1,
    xp: 2,
    moves: ['Attack', 'Attack', 'Attack', 'Attack', 'Attack', 'Attack']
  },
  SHIELDGOBLIN: {
    name: 'Shield Goblin',
    maxHp: 15,
    gold: 1,
    level: 1,
    xp: 3,
    moves: ['Attack', 'Attack', 'ShieldBash', 'ShieldBash', 'Defend', 'GreaterDefend']
  },
  CASTGOBLIN: {
    name: 'Caster Goblin',
    maxHp: 5,
    gold: 1,
    level: 1,
    xp: 2,
    moves: ['Attack', 'FireBeam', 'FireBeam', 'FireBeam', 'FireWave', 'Defend']
  },
  STINKGOBLIN: {
    name: 'Stink Goblin',
    maxHp: 10,
    gold: 1,
    level: 1,
    xp: 4,
    moves: ['Attack', 'Attack', 'Defend', 'DoNothing', 'DoNothing', 'Defend']
  },
  GOBLINSHAMAN: {
    name: 'Goblin Shaman',
    maxHp: 7,
    gold: 1,
    level: 2,
    xp: 2,
    moves: ['Attack', 'Attack', 'Heal', 'Heal', 'Heal', 'Defend']
  },
  GOBLINBRUISER: {
    name: 'Goblin Bruiser',
    maxHp: 20,
    gold: 1,
    level: 3,
    xp: 5,
    moves: ['AttackAll', 'AttackAll', 'AttackAll', 'StrongPunch', 'StrongPunch', 'Attack']
  }
};
