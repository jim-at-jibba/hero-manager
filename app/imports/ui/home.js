import {Template} from 'meteor/templating';

import {State} from './state';

import './home.html';
import './login-signup';
import './feedback';

Template.home.onCreated(function playOnCreated() {
  State.set('homeTab', 1);
});

Template.home.helpers({
  tabClass(tab) {
    return State.get('homeTab') === tab ? 'active' : '';
  },
  isActiveTab(tab) {
    return State.get('homeTab') === tab;
  },
});

Template.home.events({
  'click .nav-tabs a'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    State.set('homeTab', this.id);
  },
});
