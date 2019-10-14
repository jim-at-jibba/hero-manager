import {Template} from 'meteor/templating';

import './hero-battle.html';

Template['hero-battle'].helpers({
  isDead: function() {
    return this.health <= 0;
  },
});
