import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

import {State} from './state';
import {Heroes} from 'meteor/game:heroes';
import {Settings} from 'meteor/game:settings';
import Abilities from 'meteor/game:abilities';
import 'jquery-ui';

import './hero/hero-detail.js';
import './hero/hero-preview.js';
import './hero/hero-tab.js';
import './roster.overview.html';
import './item/item.js';
import './components/header/header.js';

const heroClasses = hero => {
  return hero.passives.map(p => Abilities.Passives.get(p).get('class'));
};

Template['roster/overview'].onCreated((function() {
  let loaded = false;

  return function() {
    if (!loaded) {
      let roster = Heroes.roster(Meteor.userId());
      if (roster.length) {
        State.set('rosterDetail', roster[0].id);
      }
      loaded = true;
    }
  };
}()));

Template['roster/overview'].onRendered(function() {
  $('[data-toggle="tooltip"]').tooltip();
});

Template['roster/overview'].helpers({
  itemImg: function() {
    return this.meta.img ? this.meta.img : '';
  },
  needsHeal: function() {
    return this.health < this.maxHealth;
  },
  healCost: function() {
    return Settings.healCost(this.maxHealth, this.health);
  },
  reviveCost: function() {
    return Settings.reviveCost(this.level);
  },
  alive: function() {
    return this.health > 0;
  },
  mercDetail: () => {
    let id = State.get('rosterDetail');
    if (id) {
      let merc = Heroes.getMerc(Meteor.userId(), id);
      return merc;
    } else {
      return false;
    }
  },
  search: (array) => {
    let search = (State.get('roster/overview.search') || '').toLowerCase();
    return array.filter(hero => {
      return hero.name.toLowerCase().includes(search) ||
        hero.passives.some(p => p.toLowerCase().includes(search)) ||
        heroClasses(hero).some(c => c.toLowerCase().includes(search));
    });
  },
  searchVal: () => State.get('roster/overview.search'),
  qualityType: function() {
    let desc;
    switch (this.quality) {
      case 8:
        desc = 'Heirloom';
        break;
      case 7:
        desc = 'Artifact';
        break;
      case 6:
        desc = 'Legendary';
        break;
      case 5:
        desc = 'Epic';
        break;
      case 4:
        desc = 'Rare';
        break;
      case 3:
        desc = 'Uncommon';
        break;
      case 2:
        desc = 'Common';
        break;
      default:
        desc = 'Poor';
    }

    return desc;
  },
  minMax: function() {
    return this.min && this.max;
  }
});

Template['roster/overview'].events({
  'click .heal'() {
    const id = this.id;
    Meteor.call('heroes.heal', id);
  },
  'click .revive'() {
    if (window.confirm(`Do you really want to spend ${Settings.reviveCost(this.level)}g to revive ${this.name}?`)) {
      const id = this.id;
      Meteor.call('heroes.revive', id);
    }
  },
  'click .fire'() {
    if (window.confirm(`Do you really want to fire ${this.name}?`)) {
      const id = this.id;
      Meteor.call('heroes.fire', id);
    }
  },
  'click .roster-block'() {
    const id = this.id;
    State.set('rosterDetail', id);
    $('.roster-hero-tab-column').removeClass('js-show');
  },
  'click .close-detail'() {
    State.set('rosterDetail', null);
  },
  'click .detail-overlay'() {
    State.set('rosterDetail', null);
  },
  'click .back'() {
    State.set('tab', 0);
  },
  'keyup #roster-search'(e) {
    State.set('roster/overview.search', $(e.target).val());
  },
  'click .show-heroes'(e) {
    e.preventDefault();
    $('.roster-hero-tab-column').toggleClass('js-show');
  },
});
