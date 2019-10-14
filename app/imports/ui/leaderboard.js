import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import R from 'ramda';

import {BursarCollection} from 'meteor/game:bursar';
import {State} from './state';

import './leaderboard.overview.html';

Meteor.subscribe('userData');

const getUserName = id => {
  let user = Meteor.users.findOne(id);
  return user ? user.username : '???';
};

Template['leaderboard/overview'].helpers({
  leaderboard: () => {
    let records = BursarCollection.find({}).fetch().filter(x => x.userId);
    let mapped = records.map(x => {
      return {
        userId: x.userId,
        gold: x.total,
        income: x.total
      };
    });

    let sorted = R.sortBy(R.prop('income'), mapped);
    sorted.reverse();
    let map = sorted.map((x, i) => ({
      name: getUserName(x.userId),
      rank: i + 1,
      income: x.income,
      userId: x.userId,
    }));
    return map;
  },
  userColor: function() {
    return this.userId === Meteor.userId() ? 'background: yellow; color: black;' : '';
  },
});

Template['leaderboard/overview'].events({
  'click .back'() {
    State.set('tab', 0);
  },
});
