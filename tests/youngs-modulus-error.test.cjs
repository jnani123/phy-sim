const assert = require("node:assert/strict");
const { test } = require("node:test");

global.window = global;
require("../assets/js/physics/youngs-modulus-error.js");

const calculate = global.PYQPhysicsEngines.youngsModulusError.calculate;
const baseline = {
  forceN: 100,
  lengthCm: 150,
  lengthLeastCountCm: 0.1,
  diameterCm: 0.08,
  diameterLeastCountCm: 0.001,
  extensionCm: 0.5,
  extensionLeastCountCm: 0.001
};

test("calculates SI area, Young's modulus, relative and absolute error", () => {
  const result = calculate(baseline);
  assert.ok(Math.abs(result.area - 5.026548245743669e-7) < 1e-18);
  assert.equal(result.lengthMetres, 1.5);
  assert.equal(result.diameterMetres, 0.0008);
  assert.equal(result.extensionMetres, 0.005);
  assert.ok(Math.abs(result.lengthError - 0.0006666666666666668) < 1e-15);
  assert.equal(result.diameterError, 0.025);
  assert.equal(result.areaRelativeError, result.diameterError);
  assert.equal(result.extensionError, 0.002);
  assert.ok(Math.abs(result.relativeError - 0.027666666666666666) < 1e-15);
  assert.ok(Math.abs(result.youngModulus - 5.968310365946075e10) < 1e-3);
  assert.ok(Math.abs(result.absoluteError - 1.651232534578414e9) < 1e-5);
  assert.ok(Math.abs(result.alpha - 1.651232534578414) < 1e-12);
});

test("updates derived values from experimental measurements", () => {
  const result = calculate({ ...baseline, diameterCm: 0.16 });
  assert.ok(Math.abs(result.area - 2.010619298297467e-6) < 1e-18);
  assert.equal(result.diameterError, 0.0125);
  assert.ok(Math.abs(result.youngModulus - 1.492077591486519e10) < 1e-3);
});

test("rejects zero dimensions and invalid least-count uncertainties", () => {
  assert.throws(() => calculate({ ...baseline, diameterCm: 0 }), /finite and positive/);
  assert.throws(() => calculate({ ...baseline, extensionCm: 0 }), /finite and positive/);
  assert.throws(() => calculate({ ...baseline, lengthLeastCountCm: -0.1 }), /least-count errors cannot be negative/);
});
