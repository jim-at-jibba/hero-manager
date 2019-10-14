import R from 'ramda';

import U from 'meteor/game:utilities';
import Equipment from 'meteor/game:equipment';

const engine = (lib) => {
  const getPrimaryAbility = () => {
    const abilities = lib.Primaries.toJS();
    const list = U.shuffle(R.keys(abilities));
    const findAbility = (list, abilities, roll = U.d1000()) => {
      let [first, ...rest] = list;
      return roll <= abilities[first].rarity ?
        first :
        rest.length ? findAbility(rest, abilities, roll) : false;
    };
    let abilityName = findAbility(list, abilities);
    return abilityName ? abilityName : 'Clumsy Assault';
  };

  const getPassives = (npc) => {
    let passives = lib.Passives.reduce((carry, item, name) => {
      if (U.d1000() <= item.get('rarity')) {
        carry.push(name);
      }
      return carry;
    }, []);

    if (npc) {
      return [];
    }

    // If the character is not an NPC the ensure they have some passives
    return passives.length ? passives : getPassives();
  };

  const create = (options = {}) => {
    let health = options.health || U.num(10, 40);
    let c = Object.assign({
      name: U.generateMercName(),
      power: U.num(1, 5),
      health: health,
      speed: U.num(1, 10),
      primaryAbility: getPrimaryAbility(),
      passives: getPassives(options.npc),
      meta: {},
      itemsUsed: [],
      type: null,
      npc: false,
      available: true,
      availableTime: 0,
      availableReason: '',
      level: 1,
      equipment: [
        Equipment.createRandom(1, 1)
      ],
    },
    options,
    {
      id: U.id(),
      created: Date.now(),
      maxHealth: health,
      forSale: false,
      exp: 0,
    });

    // The rarer the passive the pricier the mercenary
    let passiveCost = c.passives.reduce((carry, passive) => {
      let rarity = lib.Passives.get(passive).get('rarity');
      return carry + Math.ceil(10 / (rarity / 1000));
    }, 0);

    let basePrice = passiveCost + Math.ceil(
      c.maxHealth / 2 *
      c.power *
      (1 + c.speed / 10)
    ) + U.num(-50, 50);

    if (R.contains('Penitent', c.passives)) {
      c.basePrice = 0;
    } else {
      c.basePrice = basePrice;
    }

    // ensure that values are resolved to integers
    c = [
      'basePrice',
      'maxHealth',
      'power',
      'speed'
    ].reduce((carry, item) => {
      carry[item] = Math.round(carry[item]);
      return carry;
    }, c);

    return c;
  };

  return create;
};

export {engine};
