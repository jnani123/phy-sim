(function (global) {
  function calculate({ dielectricConstant, filledFraction }) {
    const K = Number(dielectricConstant), f = Number(filledFraction);
    if (!Number.isFinite(K) || K < 1) throw new RangeError("Dielectric constant K must be finite and at least 1.");
    if (!Number.isFinite(f) || f < 0 || f > 1) throw new RangeError("Filled fraction f must be between 0 and 1.");
    const ratio = f === 0 ? 1 : f === 1 ? K : 1 / ((1 - f) + f / K);
    return Object.freeze({ dielectricConstant: K, filledFraction: f, capacitanceRatio: ratio, percentageIncrease: (ratio - 1) * 100, dielectricThicknessFraction: f, airThicknessFraction: 1 - f });
  }
  function sectionRatios({ dielectricConstant, filledFraction }) {
    const { dielectricConstant: K, filledFraction: f } = calculate({ dielectricConstant, filledFraction });
    return Object.freeze({ dielectricCapacitanceRatio: f === 0 ? Infinity : K / f, airCapacitanceRatio: f === 1 ? Infinity : 1 / (1 - f) });
  }
  global.PYQPhysicsEngines = global.PYQPhysicsEngines || {};
  global.PYQPhysicsEngines.parallelPlateCapacitor = Object.freeze({ calculate, sectionRatios });
})(window);
