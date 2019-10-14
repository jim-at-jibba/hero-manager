import {Meteor} from 'meteor/meteor';

import {Heroes} from 'meteor/game:heroes';
import {HeroesCollection} from 'meteor/game:heroes';
import {Notifications} from 'meteor/game:notifications';
import {Bursar} from 'meteor/game:bursar';
import {Stronghold} from 'meteor/game:stronghold';

const gold = (userId) => Bursar.goldTotal(userId);

const purchase = (userId, hero) => {
  let rosterSize = Heroes.roster(userId).filter(x => !x.temporary).length;
  const capacity = Stronghold.capacity(Stronghold.current(userId).id, userId);
  const price = Number(hero.forSalePrice);
  const seller = hero.userId;
  if (rosterSize >= capacity) {
    Notifications.danger(
      `You can only hire <strong>${capacity}</strong> heroes. Upgrade your stronghold to hire more.`,
      userId
    );
    return;
  }
  if (gold(userId) - price < 0) {
    Notifications.danger(`You do not have enough gold to hire ${hero.name}.`, userId);
    return;
  }
  let transfer = Object.assign(hero, {
    userId: userId,
    forSale: false,
    forSalePrice: null,
  });
  Heroes.update(userId, transfer);
  Bursar.transaction(0 - price, 'transfer market', hero.id, userId);
  Bursar.transaction(price, 'transfer market', hero.id, seller);
  Notifications.success(`You hired ${hero.name} for ${price} gold.`, userId);
  Notifications.success(`You sold ${hero.name} for ${price} gold.`, seller);
};

Meteor.methods({
  'market.list': function(hero, val) {
    let userId = this.userId;
    hero.forSalePrice = val;
    hero.forSale = true;
    Heroes.update(userId, hero);
    Notifications.success(`You've listed ${hero.name} for ${val} gold.`, userId);
  },
  'market.purchase': function(hero) {
    purchase(this.userId, hero);
  },
});

export const Market = {
  listings: function() {
    return HeroesCollection.find({forSale: true}).fetch();
  },
  getMerc: function(id) {
    return HeroesCollection.findOne({id});
  }
};
