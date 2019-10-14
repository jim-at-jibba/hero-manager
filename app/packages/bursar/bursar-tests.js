// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by bursar.js.
import { name as packageName } from "meteor/bursar";

// Write your tests here!
// Here is an example.
Tinytest.add('bursar - example', function (test) {
  test.equal(packageName, "bursar");
});
