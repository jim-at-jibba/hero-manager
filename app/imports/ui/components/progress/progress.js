import {Template} from 'meteor/templating';
import './progress.html';

const percent = (a, b) => Math.round(a / b * 100);

Template['x-component-progress'].helpers({
  getPercentage: function() {
    if (this.progress) {
      return this.progress;
    } else {
      return percent(this.current, this.max);
    }
  },
  colorClass: function() {
    if (this.color) {
      return this.color.toLowerCase();
    }
    let val = percent(this.current, this.max);
    if (val >= 50) {
      return 'green';
    }
    if (val >= 25) {
      return 'orange';
    }

    return 'red';
  }
});
