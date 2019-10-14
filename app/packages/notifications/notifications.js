import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import U from 'meteor/game:utilities';

export const NotificationsCollection = new Mongo.Collection('notifications');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('notifications', function bursarPublication() {
    return NotificationsCollection.find({userId: this.userId}, {
      limit: 20,
      sort: {stamp: -1}
    });
  });
}

Meteor.methods({
  'notifications.dismiss': (id) => {
    dismiss(id);
  },
  'notifications.danger': function(message) {
    danger(message, this.userId);
  },
  'notifications.success': function(message) {
    success(message, this.userId);
  },
  'notifications.warning': function(message) {
    warning(message, this.userId);
  },
  'notifications.battle': function(message) {
    battle(message, this.userId);
  },
});

const push = (type, message, userId) => {
  NotificationsCollection.insert({
    userId: userId,
    id: U.id(),
    stamp: Date.now(),
    dismissed: false,
    message,
    type
  });
};

const success = (message, userId) => push('success', message, userId);
const info = (message, userId) => push('info', message, userId);
const warning = (message, userId) => push('warning', message, userId);
const danger = (message, userId) => push('danger', message, userId);
const battle = (message, userId) => push('battle', message, userId);

const dismiss = (id) => {
  NotificationsCollection.update(
    {id},
    {$set: {dismissed: true}}
  );
};

let _clock = 0;
const flush = () => {
  _clock++;
  if (_clock === 2) {
    _clock = 0;
    return;
  }
  let now = Date.now();
  NotificationsCollection.update(
    {stamp: {$lt: now - 5000}},
    {$set: {dismissed: true}},
    {multi: true}
  );
};

const list = (userId) => {
  return NotificationsCollection.find({userId}).fetch();
};

export const Notifications = {
  list,
  dismiss,
  success,
  info,
  warning,
  danger,
  battle,
  flush
};
