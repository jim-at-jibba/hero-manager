// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by abilities.js.
import { name as packageName } from "meteor/abilities";

// Write your tests here!
// Here is an example.
Tinytest.add('abilities - example', function (test) {
  test.equal(packageName, "abilities");
});
