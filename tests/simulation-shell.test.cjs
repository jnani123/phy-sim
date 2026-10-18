const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const reference = read("assets/simulations/youngs-modulus-error.html");
const candidate = read("assets/simulations/velocity-field-acceleration.html");
const positionDependent = read("assets/simulations/position-dependent-motion.html");
const angularKinematics = read("assets/simulations/angular-kinematics.html");
const candidateController = read("assets/js/simulations/velocity-field-acceleration.js");
const positionDependentController = read("assets/js/simulations/position-dependent-motion.js");
const angularKinematicsController = read("assets/js/simulations/angular-kinematics.js");
const studio = read("assets/js/app.js");
const shell = read("assets/js/shared/simulation-shell.js");
const teaching = read("assets/js/shared/simulation-teaching-components.js");
const assets = read("assets/css/simulation-assets.css");
const shellCss = read("assets/css/simulation-shell.css");
const math = read("assets/js/shared/simulation-math.js");

test("approved simulation mounts the reusable shared shell and assets", () => {
  assert.match(reference, /\.\.\/css\/simulation-assets\.css/);
  assert.match(reference, /\.\.\/js\/shared\/simulation-tailwind-config\.js/);
  assert.match(reference, /\.\.\/js\/shared\/simulation-math\.js/);
  assert.match(reference, /\.\.\/js\/shared\/simulation-shell\.js/);
  assert.match(reference, /PYQSimulationShell\.mount/);
  assert.match(reference, /simulationShell\.setMetadata/);
  assert.doesNotMatch(reference, /<header class="jnani-sim-header/);
  assert.doesNotMatch(reference, /<nav class="jnani-sim-tabs/);
  assert.doesNotMatch(reference, /<main class="jnani-sim-layout/);
});

test("shared shell defines all four modes and reusable playback controls", () => {
  for (const mode of ["question", "understand", "solve", "explore"]) {
    assert.match(shell, new RegExp(`\\["${mode}"`));
  }
  assert.match(shell, /id="tab-\$\{mode\}"/);
  assert.match(shell, /function setActiveMode\(mode\)/);
  assert.match(shell, /return Object\.freeze\(\{ setMetadata, setActiveMode \}\)/);
  assert.match(shell, /setActiveMode\(button\.dataset\.mode\)/);
  for (const id of ["console-content", "timelineScrubber", "sim-controls-bar", "header-badge"]) {
    assert.ok(shell.includes(`id="${id}"`), `shared shell must provide #${id}`);
  }
});

test("simulation assets centralize the reference fonts, shell CSS, and KaTeX", () => {
  assert.match(assets, /fonts\.googleapis\.com\/css2\?family=Inter/);
  assert.match(assets, /katex@0\.16\.8\/dist\/katex\.min\.css/);
  assert.match(assets, /simulation-shell\.css/);
  assert.match(math, /const katexVersion = "0\.16\.8"/);
  assert.match(math, /contrib\/auto-render\.min\.js/);
  assert.match(math, /throwOnError: false/);
  assert.match(math, /The shared KaTeX auto-render library did not initialize/);
});

test("shared simulation console exposes the design-system layout and type tokens", () => {
  for (const token of [
    "--jnani-sim-header-height",
    "--jnani-sim-panel-ratio-canvas",
    "--jnani-sim-panel-ratio-learning",
    "--jnani-sim-toolbar-height",
    "--jnani-sim-content-padding",
    "--jnani-sim-font-title",
    ".jnani-sim-card",
    ".jnani-sim-card-label",
    ".jnani-sim-option-grid",
    ".jnani-sim-option",
    ".jnani-sim-range-row"
  ]) {
    assert.ok(shellCss.includes(token), `shared shell CSS must define ${token}`);
  }
  assert.match(shellCss, /grid-template-columns: minmax\(0, var\(--jnani-sim-panel-ratio-canvas\)\)/);
  assert.match(shellCss, /\.jnani-simulation \.jnani-sim-question-fragment > span[\s\S]*text-transform: none/);
  assert.match(shellCss, /\.jnani-simulation \.jnani-sim-question-fragment > span[\s\S]*font: 12px var\(--jnani-sim-font\)/);
});

test("standalone simulations reuse the shared Common Student Trap component", () => {
  assert.match(reference, /simulation-teaching-components\.js/);
  assert.match(candidate, /simulation-teaching-components\.js/);
  assert.match(reference, /PYQSimulationTeaching\.commonStudentTrap\(m\)/);
  assert.match(candidateController, /PYQSimulationTeaching\.commonStudentTrap\(step\.trap\)/);
  assert.match(angularKinematics, /simulation-teaching-components\.js/);
  assert.match(angularKinematicsController, /PYQSimulationTeaching\.commonStudentTrap\(step\.trap\)/);
  assert.match(teaching, /Common Student Trap:/);
  assert.match(teaching, /Wrong:/);
  assert.match(teaching, /Fix:/);
});

test("angular kinematics candidate mounts the shared shell and required assets", () => {
  for (const resource of ["simulation-assets.css", "simulation-tailwind-config.js", "simulation-math.js", "simulation-teaching-components.js", "simulation-shell.js"]) {
    assert.ok(angularKinematics.includes(resource), `Q31 page references ${resource}`);
  }
  assert.match(angularKinematicsController, /PYQSimulationShell\.mount/);
  assert.match(angularKinematicsController, /shell\.setActiveMode\(mode\)/);
  assert.match(studio, /"angular-kinematics":"angular-kinematics\.html"/);
});

test("velocity-field candidate mounts the shared shell and is reachable from the studio", () => {
  assert.match(candidate, /\.\.\/css\/simulation-assets\.css/);
  assert.match(candidate, /\.\.\/js\/shared\/simulation-tailwind-config\.js/);
  assert.match(candidate, /\.\.\/js\/shared\/simulation-math\.js/);
  assert.match(candidate, /\.\.\/js\/shared\/simulation-shell\.js/);
  assert.match(candidateController, /PYQSimulationShell\.mount/);
  assert.match(candidateController, /shell\.setActiveMode\(mode\)/);
  assert.match(candidateController, /data-ustep/);
  assert.match(candidateController, /data-sstep/);
  assert.match(candidateController, /data-coordinate/);
  assert.match(studio, /"velocity-field-acceleration":"velocity-field-acceleration\.html"/);
  assert.match(studio, /velocity-field-seed-v1/);
  assert.doesNotMatch(candidate, /<header class="jnani-sim-header/);
});

test("position-dependent motion candidate mounts the same shared shell and teaching component", () => {
  assert.match(positionDependent, /\.\.\/css\/simulation-assets\.css/);
  assert.match(positionDependent, /\.\.\/js\/shared\/simulation-tailwind-config\.js/);
  assert.match(positionDependent, /\.\.\/js\/shared\/simulation-math\.js/);
  assert.match(positionDependent, /\.\.\/js\/shared\/simulation-teaching-components\.js/);
  assert.match(positionDependent, /\.\.\/js\/shared\/simulation-shell\.js/);
  assert.match(positionDependentController, /PYQSimulationShell\.mount/);
  assert.match(positionDependentController, /shell\.setActiveMode\(mode\)/);
  assert.match(positionDependentController, /PYQSimulationTeaching\.commonStudentTrap\(step\.trap\)/);
  assert.match(studio, /"position-dependent-motion":"position-dependent-motion\.html"/);
});
