
var renderFire = (function () {
  var numRandom = 12373;
  var randBound = 50;
  var randomArray = [];
  var randomIndex = 0;
  for (var r = 0; r < numRandom; r++) {
    randomArray.push((Math.random() * randBound * 2 - (randBound - 1)) | 0)
  }

  var startMillisec = new Date().getTime();

  function funSum(funs) {
    return function (a) {
      var res = 0;
      for (var fi = 0; fi < funs.length; fi++) res += funs[fi](a);
      return res;
    }
  }

  var renderer = function(ctx) {
    var canvas = ctx.canvas;
    var x, y;
    var w = canvas.width;
    var h = canvas.height;
    var currMillisec = new Date().getTime();
    var time = (currMillisec - startMillisec) / 10000.0;

    ctx.fillStyle = "#FFFFFF";

    for (var a = 0; a < 360; a += 45) {
      var radiusFac = 0.6 + Math.cos(time) * 0.4;
      x = (w >> 1) + Math.sin(a * Math.PI / 180 + time) * (radiusFac * (w >> 1) - 20);
      y = (h >> 1) + 10 + Math.cos(a * Math.PI / 180 + time) * (radiusFac * (h >> 1) - 30);
      ctx.beginPath();
      ctx.arc(x, y, 6 + Math.cos(time) * 4, 0, Math.PI * 2, false);
      ctx.fill();
    }

    var imageData = ctx.getImageData(0, 0, w, h);
    var data = imageData.data;

    var min = randBound;
    var max = 255 - 1; //randBound;
    for (y = 1; y < h - 1; y++) {
      for (x = 0; x < w; x++) {
        var dataPos = (y * w * 4) + (x * 4);

        var color = ((data[dataPos - 4] + data[dataPos] + data[dataPos + 4] + data[dataPos + (w << 2)]) >> 2) | 0;

        if (color > min && color < max) {
          var rand = randomArray[randomIndex++];
          if (randomIndex >= numRandom) randomIndex = 0;
          color -= rand;
          if (color > 255) color = 255;
          if (color < 0) color = 0;
        }
        else if (color > 0) color -= 1;

        data[dataPos + 0] = color;
        data[dataPos + 1] = color;
        data[dataPos + 2] = color;
        data[dataPos + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  renderer.indexedColorConfig = {
    paletteBits: 8,
    //displayPalette: true,
    paletteGenerator: {
      red: funSum([
        function (i) {
          //return 0;
          var a = ((i) * 0.5) * (256 / 360);
          return a >= 0 && a < 180 ? Math.cos(a * Math.PI / 180) * 256 : 0;
        }
      ]),
      green: funSum([
        function (i) {
          //return 0;
          var a = ((i) * 1.3) * (256 / 360);
          return a >= 0 && a < 180 ? Math.cos(a * Math.PI / 180) * 256 : 0;
        }
      ]),
      blue: funSum([
        function (i) {
          //return 0;
          var a = ((i) * 4) * (256 / 360);
          return a >= 0 && a < 180 ? Math.cos(a * Math.PI / 180) * 256 : 0;
        },
        function (i) {
          //return 0;
          var a = ((216 - i) * 4) * (256 / 360);
          return i > 127 ? Math.cos(a * Math.PI / 180) * 64 : 0;
        }
      ])
    }
  };

  return renderer;
})();

$(window).load(function() {
  $("#fire-canvas").canvasAnimation({
    renderer: renderFire,
    noClear: true,
    showFps: true,
    scaling: "fit-window"
  });
});