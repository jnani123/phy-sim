(function (global) {
  const katexVersion = "0.16.8";
  const libraryBase = `https://cdn.jsdelivr.net/npm/katex@${katexVersion}/dist`;
  const delimiters = [
    { left: "$$", right: "$$", display: true },
    { left: "$", right: "$", display: false },
    { left: "\\(", right: "\\)", display: false },
    { left: "\\[", right: "\\]", display: true }
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = global.document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load shared math asset: ${src}`));
      global.document.head.append(script);
    });
  }

  const ready = loadScript(`${libraryBase}/katex.min.js`)
    .then(() => loadScript(`${libraryBase}/contrib/auto-render.min.js`))
    .then(() => {
      if (typeof global.renderMathInElement !== "function") {
        throw new Error("The shared KaTeX auto-render library did not initialize.");
      }
    });

  function render(root = global.document.body) {
    return ready.then(() => global.renderMathInElement(root, { delimiters, throwOnError: false }));
  }

  global.PYQSimulationMath = Object.freeze({ render, ready, delimiters, katexVersion });
  global.renderAllMath = () => render();
})(window);
