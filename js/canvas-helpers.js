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