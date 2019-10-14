import { Meteor } from 'meteor/meteor';
import {Template} from 'meteor/templating';
import R from 'ramda';
import Abilities from 'meteor/game:abilities';
import {Settings} from 'meteor/game:settings';
import {Heroes} from 'meteor/game:heroes';
import {Battles} from 'meteor/game:combat';

import {QuestsCollection} from 'meteor/game:quests';
import {State} from '../state';

import './partyselect.html';

const heroClasses = hero => {
  return hero.passives.map(p => Abilities.Passives.get(p).get('class'));
};

Template['quests.partyselect'].helpers({
  isSelected: function() {
    return R.contains(this.id, State.get('selectedMercs'));
  },
  partySelected: () => State.get('selectedMercs').length > 0,
  loadQuest() {
    let questId = State.get('selectedQuest');
    let quest = QuestsCollection.findOne({userId: Meteor.userId(), id: questId});
    return quest;
  },
  search: (array) => {
    let search = (State.get('quests.partyselect.search') || '').toLowerCase();
    return array.filter(hero => {
      return hero.name.toLowerCase().includes(search) ||
        hero.passives.some(p => p.toLowerCase().includes(search)) ||
        heroClasses(hero).some(c => c.toLowerCase().includes(search));
    });
  },
  searchVal: () => State.get('quests.partyselect.search'),
  alive: function() {
    return this.health > 0;
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
  mercDetail: () => {
    let id = State.get('rosterDetail');
    if (id) {
      let merc = Heroes.getMerc(Meteor.userId(), id);
      return merc;
    } else {
      return false;
    }
  },
});

Template['quests.partyselect'].events({
  'click .back': function() {
    State.set('selectedQuest', null);
  },
  'click .roster-block, click .select-hero': function() {
    let list = State.get('selectedMercs');
    let id = this.id;

    if (Battles.findOne({roster: this.id})) {
      return;
    }

    if (this.health <= 0) {
      return;
    }

    if (!this.available) {
      return;
    }

    if (R.contains(id, list)) {
      State.set('selectedMercs', list.filter(x => x !== id));
    } else {
      State.set('selectedMercs', list.concat(id));
    }
  },
  'click .startquest': function() {
    let selected = State.get('selectedMercs');
    let questId = State.get('selectedQuest');
    State.set({
      'selectedMercs': [],
      'selectedQuest': null,
      'viewQuest': questId
    });

    Meteor.call('combat.start', selected, questId);
  },
  'keyup #roster-search'(e) {
    State.set('quests.partyselect.search', $(e.target).val());
  },
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
  'click .rostery-block'() {
    const id = this.id;
    if (State.get('rosterDetail') === id) {
      State.set('rosterDetail', null);
    } else {
      State.set('rosterDetail', id);
    }
  },
});

