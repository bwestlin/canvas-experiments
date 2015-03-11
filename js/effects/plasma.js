function dist(x, y, w, h) {
  return Math.sqrt((x - w / 2) * (x - w / 2) + (y - h / 2) * (y - h / 2));
}

var sinTable = [];
for (var a = 0; a < 360; a++) {
  sinTable.push(Math.sin(a * Math.PI / 180));
}

var cosTable = [];
for (var a = 0; a < 360; a++) {
  cosTable.push(Math.cos(a * Math.PI / 180));
}

function sin(v) {
  var a = parseInt(v * 180 / Math.PI) % 360;
  return sinTable[a];
  //return Math.sin(v);

}

function cos(v) {
  var a = parseInt(v * 180 / Math.PI) % 360;
  return cosTable[a];
  //return Math.cos(v);
}

var startMillisec = new Date().getTime();

function renderPlasma(lastFrameMillisec) {
  var currMillisec = new Date().getTime();
  var time = (currMillisec - startMillisec) / 1000.0;

  var canvas = document.getElementById("plasma-canvas");
  var ctx = canvas.getContext("2d");
  var w = canvas.width;
  var h = canvas.height;
  ctx.save();
  ctx.clearRect(0, 0, w, h);

  var imageData = ctx.getImageData(0, 0, w, h); //ctx.createImageData(canvas.width, canvas.height);
  var data = imageData.data;
  //console.log("imageData:", imageData);

  var cMul = (16.5 + sin(time / 2) * 15.5) | 0;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {

      var value =
        sin(dist(x + time, y, 128.0 * sin(time), 128.0 * sin(time)) / 8.0) +
        sin(dist(x, y, 64.0 * cos(time), 64.0 * cos(time)) / 16.0) +
        sin(dist(x, y + time / 7, 192.0, 64) / 17.0) +
        sin(dist(x, y, 192.0 + 200 + sin(time) * 200, 100.0 + 200 + sin(time / 2) * 200) / 8.0);

      var color = (((4 + value) * (32 / cMul)) | 0) * cMul;

      var dataPos = (y * w * 4) + (x * 4);

      data[dataPos + 0] = color << 1;
      data[dataPos + 1] = color;
      data[dataPos + 2] = 255 - color;
      data[dataPos + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Draw fps
  var fps = 1000 / lastFrameMillisec;
  if (fps) {
    ctx.font = "bold 20px 'Helvetica Neue', Helvetica, Arial, sans-serif";
    var fpsText = "Fps: " + fps.toFixed(1);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#444444';
    ctx.fillText(fpsText, 10, 22);
    ctx.strokeText(fpsText, 10, 22);
  }

  ctx.restore();

  // Upscale to window size
  var stage = document.getElementById("stage");
  var scaleX = window.innerWidth / canvas.width;
  var scaleY = window.innerHeight / canvas.height;

  var scaleToFit = Math.min(scaleX, scaleY);
  var scaleToCover = Math.max(scaleX, scaleY);

  stage.style.transformOrigin = "0 0"; //scale from top left
  stage.style.transform = "scale(" + scaleToCover + ")";
}

$(window).load(function() {
  AnimationHelper.registerAnimCallback(renderPlasma);
  AnimationHelper.startAnim();
});
