'use strict';

console.log('running');

 $.getScript('core.js')
    .done(function(script, textStatus) {
      console.log(textStatus);
      script.initialize();
    })
    .fail(function(jqxhr, settings, exception) {
      console.error('Trigger ajax error: ' + exception);
    });
