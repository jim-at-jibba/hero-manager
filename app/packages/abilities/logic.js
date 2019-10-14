// app/imports/api/abilities/logic.js

import U from 'meteor/game:utilities';

const getPrimaryAbilityData = (U) => ({
  'Clumsy Assault': {
    type: '',
    rarity: 50,
    description: 'Attack the enemy for up to 80% of your power.',
    call: function(caster, enemy, baseDamage = 0) {
      let rand = Math.floor(caster.power * 0.8);
      let damage = baseDamage < rand ?
        U.num(baseDamage, rand) :
        U.num(rand, baseDamage);
      return damage;
    }
  },
  'Attack I': {
    type: '',
    rarity: 900,
    description: 'Attack the enemy for 110 - 140% of your power.',
    call: function(caster, enemy, baseDamage = 0) {
      let damage = Math.ceil((caster.power + baseDamage) * U.num(110, 140) / 100);
      return damage;
    }
  },
  'Attack II': {
    type: '',
    rarity: 100,
    description: 'Attack the enemy for 120 - 170% of your power.',
    call: function(caster, enemy, baseDamage = 0) {
      let damage = Math.ceil((caster.power + baseDamage) * U.num(120, 170) / 100);
      return damage;
    }
  },
});

const getPassiveAbilityData = (Bursar) => ({
  'Acrobatic': {
    class: 'Rogue',
    type: '',
    rarity: 50,
    triggers: ['onDamageApply'],
    description: '20% change to avoid taking damage.',
    call: function(force = false) {
      if (force || U.d3() === 3) {
        this.battle.events.push(`${this.enemy.name} dodges ${this.caster.name}'s attack.`);
        this.damage = 0;

        this.battle.combatNotices.push({
          type: 'dodge',
          character: this.enemy.id,
          value: 'dodge',
        });
      }
    }
  },
  'Bully': {
    class: 'Fighter',
    type: '',
    rarity: 50,
    triggers: ['onAttack'],
    description: 'Deals an additional 50% damage when above 80% health.',
    call: function () {
      if (this.caster.health / this.caster.maxHealth * 100 > 80) {
        this.damage *= 1.5;

        this.battle.combatNotices.push({
          type: 'effect',
          character: this.enemy.id,
          value: 'Getting pushed around',
        });
      }
    }
  },
  'Bitter End': {
    class: 'Barbarian',
    type: '',
    rarity: 50,
    triggers: ['onDamageApply'],
    description: 'Reduce all damage by 50% when below 25% health.',
    call: function() {
      if (this.enemy.health / this.enemy.maxHealth * 100 < 25) {
        this.damage = Math.floor(this.damage / 2);

        this.battle.combatNotices.push({
          type: 'special',
          character: this.enemy.id,
          value: 'Bitter end',
        });
      }
    }
  },
  'Capitalize': {
    class: 'Rogue',
    type: '',
    rarity: 50,
    triggers: ['onAttack'],
    description: '5% chance to deal triple damage on attack.',
    call: function(force = false) {
      if (force || U.d20() === 20) {
        this.damage *= 3;
        this.battle.events.push(`${this.caster.name} lands a deadly blow.`);

        this.battle.combatNotices.push({
          type: 'effect',
          character: this.enemy.id,
          value: 'Deadly blow',
        });
      }
    }
  },
  'From The Brink': {
    class: 'Paladin',
    type: '',
    rarity: 50,
    triggers: ['onDamageApply'],
    description: 'Once per quest, If damage would reduce this hero below 10% health, restore all life.',
    call: function() {
      let identifier = 'From The Brink_' + this.enemy.id;
      if (this.battle.store.hasOwnProperty(identifier)) {
        return;
      }
      if (this.enemy.health - this.damage < this.enemy.maxHealth / 10) {
        this.damage = 0;
        this.enemy.health = this.enemy.maxHealth;
        this.battle.store[identifier] = {
          activated: true
        };
        this.battle.events.push(`${this.enemy.name} is saved from the brink by divine forces.`);
        this.battle.combatNotices.push({
          type: 'heal',
          character: this.enemy.id,
          value: this.enemy.maxHealth,
        });
      }
    }
  },
  'Gale Force': {
    class: 'Sorcerer',
    type: '',
    rarity: 15,
    triggers: ['onAttack'],
    description: 'Uses a powerful wind attack once per encounter',
    call: function() {
      let identifier = 'Gale Force_' + this.caster.id;
      if (this.battle.store.hasOwnProperty(identifier)) {
        if (this.battle.store[identifier].enemy === this.enemy.id) {
          return;
        } else {
          this.battle.store[identifier].enemy = this.enemy.id;
        }
      } else {
        this.battle.store[identifier] = {
          enemy: this.enemy.id
        };
      }

      this.damage = (1 + this.caster.level / 10) * this.enemy.maxHealth * 0.1;

      this.battle.events.push(`${this.caster.name} batters ${this.enemy.name} with hurricane speed winds.`);
    }
  },
  'Healing Aura': {
    class: 'Cleric',
    type: '',
    rarity: 50,
    triggers: ['onTurnEnd'],
    description: 'Heals each member of your party for 3% of their maximum health at the end of your turn.',
    call: function() {
      let _this = this;
      this.party.forEach(x => {
        if (x.health > 0) {
          let amount = Math.ceil(x.maxHealth * 0.03);
          x.health = x.health + amount > x.maxHealth ?
            x.maxHealth :
            x.health + amount;
          _this.battle.combatNotices.push({
            type: 'heal',
            character: x.id,
            value: amount,
          });
        }
      });
    }
  },
  'Infernal Assistance': {
    class: 'Warlock',
    type: '',
    rarity: 15,
    triggers: ['onEncounterStart'],
    description: 'Summon a Daemonic ally at the beginning of each encounter.',
    call: function() {
      let demon = this.helpers.create({
        temporary: true,
        battleId: this.battle.id,
        name: U.capitalize(U.word()),
        power: U.num(Math.ceil(this.caster.power * 0.05), Math.ceil(this.caster.power * 0.15)),
        health: U.num(Math.ceil(this.caster.maxHealth * 0.05), Math.ceil(this.caster.maxHealth * 0.15)),
        level: this.caster.level,
        primaryAbility: 'Clumsy Assault',
        passives: [],
        type: 'summon-demon'
      });

      this.battle.events.push(`The demon ${demon.name} is summoned to fight for you.`);
      this.battle.roster.push(demon.id);
      this.party.push(demon);
    }
  },
  'Inner Peace': {
    class: 'Mystic',
    type: '',
    rarity: 50,
    triggers: ['onTurnEnd'],
    description: 'Heals for 3% of your maximum health at the end of your turn.',
    call: function() {
      if (this.caster.health > 0) {
        let amount = Math.ceil(this.caster.maxHealth * 0.03);
        this.caster.health = this.caster.health + amount > this.caster.maxHealth ?
          this.caster.maxHealth :
          this.caster.health + amount;

        this.battle.combatNotices.push({
          type: 'heal',
          character: this.caster.id,
          value: amount,
        });
      }
    }
  },
  'Inspiring Song': {
    class: 'Bard',
    type: '',
    rarity: 50,
    triggers: ['onAllyAttack'],
    description: 'Attacking allies deal 20% more damage',
    call: function() {
      this.damage *= 1.2;
    }
  },
  'Iron Will': {
    class: 'Fighter',
    type: '',
    rarity: 50,
    triggers: ['onDamageApply'],
    description: 'Reduce all damage received by 3% of your maximum health.',
    call: function() {
      let reduction = Math.ceil(this.enemy.maxHealth * 0.03);
      this.damage = this.damage - reduction >= 0 ? this.damage - reduction : 0;
    }
  },
  "Man's Best Friend": {
    class: 'Ranger',
    type: '',
    rarity: 50,
    triggers: ['onEncounterStart'],
    description: 'Summon a hound to fight by your side for the duration of a quest',
    call: function() {
      let identifier = "Man's Best Friend_" + this.caster.id;
      if (this.battle.store.hasOwnProperty(identifier)) {
        return;
      }
      let hound = this.helpers.create({
        temporary: true,
        battleId: this.battle.id,
        name: U.dogName(),
        power: U.num(Math.ceil(this.caster.power * 0.25), Math.ceil(this.caster.power * 0.5)),
        health: U.num(Math.ceil(this.caster.maxHealth * 0.25), Math.ceil(this.caster.maxHealth * 0.5)),
        level: this.caster.level,
        primaryAbility: 'Attack I',
        passives: [],
        type: 'summon-hound',
        npc: true,
        meta: {
          img: '/character-art/hound_hm_v1.png'
        }
      });

      this.battle.store[identifier] = {
        activated: true
      };
      this.battle.events.push(`${this.caster.name}'s faithful hound ${hound.name} wags it's tail and waits for a command.`);
      this.battle.roster.push(hound.id);
      this.party.push(hound);
    }
  },
  'Merciless': {
    class: 'Fighter',
    type: '',
    rarity: 50,
    triggers: ['onAttack'],
    description: 'Damage is doubled against enemies below 30% health.',
    call: function() {
      if (this.enemy.health / this.enemy.maxHealth * 100 < 30) {
        this.battle.events.push(`${this.caster.name} shows no mercy!`);
        this.damage *= 2;

        this.battle.combatNotices.push({
          type: 'special',
          character: this.caster.id,
          value: 'Merciless',
        });
      }
    }
  },
  'Penitent': {
    class: 'Cleric',
    type: '',
    rarity: 5,
    triggers: ['Finance'],
    description: 'Doesn\'t require payment for quests.',
    call: () => {
    }
  },
  'Pickpocket': {
    class: 'Rogue',
    type: '',
    rarity: 50,
    triggers: ['onAttack'],
    description: '20% chance to steal gold when attacking.',
    call: function(force = false) {
      if (force || U.d10() >= 8) {
        let amount = (4 + this.caster.level) * U.d10();
        Bursar.transaction(amount, 'pickpocket', this.caster.id, this.caster.userId);
        this.battle.events.push(`${this.caster.name} pickpockets ${amount} gold.`);

        this.battle.combatNotices.push({
          type: 'effect',
          character: this.enemy.id,
          value: 'Give me my wallet back!',
        });
      }
    }
  },
  'Pyromancer': {
    class: 'Mage',
    type: '',
    rarity: 35,
    triggers: ['onAttack'],
    description: 'Cast a huge fireball at the beginning of an encounter.',
    call: function() {
      let identifier = 'Pyromancer_' + this.caster.id;
      if (this.battle.store.hasOwnProperty(identifier)) {
        if (this.battle.store[identifier].enemy === this.enemy.id) {
          return;
        } else {
          this.battle.store[identifier].enemy = this.enemy.id;
        }
      } else {
        this.battle.store[identifier] = {
          enemy: this.enemy.id
        };
      }

      this.damage = 8 * (1 + this.caster.level / 10);

      this.battle.events.push(`${this.caster.name} casts a huge fireball at ${this.enemy.name}.`);
    }
  },
  'Shapeshifter': {
    class: 'Druid',
    type: '',
    rarity: 25,
    triggers: ['onAttack', 'onDamageApply'],
    description: 'Take on the form of a fierce woodland creature when in battle, resisting attacks and dealing additional damage.',
    call: function(force = false) {
      if (this.caster.passives.indexOf('Shapeshifter') > -1) {
        this.damage *= 1.1;
      } else if (force || U.d3() === 3) {
        let reduction = Math.ceil(this.enemy.maxHealth * 0.03);
        this.damage -= reduction;
        if (this.damage < 0) {
          this.damage = 0;
        }
      }
    }
  },
  'Sword Mastery': {
    class: 'Fighter',
    type: '',
    rarity: 25,
    triggers: ['onAttack'],
    description: 'Deal 20% more damage when equipped with a sword.',
    call: function() {
      if (
        this.caster.equipment &&
        this.caster.equipment.filter(x => x.equipmentType === 'sword').length
      ) {
        this.damage *= 1.2;
      }
    }
  },
  'Dagger Mastery': {
    class: 'Rogue',
    type: '',
    rarity: 25,
    triggers: ['onAttack'],
    description: 'Deal 20% more damage when equipped with a dagger.',
    call: function() {
      if (
        this.caster.equipment &&
        this.caster.equipment.filter(x => x.equipmentType === 'dagger').length
      ) {
        this.damage *= 1.2;
      }
    }
  },
});

const getPartyPassiveLoader = () => {
  return (Passives, party, trigger) => {
    let partyPassives = party.reduce((carry, hero) => {
      var passives = [];
      passives = hero.passives.reduce((carry, item) => {
        let p = Passives.get(item);
        if (p.get('triggers').toJS().indexOf(trigger) > -1) {
          carry.push({
            passive: p,
            hero: hero
          });
        }
        return carry;
      }, []);
      return carry.concat(passives);
    }, []);

    return partyPassives;
  };
};

const triggerPartyPassives = (party, battle, create, partyPassives) => {
  partyPassives.forEach(item => {
    let bundle = {
      caster: item.hero,
      party,
      battle,
      helpers: {
        create,
      }
    };
    item.passive.get('call').apply(bundle);
  });
};

const getBaseDamage = (hero) => {
  let dmg = 0;
  if (hero.equipment.length) {
    let [min, max] = hero.equipment.reduce(([min, max], item) => {
      min += item.min;
      max += item.max;
      return [min, max];
    }, [0, 0]);

    dmg = U.num(min, max);
  }

  return dmg;
};

export default {
  getPrimaryAbilityData,
  getPassiveAbilityData,
  getPartyPassiveLoader,
  getBaseDamage,
  triggerPartyPassives,
};
