import Chance from 'chance';
import {alsation} from 'meteor/game:wordlists';

const chance = new Chance();

const dice = (max) => () => Math.floor(Math.random() * max) + 1;
const d1000 = dice(1000);
const d100 = dice(100);
const d20 = dice(20);
const d10 = dice(10);
const d6 = dice(6);
const d3 = dice(3);

const rand = (array) => chance.pickone(array);

const shuffle = (array) => {
  var currentIndex = array.length;
  var temporaryValue;
  var randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const weightedSelect = (options, weights) => {
  if (!weights) {
    weights = range(1, options.length).reverse();
  }
  let i;
  let j = 0;
  let selection = null;
  const weightTotal = weights.reduce((x, y) => x + y, 0);
  const roll = chance.integer({min: 0, max: weightTotal});

  for (i = 0; i < options.length; i++) {
    if (selection === null && roll <= j + weights[i]) {
      selection = options[i];
      break;
    }
    j += weights[i];
  }

  return selection;
};

const randomString = () => chance.string({pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'});

const capitalize = (s) => chance.capitalize(s);
const word = () => chance.word();
const last = () => chance.last();
const name = () => chance.name();
const prefix = () => chance.prefix();
const num = (min, max) => chance.integer({min, max});
const id = () => chance.apple_token();

const generateMercName = () => {
  const style = d10();
  if (style === 1) {
    return capitalize(word()) + ' ' + capitalize(word());
  } else if (style === 2 || style === 6) {
    return last() + ' ' + last();
  } else if (style === 3 || style === 4) {
    return name();
  } else if (style === 5) {
    return prefix() + ' ' + last();
  } else if (style === 6) {
    return rand(alsation) + ' ' + last();
  } else if (style === 7) {
    return rand(alsation);
  } else if (style === 8) {
    return rand(alsation) + ' ' + capitalize(word());
  } else if (style === 9) {
    return capitalize(word());
  } else if (style === 10) {
    if (d3() === 3) {
      return chance.first() + ' "' + (d3 === 3 ? 'The ' : '') + rand(alsation) + '" ' + last();
    } else {
      return name();
    }
  }
};

/**
 * range() returns an array of numbers that starts with 'min' and ends with
 * 'max'. Each number in the array increments by 1.
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Array} range
 */
const range = (min, max) => Array.apply(null, Array(max - min + 1)).map((_, i) => i + min);

const dogName = () => rand(alsation);

const U = {
  d1000,
  d100,
  d20,
  d10,
  d6,
  d3,
  dogName,
  generateMercName,
  randomString,
  rand,
  capitalize,
  word,
  last,
  name,
  prefix,
  num,
  id,
  shuffle,
  weightedSelect,
  range,
};

export default U;
