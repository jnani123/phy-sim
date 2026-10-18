const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const engineSource = fs.readFileSync(path.join(root, "assets/js/physics/position-dependent-motion.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(engineSource, context);
const engine = context.window.PYQPhysicsEngines.positionDependentMotion;

test("Question 29 engine matches independently calculated values at one second", () => {
  const result = engine.evaluate(1);
  assert.deepEqual(JSON.parse(JSON.stringify(result.position)), { x: 10, y: 5, z: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(result.velocity)), { x: 20, y: 15, z: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(result.acceleration)), { x: 20, y: 30, z: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(result.momentum)), { x: 2, y: 1.5, z: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(result.force)), { x: 2, y: 3, z: 0 });
  assert.equal(result.angularMomentum.z, 5);
  assert.equal(result.torque.z, 20);
  assert.deepEqual(JSON.parse(JSON.stringify(engine.evaluateStatements(1))), { A: true, B: true, C: false, D: true, correctOption: 4 });
});

test("Question 29 engine handles zero and a second time independently", () => {
  const zero = engine.evaluate(0);
  assert.deepEqual(JSON.parse(JSON.stringify(zero.position)), { x: 0, y: 0, z: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(zero.velocity)), { x: 0, y: 0, z: 0 });
  assert.equal(zero.angularMomentum.z, 0);
  assert.equal(zero.torque.z, 0);
  const t2 = engine.evaluate(2);
  assert.deepEqual(JSON.parse(JSON.stringify(t2.position)), { x: 40, y: 40, z: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(t2.velocity)), { x: 40, y: 60, z: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(t2.acceleration)), { x: 20, y: 60, z: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(t2.momentum)), { x: 4, y: 6, z: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(t2.force)), { x: 2, y: 6, z: 0 });
  assert.equal(t2.angularMomentum.z, 80);
  assert.equal(t2.torque.z, 160);
});

test("Question 29 engine rejects invalid time and mass", () => {
  for (const time of [-1, NaN, Infinity]) assert.throws(() => engine.evaluate(time), /Time must be/);
  for (const mass of [0, -1, NaN, Infinity]) assert.throws(() => engine.evaluate(1, mass), /Mass must be/);
});

test("Question 29 standalone page imports the shared simulation foundation", () => {
  const page = fs.readFileSync(path.join(root, "assets/simulations/position-dependent-motion.html"), "utf8");
  const controller = fs.readFileSync(path.join(root, "assets/js/simulations/position-dependent-motion.js"), "utf8");
  for (const resource of ["simulation-assets.css", "simulation-tailwind-config.js", "simulation-math.js", "simulation-teaching-components.js", "position-dependent-motion.js", "simulation-shell.js"]) {
    assert.ok(page.includes(resource), `standalone page must import ${resource}`);
  }
  assert.match(controller, /PYQSimulationShell\.mount/);
  assert.match(controller, /commonStudentTrap\(step\.trap\)/);
  assert.match(controller, /data-time/);
  assert.match(controller, /data-vector/);
  assert.match(controller, /data-view-zoom/);
  assert.match(controller, /data-view-reset/);
  assert.match(controller, /pointerdown/);
  assert.match(controller, /addEventListener\("wheel"/);
  assert.match(controller, /state\.view\.yaw = drag\.yaw \+/);
  assert.match(controller, /state\.view\.pitch = Math\.max/);
  assert.match(controller, /function project\(x, y, z = 0\)/);
  assert.match(controller, /previousMode === "explore"/);
  assert.match(controller, /state\.time = initialTime; state\.visible = \{ position: true \}; state\.understandVisible = \{ position: true \}/);
  assert.doesNotMatch(controller, /pdm-camera|state\.view\.rotation/);
  assert.doesNotMatch(controller, /Question context|stage\.title|stage\.note/);
  assert.match(controller, /\\hat i/);
  assert.match(controller, /\\hat j/);
  assert.match(page, /min-width:761px\) and \(max-width:1023px/);
  assert.match(controller, /drag to orbit/);
});

test("Question 29 record carries only supplied exam metadata and the studio routes it", () => {
  const studio = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
  assert.match(studio, /questionNumber:"29",exam:"JEE Main",year:"2026",month:"April",date:"2nd",session:"",shift:"",paper:"",set:"1"/);
  assert.match(studio, /position-dependent-motion":"position-dependent-motion\.html"/);
  assert.match(studio, /position-dependent-motion","electric-field-energy-density","kepler-orbital-period","angular-kinematics","parallel-plate-capacitor"\].includes\(q\.simulation\?\.engine\)/);
});
