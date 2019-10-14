// app/packages/chat/chat.js

import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const ChatCollection = new Mongo.Collection('chat');

const write = (message, userId, type = 'chat') => {
  ChatCollection.insert({
    userId: userId,
    stamp: Date.now(),
    message,
    type,
  });
};

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('chat', function () {
    return ChatCollection.find({}, {limit: 500, sort: {stamp: 1}});
  });

  Meteor.publish('userPresence', function() {
    // Setup some filter to find the users your user
    // cares about. It's unlikely that you want to publish the
    // presences of _all_ the users in the system.

    var filter = { userId: { $exists: true }};

    return Presences.find(filter, { fields: { state: true, userId: true }});
  });
}

Meteor.methods({
  'chat.post': function(message) {
    write(message, this.userId);
  },
});

