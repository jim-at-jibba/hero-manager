import Immutable from 'immutable';
import R from 'ramda';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import U from 'meteor/game:utilities';
import {Notifications} from 'meteor/game:notifications';
import {Bursar} from 'meteor/game:bursar';
import {Heroes} from 'meteor/game:heroes';
import Equipment from 'meteor/game:equipment';

const ItemList = Immutable.fromJS([
  {
    name: 'Advanced Combat Techniques Vol. I',
    type: 'buff',
    quality: 4,
    rarity: 15,
    price: 2000,
    use: (userId, m) => {
      Meteor.call('notifications.success', `${m.get('name')} read Advanced Combat Techniques Vol. I and learnt the 'Capitalize' passive.`);
      return m.merge({
        'passives': m.get('passives').push('Capitalize'),
        'itemsUsed': m.get('itemsUsed').push('Advanced Combat Techniques Vol. I')
      });
    },
    meta: {
      description: 'Grants the "Capitalize" passive',
      flavour: 'Dog-eared and grubby.',
      img: '/item-art/small_advanced1_hm.png',
    }
  },
  {
    name: 'Advanced Combat Techniques Vol. II',
    type: 'buff',
    quality: 4,
    rarity: 15,
    price: 2000,
    use: (userId, m) => {
      Meteor.call('notifications.success', `${m.get('name')} read Advanced Combat Techniques Vol. II and learnt the 'Bitter End' passive.`);
      return m.merge({
        'passives': m.get('passives').push('Bitter End'),
        'itemsUsed': m.get('itemsUsed').push('Advanced Combat Techniques Vol. II')
      });
    },
    meta: {
      description: 'Grants the "Bitter End" passive',
      flavour: 'Near mint condition, this book has hardly been touched.',
      img: '/item-art/small_advanced2_hm.png',
    }
  },
  {
    name: 'Black Orb of Infinite Darkness',
    type: 'buff',
    quality: 6,
    rarity: 5,
    price: 150000,
    use: (userId, m) => {
      Meteor.call('notifications.success', `${m.get('name')} absorbed the orb and learnt the 'Infernal Assistance' passive.`);
      return m.merge({
        'passives': m.get('passives').push('Infernal Assistance'),
        'itemsUsed': m.get('itemsUsed').push('Black Orb of Infinite Darkness')
      });
    },
    meta: {
      description: 'Grants the "Infernal Assistance" passive',
      flavour: 'Pulses with evil energy.',
    }
  },
  {
    name: 'Coin Pouch',
    type: 'loot',
    rarity: 200,
    quality: 3,
    price: 100,
    use: (userId) => {
      let g = U.num(20, 50);
      Bursar.transaction(g, 'item', 'Coin Pouch', userId);
      Meteor.call('notifications.success', `Opened coin pouch and received ${g} gold`);
    },
    meta: {
      description: 'A bag of coin to add to your coffers.',
      flavour: 'Jangles pleasantly.',
      img: '/item-art/small_coinpouch_hm.png',
    }
  },
  {
    name: 'Scrap Weaponry',
    type: 'loot',
    quality: 1,
    rarity: 300,
    price: 10,
    use: (userId) => {
      let g = U.num(5, 15);
      Bursar.transaction(g, 'item', 'Scrap Weaponry', userId);
      Meteor.call('notifications.success', `Sold Scrap Weaponry and received ${g} gold`);
    },
    meta: {
      description: 'Can be sold for gold',
      flavour: 'Though useless for combat, the metal can be used to forge tools and equipment.',
    }
  },
  {
    name: 'Soul Drinker',
    type: 'equipment',
    rarity: 3,
    max: 2,
    min: 1,
    equipmentType: 'Sword',
    price: 150000,
    quality: 6,
    passives: [{
      triggers: [
        'onAttack'
      ],
      call: `(function() {
        var damage = this.damage;
        var _this = this;
        this.caster.equipment.forEach(function(item) {
          if (item.name === 'Soul Drinker') {
            item.max = item.max + Math.ceil(damage * 0.02);
            item.min = Math.round(item.max / 2);

            if (_this.enemy.health - damage < 0) {
              _this.caster.health -= damage - _this.enemy.health;

              _this.battle.combatNotices.push({
                type: 'effect',
                character: _this.caster.id,
                value: "Soul Drinker takes it's toll",
              });
            }
          }
        });
      })`
    }],
    equipmentDescription: [
      '2% of damage dealt is permanently converted into weapon damage.',
      'Overkill damage is redirected onto the wielder.'
    ],
    meta: {
      img: '/item-art/equipment/sword/soul-drinker.png'
    },
  },
  {
    name: 'Tarnished Wedding Ring',
    type: 'loot',
    quality: 4,
    rarity: 13,
    price: 1000,
    use: (userId) => {
      let g = U.num(150, 300);
      Bursar.transaction(g, 'item', 'Tarnished Wedding Ring', userId);
      Meteor.call('notifications.success', `Sold Tarnished wedding ring and received ${g} gold`);
    },
    meta: {
      description: 'Sold for money.',
      flavour: '',
    }
  }
]);

export const InventoryCollection = new Mongo.Collection('inventory');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('inventory', function() {
    return InventoryCollection.find({userId: this.userId});
  });
}

const add = (item) => {
  Meteor.call(
    'inventory.update',
    {$push: { list: item.toJS() }}
  );
};

const init = () => {
  if (!InventoryCollection.findOne({userId: Meteor.userId()})) {
    InventoryCollection.insert({
      userId: Meteor.userId(),
      list: []
    });
  }
};

Meteor.methods({
  'inventory.useitem': function(item) {
    let userId = this.userId;
    let list = InventoryCollection.findOne({userId}).list;
    if (R.any(R.propEq('id', item.id), list)) {
      Inventory.getItem(item.name).get('use')(userId);
      InventoryCollection.update(
        { userId },
        { $pull: { list: { id: item.id } } }
      );
    } else {
      Notifications.danger('You don\'t own this item', this.userId);
    }
  },
  'inventory.usebuffitem': function(itemId, merc) {
    let userId = this.userId;
    let item = R.find(R.propEq('id', itemId))(InventoryCollection.findOne({userId}).list);
    if (!item) {
      return Notifications.danger('You don\'t own this item', this.userId);
    }
    if (merc.itemsUsed.indexOf(item.name) > -1) {
      return Notifications.warning(`You have already used ${item.name} on ${merc.name}`, this.userId);
    }
    Heroes.update(
      userId,
      Inventory.getItem(item.name).get('use')(userId, Immutable.fromJS(merc)).toJS()
    );

    InventoryCollection.update(
      { userId },
      { $pull: { list: { id: item.id } } }
    );
  },
  'inventory.equipitem': function(itemId, merc) {
    let userId = this.userId;
    let item = R.find(R.propEq('id', itemId))(InventoryCollection.findOne({userId}).list);
    if (item) {
      merc.equipment.push(item);
      Heroes.update(
        userId,
        merc
      );

      InventoryCollection.update(
        { userId },
        { $pull: { list: { id: item.id } } }
      );
    } else {
      Notifications.danger('You don\'t own this item', this.userId);
    }

  },
  'inventory.unequipitem': function(itemId, mercId) {
    let userId = this.userId;
    let merc = R.find(R.propEq('id', mercId))(Heroes.roster(userId));
    let item = R.find(R.propEq('id', itemId))(merc.equipment);
    if (item) {
      merc.equipment = merc.equipment.filter(x => x.id !== itemId);
      Heroes.update(
        userId,
        merc
      );

      InventoryCollection.update(
        { userId },
        { $push: { list: item } }
      );
    } else {
      Notifications.danger('You don\'t own this item', this.userId);
    }

  },
  'inventory.sellequippeditem': function(itemId, mercId) {
    let userId = this.userId;
    let merc = R.find(R.propEq('id', mercId))(Heroes.roster(userId));
    let item = R.find(R.propEq('id', itemId))(merc.equipment);
    let price = item.price || U.num(1, 50);
    if (item) {
      merc.equipment = merc.equipment.filter(x => x.id !== itemId);
      Heroes.update(
        userId,
        merc
      );

      Bursar.transaction(price, 'item', item.name, userId);
      Meteor.call('notifications.success', `Sold ${item.name} and received ${price} gold`);
    } else {
      Notifications.danger('You don\'t own this item', this.userId);
    }

  },
  'inventory.sellitem': function(itemId) {
    let userId = this.userId;
    let item = R.find(R.propEq('id', itemId))(InventoryCollection.findOne({userId}).list);
    if (!item) {
      return Notifications.danger('You don\'t own this item', this.userId);
    }

    let price = item.price || U.num(1, 50);

    InventoryCollection.update(
      { userId },
      { $pull: { list: { id: item.id } } }
    );
    Bursar.transaction(price, 'item', item.name, userId);
    return Meteor.call('notifications.success', `Sold ${item.name} and received ${price} gold`);
  },
});

const addLootList = (lootList = [], userId) => {
  if (lootList.length > 0) {
    Notifications.success('Received the following loot:<ul><li>' +
      lootList.map(x => typeof x === 'string' ? x : x.name).join('</li><li>') +
      '</ul>', userId);
  }
  const loaded = lootList.reduce((carry, item) => {
    if (typeof item === 'string') {
      return carry.push(ItemList.find(x => x.get('name') === item).set('id', U.id()));
    } else {
      return carry.push(item);
    }
  }, Immutable.List());
  InventoryCollection.update(
    {userId},
    { $push: { list: { $each: loaded.toJS() } } }
  );
};

const remove = (name) => {
  let list = Immutable.fromJS(InventoryCollection.findOne({userId: Meteor.userId()}).list);
  let filtered = list.delete(
    list.findIndex(x => x.get('name') === name)
  );
  Meteor.call(
    'inventory.update',
    {$set: {list: filtered.toJS()}}
  );
};

const getItem = name => ItemList.find(x => x.get('name') === name);
const getItemById = (userId, id) => {
  return R.find(R.propEq('id', id))(InventoryCollection.findOne({userId}).list);
};

const itemType = name => getItem(name).get('type');

const lootTable = (rating) => {
  const level = Math.round(rating / 100);
  let staticList = ItemList.reduce((carry, item) => {
    if (U.d1000() <= item.get('rarity')) {
      carry.push(item.get('name'));
    }
    return carry;
  }, []);

  let equipment = Array(U.num(0, 1)).join('-').split('-').map(() => Equipment.createRandom(level));
  return staticList.concat(equipment);
};

const list = (userId) => {
  let i = InventoryCollection.findOne({userId});
  return i ? i.list : [];
};

const clear = (userId, cb) => {
  InventoryCollection.remove({userId}, () => {
    if (cb) {
      cb();
    }
  });
};

export const Inventory = {
  add,
  addLootList,
  clear,
  remove,
  itemType,
  getItem,
  getItemById,
  list,
  lootTable,
  init,
};
