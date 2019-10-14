// app/imports/ui/inventory/items.js

import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';

import 'jquery';
import 'meteor/mizzao:jquery-ui';
import './inventory.overview.html';
import '../item/item.js';

import {Inventory} from 'meteor/game:items';
import {State} from '../state';

Template['inventory/overview'].onCreated(() => {
  Meteor.subscribe('inventory');
  Meteor.subscribe('notifications');
});

Template['inventory/overview'].onRendered(function() {
  setTimeout(() => {
    $('#inventory-grid').droppable({
      accept: '.item-thumb.equipped',
      drop: function() {
        // Briefly hide the dragged item on drop to stop weird visual bug
        let $thumb = $('.item-thumb.ui-draggable-dragging');
        $thumb.css('opacity', 0);
        setTimeout(() => $thumb.css('opacity', 1), 400);

        let itemId = $thumb[0].getAttribute('data-item-id');
        let mercId = $('.detail-card').attr('data-hero-id');

        Meteor.call('inventory.unequipitem', itemId, mercId);
      },
    });

    $('#inventory-sell').droppable({
      accept: '.item-thumb',
      drop: function() {
        // Briefly hide the dragged item on drop to stop weird visual bug
        let $thumb = $('.item-thumb.ui-draggable-dragging');
        let mercId;
        $thumb.css('opacity', 0);
        setTimeout(() => $thumb.css('opacity', 1), 600);

        let itemId = $thumb[0].getAttribute('data-item-id');

        if ($thumb.hasClass('equipped')) {
          mercId = $('.detail-card').attr('data-hero-id');
          Meteor.call('inventory.sellequippeditem', itemId, mercId);
        } else {
          Meteor.call('inventory.sellitem', itemId);
        }
      },
    });
  }, 250);
});

Template['inventory/overview'].helpers({
  equals: (a, b) => a === b,
  notEquals: (a, b) => a !== b,
  usingItem: () => State.get('usingItem'),
  inventory() {
    return Inventory.list(Meteor.userId());
  },
  qualityClass: function() {
    return `item-quality-${this.quality}`;
  },
  itemImg: function() {
    return this.meta.img ? this.meta.img : '';
  },
  isBuffOrEquipment: function() {
    return this.type === 'buff' || this.type === 'equipment';
  },
  firstElement: function() {
    return this[0];
  },
  quantity: function() {
    return this.length ? this.length : '';
  },
  qualityType: function() {
    let desc;
    switch (this.quality) {
      case 8:
        desc = 'Heirloom';
        break;
      case 7:
        desc = 'Artifact';
        break;
      case 6:
        desc = 'Legendary';
        break;
      case 5:
        desc = 'Epic';
        break;
      case 4:
        desc = 'Rare';
        break;
      case 3:
        desc = 'Uncommon';
        break;
      case 2:
        desc = 'Common';
        break;
      default:
        desc = 'Poor';
    }

    return desc;
  },
  minMax: function() {
    return this.min && this.max;
  }
});

Template['inventory/overview'].events({
  'click .item-thumb'() {
    State.set('usingItem', this.id);
  },
  'click .use-item'() {
    State.set('usingItem', null);
    Meteor.call('inventory.useitem', this);
  },
  'click .back'() {
    State.set('tab', 0);
  },
});
