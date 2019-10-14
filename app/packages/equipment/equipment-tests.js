// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by equipment.js.
import { name as packageName } from "meteor/equipment";

// Write your tests here!
// Here is an example.
Tinytest.add('equipment - example', function (test) {
  test.equal(packageName, "equipment");
});
