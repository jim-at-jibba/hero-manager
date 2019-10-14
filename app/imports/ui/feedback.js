import {Template} from 'meteor/templating';

import './feedback.html';

const disqusURL = 'http://hero.gravitywell-hub.co.uk/';
const disqusIdentifier = 'heromanager_feedback';

Template.feedback.onRendered(function() {
  console.log('rendered');

  if (window.DISQUS) {
    window.DISQUS.reset({
      reload: true,
      config: function () {
        this.page.url = disqusURL;
        this.page.identifier = disqusIdentifier;
      }
    });
  } else {
    window.disqus_config = function () {
      this.page.url = disqusURL;
      this.page.identifier = disqusIdentifier;
    };

    let d = document, s = d.createElement('script');

    s.src = '//heromanager.disqus.com/embed.js';

    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  }
});
