const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("shared Given / Find component preserves math delimiters and escapes markup", () => {
  const context = { window: {} };
  vm.runInNewContext(read("assets/js/shared/simulation-teaching-components.js"), context);
  const html = context.window.PYQSimulationTeaching.givenAndAsked({
    given: [String.raw`\(\vec v=-x\hat i\)`, "<unsafe>"],
    find: String.raw`\(|\vec a|\)`
  });
  assert.ok(html.includes(String.raw`\(\vec v=-x\hat i\)`));
  assert.ok(html.includes(String.raw`\(|\vec a|\)`));
  assert.ok(html.includes("&lt;unsafe&gt;"));
  assert.match(html, /<h3>Given<\/h3>/);
  assert.match(html, /<h3>Find<\/h3>/);
  assert.throws(() => context.window.PYQSimulationTeaching.givenAndAsked({ given: [], find: "x" }), error => error.name === "TypeError");
});

test("every current simulation ends Understand with the shared recap renderer", () => {
  const candidates = [
    ["assets/simulations/youngs-modulus-error.html", "\\(d=0.08\\"],
    ["assets/js/simulations/velocity-field-acceleration.js", "givenAsked: true"],
    ["assets/js/simulations/position-dependent-motion.js", "givenAsked: true"],
    ["assets/js/simulations/electric-field-energy-density.js", "givenAsked: true"],
    ["assets/js/simulations/kepler-orbital-period.js", "givenAsked: true"],
    ["assets/js/simulations/angular-kinematics.js", "givenAsked: true"]
  ];
  for (const [file, marker] of candidates) {
    const source = read(file);
    assert.ok(source.includes(marker), `${file} includes its question-specific Given / Find data`);
    assert.ok(source.includes("PYQSimulationTeaching.givenAndAsked"), `${file} calls the shared component`);
  }
});

test("final Understand recap rule is documented in build and acceptance standards", () => {
  assert.match(read("docs/SIMULATION_CONTENT_STANDARD.md"), /final Understand stage[\s\S]*Given \/ Find[\s\S]*PYQSimulationTeaching\.givenAndAsked/);
  assert.match(read("docs/SIMULATION_ACCEPTANCE_CHECKLIST.md"), /final Understand stage uses the shared Given \/ Find component/);
  assert.match(read("docs/SIMULATION_QA_STANDARD.md"), /final Understand stage uses the shared Given \/ Find component/);
});

test("Start Debugging uses its own workspace server port instead of the occupied old port", () => {
  const launch = read(".vscode/launch.json");
  const task = read(".vscode/tasks.json");
  const server = read("scripts/serve_jnani.py");
  assert.match(launch, /http:\/\/localhost:8002\/index\.html/);
  assert.match(task, /scripts\/serve_jnani\.py[\s\S]*?port 8002/);
  assert.match(server, /ROOT = Path\(__file__\)\.resolve\(\)\.parents\[1\]/);
  assert.match(server, /app\.js\?v=20261017-24/);
});
