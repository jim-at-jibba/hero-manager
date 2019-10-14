Package.describe({
  name: 'game:quests',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.1');
  api.use('ecmascript');
  api.use([
    'game:utilities',
    'game:items',
    'game:wordlists',
    'game:wordlists',
    'game:wordlists',
    'game:wordlists',
    'game:monster',
    'game:zones',
  ]);
  api.mainModule('quests.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('game:quests');
  api.mainModule('quests-tests.js');
});
