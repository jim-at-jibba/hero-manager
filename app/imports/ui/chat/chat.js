// app/imports/ui/chat.js

import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import {Template} from 'meteor/templating';
import {Presences} from 'meteor/tmeasday:presence';

import {ChatCollection} from 'meteor/game:chat';
import {Notifications} from 'meteor/game:notifications';
import {NotificationsCollection} from 'meteor/game:notifications';

import './chat.html';

Meteor.subscribe('chat');
Meteor.subscribe('userData');
Meteor.subscribe('userPresence');
Meteor.subscribe('notifications');

Tracker.autorun(function () {
  ChatCollection.find({}).fetch();
  NotificationsCollection.find({}).fetch();
  let $area = $('.chat-window ul');
  if ($area.length) {
    setTimeout(() => {
      $area[0].scrollTop = $area[0].scrollHeight + 50;
    }, 150);
  }
});

Template.chat.onRendered(function() {
  setTimeout(() => {
    let $area = $('.chat-window ul');
    $area[0].scrollTop = $area[0].scrollHeight + 50;
  }, 150);
});

Template.chat.helpers({
  list: () => {
    var messages = ChatCollection.find({}, {limit: 500, sort: {stamp: 1}}).fetch()
      .concat(Notifications.list(Meteor.userId()));

    messages.sort((a, b) => {
      return a.stamp - b.stamp;
    });

    return messages;
  },
  isChat: function() {
    return this.type === 'chat';
  },
  username: function() {
    if (this.type !== 'chat') {
      return 'Notification';
    }
    let user = Meteor.users.findOne(this.userId);
    return user ? user.username : '???';
  },
  online: () => {
    let v = Presences.find({}).fetch();
    var num = v.length === 0 ? 0 : v.length - 1;
    return num === 1 ?
      '1 other player online' :
      `${num} other players online`;
  },
});

Template.chat.events({
  'submit form': function(e) {
    e.preventDefault();
    const $input = $('.chat-window input');
    Meteor.call('chat.post', $input.val());
    $input.val('');
  },
});
