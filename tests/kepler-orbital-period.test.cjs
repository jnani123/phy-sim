const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "assets/js/physics/kepler-orbital-period.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);
const engine = context.window.PYQPhysicsEngines.keplerOrbitalPeriod;

const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);

test("Q30 parameters give T2/T1 = 2 from Kepler's law", () => {
  const result = engine.calculate();
  close(result.normalizedPeriods.first, 1 / Math.sqrt(2));
  close(result.normalizedPeriods.second, Math.sqrt(2));
  close(result.ratio, 2);
  close(result.angularSpeedRatio, 0.5);
});

test("equal masses and equal radii give equal periods", () => {
  close(engine.calculate({ mass1: 3, radius1: 1.4, mass2: 3, radius2: 1.4 }).ratio, 1);
});

test("equal masses and doubled radius give 2 to the three-halves", () => {
  close(engine.calculate({ mass1: 1, radius1: 1, mass2: 1, radius2: 2 }).ratio, 2 * Math.sqrt(2));
});

test("equal radii and doubled central mass give inverse square root two", () => {
  close(engine.calculate({ mass1: 2, radius1: 1, mass2: 4, radius2: 1 }).ratio, 1 / Math.sqrt(2));
});

test("one and two first-period units produce the expected synchronized phases", () => {
  const halfway = engine.orbitalState(undefined, 0.5);
  close(halfway.phase1, Math.PI);
  close(halfway.phase2, Math.PI / 2);
  const one = engine.orbitalState(undefined, 1);
  close(one.phase1, 2 * Math.PI);
  close(one.phase2, Math.PI);
  const two = engine.orbitalState(undefined, 2);
  close(two.phase1, 4 * Math.PI);
  close(two.phase2, 2 * Math.PI);
});

test("current parameters consistently determine periods and angular speed", () => {
  const parameters = { mass1: 1, radius1: 1, mass2: 2, radius2: 1 };
  const result = engine.orbitalState(parameters, 0.25);
  close(result.ratio, 1 / Math.sqrt(2));
  close(result.angularSpeed2 / result.angularSpeed1, Math.sqrt(2));
  close(result.phase2, (Math.PI / 2) / (1 / Math.sqrt(2)));
});

test("invalid mass, radius, ratio, and elapsed-time values are rejected", () => {
  for (const value of [0, -1, NaN, Infinity]) {
    assert.throws(() => engine.calculate({ mass1: value }), /finite positive/);
    assert.throws(() => engine.calculate({ radius2: value }), /finite positive/);
  }
  for (const elapsed of [-1, NaN, Infinity]) assert.throws(() => engine.orbitalState(undefined, elapsed), /Elapsed time/);
  assert.throws(() => engine.calculate({ mass1: 1e-308, radius1: 1e308, mass2: 1, radius2: 1 }), /ratio must be finite/);
});

test("Q30 page/controller and studio route use the shared foundation", () => {
  const page = fs.readFileSync(path.join(root, "assets/simulations/kepler-orbital-period.html"), "utf8");
  const controller = fs.readFileSync(path.join(root, "assets/js/simulations/kepler-orbital-period.js"), "utf8");
  const app = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
  for (const ref of ["simulation-assets.css", "simulation-tailwind-config.js", "simulation-math.js", "simulation-teaching-components.js", "simulation-shell.js", "../js/physics/kepler-orbital-period.js"]) assert.ok(page.includes(ref), `missing ${ref}`);
  assert.match(controller, /PYQSimulationShell\.mount/);
  assert.match(controller, /shell\.setActiveMode\(mode\)/);
  assert.match(controller, /PYQSimulationTeaching\.commonStudentTrap\(step\.trap\)/);
  assert.match(controller, /PYQSimulationMath\.render\(document\.getElementById\("console-content"\)\)/);
  assert.match(controller, /data-mass/);
  assert.match(controller, /data-radius/);
  assert.match(controller, /requestAnimationFrame/);
  assert.match(controller, /pointermove/);
  assert.match(controller, /wheel/);
  assert.match(app, /"kepler-orbital-period":"kepler-orbital-period\.html"/);
  assert.match(app, /"kepler-orbital-period","angular-kinematics","parallel-plate-capacitor"\]\./);
  assert.match(app, /jee-main-q30-kepler-orbital-period/);
  assert.match(app, /unit:6,chapter:"Gravitation"/);
  assert.match(app, /if\(q\.simulation\?\.engine!=="youngs-modulus-error"\)return/);
});

test("Explore preserves inline KaTeX delimiters in generated markup", () => {
  const controller = fs.readFileSync(path.join(root, "assets/js/simulations/kepler-orbital-period.js"), "utf8");
  const start = controller.indexOf("  function exploreHtml() {");
  const end = controller.indexOf("  const toolbar", start);
  assert.ok(start >= 0 && end > start, "Explore renderer is present");
  const exploreHtml = vm.runInNewContext(`(${controller.slice(start, end).trim().replace(/;\s*$/, "")})`, {
    state: { parameters: { mass1: 2, radius1: 1, mass2: 4, radius2: 2 } },
    pretty: value => String(value)
  });
  const html = exploreHtml();
  for (const formula of [
    String.raw`\(T_0=2\pi\sqrt{R^3/(GM)}\)`,
    String.raw`\(T_1/T_0\)`,
    String.raw`\(T_2/T_0\)`,
    String.raw`\(T_2/T_1\)`,
    String.raw`\(\omega_2/\omega_1\)`
  ]) assert.ok(html.includes(formula), `generated Explore markup preserves ${formula}`);
});
