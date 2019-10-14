// app/packages/equipment/logic.js

import U from 'meteor/game:utilities';

const prefixes = {
  'physical': {
    Glinting: {
      level: 5,
      modify: (item) => {
        item.min += 1;
        item.max += 2;
        return item;
      },
    },
    Burnished: {
      level: 13,
      modify: (item) => {
        item.min += U.num(2, 3);
        item.max += U.num(4, 5);
        return item;
      },
    },
    Polished: {
      level: 19,
      modify: (item) => {
        item.min += U.num(3, 4);
        item.max += U.num(6, 7);
        return item;
      },
    },
    Honed: {
      level: 28,
      modify: (item) => {
        item.min += U.num(4, 6);
        item.max += U.num(9, 10);
        return item;
      },
    },
    Gleaming: {
      level: 35,
      modify: (item) => {
        item.min += U.num(5, 7);
        item.max += U.num(11, 12);
        return item;
      },
    },
    Annealed: {
      level: 44,
      modify: (item) => {
        item.min += U.num(6, 9);
        item.max += U.num(13, 15);
        return item;
      },
    },
    'Razor Sharp': {
      level: 52,
      modify: (item) => {
        item.min += U.num(7, 10);
        item.max += U.num(15, 18);
        return item;
      },
    },
    Tempered: {
      level: 64,
      modify: (item) => {
        item.min += U.num(9, 12);
        item.max += U.num(19, 22);
        return item;
      },
    },
    Flaring: {
      level: 76,
      modify: (item) => {
        item.min += U.num(11, 15);
        item.max += U.num(22, 26);
        return item;
      },
    },
  },
  'physical-scaling': {
    Heavy: {
      level: 1,
      modify: (item) => {
        item.min = Math.round(item.min * U.num(140, 149) / 100);
        item.max = Math.round(item.max * U.num(140, 149) / 100);
        return item;
      }
    },
    Serrated: {
      level: 11,
      modify: (item) => {
        item.min = Math.round(item.min * U.num(150, 164) / 100);
        item.max = Math.round(item.max * U.num(150, 164) / 100);
        return item;
      }
    },
    Wicked: {
      level: 23,
      modify: (item) => {
        item.min = Math.round(item.min * U.num(165, 184) / 100);
        item.max = Math.round(item.max * U.num(165, 184) / 100);
        return item;
      }
    },
    Vicious: {
      level: 35,
      modify: (item) => {
        item.min = Math.round(item.min * U.num(185, 209) / 100);
        item.max = Math.round(item.max * U.num(185, 209) / 100);
        return item;
      }
    },
    Bloodthirsty: {
      level: 46,
      modify: (item) => {
        item.min = Math.round(item.min * U.num(210, 234) / 100);
        item.max = Math.round(item.max * U.num(210, 234) / 100);
        return item;
      }
    },
    Cruel: {
      level: 60,
      modify: (item) => {
        item.min = Math.round(item.min * U.num(235, 254) / 100);
        item.max = Math.round(item.max * U.num(235, 254) / 100);
        return item;
      }
    },
    Tyrannical: {
      level: 73,
      modify: (item) => {
        item.min = Math.round(item.min * U.num(255, 269) / 100);
        item.max = Math.round(item.max * U.num(255, 269) / 100);
        return item;
      }
    },
    Merciless: {
      level: 83,
      modify: (item) => {
        item.min = Math.round(item.min * U.num(270, 279) / 100);
        item.max = Math.round(item.max * U.num(270, 279) / 100);
        return item;
      }
    },
  },
  'physical-reflect': {
    'Thorny': {
      level: 1,
      modify: (item) => {
        const rand = U.num(1, 4);
        if (!item.hasOwnProperty('passives')) {
          item.passives = [];
        }
        item.passives.push({
          triggers: ['onDamageApply'],
          call: `(function() {
            var reflect = ${rand};
            if (this.caster.health <= 0) {
              return;
            }
            this.enemy.health = this.enemy.health - reflect <= 0 ?
              0 :
              this.enemy.health - reflect;
          })`
        });
        item.equipmentDescription.push(`Reflects ${rand} damage to attackers`);

        return item;
      }
    },
    'Spiny': {
      level: 10,
      modify: (item) => {
        const rand = U.num(5, 10);
        if (!item.hasOwnProperty('passives')) {
          item.passives = [];
        }
        item.passives.push({
          triggers: ['onDamageApply'],
          call: `(function() {
            var reflect = ${rand};
            if (this.caster.health <= 0) {
              return;
            }
            this.enemy.health = this.enemy.health - reflect <= 0 ?
              0 :
              this.enemy.health - reflect;
          })`
        });
        item.equipmentDescription.push(`Reflects ${rand} damage to attackers`);

        return item;
      }
    },
    'Barbed': {
      level: 20,
      modify: (item) => {
        const rand = U.num(11, 24);
        if (!item.hasOwnProperty('passives')) {
          item.passives = [];
        }
        item.passives.push({
          triggers: ['onDamageApply'],
          call: `(function() {
            var reflect = ${rand};
            if (this.caster.health <= 0) {
              return;
            }
            this.enemy.health = this.enemy.health - reflect <= 0 ?
              0 :
              this.enemy.health - reflect;
          })`
        });
        item.equipmentDescription.push(`Reflects ${rand} damage to attackers`);

        return item;
      }
    },
    'Jagged': {
      level: 35,
      modify: (item) => {
        const rand = U.num(25, 50);
        if (!item.hasOwnProperty('passives')) {
          item.passives = [];
        }
        item.passives.push({
          triggers: ['onDamageApply'],
          call: `(function() {
            var reflect = ${rand};
            if (this.caster.health <= 0) {
              return;
            }
            this.enemy.health = this.enemy.health - reflect <= 0 ?
              0 :
              this.enemy.health - reflect;
          })`
        });
        item.equipmentDescription.push(`Reflects ${rand} damage to attackers`);

        return item;
      }
    },
  },
  'damage-reduction': {
    'Lacquered': {
      level: 1,
      modify: (item) => {
        const rand = U.num(3, 10);
        if (!item.hasOwnProperty('passives')) {
          item.passives = [];
        }
        item.passives.push({
          triggers: ['onDamageApply'],
          call: `(function() {
            var reduction = ${rand};
            this.damage -= reduction;
            if (this.damage < 0) {
              this.damage = 0;
            }
          })`
        });
        item.equipmentDescription.push(`Prevents ${rand} damage from each attack received`);

        return item;
      }
    },
  }
};

const suffixes = {
  'life-regen': {
    'of the Newt': {
      level: 1,
      value: () => U.num(1, 2),
      modify: (item) => {
        const rand = U.num(1, 2);
        if (!item.hasOwnProperty('passives')) {
          item.passives = [];
        }
        item.passives.push({
          triggers: ['onTurnEnd'],
          call: `(function() {
            var heal = ${rand};
            if (this.caster.health <= 0) {
              return;
            }
            this.caster.health = this.caster.health + heal >= this.caster.maxHealth ?
              this.caster.maxHealth :
              this.caster.health + heal;
          })`
        });
        item.equipmentDescription.push(`${rand} Life Regenerated per turn`);

        return item;
      }
    },
    'of the Lizard': {
      level: 18,
      modify: (item) => {
        const rand = U.num(2, 4);
        if (!item.hasOwnProperty('passives')) {
          item.passives = [];
        }
        item.passives.push({
          triggers: ['onTurnEnd'],
          call: `(function() {
            var heal = ${rand};
            if (this.caster.health <= 0) {
              return;
            }
            this.caster.health = this.caster.health + heal >= this.caster.maxHealth ?
              this.caster.maxHealth :
              this.caster.health + heal;
          })`
        });
        item.equipmentDescription.push(`${rand} Life Regenerated per turn`);

        return item;
      }
    },
  }
};

const baseItems = {
  'sword': {
    prefixTypes: ['physical', 'physical-scaling'],
    suffixTypes: ['life-regen'],
    subset: {
      'Rusted Sword': {
        level: 1,
        min: 4,
        max: 8,
        meta: {
          img: '/item-art/equipment/sword/rusted-sword.png'
        }
      },
      'Copper Sword': {
        level: 5,
        min: 6,
        max: 12,
        meta: {
          img: '/item-art/equipment/sword/copper-sword.png'
        }
      },
      Sabre: {
        level: 10,
        min: 4,
        max: 18,
        meta: {
          img: '/item-art/equipment/sword/sabre.png'
        }
      },
      'Broad Sword': {
        level: 15,
        min: 14,
        max: 21,
        meta: {
          img: '/item-art/equipment/sword/broad-sword.png'
        }
      },
      'War Sword': {
        level: 20,
        min: 16,
        max: 30,
        meta: {
          img: '/item-art/equipment/sword/war-sword.png'
        }
      },
      'Ancient Sword': {
        level: 24,
        min: 17,
        max: 31,
        meta: {
          img: '/item-art/equipment/sword/ancient-sword.png'
        }
      },
      'Elegant Sword': {
        level: 28,
        min: 17,
        max: 27,
        meta: {
          img: '/item-art/equipment/sword/elegant-sword.png'
        }
      },
    },
  },
  'dagger': {
    prefixTypes: ['physical', 'physical-scaling'],
    suffixTypes: ['life-regen'],
    subset: {
      'Glass Shank': {
        level: 1,
        min: 5,
        max: 8,
        meta: {
          img: '/item-art/equipment/dagger/glass-shank.png'
        }
      },
      'Skinning Knife': {
        level: 5,
        min: 4,
        max: 16,
        meta: {
          img: '/item-art/equipment/dagger/skinning-knife.png'
        }
      },
      'Carving Knife': {
        level: 10,
        min: 2,
        max: 22,
        meta: {
          img: '/item-art/equipment/dagger/carving-knife.png'
        }
      },
      'Stiletto': {
        level: 15,
        min: 6,
        max: 23,
        meta: {
          img: '/item-art/equipment/dagger/stiletto.png'
        }
      },
      'Boot Knife': {
        level: 20,
        min: 8,
        max: 30,
        meta: {
          img: '/item-art/equipment/dagger/boot-knife.png'
        }
      },
      'Copper Kris': {
        level: 24,
        min: 10,
        max: 39,
        meta: {
          img: '/item-art/equipment/dagger/copper-kris.png'
        }
      },
      'Skean': {
        level: 28,
        min: 9,
        max: 37,
        meta: {
          img: '/item-art/equipment/dagger/skean.png'
        }
      },
    },
  },
  'body-armour': {
    prefixTypes: ['physical-reflect', 'damage-reduction'],
    suffixTypes: ['life-regen'],
    subset: {
      'Plate Vest': {
        level: 1,
        min: 0,
        max: 0,
        meta: {
          img: '/item-art/equipment/body-armour/plate-vest.png'
        }
      }
    }
  }
};

const create = opts => {
  let defaults = {
    userId: null,
    type: 'equipment',
    quality: 2,
    id: U.id(),
    equipmentDescription: []
  };

  return Object.assign(defaults, opts);
};

const keys = x => Object.keys(x);

const getBaseItem = (level = 1) => {
  if (level < 1) {
    level = 1;
  }
  const type = U.rand(keys(baseItems));
  const subset = baseItems[type].subset;
  const itemName = U.rand(keys(subset).filter(x => subset[x].level <= level));
  const item = baseItems[type].subset[itemName];
  item.equipmentType = type;
  item.name = itemName;
  item.price = 10;
  return item;
};

const addPrefix = (base, level) => {
  const type = U.rand(baseItems[base.equipmentType].prefixTypes);
  const subset = prefixes[type];
  const modList = keys(subset).filter(x => subset[x].level <= level);
  if (modList.length) {
    const mod = U.rand(modList);
    const item = prefixes[type][mod].modify(base);
    item.name = mod + ' ' + item.name;
    item.quality += 1;
    return item;
  } else {
    return base;
  }
};

const addSuffix = (base, level) => {
  const type = U.rand(baseItems[base.equipmentType].suffixTypes);
  const subset = suffixes[type];
  const modList = keys(subset).filter(x => subset[x].level <= level);
  if (modList.length) {
    const mod = U.rand(modList);
    const item = suffixes[type][mod].modify(base);
    item.name = item.name + ' ' + mod;
    item.quality += 1;
    return item;
  } else {
    return base;
  }
};

const createRandom = (level, rarity = U.num(1, 4)) => {
  if (level < 1) {
    level = 1;
  }
  let item = create(getBaseItem(level));
  if (rarity === 2) {
    item = addPrefix(item, level);
  }
  if (rarity === 3) {
    item = addSuffix(item, level);
  }
  if (rarity === 4) {
    item = addPrefix(addSuffix(item, level), level);
  }

  item.price = level * rarity * 15 + U.num(1, level * rarity * 10);

  return item;
};

export default {
  create,
  createRandom,
};
