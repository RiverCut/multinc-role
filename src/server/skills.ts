
import * as _ from 'lodash';

export const SkillsCodex = {
  // basic skills
  Attack: {
    level: 0,
    cost: 0,
    desc: 'Attack a single target.',
    preference: 'enemy-alive',
    automatic: (caster, possibleTargets) => _.sample(possibleTargets).id,
    effect: (caster, target) => {
      const damage = (caster.level * 2) - target.defense + caster.attack;
      target.hp -= damage;
      return { damage };
    },
    message: (caster, target, { damage }) => `${caster.name} hit ${target.name} for ${damage} damage!`
  },
  Defend: {
    level: 0,
    cost: 0,
    desc: 'Defend from an enemy attack.',
    preference: 'self',
    automatic: (caster) => caster.id,
    effect: (caster, target) => {
      target.defense += 1 * caster.level;
      return {};
    },
    message: (caster) => `${caster.name} defended!`
  },
  DoNothing: {
    level: 0,
    cost: 0,
    desc: 'Do nothing.',
    preference: 'self',
    automatic: (caster) => caster.id,
    effect: () => {
      return {};
    },
    message: (caster) => `${caster.name} did nothing!`
  },

  // speciality skills
  GreaterDefend: {
    level: 3,
    cost: 100,
    style: 'Fighter',
    desc: 'Defend more enemy damage.',
    preference: 'self',
    automatic: (caster) => caster.id,
    effect: (caster, target) => {
      target.defense += 2 * caster.level;
      return {};
    },
    message: (caster) => `${caster.name} defended!`
  },
  AttackAll: {
    level: 5,
    cost: 250,
    style: 'Fighter',
    desc: 'Attack all enemies.',
    preference: 'enemy-alive-party',
    automatic: (caster, possibleTargets) => _.map(possibleTargets || [], 'id'),
    effect: (caster, target) => {
      const damage = (caster.level * 1) - target.defense + caster.attack;
      target.hp -= damage;
      return { damage };
    },
    message: (caster, target, { damage }) => `${caster.name} spun around and hit ${target.name} for ${damage} damage!`
  },
  ShieldBash: {
    level: 7,
    cost: 500,
    style: 'Fighter',
    desc: 'Bash an target with your shield, increasing def and doing damage.',
    preference: 'enemy-alive',
    automatic: (caster, possibleTargets) =>  _.sample(possibleTargets).id,
    effect: (caster, target) => {
      caster.defense += 1 * caster.level;
      const damage = (caster.level * 1) - target.defense + caster.attack;
      target.hp -= damage;
      return { damage };
    },
    message: (caster, target, { damage }) => `${caster.name} bashed ${target.name} with a shield for ${damage} damage!`
  },
  FireBeam: {
    level: 2,
    cost: 75,
    style: 'Mage',
    desc: 'Attack a single target with a beam of fire.',
    preference: 'enemy-alive',
    automatic: (caster, possibleTargets) =>  _.sample(possibleTargets).id,
    effect: (caster, target) => {
      const damage = (caster.level * 2) + caster.attack;
      target.hp -= damage;
      return { damage };
    },
    message: (caster, target, { damage }) => `${caster.name} zapped ${target.name} with a beam of fire for ${damage} damage!`
  },
  FireWave: {
    level: 4,
    cost: 275,
    style: 'Mage',
    desc: 'Attack all enemies with a wave of fire.',
    preference: 'enemy-alive-party',
    automatic: (caster, possibleTargets) => _.map(possibleTargets || [], 'id'),
    effect: (caster, target) => {
      const damage = (caster.level * 1) + caster.attack;
      target.hp -= damage;
      return { damage };
    },
    message: (caster, target, { damage }) => `${caster.name} washed ${target.name} with a wave of fire for ${damage} damage!`
  },
  Heal: {
    level: 5,
    cost: 250,
    style: 'Druid',
    desc: 'Heal a single target.',
    preference: 'ally-alive',
    automatic: (caster, possibleTargets) => _.sample(possibleTargets).id,
    effect: (caster, target) => {
      const heal = (caster.level * 2);
      target.hp = Math.min(target.hp + heal, target.maxHp);
      return { heal };
    },
    message: (caster, target, { heal }) => `${caster.name} healed ${target.name} for ${heal} health!`
  },
  StrongPunch: {
    level: 7,
    cost: 500,
    style: 'Druid',
    desc: 'Punch a single target for massive damage.',
    preference: 'enemy-alive',
    automatic: (caster, possibleTargets) => _.sample(possibleTargets).id,
    effect: (caster, target) => {
      const damage = (caster.level * 3) - target.defense + caster.attack;
      target.hp -= damage;
      return { damage };
    },
    message: (caster, target, { damage }) => `${caster.name} punched ${target.name} for ${damage} damage!`
  },
  Reinforce: {
    level: 3,
    cost: 150,
    style: 'Druid',
    desc: 'Increase a targets atk and def by 1.',
    preference: 'ally-alive',
    automatic: (caster, possibleTargets) => _.sample(possibleTargets).id,
    effect: (caster, target) => {
      target.attack += 1;
      target.defense += 1;
      return { };
    },
    message: (caster, target, { damage }) => `${caster.name} reinforced ${target.name}'s attack and defense!`
  }
};
