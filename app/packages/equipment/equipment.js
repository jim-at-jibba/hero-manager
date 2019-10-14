// app/packages/equipment/equipment.js

import Logic from './logic';

var createRandom = (level, rarity) => Logic.createRandom(level, rarity);

export default {
  createRandom
};
