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

    var offscreenBufferRequired = false;
    var offscreenCanvas;

    var indexedColorConfig = settings.renderer.indexedColorConfig;
    var palette;
    if (indexedColorConfig) {
      offscreenBufferRequired = true;

      palette = [];
      var numColors = Math.pow(2, indexedColorConfig.paletteBits || 8) | 0;
      var paletteGen = indexedColorConfig.paletteGenerator;
      for (var idx = 0; idx < numColors; idx++) {
        var r = Math.max(0, Math.min(paletteGen.red(idx), 255)) | 0;
        var g = Math.max(0, Math.min(paletteGen.green(idx), 255)) | 0;
        var b = Math.max(0, Math.min(paletteGen.blue(idx), 255)) | 0;
        palette.push([r, g, b]);
      }
    }

    return function(lastFrameMillisec) {

      var idx;
      var w = canvasElem.width;
      var h = canvasElem.height;
      var screenCtx = canvasElem.getContext("2d");

      if (settings.bgColor) {
        screenCtx.save();

        if (!settings.noClear) {
          screenCtx.fillStyle = settings.bgColor;
          screenCtx.fillRect(0, 0, w, h);
        }
        screenCtx.restore();
      }
      else if (!settings.noClear) {
        screenCtx.clearRect(0, 0, w, h);
        //canvasElem.width = canvasElem.width; // Another way to clear the canvas
      }

      if (offscreenBufferRequired && !offscreenCanvas) {
        offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = w;
        offscreenCanvas.height = h;
        var tmpCtx = offscreenCanvas.getContext('2d');
        tmpCtx.fillStyle = settings.bgColor || "#000000";
        tmpCtx.fillRect(0, 0, w, h);
      }

      var offscreenCtx = offscreenCanvas ? offscreenCanvas.getContext('2d') : null;

      // Let the configured renderer draw
      var renderCtx = offscreenCtx || screenCtx;
      renderCtx.save();
      settings.renderer(renderCtx, lastFrameMillisec);
      renderCtx.restore();

      // Map pixels through palette if it exists
      if (palette && offscreenCtx) {
        var screenImageData = screenCtx.getImageData(0, 0, w, h);
        var screenData = screenImageData.data;
        var offscreenImageData = offscreenCtx.getImageData(0, 0, w, h);
        var offscreenData = offscreenImageData.data;

        var num = w * 4  * h;
        for (idx = 0; idx < num; idx += 4) {
          var color = offscreenData[idx];
          screenData[idx + 0] = palette[255 - color][0];
          screenData[idx + 1] = palette[255 - color][1];
          screenData[idx + 2] = palette[255 - color][2];
          screenData[idx + 3] = 255;
        }

        screenCtx.putImageData(screenImageData, 0, 0);
        //screenCtx.putImageData(offscreenImageData, 0, 0);
      }

      // Display FPS
      if (settings.showFps) {
        var fps = 1000 / lastFrameMillisec;
        if (fps) {
          screenCtx.save();
          screenCtx.font = "bold 20px 'Helvetica Neue', Helvetica, Arial, sans-serif";
          var fpsText = "Fps: " + fps.toFixed(1 );
          screenCtx.fillStyle = '#FFFFFF';
          screenCtx.strokeStyle = '#444444';
          screenCtx.fillText(fpsText, 10, 22);
          screenCtx.strokeText(fpsText, 10, 22);
          screenCtx.restore();
        }
      }

      // Display palette
      if (palette && !!indexedColorConfig.displayPalette) {
        screenCtx.save();
        for (idx = 0; idx < palette.length; idx++) {
          screenCtx.beginPath();
          screenCtx.fillStyle = "rgb(" + palette[idx][0] + "," + palette[idx][1] + "," + palette[idx][2] + ")";
          screenCtx.rect(idx, 0, 1, 20);
          screenCtx.fill();
        }
        screenCtx.restore();
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

    function scaleCanvas(canvasElem, scaling) {
      var wrap = canvasElem.parentNode;
      var scaleX = window.innerWidth / canvasElem.width;
      var scaleY = window.innerHeight / canvasElem.height;

      var scale = 1;
      switch (scaling) {
        case "cover-window":
          scale = Math.max(scaleX, scaleY);
          break;
        case "fit-window":
        default:
          scale = Math.min(scaleX, scaleY);
      }

      wrap.style.transformOrigin = "0 0"; //scale from top left
      wrap.style.transform = "scale(" + scale + ")";
    }

    return this.each(function() {
      var canvasElem = this;
      if (!!settings.scaling) {
        var $wrap = $("<div></div>").css({
          "width": canvasElem.width + "px",
          "height": canvasElem.height + "px"
        });
        $(canvasElem).css("position", "absolute").wrap($wrap);
        function scaleThisCanvas() {
          scaleCanvas(canvasElem, settings.scaling);
        }
        $(window).resize(scaleThisCanvas);
        scaleThisCanvas();
      }

      AnimationHelper.registerAnimCallback(createCanvasRenderer(canvasElem, settings));
      AnimationHelper.startAnim();
    });
  };

})(jQuery);