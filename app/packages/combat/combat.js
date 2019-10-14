import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import R from 'ramda';

import Abilities from 'meteor/game:abilities';
import U from 'meteor/game:utilities';
import {Bursar} from 'meteor/game:bursar';
import {Quests} from 'meteor/game:quests';
import {QuestsCollection} from 'meteor/game:quests';
import {Heroes} from 'meteor/game:heroes';
import {Hires} from 'meteor/game:hire';
import {Inventory} from 'meteor/game:items';
import {Notifications} from 'meteor/game:notifications';
import {Settings} from 'meteor/game:settings';

export const Battles = new Mongo.Collection('battles');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('battles', function() {
    return Battles.find({userId: this.userId});
  });
}

const init = () => {
};

Meteor.methods({
  'combat.start': function(selected, questId) {
    start(selected, questId, this.userId);
  }
});

const isOdd = num => num % 2 === 1;

const allDead = chars => R.all(x => R.lte(x.health, 0), chars);

const findNextActive = (index, roster) => {
  index = index + 1 >= roster.length ? 0 : index + 1;
  return roster[index].health > 0 ? index : findNextActive(index, roster);
};

const getQuestHealth = (monsters) => R.flatten(monsters).reduce((x, y) => x + y.health, 0);

const updateRoster = (party, userId) => {
  party.forEach((hero) => {
    hero.userId = userId;
    Heroes.update(userId, hero, true);
  });
};

// Sometimes bad things happen to heroes!
const unfortunateEvent = (battle, party, activeHero) => {
  const rand = U.num(1, 10);
  if (rand <= 2) {
    activeHero.health = 0;
    battle.events.push(U.rand([
      `${activeHero.name} stumbled and fell to their death!`,
      `${activeHero.name} suffered a sudden and unexpected heart attack.`,
      `${activeHero.name} tripped and fell on their own sword.`,
    ]));
    return;
  }
  if (rand <= 8) {
    let injury = U.num(1, activeHero.maxHealth);
    activeHero.health = activeHero.health - injury < 0 ?
      0 :
      activeHero.health - injury;
    battle.events.push(U.rand([
      `${activeHero.name} fumbled their attack and injured themselves.`,
      `A falling rock hits ${activeHero.name}.`,
      `${activeHero.name} is struck by lightning.`,
    ]));
    return;
  }
  if (rand > 8) {
    battle.events.push(`${activeHero.name} has accepted an offer of better salary and benefits and switches sides.`);
    battle.monsters[0].push(activeHero);
    battle.roster = battle.roster.filter((x) => x !== activeHero.id);
    let index = R.findIndex(R.propEq('id', activeHero.id))(party);
    party.splice(index, 1);
    battle.combatNotices.push({
      type: 'effect',
      character: activeHero.id,
      value: "It's just business",
    });
    Heroes.remove(activeHero.userId, activeHero.id);
    return;
  }
};

const questMaxHealth = (quest) => R.flatten(quest.monsterList).reduce((x, y) => x + y.health, 0);

let _clock = 0;
let processes = {};
const step = () => {
  _clock++;
  if (_clock < 5) {
    return;
  }
  _clock = 0;

  const all = Battles.find({}).fetch();

  if (all.length === 0) {
    return;
  }

  all.forEach(battle => {
    if (processes.hasOwnProperty(battle.id) && processes[battle.id]) {
      return;
    }
    processes[battle.id] = true;

    const userId = battle.userId;

    let party = Heroes.roster(userId).filter(
      x => R.contains(x.id, battle.roster)
    );

    if (battle.finished) {
      victory(battle.victory, battle, party, userId);

      Battles.remove({
        userId,
        id: battle.id
      });

      return;
    }

    battle.combatNotices = [];

    if (battle.turn === 1) {
      Abilities.triggerOnEncounterStart(party, battle);
    }

    // Attack priority is based on speed
    let hero = party[battle.activeMercenary];
    let monsterParty = battle.monsters[0];
    let monster = monsterParty[battle.activeMonster];

    // If we're into nonsense indexes for both heros and monsters, reset it.
    if (!hero && !monster) {
      battle.activeMonster = findNextActive(battle.activeMonster, monsterParty);
      battle.activeMercenary = findNextActive(battle.activeMercenary, party);
      hero = party[battle.activeMercenary];
      monster = monsterParty[battle.activeMonster];
    }

    // Ensure that the monster and hero aren't dead!
    if (hero && hero.health <= 0) {
      battle.activeMercenary = findNextActive(battle.activeMercenary, party);
      hero = party[battle.activeMercenary];
    }

    if (monster && monster.health <= 0) {
      battle.activeMonster = findNextActive(battle.activeMonster, monsterParty);
      monster = monsterParty[battle.activeMonster];
    }

    // Assume 0 speed if a nonsense index was used
    let heroSpeed = hero ? hero.speed : 0;
    let monsterSpeed = monster ? monster.speed : 0;

    // Find out who has priority
    if (heroSpeed >= monsterSpeed) {
      // There is potential for the hero to be undefined if the enemy has zero
      // or less speed
      if (!hero) {
        battle.activeMercenary = findNextActive(battle.activeMercenary, party);
        hero = party[battle.activeMercenary];
      }
      let [monster] = monsterParty.filter(x => x.health > 0);

      if (U.d1000() <= 25) {
        unfortunateEvent(battle, party, hero);
      } else {
        Abilities.usePrimary(hero, monster, party, battle);

        Abilities.triggerOnTurnEnd(hero, party, battle);
      }

      battle.activeCharacter = hero.id;
      battle.activeMercenary++;

    } else {
      // Attack random living hero
      let liveHeroes = party.filter(x => x.health > 0);
      if (liveHeroes.length) {
        hero = liveHeroes[U.num(1, liveHeroes.length) - 1];
        Abilities.usePrimary(monster, hero, monsterParty, battle);

        Abilities.triggerOnTurnEnd(monster, monsterParty, battle);

        battle.activeCharacter = monster.id;
        battle.activeMonster++;
      }
    }

    if (hero && isOdd(battle.turn)) {
      Abilities.triggerOnTurnEnd(hero, party, battle);
    }

    battle.progress = 100 - getQuestHealth(battle.monsters) / battle.monsterTotalHealth * 100;

    updateRoster(party, userId);

    if (hero && hero.health <= 0) {
      battle.events.push(`${hero.name} was slain.`);
    }

    if (monster && monster.health <= 0) {
      battle.events.push(`The enemy ${monster.name} was slain.`);
    }

    if (allDead(party)) {
      battle.finished = true;
      battle.victory = false;
    }

    if (allDead(battle.monsters[0])) {
      battle.turn = 0;
      battle.monsters = battle.monsters.slice(1);
      battle.activeMercenary = 0;
      battle.activeMonster = 0;
    }

    if (battle.monsters.length === 0) {
      battle.finished = true;
      battle.victory = true;
    }

    if (!battle.finished) {
      battle.turn += 1;
    }

    battle.events.forEach(function(event) {
      Notifications.battle(event, userId);
    });

    battle.events = [];

    delete battle._id;
    Battles.update(
      {userId, id: battle.id},
      battle
    );

    processes[battle.id] = false;

  });
};

const victory = (victory, battle, party, userId) => {
  let quest = QuestsCollection.findOne({userId, id: battle.quest});
  if (!quest) {
    return;
  }
  let questId = quest.id;
  let reward = quest.reward;
  if (victory) {
    Bursar.transaction(reward, 'quest', questId, userId);
    let salaryDeduction = party.reduce((carry, item) => {
      let wage = Math.ceil(reward * 0.05);
      Bursar.transaction(0 - wage, 'salary', item.id, userId);
      return carry + wage;
    }, 0);
    Inventory.addLootList(quest.loot, userId);
    Notifications.success(`Completed quest "${quest.name}" and received a reward of ${reward} gold. Your heroes took a cut of ${salaryDeduction} gold leaving you with ${reward - salaryDeduction} gold.`, userId);
    if (quest.difficultyRating > 700) {
      if (U.d6 >= 4) {
        let len = U.d3() + 1;
        let count = 1;
        while (count <= len) {
          Hires.addHire(userId);
          count++;
        }
        Notifications.success(`Word of your success has spread! ${len} new hero${len > 1 ? 'es' : ''} are available for hire.`, userId);
      }
    }
  } else {
    Notifications.danger(`Failed quest "${quest.name}".`, userId);
  }

  Quests.remove(userId, questId);
  // Quests.update(questId, 'ended', true, userId);

  party.forEach((hero) => {
    if (hero.temporary) {
      Heroes.remove(userId, hero.id);
    } else if (hero.health > 0) {
      hero.health = hero.maxHealth;
      hero.exp += Settings.expFromQuest(quest);
      Heroes.update(userId, hero, true);
    }
  });
};

const start = (selected, questId, userId) => {
  let quest = QuestsCollection.findOne({userId, id: questId});

  // Sanity check: don't run if the quest doesn't exist!
  if (!quest) {
    console.log('QUEST NOT FOUND');
    return;
  }

  // Sanity check: don't run if a battle for this quest already exists!
  if (Battles.findOne({quest: this.id})) {
    console.log('BATTLE ALREADY IN PROGRESS!');
    return;
  }

  let roster = Heroes.roster(userId).filter(x => R.contains(x.id, selected)).sort((a, b) => {
   return a.speed < b.speed;
  });

  let battle = {
    userId: userId,
    id: U.id(),
    running: true,
    turn: 1,
    victory: null,
    activeMercenary: 0,
    activeMonster: 0,
    monsters: quest.monsterList,
    quest: quest.id,
    progress: 0,
    monsterTotalHealth: questMaxHealth(quest),
    roster: roster.map(x => x.id),
    activeCharacter: null,
    events: [],
    combatNotices: [],
    store: {},
  };

  Battles.insert(battle);
};

const clear = (userId, cb) => {
  Battles.remove({userId}, () => {
    if (cb) {
      cb();
    }
  });
};

export const Combat = {
  clear,
  start,
  step,
  init
};
