// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by utilities.js.
import { name as packageName } from "meteor/utilities";

// Write your tests here!
// Here is an example.
Tinytest.add('utilities - example', function (test) {
  test.equal(packageName, "utilities");
});
