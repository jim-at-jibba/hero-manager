import {Template} from 'meteor/templating';

import moment from 'moment';

import './hero-preview.html';


Template['hero-preview'].helpers({
  isDead: function() {
    return this.health <= 0;
  },
  unavailable: function() {
    if (!this.hasOwnProperty('available')) {
      return false;
    }
    return !this.available;
  },
  timeTillAvailable: function() {
    return moment(this.availableTime).fromNow();
  },
});
