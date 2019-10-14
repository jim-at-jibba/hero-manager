// app/imports/ui/play.js

import { Meteor } from 'meteor/meteor';
import {Template} from 'meteor/templating';
import R from 'ramda';

import {State} from './state';
import {Bursar} from 'meteor/game:bursar';
import {Heroes} from 'meteor/game:heroes';
import {Battles} from 'meteor/game:combat';
import {Notifications} from 'meteor/game:notifications';
import Abilities from 'meteor/game:abilities';
import {Settings} from 'meteor/game:settings';

import './play.html';
import './map.js';
import './roster.js';
import './quests.js';
import './tavern/hire.js';
import './inventory/items.js';
import './stronghold.js';
import './leaderboard.js';
import './chat/chat.js';
import './settings/settings.js';

Meteor.subscribe('bursar');
Meteor.subscribe('heroes');
Meteor.subscribe('notifications');

const heroClasses = hero => {
  return hero.passives.map(p => Abilities.Passives.get(p).get('class'));
};

Template.registerHelper('dColor', (val) => {
  let label;
  switch (true) {
    case val > 600:
      label = 'danger';
      break;
    case val > 400:
      label = 'warning';
      break;
    default:
      label = 'success';
  }
  return label;
});

Template.registerHelper('expThisLevel', function() {
  return Settings.expForLevel(this.level);
});

Template.registerHelper('classImage', function() {
  let classes = heroClasses(this);
  if (this.npc && this.type) {
    if (this.meta.img) {
      return this.meta.img;
    }
    return this.type.length ? Settings.monsterImages[this.type[0]][0] : '';
  }

  return classes.length ? Settings.classImages[classes[0]] : '';
});

Template.registerHelper('classImageStyle', function() {
  if (this.npc) {
    return '';
  }
  let classes = heroClasses(this);
  return classes.length ? classes[0].toLowerCase() : '';
});

Template.registerHelper('isLocalHost', () => {
  return !!window.location.href.match(/localhost/g);
});

Template.registerHelper('getClass', (merc) => {
  if (!merc) {
    return [];
  }
  let classes = merc.passives.map((p) => {
    return Abilities.Passives.get(p).get('class');
  });
  return classes.length ? R.uniq(classes).sort() : [];
});

Template.registerHelper('activeQuest', function() {
  return !!Battles.findOne({roster: this.id});
});

Template.registerHelper('toLower', str => str.toLowerCase());

Template.registerHelper('loggedIn', () => !!Meteor.userId());

Template.registerHelper('roster', function() {
  return Heroes.roster(Meteor.userId());
});

Template.registerHelper('getMerc', function(id) {
  return Heroes.getMerc(Meteor.userId(), id);
});

Template.registerHelper('percent', function(a, b) {
  return a / b * 100;
});

Template.registerHelper('noHealth', val => val <= 0);

Template.registerHelper('goldTotal', () => {
  return Bursar.goldTotal();
});

Template.registerHelper('abilityDescription', (name) => {
  return name ? Abilities.Primaries.get(name).get('description') : '';
});

Template.registerHelper('passiveDescription', (name) => {
  return name ? Abilities.Passives.get(name).get('description') : '';
});

Template.registerHelper('fullPassive', (name) => {
  return name ? Abilities.Passives.get(name).toJS() : '';
});

Template.play.onCreated(function playOnCreated() {
  Meteor.call('game.init');
  State.set('tab', 0);
  setTimeout(() => State.set('loading', false), 2000);
});

Template.play.helpers({
  loading: () => State.get('loading'),
  game() {
    return {};
  },
  isActiveTab(tab) {
    return State.get('tab') === tab;
  },
  notifications() {
    return Notifications.list(Meteor.userId());
  },
  selectedQuest: () => State.get('selectedQuest') !== null,
  viewQuest() {
    return State.get('viewQuest');
  },
});

Template.play.events({
  'click .clear-storage'() {
    Meteor.call('game.reset');
  },
  'click .notifications .alert'() {
    Meteor.call('notifications.dismiss', this.id);
  },
  'click .tab-modal-overlay'(event) {
    if (event.target.className.indexOf('tab-modal-overlay') > -1) {
      State.set('tab', 0);
    }
  }
});

Template.loginButtons.events({
  'click #login-buttons-logout': function() {
    console.log('manual log out');
    window.location.reload();
  }
});
