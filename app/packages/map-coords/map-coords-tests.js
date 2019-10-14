// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by map-coords.js.
import { name as packageName } from "meteor/map-coords";

// Write your tests here!
// Here is an example.
Tinytest.add('map-coords - example', function (test) {
  test.equal(packageName, "map-coords");
});
