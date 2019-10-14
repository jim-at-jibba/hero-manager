import { Meteor } from 'meteor/meteor';
import {Template} from 'meteor/templating';

import './market.js';
import './hire.overview.html';

import {State} from '../state';
import {Hires} from 'meteor/game:hire';
import {Settings} from 'meteor/game:settings';
import Abilities from 'meteor/game:abilities';
import {Market} from 'meteor/game:market';

const heroClasses = hero => {
  return hero.passives.map(p => Abilities.Passives.get(p).get('class'));
};

Template['hire/overview'].onCreated(() => {
  Meteor.subscribe('hires');
});

Template['hire/overview'].helpers({
  listings: () => {
    const hires = Hires.list(Meteor.userId());
    const playerHires = Market.listings();
    return playerHires.concat(hires);
  },
  mercDetail: () => {
    let id = State.get('rosterDetail');
    if (!id) {
      return false;
    }
    let merc = Hires.getMerc(Meteor.userId(), id) || Market.getMerc(id);
    return merc;
  },
  boosterCost: () => Settings.boosterCost,
  classImage: function() {
    let classes = heroClasses(this);
    return classes.length ? Settings.classImages[classes[0]] : '';
  },
  classImageStyle: function() {
    let classes = heroClasses(this);
    return classes.length ? classes[0].toLowerCase() : '';
  },
  search: (array) => {
    let search = (State.get('hire/overview.search') || '').toLowerCase();
    return array.filter(hero => {
      return hero.name.toLowerCase().includes(search) ||
        hero.passives.some(p => p.toLowerCase().includes(search)) ||
        heroClasses(hero).some(c => c.toLowerCase().includes(search));
    });
  },
  selling: () => State.get('market/overview.selling'),
  searchVal: () => State.get('hire/overview.search'),
  salePrice: function() {
    return this.forSale ? this.forSalePrice : this.basePrice;
  }
});

Template['hire/overview'].events({
  'click .hire'() {
    if (this.forSale) {
      Meteor.call('market.purchase', this);
    } else {
      Meteor.call('hires.recruit', this.id);
    }
    State.set('rosterDetail', null);
  },
  'click .remove'() {
    Meteor.call('hires.remove', this.id);
  },
  'click .buy-booster'() {
    Meteor.call('hires.addBooster');
  },
  'keyup #roster-search'(e) {
    State.set('hire/overview.search', $(e.target).val());
  },
  'click .back'() {
    State.set('tab', 0);
  },
  'click .roster-block'() {
    const id = this.id;
    if (State.get('rosterDetail') === id) {
      State.set('rosterDetail', null);
    } else {
      State.set('rosterDetail', id);
    }
  },
  'click .close-modal'() {
    State.set('rosterDetail', null);
  },
  'click .detail-overlay'() {
    State.set('rosterDetail', null);
  },
  'click .sell': function() {
    State.set('market/overview.selling', true);
  },
});
