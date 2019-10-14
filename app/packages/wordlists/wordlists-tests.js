// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by wordlists.js.
import { name as packageName } from "meteor/wordlists";

// Write your tests here!
// Here is an example.
Tinytest.add('wordlists - example', function (test) {
  test.equal(packageName, "wordlists");
});
