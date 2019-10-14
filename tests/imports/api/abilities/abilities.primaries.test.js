const test = require('tape');

import Logic from '../../../../app/imports/api/abilities/logic.js';

const utilStub = {
  num: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
};

const primaries = Logic.getPrimaryAbilityData(utilStub);

let message = 'When using the "Clumsy Assault" ability, damage is up to (and including) 80% of the casters power';
test(message, function (t) {
  const caster = { power: 100 };
  const run = (results = []) => {
    results.push(primaries['Clumsy Assault'].call(caster));
    return results.length >= 5000 ? results : run(results);
  };

  const results = run();

  t.equal(results.filter(x => x < 0 || x > 80).length, 0);
  t.end();
});

message = 'When using the "Attack I" ability, damage is 110 - 140% of the casters power';
test(message, function (t) {
  const caster = { power: 100 };
  const run = (results = []) => {
    results.push(primaries['Attack I'].call(caster));
    return results.length >= 5000 ? results : run(results);
  };

  const results = run();

  t.equal(results.filter(x => x < 110 || x > 140).length, 0);
  t.end();
});

message = 'When using the "Attack II" ability, damage is 120 - 170% of the casters power';
test(message, function (t) {
  const caster = { power: 100 };
  const run = (results = []) => {
    results.push(primaries['Attack II'].call(caster));
    return results.length >= 5000 ? results : run(results);
  };

  const results = run();

  t.equal(results.filter(x => x < 120 || x > 170).length, 0);
  t.end();
});

