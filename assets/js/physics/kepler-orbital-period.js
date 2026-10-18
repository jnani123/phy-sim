(function (global) {
  const TAU = 2 * Math.PI;
  const DEFAULT_PARAMETERS = Object.freeze({ mass1: 2, radius1: 1, mass2: 4, radius2: 2 });

  function validateParameters(parameters = {}) {
    const result = {};
    for (const key of ["mass1", "radius1", "mass2", "radius2"]) {
      const value = Number(parameters[key] ?? DEFAULT_PARAMETERS[key]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new TypeError(`${key} must be a finite positive value.`);
      }
      result[key] = value;
    }
    return Object.freeze(result);
  }

  function calculate(parameters = DEFAULT_PARAMETERS) {
    const p = validateParameters(parameters);
    // T0 = 2*pi*sqrt(R^3/(G*M)); radii use R and masses use M.
    const period1 = p.radius1 ** 1.5 / Math.sqrt(p.mass1);
    const period2 = p.radius2 ** 1.5 / Math.sqrt(p.mass2);
    const ratio = period2 / period1;
    if (!Number.isFinite(ratio) || ratio <= 0) throw new RangeError("The period ratio must be finite and positive.");
    return Object.freeze({
      parameters: p,
      normalizedPeriods: Object.freeze({ first: period1, second: period2 }),
      ratio,
      angularSpeedRatio: 1 / ratio
    });
  }

  function orbitalState(parameters = DEFAULT_PARAMETERS, elapsedT1 = 0) {
    const elapsed = Number(elapsedT1);
    if (!Number.isFinite(elapsed) || elapsed < 0) throw new TypeError("Elapsed time must be finite and non-negative.");
    const result = calculate(parameters);
    const phase1 = TAU * elapsed;
    const phase2 = TAU * elapsed / result.ratio;
    return Object.freeze({
      elapsedT1: elapsed,
      phase1,
      phase2,
      angularSpeed1: TAU,
      angularSpeed2: TAU / result.ratio,
      ...result
    });
  }

  global.PYQPhysicsEngines = global.PYQPhysicsEngines || {};
  global.PYQPhysicsEngines.keplerOrbitalPeriod = Object.freeze({
    TAU,
    DEFAULT_PARAMETERS,
    validateParameters,
    calculate,
    orbitalState
  });
})(window);
