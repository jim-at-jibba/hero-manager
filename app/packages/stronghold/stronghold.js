import Immutable from 'immutable';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import {Bursar} from 'meteor/game:bursar';
import {Notifications} from 'meteor/game:notifications';

export const StrongholdCollection = new Mongo.Collection('stronghold');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('stronghold', function() {
    return StrongholdCollection.find();
  });
}

const init = (userId) => {
  if (!StrongholdCollection.findOne({userId})) {
    StrongholdCollection.insert({
      userId,
      id: 1,
      passives: []
    });
  }
};

const Locations = Immutable.fromJS([
  {
    id: 1,
    name: 'Cellar',
    description: `<p>Your currently renting out Mrs Burridge's cellar below the
    Royal Oak tavern.</p><p>It's cramped and there's a leak, maybe its time to
    move into more suitable premises?</p>`,
    cost: 0,
    heroCapacity: 7,
    passives: [],
    next: 2,
    coords: {
      x: 67,
      y: 44
    }
  },
  {
    id: 2,
    name: 'Lockup',
    description: `<p>A sparse lockup on the far side of town, nestled between a butchers and a manure merchant.</p>`,
    cost: 3000,
    heroCapacity: 10,
    passives: [],
    next: 3,
    coords: {
      x: 67,
      y: 44
    }
  },
  {
    id: 3,
    name: 'Warehouse',
    description: `<p>Lorem ipsum dolor sit amet</p>`,
    cost: 7000,
    heroCapacity: 14,
    passives: [],
    next: 4,
    coords: {
      x: 67,
      y: 44
    }
  },
  {
    id: 4,
    name: 'Townhouse',
    description: `<p>Lorem ipsum dolor sit amet</p>`,
    cost: 8000,
    heroCapacity: 18,
    passives: [],
    next: 5,
    coords: {
      x: 67,
      y: 44
    }
  },
  {
    id: 5,
    name: 'Smallholding',
    description: `<p>Lorem ipsum dolor sit amet`,
    cost: 10000,
    heroCapacity: 22,
    passives: [],
    next: 6,
    coords: {
      x: 67,
      y: 44
    }
  },
  {
    id: 6,
    name: 'Manor House',
    description: `<p>Lorem ipsum dolor sit amet`,
    cost: 15000,
    heroCapacity: 26,
    passives: [],
    next: 7,
    coords: {
      x: 67,
      y: 44
    }
  },
  {
    id: 7,
    name: 'Country Estate',
    description: `<p>Lorem ipsum dolor sit amet`,
    cost: 25000,
    heroCapacity: 40,
    passives: [],
    next: 8,
    coords: {
      x: 67,
      y: 44
    }
  },
  {
    id: 8,
    name: 'Castle',
    description: `<p>Lorem ipsum dolor sit amet`,
    cost: 200000,
    heroCapacity: 100,
    passives: [],
    next: 9,
    coords: {
      x: 67,
      y: 44
    }
  },
  {
    id: 9,
    name: 'Mountain Stronghold',
    description: `<p>Lorem ipsum dolor sit amet`,
    cost: 1000000,
    heroCapacity: 500,
    passives: [],
    next: null,
    coords: {
      x: 67,
      y: 44
    }
  }
]);

const gold = () => Bursar.goldTotal(Meteor.userId());

Meteor.methods({
  'stronghold.upgrade'(id) {
    const userId = this.userId;
    const price = Stronghold.cost(Stronghold.next());

    if (gold() - price < 0) {
      Notifications.danger(`You do not have enough gold to upgrade your stronghold.`, userId);
      return;
    }

    Bursar.transaction(0 - price, 'stronghold', id, userId);

    StrongholdCollection.update(
      {userId},
      { $set: { id: Stronghold.next() } }
    );
    Notifications.success(`You upgraded your stronghold to a ${Stronghold.name()} at a cost of ${price} gold.`, userId);
  }
});

const locationValue = (key, id, userId = Meteor.userId()) => {
  if (!id) {
    id = Immutable.fromJS(StrongholdCollection.findOne({userId}).id);
  }
  return Locations.find(x => x.get('id') === id).get(key);
};

const capacity = (id, userId) => locationValue('heroCapacity', id, userId);
const description = (id) => locationValue('description', id);
const cost = (id) => locationValue('cost', id);
const name = (id) => locationValue('name', id);
const next = (id) => locationValue('next', id);

const current = (userId) => {
  return StrongholdCollection.findOne({userId});
};

const clear = (userId, cb) => {
  StrongholdCollection.remove({userId}, () => {
    if (cb) {
      cb();
    }
  });
};

const load = (id) => Locations.find(x => x.get('id') === id).toJS();

export const Stronghold = {
  clear,
  current,
  init,
  capacity,
  cost,
  description,
  locations: () => Locations,
  load,
  name,
  next
};
