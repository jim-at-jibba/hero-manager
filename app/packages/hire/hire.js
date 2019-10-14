import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import Immutable from 'immutable';
import R from 'ramda';

import {engine} from 'meteor/game:character';
import Abilities from 'meteor/game:abilities';
import {Heroes} from 'meteor/game:heroes';
import {Notifications} from 'meteor/game:notifications';
import {Bursar} from 'meteor/game:bursar';
import {Stronghold} from 'meteor/game:stronghold';
import {Settings} from 'meteor/game:settings';

export const HiresCollection = new Mongo.Collection('hires');

const create = engine({
  Primaries: Abilities.Primaries,
  Passives: Abilities.Passives
});

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('hires', function() {
    return HiresCollection.find({userId: this.userId});
  });
}

Meteor.methods({
  'hires.remove': function(id) {
    remove(this.userId, id);
  },
  'hires.recruit': function(id) {
    recruit(id, this.userId);
  },
  'hires.addBooster': function() {
    let userId = this.userId;
    let cost = Settings.boosterCost;
    if (gold(userId) - cost < 0) {
      Notifications.danger(`You do not have enough gold.`, userId);
      return;
    }
    Bursar.transaction(0 - cost, 'hire', 'booster', userId);
    Notifications.success(`You added 3 new prospects to your hire list at a cost of ${cost} gold.`, userId);
    addHire(this.userId);
    addHire(this.userId);
    addHire(this.userId);
  }
});

const generateMerc = () => {
  return create();
};

const fillHireList = (list = Immutable.List()) => {
  return list.size === 5 ? list : fillHireList(list.push(generateMerc()));
};

const gold = (userId) => Bursar.goldTotal(userId);

const remove = (userId, id) => {
  HiresCollection.update(
    { userId },
    { $pull: { list: { id } } }
  );
};

const recruit = (id, userId) => {
  let list = HiresCollection.findOne({userId}).list;
  let rosterSize = Heroes.roster(userId).filter(x => !x.temporary).length;
  let merc = R.find(R.propEq('id', id))(list);
  const capacity = Stronghold.capacity(Stronghold.current(userId).id, userId);
  if (rosterSize >= capacity) {
    Notifications.danger(
      `You can only hire <strong>${capacity}</strong> heroes. Upgrade your stronghold to hire more.`,
      userId
    );
    return;
  }
  if (gold(userId) - merc.basePrice < 0) {
    Notifications.danger(`You do not have enough gold to hire ${merc.name}.`, userId);
    return;
  }
  remove(userId, id);
  Heroes.add(userId, merc);
  Bursar.transaction(0 - merc.basePrice, 'hire', id, userId);
  Notifications.success(`You hired ${merc.name} for ${merc.basePrice} gold.`, userId);
};

const list = (userId) => {
  let h = HiresCollection.findOne({userId});
  return h ? h.list : [];
};

const getMerc = (userId, id) => {
  let [merc] = HiresCollection.findOne({userId}).list.filter(x => x.id === id);
  return merc;
};

// Interval time should be approximately 120 seconds
const intervalTime = 120 * 1000 / Settings.stepInterval;

const step = (() => {
  let _clock = 0;

  return () => {
    _clock++;
    if (_clock >= intervalTime) {
      _clock = 0;

      HiresCollection.find({}).forEach((record) => {
        if (record.list.length < 25) {
          addHire(record.userId);
        } else {
          HiresCollection.update(
            {userId: record.userId},
            {list: record.list.slice(-25)}
          );
        }
      });
    }
  };
})();

const addHire = (userId) => {
  HiresCollection.update(
    {userId},
    {$push: {list: generateMerc()}}
  );
};

const init = (force = false) => {
  console.log(Meteor.userId());
  if (force || !HiresCollection.findOne({userId: Meteor.userId()})) {
    HiresCollection.insert({
      userId: Meteor.userId(),
      list: fillHireList().toJS()
    });
  }
};

const clear = (userId) => {
  HiresCollection.remove({userId});
};

export const Hires = {
  addHire,
  clear,
  list,
  getMerc,
  remove: remove,
  recruit: recruit,
  step,
  init,
};
