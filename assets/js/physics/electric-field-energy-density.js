(function (global) {
  const BASES = Object.freeze(["M", "L", "T", "I"]);
  const ENERGY = Object.freeze({ M: 1, L: 2, T: -2, I: 0 });
  const VOLUME = Object.freeze({ M: 0, L: 3, T: 0, I: 0 });
  const PERMITTIVITY = Object.freeze({ M: -1, L: -3, T: 4, I: 2 });
  const FIELD = Object.freeze({ M: 1, L: 1, T: -3, I: -1 });

  function combine(left, right, multiplier = 1) {
    return Object.fromEntries(BASES.map(base => [base, (left[base] || 0) + multiplier * (right[base] || 0)]));
  }
  function energyDensityDimensions() { return combine(ENERGY, VOLUME, -1); }
  function directFieldDimensions() {
    const fieldSquared = Object.fromEntries(BASES.map(base => [base, 2 * FIELD[base]]));
    return combine(PERMITTIVITY, fieldSquared);
  }
  function identifyExponents(dimensions = energyDensityDimensions()) {
    return Object.freeze({ a: dimensions.M, b: dimensions.L, c: dimensions.T });
  }
  function evaluateExpression({ a, b, c } = {}) {
    if ([a, b, c].some(value => value === null || value === undefined || value === "")) return null;
    const values = [a, b, c].map(Number);
    if (values.some(value => !Number.isFinite(value) || !Number.isInteger(value))) return null;
    return 2 * values[0] - values[1] + values[2];
  }
  function equivalentDimensions(left, right) {
    return BASES.every(base => (left?.[base] || 0) === (right?.[base] || 0));
  }
  function dimensionString(dimensions, includeCurrent = false) {
    const bases = includeCurrent ? BASES : BASES.slice(0, 3);
    return bases.filter(base => dimensions?.[base]).map(base => `${base}${dimensions[base] === 1 ? "" : `^${dimensions[base]}`}`).join(" ") || "1";
  }

  global.PYQPhysicsEngines = global.PYQPhysicsEngines || {};
  global.PYQPhysicsEngines.electricFieldEnergyDensity = Object.freeze({
    bases: BASES,
    energyDimensions: ENERGY,
    volumeDimensions: VOLUME,
    permittivityDimensions: PERMITTIVITY,
    electricFieldDimensions: FIELD,
    energyDensityDimensions,
    directFieldDimensions,
    identifyExponents,
    evaluateExpression,
    equivalentDimensions,
    dimensionString
  });
})(window);
