// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by stronghold.js.
import { name as packageName } from "meteor/stronghold";

// Write your tests here!
// Here is an example.
Tinytest.add('stronghold - example', function (test) {
  test.equal(packageName, "stronghold");
});
