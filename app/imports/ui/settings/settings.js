import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {State} from '../state';
import './settings.html';

Template.settings.events({
  'click .restart-game'(event) {
    event.preventDefault();
    if (window.confirm(`Do you really want to restart your game? This action cannot be undone`)) {
      Meteor.call('game.restart');
      State.set('tab', null);
      window.location.reload();
    }
  }
});

