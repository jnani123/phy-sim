const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const context = { window: {} };
vm.runInNewContext(read("assets/js/physics/parallel-plate-capacitor.js"), context);
const engine = context.window.PYQPhysicsEngines.parallelPlateCapacitor;

test("Q32 default half-filled dielectric gives 5C/3 and a 66.67 percent increase", () => {
  const result = engine.calculate({ dielectricConstant: 5, filledFraction: 0.5 });
  assert.ok(Math.abs(result.capacitanceRatio - 5 / 3) < 1e-12);
  assert.ok(Math.abs(result.percentageIncrease - 200 / 3) < 1e-10);
  assert.deepEqual(JSON.parse(JSON.stringify(engine.sectionRatios({ dielectricConstant: 5, filledFraction: 0.5 }))), { dielectricCapacitanceRatio: 10, airCapacitanceRatio: 2 });
});

test("filled-fraction boundaries and unity dielectric are physically correct", () => {
  assert.equal(engine.calculate({ dielectricConstant: 5, filledFraction: 0 }).capacitanceRatio, 1);
  assert.equal(engine.calculate({ dielectricConstant: 5, filledFraction: 1 }).capacitanceRatio, 5);
  assert.equal(engine.calculate({ dielectricConstant: 1, filledFraction: 0.63 }).capacitanceRatio, 1);
});

test("sandbox inputs reject nonphysical and non-finite values", () => {
  for (const input of [{ dielectricConstant: 0.5, filledFraction: 0.5 }, { dielectricConstant: 5, filledFraction: -0.1 }, { dielectricConstant: 5, filledFraction: 1.1 }, { dielectricConstant: Infinity, filledFraction: 0.5 }]) assert.throws(() => engine.calculate(input), { name: "RangeError" });
});

test("simulation imports the shared shell, theme, math, question data, and teaching components", () => {
  const page = read("assets/simulations/parallel-plate-capacitor.html");
  const controller = read("assets/js/simulations/parallel-plate-capacitor.js");
  const app = read("assets/js/app.js");
  for (const asset of ["simulation-assets.css", "simulation-tailwind-config.js", "simulation-math.js", "simulation-teaching-components.js", "simulation-question-data.js", "simulation-shell.js"]) assert.ok(page.includes(asset), `missing shared asset ${asset}`);
  assert.match(controller, /PYQSimulationShell\.mount/);
  assert.match(controller, /PYQSimulationTeaching\.givenAndAsked/);
  assert.match(controller, /PYQSimulationTeaching\.commonStudentTrap\(s\.trap\)/);
  assert.match(controller, /shell\.setActiveMode\(mode\)/);
  assert.match(controller, /state\.mode === "question" \? \{ K: initial\.K, f:/, "K stays fixed while the insertion fraction animates");
  assert.doesNotMatch(controller, /the two material regions are arranged along the plate separation/i, "Understand must not add a conceptual arrangement stage");
  assert.match(controller, /series-circuit-panel/);
  assert.doesNotMatch(controller, /M270 200v35h55v-35/, "the incorrect pulse-like circuit drawing must stay removed");
  assert.match(controller, /String\.raw`\\\[/, "math delimiters must be preserved in generated markup");
  assert.match(app, /parallel-plate-capacitor-seed-v1/);
  assert.match(app, /jee-main-2026-april-2-set-1-q32-parallel-plate-capacitor/);
  assert.match(app, /"parallel-plate-capacitor":"parallel-plate-capacitor\.html"/);
  assert.match(app, /"angular-kinematics","parallel-plate-capacitor"\]\.includes/);
});
