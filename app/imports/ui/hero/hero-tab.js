import {Template} from 'meteor/templating';

import './hero-tab.html';


Template['hero-tab'].helpers({
  isDead: function() {
    return this.health <= 0;
  },
});
