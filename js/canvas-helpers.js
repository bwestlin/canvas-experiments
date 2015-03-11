window.requestAnimFrame = (function() {
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

    return function(lastFrameMillisec) {

      var ctx = canvasElem.getContext("2d");

      if (settings.bgColor) {
        ctx.save();

        if (!settings.noClear) {
          ctx.fillStyle = settings.bgColor;
          ctx.fillRect(0, 0, canvasElem.width, canvasElem.height);
        }
        ctx.restore();
      }
      else if (!settings.noClear) {
        ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
        //canvasElem.width = canvasElem.width;
      }

      ctx.save();
      try {
        settings.renderer(ctx, lastFrameMillisec);
      }
      catch (e) {
        console.error(e);
      }
      ctx.restore();

      if (settings.showFps) {
        var fps = 1000 / lastFrameMillisec;
        if (fps) {
          ctx.save();
          ctx.font = "bold 20px 'Helvetica Neue', Helvetica, Arial, sans-serif";
          var fpsText = "Fps: " + fps.toFixed(1 );
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#444444';
          ctx.fillText(fpsText, 10, 22);
          ctx.strokeText(fpsText, 10, 22);
          ctx.restore();
        }
      }
    }
  }

  /**
   *
   * @param options The options
   * @param {function} options.renderer The rendering function
   * @param {boolean} options.displayFps Display fps (frames per second) or not
   * @param {string} options.scaling Apply a scaling mechanism
   * @param {string} options.bgColor Use a specific background color
   * @param {boolean} options.noClear Skip clearing of background on each frame
   * @param {boolean} options.showFps Show frames per second
   */
  $.fn.canvasAnimation = function(options) {

    var defaults = {
      renderer: function (ctx) {},
      displayFps: false,
      scaling: null,
      bgColor: null,
      noClear: false,
      showFps: false
    };

    var settings = $.extend({}, defaults, options);

    return this.each(function() {
      AnimationHelper.registerAnimCallback(createCanvasRenderer(this, settings));
      AnimationHelper.startAnim();
    });
  };

})(jQuery);