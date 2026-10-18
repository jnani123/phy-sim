const assert = require("node:assert/strict");
const fs = require("node:fs");
const { test } = require("node:test");

global.window = global;
require("../assets/js/physics/velocity-field-acceleration.js");

const field = global.PYQPhysicsEngines.velocityFieldAcceleration;

test("simulation source preserves math, a clean point-first scene, orbit zoom, and staged vector controls", () => {
  const controller = fs.readFileSync(require.resolve("../assets/js/simulations/velocity-field-acceleration.js"), "utf8");
  const page = fs.readFileSync(require.resolve("../assets/simulations/velocity-field-acceleration.html"), "utf8");
  assert.match(controller, /String\.raw`\\\[\\vec v=/);
  assert.match(controller, /String\.raw`\\\(\(1,2,4\)/);
  assert.match(controller, /pointermove/);
  assert.match(controller, /addEventListener\("wheel"/);
  assert.match(controller, /max="6" step="0\.1"/);
  assert.match(controller, /data-vector="velocity"/);
  assert.match(controller, /data-vector="acceleration"/);
  assert.match(controller, /state\.velocityVisible = false/);
  assert.match(controller, /id="arrow-r"/);
  assert.match(controller, /function togglePlayback\(\)/);
  assert.match(controller, /label: "JEE Main/);
  assert.equal((controller.match(/trap: \{/g) || []).length, 6, "every Solve step should provide a question-specific common trap");
  assert.match(controller, /PYQSimulationTeaching\.commonStudentTrap\(step\.trap\)/);
  assert.match(controller, /Start Guided Understanding/);
  assert.match(controller, /Proceed to Solve/);
  assert.match(controller, /Explore values/);
  assert.match(controller, /navigateMode\("solve"\)/);
  assert.match(controller, /navigateMode\("explore"\)/);
  assert.match(controller, /jnani-vfa-point-guide/);
  assert.match(page, /simulation-shell\.js/);
  assert.match(page, /simulation-math\.js/);
});

test("evaluates velocity and material acceleration at the printed point", () => {
  const point = { x: 1, y: 2, z: 4 };
  assert.deepEqual(field.evaluateVelocity(point), { x: -1, y: 4, z: -4 });
  assert.deepEqual(field.evaluateAcceleration(point), { x: 1, y: 8, z: 4 });
  assert.ok(Math.abs(field.magnitude(field.evaluateVelocity(point)) - Math.sqrt(33)) < 1e-12);
  assert.equal(field.magnitude(field.evaluateAcceleration(point)), 9);
});

test("returns zero velocity and acceleration at the origin", () => {
  const origin = { x: 0, y: 0, z: 0 };
  assert.deepEqual(field.evaluateVelocity(origin), { x: 0, y: 0, z: 0 });
  assert.deepEqual(field.evaluateAcceleration(origin), { x: 0, y: 0, z: 0 });
  assert.equal(field.magnitude(field.evaluateAcceleration(origin)), 0);
});

test("evaluates an independent point and its acceleration magnitude", () => {
  const point = { x: 2, y: 1, z: 3 };
  assert.deepEqual(field.evaluateVelocity(point), { x: -2, y: 2, z: -3 });
  assert.deepEqual(field.evaluateAcceleration(point), { x: 2, y: 4, z: 3 });
  assert.ok(Math.abs(field.magnitude(field.evaluateAcceleration(point)) - Math.sqrt(29)) < 1e-12);
});

test("rejects non-finite position and vector values", () => {
  assert.throws(() => field.evaluateAcceleration({ x: 1, y: Infinity, z: 2 }), /finite numbers/);
  assert.throws(() => field.magnitude({ x: 1, y: NaN, z: 2 }), /finite numbers/);
});
