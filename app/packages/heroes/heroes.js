import {Meteor} from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import {Bursar} from 'meteor/game:bursar';
import {Settings} from 'meteor/game:settings';
import {Notifications} from 'meteor/game:notifications';
import U from 'meteor/game:utilities';

export const HeroesCollection = new Mongo.Collection('heroes');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('heroes', function heroesPublication() {
    return HeroesCollection.find({
      $or: [
        {userId: this.userId},
        {forSale: true},
      ]
    });
  });
}

const levelUp = (hero, expTop) => {
  hero.level += 1;
  hero.exp = hero.exp - expTop;
  if (hero.exp < 0) {
    hero.exp = 0;
  }
  let speedIncrease = Math.ceil(hero.speed * 1.1) - hero.speed;
  let healthIncrease = Math.ceil(hero.maxHealth * 1.1) - hero.maxHealth;
  let powerIncrease = Math.ceil(hero.power * 1.1) - hero.power;
  hero.speed += speedIncrease;
  hero.maxHealth += healthIncrease;
  hero.power += powerIncrease;
  hero.health = hero.maxHealth;
  Notifications.success(`${hero.name} reached level ${hero.level}:<ul><li>Speed +${speedIncrease}</li><li>Power +${powerIncrease}</li><li>Health +${healthIncrease}</li></ul>`, hero.userId);
  return hero;
};

const checkForLevelUp = function checkForLevelUp(hero) {
  let expForLevel = Settings.expForLevel(hero.level);
  if (hero.exp >= expForLevel) {
    return levelUp(hero, expForLevel);
  } else {
    return hero;
  }
};

let _clock = 0;
const step = () => {
  _clock++;
  if (_clock < 60) {
    return;
  }
  _clock = 0;
  const list = HeroesCollection.find({
    health: {$gt: 0},
    available: {$ne: false}
  }, {fields: { id: 1}}).fetch();
  const now = Date.now();

  const onHols = list.filter(() => U.d1000() < 2);

  onHols.forEach((item) => {
    HeroesCollection.update(
      {id: item.id},
      {$set: {
        available: false,
        availableReason: 'On Annual Leave',
        availableTime: now + 1000 * 60 * U.num(15, 60)
      }}
    );
  });

  // Return heroes to work if their time is up.
  HeroesCollection.update(
    {availableTime: {$lt: now}},
    {
      $set: {
        available: true,
        availableReason: '',
        availableTime: 0,
      }
    },
    {multi: true}
  );
};

export const Heroes = {
  roster: (userId) => {
    return HeroesCollection.find({userId, forSale: false}).fetch();
  },
  getMerc: (userId, id) => {
    return HeroesCollection.findOne({userId, id});
  },
  update: (userId, hero, upsert = false) => {
    if (hero._id) {
      delete hero._id;
    }
    hero = checkForLevelUp(hero);
    HeroesCollection.update(
      {id: hero.id},
      {$set: hero},
      {upsert}
    );
  },
  remove: (userId, id) => {
    HeroesCollection.remove(
      {id, userId}
    );
  },
  clear: (userId, cb) => {
    HeroesCollection.remove({userId}, () => {
      if (cb) {
        cb();
      }
    });
  },
  add: (userId, merc) => {
    merc.userId = userId;
    HeroesCollection.insert(merc);
  },
  step,
};

Meteor.methods({
  'heroes.heal': function(id) {
    const userId = this.userId;
    const merc = HeroesCollection.findOne({userId, id});
    const cost = Settings.healCost(merc.maxHealth, merc.health);
    const name = merc.name;
    if (Bursar.goldTotal() - cost <= 0) {
      Meteor.call('notifications.danger', `You do not have enough gold to heal ${name}.`);
      return;
    }
    Bursar.transaction(0 - cost, 'heal', id, userId);
    HeroesCollection.update(
      {userId, id},
      {$set: {health: merc.maxHealth}}
    );
  },
  'heroes.revive'(id) {
    const userId = this.userId;
    const merc = HeroesCollection.findOne({userId, id});
    const cost = Settings.reviveCost(merc.level);
    const name = merc.name;
    if (Bursar.goldTotal() - cost <= 0) {
      Meteor.call('notifications.danger', `You do not have enough gold to revive ${name}.`);
      return;
    }
    Bursar.transaction(0 - cost, 'revive', id, userId);
    HeroesCollection.update(
      {userId, id},
      {$set: {health: merc.maxHealth}}
    );
  },
  'heroes.fire'(id) {
    const userId = this.userId;
    HeroesCollection.remove({userId, id});
  },
});
