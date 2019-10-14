const test = require('tape');

import U from '../../../app/imports/api/utils.js';

test('weightedSelect should', function(t) {
  const options = ['Apples', 'Oranges', 'Bananas'];
  const weights = [0, 100, 0];

  const result = U.weightedSelect(options, weights);

  t.equal(result, 'Oranges', 'return a biased value.');
  t.end();
});

test('range should', function(t) {

  const result = U.range(5, 10);

  const pass = result.length === 6 &&
               result[0] === 5 &&
               result[1] === 6 &&
               result[2] === 7 &&
               result[3] === 8 &&
               result[4] === 9 &&
               result[5] === 10;

  t.ok(pass, 'return an array of integers that increment by 1 starting at the min value and ending at the max value.');
  t.end();
});
