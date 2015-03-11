var renderStars = (function () {
  var lastMillisec = new Date().getTime();

  var zAxis = 300;
  var maxX = 8192;
  var maxY = 8192;
  var maxZ = 4000;

  var stars = [];
  for (var i = 0; i < 400; i++) {
    stars.push({
      x: Math.random() * maxX - (maxX >> 1),
      y: Math.random() * maxY - (maxY >> 1),
      z: Math.random() * maxZ + 1
    });
  }

  return function renderStars(ctx) {
    var canvas = ctx.canvas;
    var currMillisec = new Date().getTime();
    var time = (currMillisec - lastMillisec) | 0;
    lastMillisec = currMillisec;

    var w = canvas.width;
    var h = canvas.height;
    var halfW = w / 2;
    var halfH = h / 2;


    for (var i in stars) {
      var star = stars[i];
      var projX = (zAxis * star.x / star.z + halfW);
      var projY = (zAxis * star.y / star.z + halfH);
      var color = (255 - star.z / 16) | 0;
      var radius = 1 / maxZ * (maxZ - star.z) * 3;

      if (projX >= 0 && projX < w && projY >= 0 && projY < h) {
        ctx.fillStyle = "rgba(255,255,255," + (color / 256).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, Math.PI * 2, false);
        ctx.fill();
      }

      star.z -= time;
      if (star.z <= 0) star.z += maxZ;
    }
  };
})();

$(window).load(function() {
  $("#stars-canvas").canvasAnimation({
    renderer: renderStars,
    bgColor: "rgba(0,0,0,0.2)"
  });
});
