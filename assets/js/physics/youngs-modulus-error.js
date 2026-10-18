(function (global) {
  const calculateYoungsModulusError = (parameters) => {
    const L = Number(parameters.lengthCm);
    const d = Number(parameters.diameterCm);
    const x = Number(parameters.extensionCm);
    const F = Number(parameters.forceN);
    const dL = Number(parameters.lengthLeastCountCm);
    const dd = Number(parameters.diameterLeastCountCm);
    const dx = Number(parameters.extensionLeastCountCm);

    if ([L, d, x, F, dL, dd, dx].some((value) => !Number.isFinite(value)) ||
      L <= 0 || d <= 0 || x <= 0 || F <= 0 || dL < 0 || dd < 0 || dx < 0) {
      throw new Error("Simulation measurements must be finite and positive; least-count errors cannot be negative.");
    }

    const lengthError = dL / L;
    const diameterError = 2 * dd / d;
    const extensionError = dx / x;
    const relativeError = lengthError + diameterError + extensionError;
    const lengthMetres = L / 100;
    const diameterMetres = d / 100;
    const extensionMetres = x / 100;
    const area = (Math.PI * diameterMetres ** 2) / 4;
    const youngModulus = (F * lengthMetres) / (area * extensionMetres);

    return {
      L, d, x, F, dL, dd, dx,
      lengthMetres,
      diameterMetres,
      extensionMetres,
      area,
      areaRelativeError: diameterError,
      lengthError,
      diameterError,
      extensionError,
      relativeError,
      youngModulus,
      absoluteError: relativeError * youngModulus,
      alpha: (relativeError * youngModulus) / 1e9
    };
  };

  global.PYQPhysicsEngines = global.PYQPhysicsEngines || {};
  global.PYQPhysicsEngines.youngsModulusError = Object.freeze({
    calculate: calculateYoungsModulusError
  });
})(window);
