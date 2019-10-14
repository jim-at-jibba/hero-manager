// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by heroes.js.
import { name as packageName } from "meteor/heroes";

// Write your tests here!
// Here is an example.
Tinytest.add('heroes - example', function (test) {
  test.equal(packageName, "heroes");
});
