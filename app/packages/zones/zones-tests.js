// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by zones.js.
import { name as packageName } from "meteor/zones";

// Write your tests here!
// Here is an example.
Tinytest.add('zones - example', function (test) {
  test.equal(packageName, "zones");
});
