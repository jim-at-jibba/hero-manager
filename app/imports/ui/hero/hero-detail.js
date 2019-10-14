import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

import {Settings} from 'meteor/game:settings';
import Abilities from 'meteor/game:abilities';

import moment from 'moment';

import '../item/item.js';
import './hero-detail.html';

const heroClasses = hero => {
  return hero.passives.map(p => Abilities.Passives.get(p).get('class'));
};

Template['hero-detail'].onRendered(function() {
  setTimeout(() => {
    $('.detail-card').droppable({
      accept: '.item-thumb.unequipped',
      drop: function() {
        // Briefly hide the dragged item on drop to stop weird visual bug
        let $thumb = $('.item-thumb.ui-draggable-dragging');
        $thumb.css('opacity', 0);
        setTimeout(() => $thumb.css('opacity', 1), 500);
      }
    });
  }, 250);
});

Template['hero-detail'].helpers({
  classImage: function() {
    let classes = heroClasses(this);
    return classes.length ? Settings.classImages[classes[0]] : '';
  },
  equipmentPlaceholder: function() {
    const placeHolder = '<div class="item-thumb-placeholder"></div>';
    if (this.equipment.length === 2) {
      return '';
    } else if (this.equipment.length === 1) {
      return placeHolder;
    } else {
      return placeHolder + placeHolder;
    }
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

Template['hero-detail'].events({
  'drop .detail-card'() {
    let itemId = $('.ui-draggable-dragging').attr('data-item-id');
    let itemType = $('.ui-draggable-dragging').attr('data-item-type');
    if (itemType === 'buff') {
      return Meteor.call('inventory.usebuffitem', itemId, this);
    }
    if (
      itemType !== 'equipment' ||
      this.equipment && this.equipment.length >= 2
    ) {
      return;
    }
    Meteor.call('inventory.equipitem', itemId, this);
  }
});
