import { Meteor } from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {QuestsCollection} from 'meteor/game:quests';
import {Battles} from 'meteor/game:combat';
import {State} from '../state';

import './battle.html';

import '../hero/hero-battle.js';

Template['quests/battle'].helpers({
  quest() {
    let id = State.get('viewQuest');
    let q = QuestsCollection.findOne({userId: Meteor.userId(), id});
    if (!q) {
      State.set('viewQuest', null);
    }
    return q;
  },
  questZone() {
    let id = State.get('viewQuest');
    let q = QuestsCollection.findOne({userId: Meteor.userId(), id});
    if (!q) {
      return '';
    }
    return q.zone.name.toLowerCase().replace(' ', '-');
  },
  battle() {
    let id = State.get('viewQuest');
    let battle = Battles.findOne({quest: id});
    return battle;
  },
  questParty(battle) {
    return battle ? battle.roster : [];
  },
  monsterParty(battle) {
    return battle ? battle.monsters[0] : [];
  },
  battleProgress() {
    let battle = Battles.findOne({quest: this.id});
    return battle ? battle.progress : 0;
  },
  battleEvents() {
    let battle = Battles.findOne({quest: this.id});
    return battle ? battle.events : [];
  },
  activeClass(battle) {
    if (battle) {
      return this.id === battle.activeCharacter ? 'battle-active' : '';
    } else {
      return '';
    }
  },
  combatNotices(battle) {
    if (!battle) {
      return [];
    }
    let notices = battle.combatNotices;
    return notices.filter(x => x.character === this.id);
  },
});

Template['quests/battle'].events({
  'click .go-back'() {
    State.set('viewQuest', null);
  }
});
