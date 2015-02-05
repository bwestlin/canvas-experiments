window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

var AnimationHelper = (function () {
  var callbacks = [];
  var animating = false;
  var lastTime = null;

  function registerAnimCallback(callback) {
    callbacks.push(callback);
  }

  function startAnim() {
    animating = true;
    startTime = null;
    requestAnimFrame(doAnimation);
  }

  function stopAnim() {
    animating = false;
  }

  function doAnimation(time) {
    var lastFrameMillisec = undefined;
    if (time) {
      if (lastTime) lastFrameMillisec = time - lastTime;
      lastTime = time;
    }
    for (var i = 0; i < callbacks.length; i++) callbacks[i](lastFrameMillisec);

    if (animating) {
      requestAnimFrame(doAnimation);
    }
  }

  return {
    registerAnimCallback: registerAnimCallback,
    startAnim: startAnim,
    stopAnim: stopAnim
  };
})();


/**
 * Canvas animation helper plugin
 */
(function($) {

  function createCanvasRenderer(canvasElem, settings) {
    var firstRender = true;
    var bgColorWithAlpha = !settings.bgColor || /^rgba/.test(settings.bgColor);

    return function(lastFrameMillisec) {

      var ctx = canvasElem.getContext("2d");
      if (settings.bgColor) {
        ctx.save();

        if (firstRender) {
          if (bgColorWithAlpha) {
            // TODO Need to get the rgb without a from the color
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvasElem.width, canvasElem.height);
          }
          firstRender = false;
        }

        ctx.fillStyle = settings.bgColor;
        ctx.fillRect(0, 0, canvasElem.width, canvasElem.height);
        ctx.restore();
      }
      else {
        ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
      }

      ctx.save();

      try {
        settings.renderer(ctx, lastFrameMillisec);
      }
      catch (e) {
        console.error(e);
      }

      ctx.restore();
    }

  }

  /**
   *
   * @param options The options
   * @param {function} options.renderer The rendering function
   * @param {boolean} options.displayFps Display fps (frames per second) or not
   * @param {string} options.scaling Apply a scaling mechanism
   * @param {string} options.bgColor Use a specific background color
   */
  $.fn.canvasAnimation = function(options) {

    var defaults = {
      renderer: function (ctx) {},
      displayFps: false,
      scaling: null,
      bgColor: null
    };

    var settings = $.extend( {}, defaults, options );

    return this.each(function() {
      AnimationHelper.registerAnimCallback(createCanvasRenderer(this, settings));
      AnimationHelper.startAnim();
    });
  };

})(jQuery);