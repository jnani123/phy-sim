const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

test("shared view toolbar provides accessible zoom and reset actions", () => {
  const source = read("assets/js/shared/simulation-view-controls.js");
  let controls;
  vm.runInNewContext(source, { window: { set PYQSimulationViewControls(value) { controls = value; } } });
  const markup = controls.markup();
  assert.match(markup, /role="group" aria-label="Simulation view controls"/);
  assert.match(markup, /data-sim-view="out" aria-label="Zoom out"/);
  assert.match(markup, /data-sim-view="in" aria-label="Zoom in"/);
  assert.match(markup, /data-sim-view="reset">Reset View/);

  let listener;
  const rootElement = {
    addEventListener: (_name, callback) => { listener = callback; },
    removeEventListener: (_name, callback) => { assert.equal(callback, listener); },
    contains: () => true
  };
  const calls = [];
  const unbind = controls.bind(rootElement, {
    out: () => calls.push("out"), in: () => calls.push("in"), reset: () => calls.push("reset")
  });
  for (const action of ["out", "in", "reset"]) {
    let prevented = false;
    listener({ target: { closest: () => ({ dataset: { simView: action } }) }, preventDefault: () => { prevented = true; } });
    assert.equal(prevented, true);
  }
  assert.deepEqual(calls, ["out", "in", "reset"]);
  unbind();
});

test("Q32 imports and uses shared view controls and has no mojibake in scene labels", () => {
  const html = read("assets/simulations/parallel-plate-capacitor.html");
  const controller = read("assets/js/simulations/parallel-plate-capacitor.js");
  assert.match(html, /shared\/simulation-view-controls\.js/);
  assert.match(controller, /PYQSimulationViewControls\.markup\(\)/);
  assert.match(controller, /PYQSimulationViewControls\.bind/);
  assert.match(controller, /Cross-section: layers are stacked/);
  assert.match(controller, /Series-equivalent model of the two layers/);
  assert.match(controller, /Dielectric[\s\S]*C1 = 10C[\s\S]*Air[\s\S]*C2 = 2C/);
  assert.match(controller, /state\.mode === "solve" && state\.step >= 2/);
  assert.doesNotMatch(controller, /Â|âˆ’|â†/);
});
