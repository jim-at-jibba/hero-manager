import { Meteor } from 'meteor/meteor';
import {Template} from 'meteor/templating';
import R from 'ramda';

import './quests/battle.js';
import './quests/partyselect.js';
import './quests.overview.html';
import './quests.act-select.html';
import './components/progress/progress.js';

import {QuestsCollection} from 'meteor/game:quests';
import {Battles} from 'meteor/game:combat';
import {State} from './state';

Template['quests/overview'].onCreated((function() {
  let loaded = false;

  return function() {
    if (!loaded) {
      State.set('quests/overview.act', 1);
      loaded = true;
    }
    Meteor.subscribe('quests');
    Meteor.subscribe('battles');
  };
}()));

Template['quests/act-select'].helpers({
  activeClass: function(id) {
    return id === State.get('quests/overview.act') ? 'active' : '';
  },
  currentSlide: function() {
    return State.get('quests/overview.act');
  }
});

Template['quests/act-select'].events({
  'click .act-select .item': function(e) {
    e.preventDefault();
    State.set('quests/overview.act', parseInt($(e.currentTarget).attr('data-act-id'), 10));
  },
});

Template['quests/overview'].helpers({
  viewQuest() {
    return State.get('viewQuest');
  },
  equals: (a, b) => a === b,
  notEquals: (a, b) => a !== b,
  quests() {
    let act = State.get('quests/overview.act');
    let q = QuestsCollection.find({userId: Meteor.userId(), act}).fetch();
    return q ? q : [];
  },
  level() {
    let [min, max] = this.monsterList.reduce(([min, max], group) => {
      let average = Math.ceil(group.reduce((x, y) => x + y.level, 0) / group.length);
      if (min === null || average < min) {
        min = average;
      }
      if (max === null || average > max) {
        max = average;
      }
      return [min, max];
    }, [null, null]);

    return min === max ? min : min + '-' + max;
  },
  activeQuests() {
    let q = QuestsCollection.find({userId: Meteor.userId()}).fetch();
    if (!q) {
      return [];
    }
    let active = R.sort((a, b) => a.started - b.started, q).filter(
      x => !!Battles.findOne({quest: x.id})
    );
    return active;
  },
  questIsActive() {
    return !!Battles.findOne({quest: this.id});
  },
  questParty() {
    let battle = Battles.findOne({quest: this.id});
    return battle ? battle.roster.sort((x, y) => x.speed >= y.speed) : [];
  },
  battleProgress() {
    let battle = Battles.findOne({quest: this.id});
    return battle ? battle.progress : 0;
  },
  battleEvents() {
    let battle = Battles.findOne({quest: this.id});
    return battle ? battle.events : [];
  },
  loadQuest() {
    let act = State.get('quests/overview.act');
    let [q] = QuestsCollection.find({userId: Meteor.userId(), act}).fetch();
    return q;
  },
  selectedQuest: () => State.get('selectedQuest') !== null,
  sliding: () => State.get('quests/overview.sliding'),
});

Template['quests/overview'].events({
  'click .selectquest': function() {
    State.set('selectedQuest', this.id);
  },
  'click .removequest': function() {
    Meteor.call('quests.remove', this.id);
  },
  'click .active-quest-preview': function() {
    State.set('viewQuest', this.id);
  },
  'click .back': function() {
    State.set('selectedQuest', null);
    State.set('tab', 0);
  },
});

