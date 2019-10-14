// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by notifications.js.
import { name as packageName } from "meteor/notifications";

// Write your tests here!
// Here is an example.
Tinytest.add('notifications - example', function (test) {
  test.equal(packageName, "notifications");
});
