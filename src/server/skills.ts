
import * as _ from 'lodash';

export const SkillsCodex = {
  // basic skills
  Attack: {
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
    preference: 'self',
    automatic: (caster) => caster.id,
    effect: (caster, target) => {
      target.defense += 1 * caster.level;
      return {};
    },
    message: (caster) => `${caster.name} defended!`
  },
  DoNothing: {
    preference: 'self',
    automatic: (caster) => caster.id,
    effect: () => {
      return {};
    },
    message: (caster) => `${caster.name} did nothing!`
  },

  // speciality skills
  GreaterDefend: {
    preference: 'self',
    automatic: (caster) => caster.id,
    effect: (caster, target) => {
      target.defense += 2 * caster.level;
      return {};
    },
    message: (caster) => `${caster.name} defended!`
  },
  AttackAll: {
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
