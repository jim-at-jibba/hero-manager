// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by market.js.
import { name as packageName } from "meteor/market";

// Write your tests here!
// Here is an example.
Tinytest.add('market - example', function (test) {
  test.equal(packageName, "market");
});
