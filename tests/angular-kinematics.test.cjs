const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const engineContext = { window: {} };
vm.runInNewContext(read("assets/js/physics/angular-kinematics.js"), engineContext);
const engine = engineContext.window.PYQPhysicsEngines.angularKinematics;
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);

test("angular kinematics is zero initially and has the expected inflection/sign changes", () => {
  const initial = engine.evaluate(0);
  assert.deepEqual({ theta: initial.theta, omega: initial.omega, alpha: initial.alpha }, { theta: 0, omega: 0, alpha: 0 });
  close(engine.angularAcceleration(4 / 3), 0);
  assert.ok(engine.angularAcceleration(1.2) < 0);
  assert.ok(engine.angularAcceleration(1.5) > 0);
});

test("angular velocity reverses sign at t=2 seconds", () => {
  close(engine.angularVelocity(2), 0);
  assert.ok(engine.angularVelocity(1.9) < 0);
  assert.ok(engine.angularVelocity(2.1) > 0);
});

test("independent t=10 values match theta=2750/3 rad, omega=400 rad/s, alpha=130 rad/s^2", () => {
  const result = engine.evaluate(10);
  close(result.theta, 2750 / 3);
  close(result.omega, 400);
  close(result.alpha, 130);
  assert.equal(Math.round(result.alpha), 130);
});

test("invalid negative and non-finite times are rejected", () => {
  for (const time of [-1, NaN, Infinity, -Infinity]) {
    assert.throws(() => engine.evaluate(time), /finite, non-negative/);
  }
});

test("generated Question, Understand, Solve, and Explore math keeps KaTeX delimiters", () => {
  const controller = read("assets/js/simulations/angular-kinematics.js");
  const getFunction = (startMarker, endMarker, context = {}) => {
    const start = controller.indexOf(startMarker), end = controller.indexOf(endMarker, start);
    assert.ok(start >= 0 && end > start, `function block exists: ${startMarker}`);
    return vm.runInNewContext(`(${controller.slice(start, end).trim().replace(/;\s*$/, "")})`, context);
  };
  const questionHtml = getFunction("  function questionHtml()", "  function understandHtml()", {
    question: { questionNumber: "31", options: "(1) 150\n(2) 120\n(3) 130\n(4) 170" }
  })();
  for (const choice of ["150", "120", "130", "170"]) assert.ok(questionHtml.includes(String.raw`\(${choice}\)`));
  assert.ok(questionHtml.includes(String.raw`\[\theta=\frac{5t^4}{40}-\frac{t^3}{3}.\]`));

  const understandHtml = getFunction("  function understandHtml()", "  function solveHtml()", {
    state: { understandStep: 1 }, understand: [{ focus: "path" }, { fragment: String.raw`\[\theta=\frac{5t^4}{40}-\frac{t^3}{3}.\]` }, { focus: "requested" }]
  })();
  assert.ok(understandHtml.includes(String.raw`\[\theta=\frac{5t^4}{40}-\frac{t^3}{3}.\]`));
  assert.doesNotMatch(understandHtml, /130|Option \(3\)/);

  const solveSteps = getFunction("  function solveSteps()", "  function fmt(", { traps: Array.from({ length: 5 }, () => ({})) });
  const steps = solveSteps();
  assert.equal(steps.length, 5);
  for (const step of steps) {
    assert.ok(step.math.includes(String.raw`\[`), `display equation in ${step.title}`);
    assert.ok(step.trap);
  }

  const exploreHtml = getFunction("  function exploreHtml()", "  const toolbar", {
    engine, state: { time: 10, showOmega: true, showAlpha: false }, fmt: value => String(value)
  })();
  for (const symbol of [String.raw`\(\theta\)`, String.raw`\(\omega\)`, String.raw`\(\alpha\)`, String.raw`\(2\pi\)`]) {
    assert.ok(exploreHtml.includes(symbol), `Explore output preserves ${symbol}`);
  }
});

test("Q31 uses the shared shell, math renderer, teaching trap, and studio route", () => {
  const page = read("assets/simulations/angular-kinematics.html");
  const controller = read("assets/js/simulations/angular-kinematics.js");
  const app = read("assets/js/app.js");
  for (const resource of ["simulation-assets.css", "simulation-tailwind-config.js", "simulation-math.js", "simulation-teaching-components.js", "simulation-shell.js", "../js/physics/angular-kinematics.js"]) {
    assert.ok(page.includes(resource), `page references ${resource}`);
  }
  assert.match(controller, /PYQSimulationShell\.mount/);
  assert.match(controller, /shell\.setActiveMode\(mode\)/);
  assert.match(controller, /PYQSimulationMath\.render\(document\.getElementById\("console-content"\)\)/);
  assert.match(controller, /state\.time = \[0, 1, 10, 10\]\[next\]/, "the final Given / Find stage keeps the scene at the last valid time");
  assert.match(controller, /\[0, 1, 10, 10\]\[state\.understandStep\]/, "timeline scrubbing handles the final recap stage");
  assert.match(controller, /PYQSimulationTeaching\.commonStudentTrap\(step\.trap\)/);
  assert.match(controller, /data-time-point/);
  assert.match(controller, /pointermove/);
  assert.match(controller, /state\.view\.x = drag\.x \+ \(event\.clientX - drag\.px\)/);
  assert.match(controller, /state\.view\.y = drag\.y \+ \(event\.clientY - drag\.py\)/);
  assert.match(app, /jee-main-2026-april-2-set-1-q31-angular-kinematics/);
  assert.match(app, /"angular-kinematics":"angular-kinematics\.html"/);
  assert.match(app, /"kepler-orbital-period","angular-kinematics","parallel-plate-capacitor"\].includes\(q\.simulation\?\.engine\)/);
  assert.match(app, /unit:5,chapter:"Rotational Motion"/);
});
