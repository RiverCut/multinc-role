
import * as _ from 'lodash';

export const SkillsCodex = {
  Attack: {
    preference: 'enemy-alive',
    automatic: (caster, possibleTargets) => _.sample(possibleTargets).id,
    effect: (caster, target) => {
      const damage = (caster.level * 2) - target.defense;
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
  AttackAll: {
    preference: 'enemy-alive-party',
    automatic: (caster, possibleTargets) => _.map(possibleTargets || [], 'id'),
    effect: (caster, target) => {
      const damage = (caster.level * 1) - target.defense;
      target.hp -= damage;
      return { damage };
    },
    message: (caster, target, { damage }) => `${caster.name} spun around and hit ${target.name} for ${damage} damage!`
  },
};
