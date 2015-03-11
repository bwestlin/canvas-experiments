
var renderFire = (function () {
  var numRandom = 12373;
  var randBound = 50;
  var randomArray = [];
  var randomIndex = 0;
  for (var r = 0; r < numRandom; r++) {
    randomArray.push((Math.random() * randBound * 2 - (randBound - 1)) | 0)
  }

  var startMillisec = new Date().getTime();

  return function(ctx) {
    var canvas = ctx.canvas;
    var w = canvas.width;
    var h = canvas.height;
    var currMillisec = new Date().getTime();
    var time = (currMillisec - startMillisec) / 10000.0;

    ctx.fillStyle = "#FFFFFF";

    for (var a = 0; a < 360; a += 45) {
      var radiusFac = 0.6 + Math.cos(time) * 0.4;
      var x = (w >> 1) + Math.sin(a * Math.PI / 180 + time) * (radiusFac * (w >> 1) - 20);
      var y = (h >> 1) + 10 + Math.cos(a * Math.PI / 180 + time) * (radiusFac * (h >> 1) - 30);
      ctx.beginPath();
      ctx.arc(x, y, 6 + Math.cos(time) * 4, 0, Math.PI * 2, false);
      ctx.fill();

    }

    var imageData = ctx.getImageData(0, 0, w, h);
    var data = imageData.data;

    var min = randBound;
    var max = 255 - randBound;
    for (var y = 1; y < h - 1; y++) {
      for (var x = 0; x < w; x++) {
        var dataPos = (y * w * 4) + (x * 4);

        var color = ((data[dataPos - 4] + data[dataPos] + data[dataPos + 4] + data[dataPos + (w << 2)]) >> 2) | 0;

        if (color > min && color < max) {
          var rand = randomArray[randomIndex++];
          if (randomIndex >= numRandom) randomIndex = 0;
          color -= rand;
        }
        else if (color > 0) color -= 1;

        data[dataPos + 0] = color;
        data[dataPos + 1] = 0;//color;
        data[dataPos + 2] = 0;//color;
        data[dataPos + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

  };
})();

$(window).load(function() {
  $("#fire-canvas").canvasAnimation({
    renderer: renderFire,
    noClear: true,
    showFps: true
  });
});