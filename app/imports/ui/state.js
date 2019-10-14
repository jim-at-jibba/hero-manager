import {ReactiveDict} from 'meteor/reactive-dict';

export const State = new ReactiveDict();

State.set({
  'selectedQuest': null,
  'loading': true,
  'selectedMercs': [],
});

State.setDefault({
  'tab': 1,
});
