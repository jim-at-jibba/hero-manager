// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by character.js.
import { name as packageName } from "meteor/character";

// Write your tests here!
// Here is an example.
Tinytest.add('character - example', function (test) {
  test.equal(packageName, "character");
});
