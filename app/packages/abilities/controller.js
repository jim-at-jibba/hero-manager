// app/imports/api/abilities/controller.js

import Immutable from 'immutable';
import R from 'ramda';
import U from 'meteor/game:utilities';
import {engine} from 'meteor/game:character';
import {Bursar} from 'meteor/game:bursar';

import Logic from './logic';

const Primaries = Immutable.fromJS(Logic.getPrimaryAbilityData(U));
const Passives = Immutable.fromJS(Logic.getPassiveAbilityData(Bursar));
const create = engine({Primaries, Passives});

const partyPassiveLoader = Logic.getPartyPassiveLoader();

const getEquipmentPassives = (hook, equipment) => {
  let eqp = equipment.reduce((carry, item) => {
    if (item.passives && Array.isArray(item.passives)) {
      item.passives.forEach(function(passive) {
        if (R.contains(hook, passive.triggers)) {
          carry.push(passive);
        }
      });

      return carry;
    }
    if (item.passives && R.contains(hook, item.passives.triggers)) {
      carry.push(item.passives);
    }
    return carry;
  }, []);

  return eqp;
};

// the party and battle variables are passed by reference
const triggerOnEncounterStart = (party, battle) => {
  let partyPassives = partyPassiveLoader(Passives, party, 'onEncounterStart');
  Logic.triggerPartyPassives(party, battle, create, partyPassives);
};

const triggerOnTurnEnd = (caster, party, battle) => {
  let passives = caster.passives.reduce((carry, item) => {
    let p = Passives.get(item);
    if (R.contains('onTurnEnd', p.get('triggers').toJS())) {
      carry.push(p);
    }
    return carry;
  }, []);
  passives.forEach(p => {
    p.get('call').apply({caster, party, battle});
  });

  let equipmentPassives = getEquipmentPassives('onTurnEnd', caster.equipment);
  equipmentPassives.forEach(p => {
    eval(p.call).apply({caster, party, battle});
  });
};

const buffHook = (hook, context) => {
  if (hook === 'onAllyAttack') {
    let partyPassives = context.party.reduce((carry, item) => {
      var passives = [];
      if (item.health > 0 && item.id !== context.caster.id) {
        passives = item.passives.reduce((carry, item) => {
          let p = Passives.get(item);
          if (R.contains('onAllyAttack', p.get('triggers').toJS())) {
            carry.push(p);
          }
          return carry;
        }, []);
      }
      return carry.concat(passives);
    }, []);
    partyPassives.forEach(p => {
      p.get('call').apply(context);
    });
    let equipmentPassives = context.party.reduce((carry, hero) => {
      var passives = [];
      if (hero.health > 0 && hero.id !== context.caster.id) {
        passives = getEquipmentPassives('onAllyAttack', hero.equipment);
      }
      return carry.concat(passives);
    }, []);
    equipmentPassives.forEach(p => {
      eval(p.call).apply(context);
    });
  } else if (hook === 'onDamageApply') {
    let passives = context.enemy.passives.reduce((carry, item) => {
      let p = Passives.get(item);
      if (R.contains('onDamageApply', p.get('triggers').toJS())) {
        carry.push(p);
      }
      return carry;
    }, []);
    passives.forEach(p => {
      p.get('call').apply(context);
    });

    let equipmentPassives = getEquipmentPassives('onDamageApply', context.enemy.equipment);
    equipmentPassives.forEach(p => {
      eval(p.call).apply(context);
    });
  } else if (hook === 'onAttack') {
    let passives = context.caster.passives.reduce((carry, item) => {
      let p = Passives.get(item);
      if (R.contains('onAttack', p.get('triggers').toJS())) {
        carry.push(p);
      }
      return carry;
    }, []);
    passives.forEach(p => {
      p.get('call').apply(context);
    });

    let equipmentPassives = getEquipmentPassives('onAttack', context.caster.equipment);
    equipmentPassives.forEach(p => {
      eval(p.call).apply(context);
    });
  }
};

const usePrimary = (caster, enemy, party, battle) => {
  const ability = Primaries.get(caster.primaryAbility).toJS();
  let baseDamage = Logic.getBaseDamage(caster);
  let damage = ability.call.apply({party, battle}, [caster, enemy, baseDamage]);
  // Bundling damage into an object allows us to pass it by reference.
  let bundle = {damage, caster, enemy, party, battle};
  // Attach helpers for use within function calls
  bundle.helpers = {
    create,
  };
  buffHook('onAttack', bundle);
  buffHook('onAllyAttack', bundle);
  buffHook('onDamageApply', bundle);
  buffHook('onDamageResolve', bundle);

  // Only allow integers for damage.
  bundle.damage = Math.ceil(bundle.damage);

  battle.combatNotices.push({
    type: 'damage',
    character: enemy.id,
    value: bundle.damage,
  });

  enemy.health = enemy.health - bundle.damage < 0 ?
    0 :
    enemy.health - bundle.damage;
};

const Abilities = {
  buffHook,
  usePrimary,
  triggerOnTurnEnd,
  triggerOnEncounterStart,
  Passives,
  Primaries
};

export default Abilities;
