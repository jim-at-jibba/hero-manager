// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by items.js.
import { name as packageName } from "meteor/items";

// Write your tests here!
// Here is an example.
Tinytest.add('items - example', function (test) {
  test.equal(packageName, "items");
});
