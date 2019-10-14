import U from 'meteor/game:utilities';
import {engine} from 'meteor/game:character';
import {Settings} from 'meteor/game:settings';

import Abilities from 'meteor/game:abilities';

const create = engine(Abilities);

const monsterTypes = [{
  name: 'Spider',
  generate: (opts) => {
    opts.meta = {
      img: U.rand(Settings.monsterImages.Spider)
    };
    return opts;
  },
}, {
  name: 'Snake',
  generate: (opts) => {
    opts.meta = {
      img: U.rand(Settings.monsterImages.Snake)
    };
    return opts;
  },
}, {
  name: 'Rat',
  generate: (opts) => {
    opts.meta = {
      img: U.rand(Settings.monsterImages.Rat)
    };
    return opts;
  },
}, {
  name: 'Demon',
  generate: (opts) => {
    opts.name = generateMonsterName();
    return opts;
  }
}, {
  name: 'Dog',
  generate: (opts) => opts,
}, {
  name: 'Wolf',
  generate: (opts) => {
    opts.meta = {
      img: U.rand(Settings.monsterImages.Wolf)
    };
    return opts;
  },
}, {
  name: 'Bear',
  generate: (opts) => opts,
}, {
  name: 'Elemental',
  generate: (opts) => {
    opts.meta = {
      img: U.rand(Settings.monsterImages.Elemental)
    };
    return opts;
  },
}, {
  name: 'Human',
  generate: (opts) => {
    // Remove the name so that the core name generator is used.
    delete opts.name;
    return opts;
  },
}, {
  name: 'Skeleton',
  generate: (opts) => {
    opts.health *= 0.75;
    return opts;
  },
}, {
  name: 'Zombie',
  generate: (opts) => {
    opts.speed = 0;
    opts.power *= 1.2;
    opts.meta = {
      img: U.rand(Settings.monsterImages.Zombie)
    };
    return opts;
  },
}, {
  name: 'Vampire',
  generate: (opts) => opts,
}, {
  name: 'Dragon',
  generate: (opts) => {
    opts.power *= 3;
    opts.health *= 3;
    opts.passives = ['Pyromancer'];
    return opts;
  },
}, {
  name: 'Goblin',
  generate: (opts) => opts,
}, {
  name: 'Orc',
  generate: (opts) => opts,
}, {
  name: 'Troll',
  generate: (opts) => opts,
}];

const generateMonsterName = () => {
  return U.capitalize(U.word());
};

const findMonsterTypeFromRoll = (types, roll, start = 0) => {
  let [type, ...rest] = types;
  let ceil = start + type.rarity;
  return roll <= ceil ? type.name : findMonsterTypeFromRoll(rest, roll, ceil);
};

const growToLevel = (monster, level) => {
  let i;
  for (i = 0; i < level; i++) {
    let speedIncrease = monster.speed * 1.1 - monster.speed;
    let healthIncrease = monster.maxHealth * 1.15 - monster.maxHealth;
    let powerIncrease = monster.power * 1.03 - monster.power;
    monster.level += 1;
    monster.speed += speedIncrease;
    monster.maxHealth += healthIncrease;
    monster.power += powerIncrease;
  }
  monster.speed = Math.round(monster.speed);
  monster.maxHealth = Math.round(monster.maxHealth);
  monster.power = Math.round(monster.power);
  monster.health = monster.maxHealth;
  return monster;
};

const generateMonster = (act, zone) => {
  let weights = [50, 45, 30, 25, 15, 10, 7, 6, 5, 2];
  const weightedRand = (min, max) => U.weightedSelect(U.range(min, max));
  let level;
  let actOptions = [{
    power: 1,
    health: weightedRand(25, 50),
    speed: weightedRand(1, 5),
  }, {
    power: weightedRand(1, 3),
    health: weightedRand(70, 150),
    speed: weightedRand(5, 12),
  }, {
    power: weightedRand(5, 8),
    health: weightedRand(150, 300),
    speed: weightedRand(20, 40),
  }];

  let monsterType = findMonsterTypeFromRoll(
    zone.types,
    U.num(0, zone.types.reduce((x, y) => x + y.rarity, 0))
  );

  if (act === 1) {
    level = U.weightedSelect(U.range(1, 5), weights);
  } else if (act === 2) {
    level = U.weightedSelect(U.range(6, 10), weights);
  } else if (act === 3) {
    level = U.weightedSelect(U.range(11, 20), weights);
  }

  const typeGenerator = monsterTypes.find(x => x.name === monsterType).generate;

  let options = typeGenerator(Object.assign(
    actOptions[act - 1],
    {
      npc: true,
      type: [monsterType],
      name: monsterType
    }
  ));

  // Only give monsters passives in act 2 or higher
  if (!options.passives && act !== 1) {
    options.passives = [];
  }
  return growToLevel(create(options), level);
};

export const Monster = {
  generate: generateMonster,
};
