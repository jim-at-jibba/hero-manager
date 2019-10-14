import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Accounts} from 'meteor/accounts-base';

import {State} from './state';

import './login-signup.html';

Template['login-signup'].onCreated(() => {
  State.set('login-signup.create', true);
});

Template['login-signup'].helpers({
  create: () => State.get('login-signup.create'),
  error: () => State.get('login-signup.error'),
});

Template['login-signup'].events({
  'submit': function (e) {
    State.set('login-signup.error', null);
    console.log(e);
    const username = $('#input-username').val();
    const password1 = $('#input-password-1').val();
    e.preventDefault();
    if (State.get('login-signup.create')) {
      const password2 = $('#input-password-2').val();
      if (password1 !== password2) {
        return State.set('login-signup.error', 'Passwords don\'t match');
      }
      // Create account
      Accounts.createUser({username: username, password: password1}, function(err) {
        if (err) {
          console.log(err);
          State.set('login-signup.error', 'An error occurred');
        } else {
          console.log('success!');
        }
      });
    } else {
      Meteor.loginWithPassword(username, password1, function (error) {
        if (error) {
          console.log(error);
          State.set('login-signup.error', error.reason);
        } else {
          console.log('SUCCESS!');
        }
      });
    }
  },
  'click .login-signup-toggle': function(e) {
    e.preventDefault();
    State.set('login-signup.create', !State.get('login-signup.create'));
  },
});

