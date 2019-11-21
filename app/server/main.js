import { Meteor } from "meteor/meteor";
const Fiber = Npm.require("fibers");

import { Bursar } from "meteor/game:bursar";
import { Heroes } from "meteor/game:heroes";
import { HeroesCollection } from "meteor/game:heroes";
import { Quests } from "meteor/game:quests";
import { QuestsCollection } from "meteor/game:quests";
import { Combat } from "meteor/game:combat";
import { Battles } from "meteor/game:combat";
import { Hires } from "meteor/game:hire";
import { HiresCollection } from "meteor/game:hire";
import { Notifications } from "meteor/game:notifications";
import { NotificationsCollection } from "meteor/game:notifications";
import { Inventory } from "meteor/game:items";
import { InventoryCollection } from "meteor/game:items";
import { Stronghold } from "meteor/game:stronghold";
import { Settings } from "meteor/game:settings";
import "meteor/game:market";
import "meteor/game:chat";

const tick = () => {
  Fiber(function() {
    Notifications.flush();
    Combat.step();
    Quests.step();
    Hires.step();
    Heroes.step();
  }).run();
};

Meteor.startup(() => {
  setInterval(() => tick(), Settings.stepInterval);
  // code to run on server at startup
  HiresCollection._ensureIndex({ userId: 1 });
  QuestsCollection._ensureIndex({ userId: 1 });
  HeroesCollection._ensureIndex({ userId: 1 });
  HeroesCollection._ensureIndex({ id: 1 });
  InventoryCollection._ensureIndex({ userId: 1 });
  NotificationsCollection._ensureIndex({ userId: 1 });
  Battles._ensureIndex({ quest: 1 });
  Battles._ensureIndex({ userId: 1 });
});

Meteor.publish("userData", function() {
  return Meteor.users.find({}, { fields: { username: 1 } });
});

Meteor.methods({
  "game.init": function() {
    Bursar.init(this.userId);
    Combat.init(this.userId);
    Hires.init(this.userId);
    Inventory.init(this.userId);
    Quests.init(this.userId);
    Stronghold.init(this.userId);
  },
  "game.reset": function() {
    Bursar.clear(this.userId);
    Combat.clear(this.userId);
    Heroes.clear(this.userId);
    Hires.clear(this.userId);
    Inventory.clear(this.userId);
    Quests.clear(this.userId);
    Stronghold.clear(this.userId);
  },
  "game.restart": function() {
    const uid = this.userId;
    Bursar.clear(uid, () => {
      Bursar.init(uid);
    });
    Combat.clear(uid, () => {
      Combat.init(uid);
    });
    Heroes.clear(uid);
    Hires.clear(uid, () => {
      Hires.init(true);
    });
    Inventory.clear(uid, () => {
      Inventory.init(uid);
    });
    Quests.clear(uid, () => {
      Quests.init(uid);
    });
    Stronghold.clear(uid, () => {
      Stronghold.init(uid);
    });
  }
});
