import {Meteor} from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {BlazeLayout} from 'meteor/kadira:blaze-layout';

import 'meteor/jquery';

import './main.html';
import '../imports/ui/play';
import '../imports/ui/home';
import '../imports/startup/accounts-config';

FlowRouter.route('/', {
  name: 'Home',
  action: function() {
    console.log('HOME!!');
    BlazeLayout.render('mainLayout', {content: 'home'});
  }
});

FlowRouter.route('/play', {
  name: 'Play',
  triggersEnter: [function(context, redirect) {
    if (!Meteor.userId()) {
      redirect('/');
    }
  }],
  action: function() {
    console.log('PLAY!');
    BlazeLayout.render('mainLayout', {content: 'play'});
  }
});

