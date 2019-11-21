import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import R from "ramda";

import U from "meteor/game:utilities";
import { Inventory } from "meteor/game:items";
import { questEntityActions } from "meteor/game:wordlists";
import { questEntities } from "meteor/game:wordlists";
import { questObjectActions } from "meteor/game:wordlists";
import { questObjects } from "meteor/game:wordlists";
import { Monster } from "meteor/game:monster";
import { Zones } from "meteor/game:zones";

const QuestsCollection = new Mongo.Collection("quests");

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("quests", function() {
    return QuestsCollection.find({ userId: this.userId });
  });
}

const fillMonsterParty = (act = 1, length, zone, list = []) => {
  let collection = list.concat(Monster.generate(act, zone));
  return collection.length === length
    ? collection
    : fillMonsterParty(act, length, zone, collection);
};

const lootTable = rating => {
  let t = Inventory.lootTable(rating);
  return t;
};

const makeName = () => {
  let roll = U.d3();
  let name = "";
  if (roll === 2) {
    name = U.rand(questEntityActions) + " " + U.rand(questEntities);
  } else {
    name = U.rand(questObjectActions) + " " + U.rand(questObjects);
  }
  return name;
};

const generateQuest = (userId, act = 1) => {
  let zone = U.rand(Zones);
  // Group monsters into parties sorted by speed.
  let monsterList = R.range(1, U.num(2, 3))
    .map(() => fillMonsterParty(act, U.num(1, 4), zone))
    .sort((a, b) => a.speed < b.speed);

  let difficultyRating = Math.ceil(
    R.flatten(monsterList).reduce((x, y) => {
      return x + y.health * (y.power * 0.75);
    }, 0)
  );
  let reward = Math.ceil(
    (difficultyRating * 0.75 + U.num(0, 50)) * (1 + act / 10)
  );
  let location = U.rand(zone.coords);
  return {
    id: U.id(),
    userId: userId,
    progress: 0,
    status: "PENDING",
    started: null,
    ended: null,
    monsterList: monsterList,
    name: makeName(),
    reward: reward,
    loot: lootTable(difficultyRating),
    act: act,
    numberOfEncounters: monsterList.length,
    difficultyRating: difficultyRating,
    coordsX: location.x,
    coordsY: location.y,
    zone: zone
  };
};

const fillQuestList = (userId, act = 1, list = [], length = 10) => {
  return list.length === length
    ? list
    : fillQuestList(
        userId,
        act,
        list.concat(generateQuest(userId, act)),
        length
      );
};

const addNew = (userId, act = 1) => {
  QuestsCollection.insert(generateQuest(userId, act));
};

const addParty = (qid, party, userId = Meteor.userId()) => {
  QuestsCollection.update(
    { userId, id: qid },
    { $set: { "list.$.party": party } }
  );
};

const updateQuest = (id, keypath, value, userId = Meteor.userId()) => {
  let questList = QuestsCollection.findOne({ userId: userId }).list;
  let quest = R.find(R.propEq("id", id), questList);
  quest[keypath] = value;
  QuestsCollection.update({ userId }, { $set: { list: questList } });
};

const step = (() => {
  let _count = 0;

  return () => {
    _count++;
    if (_count >= 40) {
      _count = 0;

      const users = Meteor.users.find({}).fetch();

      // Adds a new quest for each act for each user.
      users.forEach(user => {
        let act = 0;

        while (act < 3) {
          act++;
          let len = QuestsCollection.find({ userId: user._id, act }).fetch()
            .length;
          if (len < 10) {
            addNew(user._id, act);
          }
        }
      });
    }
  };
})();

const init = userId => {
  if (!QuestsCollection.findOne({ userId })) {
    fillQuestList(userId, 1).forEach(quest => {
      QuestsCollection.insert(quest);
    });
    fillQuestList(userId, 2).forEach(quest => {
      QuestsCollection.insert(quest);
    });
    fillQuestList(userId, 3).forEach(quest => {
      QuestsCollection.insert(quest);
    });
  }
};

const list = (userId = Meteor.userId(), act = 1) => {
  return QuestsCollection.find({ userId, act }).fetch();
};

const clear = (userId, cb) => {
  QuestsCollection.remove({ userId }, () => {
    if (cb) {
      cb();
    }
  });
};

const remove = (userId, id) => {
  QuestsCollection.remove({ userId, id });
};

const get = (userId, id) => QuestsCollection.findOne({ userId, id });

const Quests = {
  get,
  clear,
  list,
  addNew,
  addParty,
  fillQuestList,
  updateQuest,
  remove,
  step,
  init
};

Meteor.methods({
  "quests.remove"(id) {
    let userId = this.userId;
    remove(userId, id);
  }
});

export { Quests, QuestsCollection };
