// app/imports/ui/item/item.js

import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';

import {State} from '../state';
import {Inventory} from 'meteor/game:items';

import './item.html';

Template.item.onCreated(() => {
  Meteor.subscribe('inventory');
});

Template.item.onRendered(function() {
  setTimeout(() => {
    let $thumb = $(this.firstNode);
    $thumb.qtip({
      content: {
        text: $thumb.next('.tooltiptext')
      },
      style: 'qtip-dark',
      show: {
        event: 'click mouseenter'
      }
    });

    $thumb.draggable({
      revert: true,
    });
  }, 250);
});

Template.item.helpers({
  equals: (a, b) => a === b,
  notEquals: (a, b) => a !== b,
  usingItem: () => State.get('usingItem'),
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
  },
  equippedClass: function() {
    let items = Inventory.list(Meteor.userId());
    let itemId = this.id;

    return items.find(x => x.id === itemId) ?
      'unequipped' :
      'equipped';
  },
  isEquipment: function() {
    return this.type === 'equipment';
  },
});

Template.item.events({
  'click .item-thumb'() {
    State.set('usingItem', this.id);
  },
});
