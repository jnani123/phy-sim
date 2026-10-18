(function (global) {
  const rounded = (ctx, x, y, width, height, radius, fill, stroke) => {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  };

  const label = (ctx, text, x, y, color, size = 12, align = "center") => {
    ctx.fillStyle = color;
    ctx.font = `${size >= 14 ? "600 " : ""}${size}px "DM Sans",sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  };

  const arrow = (ctx, ax, ay, bx, by, color, width = 2) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    const angle = Math.atan2(by - ay, bx - ax);
    const head = 7;
    for (const [x, y, direction] of [[ax, ay, angle], [bx, by, angle + Math.PI]]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + head * Math.cos(direction - 0.42), y + head * Math.sin(direction - 0.42));
      ctx.lineTo(x + head * Math.cos(direction + 0.42), y + head * Math.sin(direction + 0.42));
      ctx.closePath();
      ctx.fill();
    }
  };

  global.PYQCanvasComponents = Object.freeze({ rounded, label, arrow });
})(window);
