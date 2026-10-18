const assert = require("node:assert/strict");
const { test } = require("node:test");

global.window = global;
require("../assets/js/shared/simulation-teaching-components.js");

test("common student trap renders consistent wrong and correction labels", () => {
  const html = global.PYQSimulationTeaching.commonStudentTrap({
    title: "Ignoring spatial change",
    wrong: String.raw`Set \(\vec a=0\).`,
    fix: String.raw`Include \((\vec v\cdot\nabla)\vec v\).`
  });
  assert.match(html, /Common Student Trap: Ignoring spatial change/);
  assert.match(html, /Wrong:/);
  assert.match(html, /Fix:/);
  assert.match(html, /\\\(\\vec a=0\\\)/);
});

test("common student trap escapes authored text and requires all content", () => {
  const html = global.PYQSimulationTeaching.commonStudentTrap({ title: "<trap>", wrong: "<script>", why: "Use & check" });
  assert.match(html, /&lt;trap&gt;/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Use &amp; check/);
  assert.throws(() => global.PYQSimulationTeaching.commonStudentTrap({ title: "Missing details" }), /requires a title/);
});
