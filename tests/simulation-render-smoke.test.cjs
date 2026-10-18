const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");

class Element {
  constructor(id = "") {
    this.id = id;
    this.innerHTML = "";
    this.textContent = "";
    this.value = "";
    this.disabled = false;
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  }
  addEventListener() {}
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  setPointerCapture() {}
  closest(selector) { return this.matchesSelector === selector ? this : null; }
  querySelector() { return new Element(); }
  querySelectorAll() { return []; }
}

function runSimulation(engine, controller, question) {
  const elements = new Map();
  const events = {};
  const element = id => {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
  };
  const rootElement = element("simulation-shell-root");
  rootElement.querySelector = () => new Element();
  const document = {
    title: "",
    body: element("body"),
    getElementById: element,
    querySelector: () => new Element(),
    querySelectorAll: () => [],
    addEventListener: (type, fn) => { events[type] = fn; }
  };
  const window = {
    location: { search: `?questionId=${question.id}`, origin: "http://localhost:8002" },
    parent: null,
    addEventListener() {},
    PYQSimulationQuestionData: { loadQuestion: selectedEngine => selectedEngine === engine ? question : null },
    PYQSimulationPhysics: {},
    PYQPhysicsEngines: {},
    PYQSimulationMath: { render: () => Promise.resolve() },
    PYQSimulationViewControls: { markup: () => '<div class="shared-view-controls"></div>', bind: () => () => {} },
    PYQSimulationTeaching: {
      givenAndAsked: () => '<section class="given-asked">Given and find</section>',
      commonStudentTrap: () => '<section class="student-trap">Common Student Trap</section>'
    },
    PYQSimulationShell: {
      mount: config => {
        config.root.querySelector("[data-shell-toolbar]").innerHTML = config.toolbar;
        config.root.querySelector("[data-shell-visualization]").innerHTML = config.visualization;
        window.modeChange = config.onModeChange;
        return { setActiveMode() {}, setMetadata() {} };
      }
    }
  };
  const localStorage = { getItem: () => JSON.stringify([question]) };
  const context = {
    window, document, localStorage, console, Math, Number, String, Object, Array, Date, JSON,
    URLSearchParams, location: window.location, parent: null, Promise, setInterval: () => 1, clearInterval() {}, setTimeout: () => 1,
    requestAnimationFrame: callback => callback(), cancelAnimationFrame() {}
  };
  const engineSource = fs.readFileSync(path.join(root, `assets/js/physics/${engine}.js`), "utf8");
  vm.runInNewContext(engineSource, context, { filename: `${engine}.js` });
  vm.runInNewContext(fs.readFileSync(path.join(root, `assets/js/simulations/${controller}.js`), "utf8"), context, { filename: `${controller}.js` });
  return { content: element("console-content"), scene: element(engine === "velocity-field-acceleration" ? "vfa-scene" : engine === "position-dependent-motion" ? "pdm-scene" : "angular-scene"), changeMode: window.modeChange, events, document };
}

test("Question 28 renders content and its Understand tab renders content at runtime", () => {
  const question = { id: "q28", options: "(1) √6\n(2) 9\n(3) √33\n(4) 0", questionNumber: "28", topic: "Velocity field and acceleration", chapter: "Motion in a plane", simulation: { engine: "velocity-field-acceleration" } };
  const page = runSimulation("velocity-field-acceleration", "velocity-field-acceleration", question);
  assert.match(page.content.innerHTML, /The velocity of a particle/);
  assert.match(page.scene.innerHTML, /<line/);
  page.changeMode("understand");
  assert.match(page.content.innerHTML, /Velocity field/);
});

test("Question 29 renders content and its Understand tab renders content at runtime", () => {
  const question = { id: "q29", options: "1. A, B and C only\n2. B, C and D only\n3. A, C and D only\n4. A, B and D only", questionNumber: "29", topic: "Position-dependent motion", chapter: "Laws of motion", simulation: { engine: "position-dependent-motion" } };
  const page = runSimulation("position-dependent-motion", "position-dependent-motion", question);
  assert.match(page.content.innerHTML, /The position of an object/);
  assert.match(page.scene.innerHTML, /<line/);
  page.changeMode("understand");
  assert.match(page.content.innerHTML, /The position of an object having mass/);
});

test("Question 31 renders its prompt and Understand content at runtime", () => {
  const question = { id: "q31", options: "(1) 150\n(2) 120\n(3) 130\n(4) 170", questionNumber: "31", topic: "Angular position, velocity and acceleration", chapter: "Rotational Motion", simulation: { engine: "angular-kinematics", parameters: { timeSeconds: 0 } } };
  const page = runSimulation("angular-kinematics", "angular-kinematics", question);
  assert.match(page.content.innerHTML, /A particle is rotating/);
  assert.ok(page.content.innerHTML.includes(String.raw`\[\theta=`));
  page.changeMode("understand");
  assert.match(page.content.innerHTML, /Question part/);
});

test("Question 32 renders Question, Understand, Solve, and Explore content at runtime", () => {
  const question = { id: "q32", text: "A parallel plate air capacitor has capacitance C and is half filled by K=5.", options: "(1) 33.34\n(2) 66.67\n(3) 200\n(4) 400", questionNumber: "32", exam: "JEE Main", year: "2026", month: "April", date: "2nd", set: "1", topic: "Partially filled capacitor", chapter: "Electrostatic potential and capacitance", simulation: { engine: "parallel-plate-capacitor", parameters: { dielectricConstant: 5, filledFraction: 0.5 } } };
  const page = runSimulation("parallel-plate-capacitor", "parallel-plate-capacitor", question);
  assert.match(page.content.innerHTML, /A parallel plate air capacitor/);
  assert.match(page.content.innerHTML, /66\.67/);
  page.changeMode("understand");
  assert.match(page.content.innerHTML, /A parallel plate air capacitor has a capacitance/);
  assert.doesNotMatch(page.content.innerHTML, /The two material regions are arranged/);
  page.changeMode("solve");
  assert.match(page.content.innerHTML, /Find the dielectric-section capacitance/);
  assert.match(page.content.innerHTML, /Common Student Trap/);
  assert.ok(page.content.innerHTML.includes(String.raw`\[C_1=`));
  page.changeMode("explore");
  assert.match(page.content.innerHTML, /Capacitor lab/);
  assert.match(page.content.innerHTML, /66\.67%/);
});
