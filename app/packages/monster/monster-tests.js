// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by monster.js.
import { name as packageName } from "meteor/monster";

// Write your tests here!
// Here is an example.
Tinytest.add('monster - example', function (test) {
  test.equal(packageName, "monster");
});
