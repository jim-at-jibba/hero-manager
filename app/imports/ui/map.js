import { Meteor } from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {QuestsCollection} from 'meteor/game:quests';
import {Battles} from 'meteor/game:combat';
import {Stronghold} from 'meteor/game:stronghold';
import {ReactiveVar} from 'meteor/reactive-var';

import 'jquery';
import 'meteor/mizzao:jquery-ui';
import 'meteor/dsyko:jquery-ui-touch-punch';

import './map.overview.html';

import {State} from './state';

const originalMapWidth = 5000;
const originalMapHeight = 5000;
let mapWidth = new ReactiveVar(originalMapWidth * 0.5);
let mapHeight = new ReactiveVar(originalMapHeight * 0.5);

Template['map/overview'].onCreated(function () {
  Meteor.subscribe('quests');
  Meteor.subscribe('stronghold');
  Meteor.subscribe('battles');
});

Template['map/overview'].onRendered(function () {
  let currentX = State.get('map.overview.currentX') ?
    State.get('map.overview.currentX') : $(window).width() / 2 - mapWidth.get() / 2;
  let currentY = State.get('map.overview.currentY') ?
    State.get('map.overview.currentY') : $(window).height() / 2 - mapHeight.get() / 2;

  $('.map-drag-wrapper').draggable();

  const setMap = (x, y) => {
    $('.map-container .map-drag-wrapper').css({
      'transform': `translate(${x}px, ${y}px)`
    });
  };

  const zoomMap = (amount) => {
    currentX = currentX + amount / 2;
    currentY = currentY + amount / 2;
    State.set('map.overview.currentX', currentX);
    State.set('map.overview.currentY', currentY);
    mapWidth.set(mapWidth.get() - amount);
    mapHeight.set(mapHeight.get() - amount);
    setMap(currentX, currentY);
  };

  $('.map-drag-wrapper').on('wheel', function(e) {
    const amount = e.originalEvent.deltaY;
    zoomMap(amount);
  });

  $('.map-zoom-controls .map-zoom-in').click(function(e) {
    e.preventDefault();
    zoomMap(-600);
  });

  $('.map-zoom-controls .map-zoom-out').click(function(e) {
    e.preventDefault();
    zoomMap(600);
  });

  window.points = [];
  // Utility function to show percentage coordinates for map.
  $('.map-drag-wrapper').on('click', function(e) {
    const percentX = e.offsetX / $(this).width() * 100;
    const percentY = e.offsetY / $(this).height() * 100;
    window.points.push({
      x: percentX,
      y: percentY
    });
  });
});

Template['map/overview'].helpers({
  tabClass(tab) {
    return State.get('tab') === tab ? 'active' : '';
  },
  mapWidth: () => mapWidth.get(),
  mapHeight: () => mapHeight.get(),
  startX: () => State.get('map.overview.currentX') ?
    State.get('map.overview.currentX') : $(window).width() / 2 - mapWidth.get() / 2,
  startY: () => State.get('map.overview.currentY') ?
    State.get('map.overview.currentY') : $(window).height() / 2 - mapHeight.get() / 2,
  quests() {
    let act = State.get('quests/overview.act') || 1;
    let q = QuestsCollection.find({
      act: act,
      userId: Meteor.userId()
    }).fetch();
    return q ? q : [];
  },
  isSelected: function() {
    return this.id === State.get('map.overview.selectedQuest');
  },
  stronghold: () => {
    const s = Stronghold.current(Meteor.userId());
    return s ? Stronghold.load(s.id) : false;
  },
  questIsActive() {
    return !!Battles.findOne({quest: this.id});
  },
  battleProgress() {
    let battle = Battles.findOne({quest: this.id});
    return battle ? battle.progress : 0;
  },
  mapSrc() {
    let act = State.get('quests/overview.act') || 1;
    return '/world/act-' + act + '-map.jpg';
  },
  isFullScreen() {
    return State.get('isFullScreen');
  }
});

Template['map/overview'].events({
  'click .toolbar .toolbar-leaderboard'(event) {
    event.preventDefault();
    State.set('tab', 6);
  },
  'click .toolbar .toolbar-chat-window'(event) {
    event.preventDefault();
    $('.chat-window').toggle();
  },
  'click .toolbar .toolbar-act-select'(event) {
    event.preventDefault();
    State.set('tab', 9);
  },
  'click .toolbar .toolbar-settings'(event) {
    event.preventDefault();
    State.set('tab', 8);
  },
  'click .toolbar .toolbar-stronghold'(event) {
    event.preventDefault();
    State.set('tab', 5);
  },
  'click .toolbar .toolbar-tavern'(event) {
    event.preventDefault();
    State.set('tab', 3);
  },
  'click .map-quest-marker-wrapper': function() {
    State.set('map.overview.selectedQuest', this.id);
  },
  'click .start-quest': function() {
    State.set('tab', 4);
    State.set('selectedQuest', this.id);
    State.set('map.overview.selectedQuest', null);
  },
  'click .observe-quest': function() {
    State.set('tab', 4);
    State.set('viewQuest', this.id);
    State.set('map.overview.selectedQuest', null);
  },
  'click .map-location-marker-wrapper.stronghold': function() {
    State.set('tab', 5);
  },
  'click .map-location-marker-wrapper.tavern': function() {
    State.set('tab', 3);
  },
  'click .toolbar-fullscreen': function() {
    let isFullScreen = State.get('isFullScreen');
    if (isFullScreen) {
      let refs = document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen ||
        document.webkitExitFullscreen;
      refs.call(document);
    } else {
      let el = document.documentElement;
      let rfs = el.requestFullscreen ||
        el.webkitRequestFullScreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;

      rfs.call(el);
    }
    State.set('isFullScreen', !isFullScreen);
  }
});
