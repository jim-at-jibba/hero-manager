import { Meteor } from 'meteor/meteor';
import {Template} from 'meteor/templating';

import './stronghold.overview.html';
import {Stronghold} from 'meteor/game:stronghold';
import {State} from './state';

Template['stronghold/overview'].onCreated(function() {
  Meteor.subscribe('stronghold');
});

Template['stronghold/overview'].helpers({
    stronghold: () => Stronghold.current(Meteor.userId()),
    strongholdDescription: () => Stronghold.description(),
    strongholdCapacity: () => Stronghold.capacity(),
    strongholdCost: (id) => Stronghold.cost(id),
    strongholdName: (id) => Stronghold.name(id),
    strongholdNext: (id) => Stronghold.next(id)
});

Template['stronghold/overview'].events({
  'click .upgrade-stronghold'() {
    Meteor.call('stronghold.upgrade', this.id);
  },
  'click .back'() {
    State.set('tab', 0);
  },
});
