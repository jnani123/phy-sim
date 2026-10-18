const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const source = fs.readFileSync(path.join(__dirname, "../assets/js/shared/simulation-question-data.js"), "utf8");
function makeContext(search, stored = "[]") {
  const context = {
    URLSearchParams,
    window: {
      location: { search },
      localStorage: { getItem: () => stored }
    },
    console
  };
  vm.runInNewContext(source, context);
  return context.window.PYQSimulationQuestionData;
}

const record = { id: "q28", text: "Question text", options: "(1) A", simulation: { engine: "velocity-field-acceleration" } };

test("question link payload opens the selected simulation without local storage", () => {
  const params = new URLSearchParams({ questionId: record.id, questionData: JSON.stringify(record) });
  const data = makeContext(`?${params}`, "not valid JSON").loadQuestion("velocity-field-acceleration");
  assert.equal(data.id, record.id);
  assert.equal(data.text, record.text);
});

test("saved question library remains a fallback for legacy links", () => {
  const data = makeContext(`?questionId=${record.id}`, JSON.stringify([record])).loadQuestion("velocity-field-acceleration");
  assert.equal(data.id, record.id);
});

test("question data must match both the selected id and simulation engine", () => {
  const params = new URLSearchParams({ questionId: record.id, questionData: JSON.stringify(record) });
  assert.equal(makeContext(`?${params}`, "[]").loadQuestion("position-dependent-motion"), null);
  assert.equal(makeContext("?questionId=q29", JSON.stringify([record])).loadQuestion("velocity-field-acceleration"), null);
});

test("Question 28 and 29 pages both import and use the shared handoff", () => {
  const studio = fs.readFileSync(path.join(__dirname, "../assets/js/app.js"), "utf8");
  assert.match(studio, /questionData=\$\{encodeURIComponent\(JSON\.stringify\(/);
  for (const [pageName, controllerName, engine] of [
    ["velocity-field-acceleration.html", "velocity-field-acceleration.js", "velocity-field-acceleration"],
    ["position-dependent-motion.html", "position-dependent-motion.js", "position-dependent-motion"]
  ]) {
    const page = fs.readFileSync(path.join(__dirname, `../assets/simulations/${pageName}`), "utf8");
    const controller = fs.readFileSync(path.join(__dirname, `../assets/js/simulations/${controllerName}`), "utf8");
    assert.match(page, /simulation-question-data\.js/);
    assert.match(controller, new RegExp(`loadQuestion\\("${engine}"\\)`));
  }
});

test("shared text tokens are applied to question and Understand content", () => {
  const css = fs.readFileSync(path.join(__dirname, "../assets/css/simulation-shell.css"), "utf8");
  assert.match(css, /--jnani-sim-font-question:\s*16px/);
  assert.match(css, /--jnani-sim-font-equation:\s*clamp\(16px/);
  assert.match(css, /\.jnani-sim-question-fragment[\s\S]*font-size:\s*var\(--jnani-sim-font-question\)/);
  const q31 = fs.readFileSync(path.join(__dirname, "../assets/js/simulations/angular-kinematics.js"), "utf8");
  assert.match(q31, /jnani-sim-question-text/);
  const q31Html = fs.readFileSync(path.join(__dirname, "../assets/simulations/angular-kinematics.html"), "utf8");
  assert.doesNotMatch(q31Html, /jnani-ak-question\{font-size:/);
});
