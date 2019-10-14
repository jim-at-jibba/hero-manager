import {coords} from 'meteor/game:map-coords';

export const Zones = [{
  name: 'Swamp',
  types: [{
    name: 'Zombie',
    rarity: 60,
  }, {
    name: 'Elemental',
    rarity: 20,
  }, {
    name: 'Snake',
    rarity: 20,
  }],
  coords: coords.swamp,
}, {
  name: 'Forest',
  types: [{
    name: 'Rat',
    rarity: 30,
  }, {
    name: 'Bear',
    rarity: 5,
  }, {
    name: 'Wolf',
    rarity: 20,
  }, {
    name: 'Human',
    rarity: 5,
  }, {
    name: 'Spider',
    rarity: 20,
  }],
  coords: coords.forest,
}, {
  name: 'Mountain',
  types: [{
    name: 'Goblin',
    rarity: 60,
  }, {
    name: 'Orc',
    rarity: 30,
  }, {
    name: 'Troll',
    rarity: 15,
  }, {
    name: 'Human',
    rarity: 10,
  }, {
    name: 'Dragon',
    rarity: 2,
  }],
  coords: coords.mountain,
}];
