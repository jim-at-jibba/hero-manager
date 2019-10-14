// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by quests.js.
import { name as packageName } from "meteor/quests";

// Write your tests here!
// Here is an example.
Tinytest.add('quests - example', function (test) {
  test.equal(packageName, "quests");
});
