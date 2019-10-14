// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by hire.js.
import { name as packageName } from "meteor/hire";

// Write your tests here!
// Here is an example.
Tinytest.add('hire - example', function (test) {
  test.equal(packageName, "hire");
});
