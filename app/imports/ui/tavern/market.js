import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';

import {Heroes} from 'meteor/game:heroes';
import {State} from '../state';

import './market.sell.html';

Template['market/sell'].helpers({
  selectedMerc: () => !!State.get('market/sell.selected'),
  getSelectedMerc: () => {
    return Heroes.getMerc(
      Meteor.userId(),
      State.get('market/sell.selected')
    );
  },
  mercDetail: () => {
    let id = State.get('market/sell.selected');
    if (id) {
      let merc = Heroes.getMerc(Meteor.userId(), id);
      console.log(merc);
      return merc;
    } else {
      return false;
    }
  },
});

Template['market/sell'].events({
  'click .close-sell-window': function() {
    if (State.get('market/sell.selected')) {
      State.set('market/sell.selected', null);
    } else {
      State.set('market/overview.selling', false);
    }
  },
  'click .selectMerc': function() {
    State.set('market/sell.selected', this.id);
  },
  'click .sell-confirm': function() {
    let val = $('#sell-price').val();
    let hero = this;
    if (val) {
      Meteor.call('market.list', hero, Number(val));
      State.set('market/sell.selected', null);
      State.set('market/overview.selling', false);

    } else {
      console.log('No value set');
    }
  },
  'click .roster-block'() {
    const id = this.id;
    if (State.get('market/sell.selected') === id) {
      State.set('market/sell.selected', null);
    } else {
      State.set('market/sell.selected', id);
    }
  },
});
