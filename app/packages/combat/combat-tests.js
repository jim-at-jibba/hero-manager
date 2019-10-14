// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by combat.js.
import { name as packageName } from "meteor/combat";

// Write your tests here!
// Here is an example.
Tinytest.add('combat - example', function (test) {
  test.equal(packageName, "combat");
});
