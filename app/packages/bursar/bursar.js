import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const BursarCollection = new Mongo.Collection('bursar');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('bursar', function bursarPublication() {
    return BursarCollection.find({}, {fields: {userId: 1, total: 1}});
  });
}

export const Bursar = {
  goldTotal: (userId = Meteor.userId()) => {
    let record = BursarCollection.findOne({userId});
    return record ? record.total : 0;
  },
  transaction: (value = 0, reason = '', ref = '', userId) => {
    BursarCollection.update(
      {userId},
      {
        $inc: { total: value },
        $push: { ledger: {
          value,
          reason,
          ref,
          timestamp: new Date()
        }}
      }
    );
  },
  clear: (userId, cb) => {
    BursarCollection.remove({userId}, function() {
      if (cb) {
        cb();
      }
    });
  },
  init: (userId) => {
    if (!BursarCollection.findOne({userId})) {
      BursarCollection.insert({
        userId: userId,
        total: 2000,
        ledger: []
      });
    }
  }
};

