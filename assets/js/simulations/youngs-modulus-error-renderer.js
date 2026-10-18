(function (global) {
  const render = ({ canvas, parameters, result, focus, mode, gridVisible, labelsVisible }) => {
    if (!canvas || !result) return;
    const shell = canvas.parentElement;
    const bounds = shell.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const compact = bounds.width < 480;
    shell.classList.toggle("compact", compact);
    const ratio = Math.min(global.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * ratio);
    canvas.height = Math.round(bounds.height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const w = bounds.width;
    const h = bounds.height;
    ctx.clearRect(0, 0, w, h);

    if (gridVisible) {
      ctx.strokeStyle = "rgba(115,145,172,.07)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    const tokens = global.getComputedStyle(global.document.documentElement);
    const color = key => tokens.getPropertyValue(global.PYQSimulationTheme.palette[key]).trim();
    const accent = color("accent");
    const gold = color("gold");
    const cyan = color("cyan");
    const purple = color("violet");
    const text = color("text");
    const muted = color("muted");
    const { rounded, label, arrow } = global.PYQCanvasComponents;
    const drawBox = (...args) => rounded(ctx, ...args);
    const drawLabel = (...args) => label(ctx, ...args);
    const drawArrow = (...args) => arrow(ctx, ...args);
    const highlight = key => focus === key || (mode === "EXPLORE" && ["diameter", "length", "extension"].includes(key));
    const glow = value => {
      ctx.shadowColor = value;
      ctx.shadowBlur = 12;
    };

    const wireX = w * 0.48;
    const top = h * 0.245;
    const originalEnd = h * 0.49;
    const stretchedEnd = h * 0.565;
    const wireColor = highlight("wire") || highlight("modulus") || highlight("si") || highlight("result")
      ? accent
      : "#7893a8";

    ctx.fillStyle = "#516579";
    drawBox(wireX - 46, top - 16, 92, 13, 5, "#314354", "#60778c");
    ctx.fillStyle = "#243446";
    ctx.fillRect(wireX - 30, top - 3, 60, 7);
    ctx.save();
    if (highlight("wire") || highlight("extension")) glow(wireColor);
    ctx.strokeStyle = wireColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(wireX, top + 4);
    ctx.lineTo(wireX, stretchedEnd);
    ctx.stroke();
    ctx.restore();
    ctx.lineCap = "butt";

    const scaleX = wireX - w * 0.18;
    ctx.strokeStyle = highlight("length") ? cyan : "#71879a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleX, top + 9);
    ctx.lineTo(scaleX, originalEnd);
    ctx.stroke();
    for (let i = 0; i <= 10; i++) {
      const y = top + 9 + (originalEnd - top - 9) * i / 10;
      ctx.beginPath();
      ctx.moveTo(scaleX, y);
      ctx.lineTo(scaleX + (i % 5 === 0 ? 9 : 5), y);
      ctx.stroke();
    }
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#8395a6";
    ctx.beginPath();
    ctx.moveTo(scaleX + 12, originalEnd);
    ctx.lineTo(wireX + 19, originalEnd);
    ctx.stroke();
    ctx.setLineDash([]);

    const lengthX = wireX - w * 0.24;
    drawArrow(lengthX, top + 11, lengthX, originalEnd, highlight("length") ? cyan : muted, 1.6);
    drawLabel("ℓ", lengthX - 8, (top + originalEnd) / 2, highlight("length") ? cyan : text, 13, "right");
    const extensionX = wireX + w * 0.12;
    drawArrow(extensionX, originalEnd + 2, extensionX, stretchedEnd - 1, highlight("extension") ? gold : muted, 1.6);
    drawLabel("Δℓ", extensionX + 7, (originalEnd + stretchedEnd) / 2, highlight("extension") ? gold : text, 11, "left");

    ctx.fillStyle = wireColor;
    ctx.beginPath();
    ctx.arc(wireX, stretchedEnd, 4, 0, Math.PI * 2);
    ctx.fill();
    drawBox(wireX - 18, stretchedEnd + 12, 36, 23, 5, "#394b5e", highlight("force") ? gold : "#52687c");
    drawArrow(wireX, stretchedEnd + 37, wireX, Math.min(h * 0.68, stretchedEnd + 56), highlight("force") ? gold : "#d08d54", 2);
    drawLabel("100 N", wireX + 27, stretchedEnd + 23, highlight("force") ? gold : text, 10, "left");
    drawLabel("FIXED SUPPORT", wireX, top - 24, muted, 8);
    drawLabel("scale", scaleX - 8, originalEnd + 12, highlight("length") ? cyan : muted, 8, "right");

    const insetX = w * 0.82;
    const insetY = h * 0.34;
    const radius = Math.min(29, w * 0.062);
    ctx.save();
    if (highlight("diameter") || highlight("area")) glow(purple);
    ctx.strokeStyle = highlight("diameter") || highlight("area") ? purple : "#587087";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(insetX, insetY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#142333";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(insetX, insetY, Math.max(7, radius * 0.42), 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.strokeStyle = purple;
    ctx.beginPath();
    ctx.moveTo(insetX - radius - 9, insetY - radius * 0.6);
    ctx.lineTo(insetX - radius + 1, insetY - radius * 0.6);
    ctx.moveTo(insetX - radius - 9, insetY + radius * 0.6);
    ctx.lineTo(insetX - radius + 1, insetY + radius * 0.6);
    ctx.moveTo(insetX - radius - 9, insetY - radius * 0.6);
    ctx.lineTo(insetX - radius - 9, insetY + radius * 0.6);
    ctx.stroke();
    ctx.restore();
    if (labelsVisible) {
      drawArrow(insetX - radius * 0.54, insetY, insetX + radius * 0.54, insetY, purple, 1.8);
      drawLabel("d", insetX, insetY + radius + 11, purple, 10);
      drawLabel("MAGNIFIED · NOT TO SCALE", insetX, insetY + radius + 25, muted, compact ? 6 : 7);
    }

    const cardGap = compact ? 5 : 9;
    const cardsY = h * 0.765;
    const cardWidth = (w * 0.94 - 2 * cardGap) / 3;
    const startX = w * 0.03;
    const cardHeight = compact ? 50 : 61;
    const cards = [
      { title: "SCALE · ORIGINAL LENGTH ℓ", value: `${result.L} cm`, least: `least count ±${result.dL} cm`, key: "length", color: cyan },
      { title: "SCREW GAUGE · DIAMETER d", value: `${result.d.toPrecision(3)} cm`, least: `least count ±${result.dd} cm`, key: "diameter", color: purple },
      { title: "MICROMETER · EXTENSION Δℓ", value: `${result.x.toPrecision(3)} cm`, least: `least count ±${result.dx} cm`, key: "extension", color: gold }
    ];
    cards.forEach((item, index) => {
      const x = startX + index * (cardWidth + cardGap);
      const isActive = highlight(item.key);
      drawBox(x, cardsY, cardWidth, cardHeight, 9, isActive ? "#142536" : "#101a26", isActive ? item.color : "#2a3949");
      drawLabel(item.title, x + 7, cardsY + 12, isActive ? item.color : muted, compact ? 6.5 : 8, "left");
      drawLabel(item.value, x + 7, cardsY + 29, text, compact ? 10 : 12, "left");
      if (!compact) drawLabel(item.least, x + 7, cardsY + 46, muted, 8, "left");
    });

    global.document.getElementById("simReadLength").textContent = `${result.L} cm`;
    global.document.getElementById("simReadDiameter").textContent = `${result.d.toPrecision(3)} cm`;
    global.document.getElementById("simReadExtension").textContent = `${result.x.toPrecision(3)} cm`;
    global.document.getElementById("simCanvasCaption").textContent =
      "Schematic — the extension and diameter are exaggerated, not to scale";
    return true;
  };

  global.PYQYoungsModulusRenderer = Object.freeze({ render });
})(window);
