const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "assets/js/physics/electric-field-energy-density.js"), "utf8");
const page = fs.readFileSync(path.join(root, "assets/simulations/electric-field-energy-density.html"), "utf8");
const controller = fs.readFileSync(path.join(root, "assets/js/simulations/electric-field-energy-density.js"), "utf8");
const app = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);
const engine = context.window.PYQPhysicsEngines.electricFieldEnergyDensity;

test("energy divided by volume gives independent MLT dimensions", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(engine.energyDimensions)), { M: 1, L: 2, T: -2, I: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(engine.volumeDimensions)), { M: 0, L: 3, T: 0, I: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(engine.energyDensityDimensions())), { M: 1, L: -1, T: -2, I: 0 });
});

test("direct epsilon-zero E-squared check cancels current dimension", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(engine.directFieldDimensions())), { M: 1, L: -1, T: -2, I: 0 });
  assert.equal(engine.equivalentDimensions(engine.energyDensityDimensions(), engine.directFieldDimensions()), true);
});

test("coefficient one-half is treated as dimensionless and requested value is one", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(engine.identifyExponents())), { a: 1, b: -1, c: -2 });
  assert.equal(engine.evaluateExpression({ a: 1, b: -1, c: -2 }), 1);
  assert.equal(engine.evaluateExpression({ a: 1, b: -1, c: -2 }), 2 * 1 - (-1) + (-2));
});

test("expression rejects missing, non-finite, and fractional powers", () => {
  assert.equal(engine.evaluateExpression({ a: 1, b: null, c: -2 }), null);
  assert.equal(engine.evaluateExpression({ a: 1, b: 0.5, c: -2 }), null);
  assert.equal(engine.evaluateExpression({ a: 1, b: Infinity, c: -2 }), null);
});

test("Q26 page and controller use the shared foundation, solve traps, and staged learning", () => {
  for (const ref of ["../css/simulation-assets.css", "../js/shared/simulation-tailwind-config.js", "../js/shared/simulation-math.js", "../js/shared/simulation-teaching-components.js", "../js/shared/simulation-shell.js"]) assert.ok(page.includes(ref), `missing ${ref}`);
  assert.match(page, /electric-field-energy-density\.js\?v=20261017-17/);
  assert.match(controller, /PYQSimulationShell\.mount/);
  assert.match(controller, /PYQSimulationTeaching\.commonStudentTrap\(step\.trap\)/);
  assert.match(controller, /const understand = \[/);
  assert.match(controller, /const solveSteps = \[/);
  assert.match(controller, /data-exp/);
  assert.match(controller, /data-check-method/);
  assert.match(controller, /data-view="in"/);
  assert.match(controller, /addEventListener\("pointermove"/);
  assert.match(controller, /addEventListener\("wheel"/);
  assert.match(controller, /window\.resetView/);
  assert.match(controller, /shell\.setActiveMode\(mode\)/);
  assert.match(controller, /state\.view\.drag\.x \+ \(event\.clientX - state\.view\.drag\.pointerX\)/);
  assert.match(controller, /state\.view\.drag\.y \+ \(event\.clientY - state\.view\.drag\.pointerY\)/);
  assert.match(app, /"electric-field-energy-density":"electric-field-energy-density\.html"/);
  assert.match(app, /"position-dependent-motion","electric-field-energy-density","kepler-orbital-period","angular-kinematics","parallel-plate-capacitor"\]\./);
  assert.match(app, /electric-field-energy-density-seed-v1/);
  assert.match(app, /jee-main-q26-electric-field-energy-density/);
  assert.match(app, /exam:"JEE Main",year:"2026",month:"April",date:"2nd"[^\n]*set:"1"/);
});
