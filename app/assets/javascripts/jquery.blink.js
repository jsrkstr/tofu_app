/**
 * Basic usage (Most common settings. {no max blinks = blink indefinitely, blinkDuration ~1 sec, no callback}):
 *
 *      $('selector').blink();
 *
 * Advanced usage:
 * 
 *      $('selector').blink({maxBlinks: 60, blinkPeriod: 1000, speed: 'slow', onMaxBlinks: function(){}, onBlink: function(){}}); 
 *
 * Stopping
 *      $('selector').blink({ stop: true); 
*/

(function( $ ) {
  $.fn.blink = function( options ) {

    var settings = {
      maxBlinks    : undefined,
      blinkPeriod  : 1000,
      onMaxBlinks  : function() {},
      onBlink      : function(i) {},
      speed        : undefined
    };

    if(this[0])
      this[0].stopped = false;
    else
      return this;

    if(options) {
      $.extend(settings, options);
      if(options.stop)
        this[0].stopped = true;
    }

    var blinkElem = this;
    var on = true;
    var blinkCount = 0;
    settings.speed = settings.speed ? settings.speed : settings.blinkPeriod/2;

    /* The function that does the actual fading. */
    (function toggleFade() {
      var maxBlinksReached = false;
      if(on){
        blinkElem.fadeTo(settings.speed, 0.01);
      } else {
        blinkCount++;
        maxBlinksReached = (settings.maxBlinks && (blinkCount >= settings.maxBlinks));
        blinkElem.fadeTo(settings.speed, 1, function() {
          settings.onBlink.call(blinkElem, blinkCount);
          if(maxBlinksReached) {
            settings.onMaxBlinks.call();
          }
        });
      }
      on = !on;

      if(!maxBlinksReached && !(blinkElem[0].stopped && on)) {
        setTimeout(toggleFade, settings.blinkPeriod/2); // #3
      }
    })();

    return this; // Returning 'this' to maintain chainability.
  };
})(jQuery);
