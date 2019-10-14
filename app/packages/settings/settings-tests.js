// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by settings.js.
import { name as packageName } from "meteor/settings";

// Write your tests here!
// Here is an example.
Tinytest.add('settings - example', function (test) {
  test.equal(packageName, "settings");
});
