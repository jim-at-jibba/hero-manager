const test = require('tape');

import Logic from '../../../../app/imports/api/abilities/logic.js';

let bursarStubTransaction = [];
const bursarStub = {
  transaction: (x) => bursarStubTransaction.push(x)
};
const createStub = () => ({});

const generateContextBundle = () => {
  let bundle = {
    damage: 100,
    caster: {
      name: 'foo',
      id: '1234',
      userId: 'qwerty',
      health: 100,
      maxHealth: 100,
      level: 10,
    },
    enemy: {
      name: 'bar',
      id: '4568',
      health: 100,
      maxHealth: 100,
      level: 10,
    },
    battle: {
      combatNotices: [],
      events: [],
      store: {},
    },
    helpers: {
      create: createStub,
    },
  };

  return bundle;
};

const passives = Logic.getPassiveAbilityData(bursarStub);

test('When the "Acrobatic" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();

  // The boolean value that is applied forces the passive to trigger
  passives.Acrobatic.call.apply(bundle, [true]);

  t.equal(bundle.damage, 0, 'damage is reduced to 0');
  t.equal(bundle.battle.events.length, 1, 'a battle event is generated');
  t.equal(bundle.battle.combatNotices.length, 1, 'a combat notice is generated');
  t.end();
});

test('When the "Bully" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();

  // The boolean value that is applied forces the passive to trigger
  passives.Bully.call.apply(bundle, [true]);

  t.equal(bundle.damage, 150, 'damage is increased by 50%');
  t.equal(bundle.battle.combatNotices.length, 1, 'a combat notice is generated');
  t.end();
});

test('The "Bitter End" passive ability should only be triggered when under 25% health', function (t) {
  const run = (life = 1) => {
    let bundle = generateContextBundle();
    bundle.enemy.health = life;
    passives['Bitter End'].call.apply(bundle);
    return bundle.damage === 100 ? life : run(life + 1);
  };

  let result = run();

  t.equal(result, 25);
  t.end();
});

test('When the "Bitter End" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();

  bundle.enemy.health = 10;

  // The boolean value that is applied forces the passive to trigger
  passives['Bitter End'].call.apply(bundle);

  t.equal(bundle.damage, 50, 'damage is decreased by 50%');
  t.equal(bundle.battle.combatNotices.length, 1, 'a combat notice is generated');
  t.end();
});

test('When the "Capitalize" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();

  // The boolean value that is applied forces the passive to trigger
  passives.Capitalize.call.apply(bundle, [true]);

  t.equal(bundle.damage, 300, 'damage is tripled');
  t.equal(bundle.battle.events.length, 1, 'a battle event is generated');
  t.equal(bundle.battle.combatNotices.length, 1, 'a combat notice is generated');
  t.end();
});

test('The "From The Brink" passive ability should only be triggered when damage would reduce the hero to under 10% health', function (t) {
  const run = (damage = 1) => {
    let bundle = generateContextBundle();
    bundle.enemy.health = 99;
    bundle.damage = damage;
    passives['From The Brink'].call.apply(bundle);
    return bundle.enemy.health === 100 ? bundle.enemy.maxHealth - damage : run(damage + 1);
  };

  let result = run();

  t.equal(result, 10);
  t.end();
});

test('When the "From The Brink" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();

  bundle.damage = 99;
  bundle.enemy.health = 50;

  // The boolean value that is applied forces the passive to trigger
  passives['From The Brink'].call.apply(bundle);

  t.equal(bundle.enemy.health, bundle.enemy.maxHealth, 'the hero is restored to full health');
  t.equal(bundle.battle.events.length, 1, 'a battle event is generated');
  t.equal(bundle.battle.combatNotices.length, 1, 'a combat notice is generated');

  bundle.enemy.health = 50;
  passives['From The Brink'].call.apply(bundle);

  t.equal(bundle.enemy.health, 50, 'it cannot be triggered again');

  t.end();
});

test('When the "Gale Force" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();

  // The boolean value that is applied forces the passive to trigger
  passives['Gale Force'].call.apply(bundle);

  // Assuming level 10 caster and enemy health of 100
  t.equal(bundle.damage, 20, 'damage dealt is 10% of enemy health multiplied by 10% per caster level');
  t.equal(bundle.battle.events.length, 1, 'a battle event is generated');
  t.end();
});

test('When the "Healing Aura" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();

  let makePartyMember = () => ({
    health: 100,
    maxHealth: 100,
    id: '1234',
  });

  // Setup a party where all characters are at half health
  bundle.party = [makePartyMember(), makePartyMember(), makePartyMember()].map(x => {
    x.health = 50;
    return x;
  });

  passives['Healing Aura'].call.apply(bundle);

  let anomalies = bundle.party.filter(x => x.health !== 53);
  t.equal(anomalies.length, 0, 'all living party members should be healed for 3% of their max health');
  t.equal(bundle.battle.combatNotices.length, bundle.party.length, 'a combat notice should be generated for each party member');

  bundle = generateContextBundle();
  bundle.party = [makePartyMember(), makePartyMember()];
  bundle.party[0].health = 0;
  bundle.caster.health = 50;

  passives['Healing Aura'].call.apply(bundle);

  t.equal(bundle.party[0].health, 0, 'dead party members should not be healed');
  t.equal(bundle.party[1].health, 100, 'party members at max health should not be healed');
  t.equal(bundle.caster.health, 50, 'the caster should not be healed');

  t.end();
});

test('When the "Infernal Assistance" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();
  bundle.battle.roster = [];
  bundle.party = [];

  passives['Infernal Assistance'].call.apply(bundle);

  t.equal(bundle.battle.roster.length, 1, 'a character is added to the battle roster');
  t.equal(bundle.party.length, 1, 'a character is added to the party');
  t.equal(bundle.battle.events.length, 1, 'a battle event is generated');
  t.end();
});

test('When the "Inner Peace" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();
  bundle.caster.health = 50;

  passives['Inner Peace'].call.apply(bundle);

  t.equal(bundle.caster.health, 53, 'the caster is healed for 3% of their maximum health');

  bundle = generateContextBundle();
  bundle.caster.health = 0;

  passives['Inner Peace'].call.apply(bundle);

  t.equal(bundle.caster.health, 0, 'the caster is not healed if they are dead');

  bundle = generateContextBundle();
  bundle.caster.health = 100;

  passives['Inner Peace'].call.apply(bundle);

  t.equal(bundle.caster.health, 100, 'the casters health does not change if they are already at maximum health');

  t.equal(bundle.battle.combatNotices.length, 1, 'a battle event is generated');
  t.end();
});

test('When the "Inspiring Song" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();

  passives['Inspiring Song'].call.apply(bundle);

  t.equal(bundle.damage, 120, 'damage is increased by 20%');
  t.end();
});

test('When the "Iron Will" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();

  passives['Iron Will'].call.apply(bundle);

  t.equal(bundle.damage, 97, 'damage is decreased by 3% of the characters health');

  bundle = generateContextBundle();
  bundle.damage = 1;

  passives['Iron Will'].call.apply(bundle);

  t.equal(bundle.damage, 0, 'damage cannot be reduced below 0');
  t.end();
});

test('When the "Man\'s Best Friend" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();
  bundle.battle.roster = [];
  bundle.party = [];

  passives["Man's Best Friend"].call.apply(bundle);

  t.equal(bundle.battle.roster.length, 1, 'a character is added to the battle roster');
  t.equal(bundle.party.length, 1, 'a character is added to the party');
  t.equal(bundle.battle.events.length, 1, 'a battle event is generated');
  t.end();
});

test('When the "Merciless" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();
  bundle.enemy.health = 29;

  passives.Merciless.call.apply(bundle);

  t.equal(bundle.damage, 200, 'damage is doubled against an enemy is below 30% health');
  t.equal(bundle.battle.events.length, 1, 'a battle event is generated');
  t.equal(bundle.battle.combatNotices.length, 1, 'a combat notice is generated');

  bundle = generateContextBundle();
  bundle.enemy.health = 30;

  passives.Merciless.call.apply(bundle);

  t.equal(bundle.damage, 100, 'damage remains the same against an enemy at 30% health or more');
  t.end();
});

test('When the "Pickpocket" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();
  bursarStubTransaction = [];

  // The boolean value that is applied forces the passive to trigger
  passives.Pickpocket.call.apply(bundle, [true]);

  t.equal(bursarStubTransaction.length, 1, 'a monetary transaction is triggered');
  t.equal(bundle.battle.events.length, 1, 'a battle event is generated');
  t.equal(bundle.battle.combatNotices.length, 1, 'a combat notice is generated');
  t.end();
});

test('When the "Pyromancer" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();

  passives.Pyromancer.call.apply(bundle);

  t.equal(bundle.damage, 16, 'Damage is equal to 8 increased by 10% per caster level');
  t.equal(bundle.battle.events.length, 1, 'a battle event is generated');
  t.end();
});

test('When the "Shapeshifter" passive ability is triggered:', function (t) {
  let bundle = generateContextBundle();
  bundle.caster.passives = ['Shapeshifter'];

  // The boolean value that is applied forces the passive to trigger
  passives.Shapeshifter.call.apply(bundle, [true]);

  // Normalize because of floating point nonsense
  t.equal(Number(bundle.damage.toFixed(2)), 110, 'damage is increased by 10% if the hero is attacking');

  bundle = generateContextBundle();
  bundle.caster.passives = [];

  // The boolean value that is applied forces the passive to trigger
  passives.Shapeshifter.call.apply(bundle, [true]);

  t.equal(bundle.damage, 97, "damage is decreased by 3% of the hero's maximum health if they are defending");
  t.end();
});

