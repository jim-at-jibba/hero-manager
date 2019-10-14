const test = require('tape');
const Immutable = require('immutable');

import Logic from '../../../../app/imports/api/abilities/logic.js';

const createStub = () => ({});

let methodCallLog = {
  'Example': 0,
  'Example2': 0,
};

const mockPassives = () => {
  return {
    'Example': {
      triggers: ['exampleTrigger'],
      call: function() {
        methodCallLog.Example += 1;
      }
    },
    'Example2': {
      triggers: ['exampleTrigger2'],
      call: function() {
        methodCallLog.Example2 += 1;
      }
    },
  };
};

const mockParty = [{
  passives: ['Example'],
  id: '1234',
}, {
  passives: ['Example2'],
  id: '4568',
}];

const partyPassiveLoader = Logic.getPartyPassiveLoader();

let passives = partyPassiveLoader(
  Immutable.fromJS(mockPassives()),
  mockParty,
  'exampleTrigger'
);

test('When used, the partyPassiveLoader should', function(t) {
  let anomalies = passives.filter(x => !x.passive.get('triggers').toJS().includes('exampleTrigger'));

  let passes = passives.filter(x => x.passive.get('triggers').toJS().includes('exampleTrigger'));

  t.equal(passes.length, 1, 'return an element for each hero in the party who has a passive that has the designated trigger.');
  t.equal(anomalies.length, 0, 'not include any passives that do not have the designated trigger.');
  t.end();
});

test('When used, the triggerPartyPassives method should', function(t) {
  Logic.triggerPartyPassives(mockParty, {}, createStub, passives);

  t.equal(methodCallLog.Example, 1, 'call the correct passive once.');
  t.equal(methodCallLog.Example2, 0, 'should not call any other passives.');

  t.end();
});
