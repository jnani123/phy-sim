# Simulation QA Standard

This standard is a mandatory quality gate for every new JNANI Physics
simulation and every modification to an existing one. Successful code
generation, compilation, or a single successful page load does not establish
completion.

## Reference and baseline

Use the actual **Units and Measurements — Errors in Measurements** simulation
(`assets/simulations/youngs-modulus-error.html`) as the approved visual and
interaction reference. Inspect its implementation and the shared assets it
uses before changing a candidate. Reuse the existing UI conventions,
mathematical rendering library/configuration, shared helpers, and physics-engine
patterns where appropriate. Never alter the approved reference merely to make
a candidate pass.

Apply [`JNANI_DESIGN_STANDARD.md`](JNANI_DESIGN_STANDARD.md) to keep the
standalone console consistent, and use
[`SIMULATION_CONTENT_STANDARD.md`](SIMULATION_CONTENT_STANDARD.md) to judge
whether the four-mode journey teaches enough for independent student use.

The current reference uses KaTeX 0.16.8, Inter and JetBrains Mono, and the
shared shell/assets in `assets/js/shared/simulation-shell.js`,
`assets/js/shared/simulation-math.js`, `assets/css/simulation-assets.css`, and
`assets/css/simulation-shell.css`. Its calculation engine has focused Node
tests in `tests/youngs-modulus-error.test.cjs`; shell reuse is guarded by
`tests/simulation-shell.test.cjs`. Confirm the actual project state before
relying on a tool, script, dependency, or test command; do not claim a check was
run when it was not.

## Mandatory shared-asset and component reuse

Before implementing each new question, inspect the approved reference and
inventory the actual project assets/components, including
`assets/js/shared/simulation-shell.js`,
`assets/js/shared/simulation-math.js`,
`assets/js/shared/simulation-tailwind-config.js`,
`assets/css/simulation-assets.css`, `assets/css/simulation-shell.css`,
`index.html`, `assets/css/studio.css`, `assets/js/simulation-theme.js`,
`assets/js/shared/canvas-components.js`, and the reference's real imports.
Extend the inventory when the project changes; a filename or matching
screenshot does not establish reuse.

- Mount `window.PYQSimulationShell` for the branded header, metadata, responsive
  canvas/content layout, Question/Understand/Solve/Explore tabs, and playback
  controls. Use its metadata/toolbar/visualization/mode-handler interface; do
  not hand-author replacements for shell-owned elements.
- Reference `simulation-assets.css`, the shared Tailwind config, and the shared
  KaTeX loader/config. Reuse the existing shared fonts, design tokens,
  stylesheets, and helpers wherever applicable.
- If a resource exists only as embedded markup/setup in the approved reference,
  do not copy it into every question. Extract it as a shared resource when safe
  and practical, preserving reference appearance and behavior and adding
  regression checks.
- Keep question-specific physics, diagrams, animation, and instructional
  content separate from shared UI. New candidates must import/reference shared
  resources directly; visual similarity alone is not compliance.
- Do not duplicate shared resources unless the exception is justified and
  documented. Verify the actual import/reference and runtime use in the
  candidate.
- Any shared-resource change requires relevant automated regression tests and
  browser regression checks on the approved reference.
- If the current architecture prevents safe reuse, document the exact limitation
  and a minimal migration plan. Do not claim the shared-foundation criterion is
  satisfied until a future candidate demonstrably imports/references the shared
  foundation and passes visual/interaction regression against the reference.

The studio (`index.html`) remains a distinct application context with its own
app shell and KaTeX 0.16.22. The standalone approved simulation uses the shared
simulation shell and KaTeX 0.16.8. Do not represent the studio as sharing the
simulation shell; aligning those separate contexts requires a separately scoped
migration. The Tailwind CSS runtime remains CDN-hosted, though its theme config
is centralized. The approved JP logo is a CSS/text mark rather than an image
file.

## Mandatory generate-test-fix-retest workflow

For each simulation task:

1. Identify the question, expected result, affected files, shared dependencies,
   available test commands, regression surfaces, and reusable asset/component
   inventory.
2. Independently derive the governing physics and expected numerical results.
   Resolve ambiguities explicitly; do not silently invent assumptions.
3. Implement the simulation and focused automated tests. Prefer independent
   expected values and reusable, data-driven helpers over duplicated
   question-specific test infrastructure.
4. Run all applicable automated tests.
5. Serve and open the simulation in a real browser with the available
   browser-testing tools. Exercise every learning mode, every meaningful stage,
   and each implemented interaction; verify effects rather than merely
   clicking controls.
6. Audit physics, all rendered mathematics, layout, overlap, responsiveness,
   runtime behavior, accessibility/reduced motion where supported, and visual
   consistency against the approved reference. Verify shared imports/references
   in source and at runtime; document justified duplication or migration
   limitations.
7. Record failures, fix every reproducible in-scope defect, and repeat affected
   checks.
8. Run the full applicable regression suite again, including the reference
   simulation's tests when shared code or assets are affected.
9. Complete the pass/fail report below before reporting completion.

Do not stop after initial load, an initial screenshot, or the first successful
test run. If a required browser, viewport, screenshot, or automation check is
unavailable, mark that check **NOT TESTED** and explain why.

## Physics correctness audit

Verify that:

- Each formula and model applies to the actual question and governing physics.
- Every derivation follows logically; vectors, signs, directions, axes, and
  coordinate conventions are consistent.
- Substitution and arithmetic are independently checked; SI conversions,
  dimensions, units, significant figures, approximations, and answer formatting
  are appropriate.
- The displayed answer agrees with the question's choices and the independent
  result.
- Boundary conditions, unusual inputs, and meaningful edge cases behave
  correctly.
- The visualization, numerical calculations, and written solution agree.
- Tests use independently calculated expected results where practical, rather
  than the implementation under test as its own oracle.

Flag ambiguity in the question or supplied solution instead of concealing it
with an assumption.

## Mathematical rendering audit

Inspect the actual rendered browser output for every equation and expression in
every mode, step, and meaningful state. Check applicable:

- Greek letters; vector arrows and hats; subscripts and superscripts.
- Fractions, roots, derivatives, integrals, sums, brackets, and scientific
  notation.
- Multiplication/minus signs, inequalities, degree symbols, and units mixed
  with prose.
- Inline and display math in question text, cards, buttons, labels, tooltips,
  solution steps, and responsive panels.
- Missing glyphs, font loading/fallback, initialization errors, clipping,
  overflow, wrapping, baseline alignment, and legibility.

Use the approved math-rendering library and configuration. Do not add another
math renderer without documented technical need and approval. Source inspection
alone is not proof of correct math rendering.

- When math is inserted from JavaScript-generated HTML, preserve the delimiter
  backslashes in the generated markup (for example, use `String.raw` or escape
  backslashes correctly). Add a regression assertion against the generated
  markup so a template-string escape cannot silently turn `\\(` into plain
  text. Verify that the inserted content is passed to the shared renderer.

## Reference visual and interaction comparison

Compare all four modes—Question, Understand, Solve, and Explore—at initial and
meaningful post-interaction states. Compare:

- Header, logo, title, metadata, navigation, fonts, type hierarchy, colors,
  contrast, borders, spacing, alignment, and panel proportions.
- Buttons, icons, sliders, labels, toolbars, canvas/drawing area, question,
  options, explanations, equations, and annotations.
- Loading, empty, error, reset, and completed states as applicable.
- State transitions and consistency between modes.
- After every Next/Previous, guided transition, timeline mode change, and tab
  click, confirm that the matching Question/Understand/Solve/Explore tab is
  highlighted and has `aria-current="step"`.
- Representative mobile, tablet, and desktop viewports.

Use the reference's actual design system rather than making a loosely similar
alternative. If automated visual comparison is unavailable, capture practical
screenshots of reference and candidate at matching viewport sizes and inspect
them side by side. Do not claim pixel-perfect verification unless a measured
pixel comparison was performed.

## Overlap and layout audit

Inspect every mode and meaningful stage for:

- Text-to-text or equation-to-label/content collisions.
- Labels covering diagrams, vectors, objects, or controls.
- Content escaping its panel, clipped/truncated prompts or solutions, hidden
  buttons/sliders, and incorrect stacking or z-index.
- Misaligned arrows, dimension lines, or annotations.
- Canvas content cut off after viewport or panel resizing.
- Zoom in/out, free scene dragging, two-axis yaw/pitch orbit for 3D scenes, and
  reset-view controls work without conflicting with playback or learning
  navigation. Drag in horizontal, vertical, and diagonal directions and confirm
  that each changes the viewpoint; dragging the view must not change physics
  values.
  For 2D panning, confirm right/down pointer movement moves the scene
  right/down, then verify reset returns the original framing.
- The selected 2D/3D view suits the physics; inspect the most crowded meaningful
  state at high zoom.
- Understand excerpts preserve source notation and casing, with neutral
  sentence-case labels.
- Unintended horizontal scrolling and content concealed by sticky/floating
  controls.
- Misplacement or collisions after changing font size, viewport, or parameters.

Use DOM geometry checks where appropriate and screenshots for canvas/SVG
collisions that DOM checks cannot detect. Fix every overlap that harms
readability or interaction.

## Mode and interaction coverage

Exercise all applicable controls, including play, pause, restart, speed,
previous/next, sliders, dropdowns, keyboard controls, and reset. Revisit modes
and verify that state is not stale or inconsistent.

### Question

- Full prompt and every option are visible and correct.
- Metadata and notation are correct.
- Simulation and playback controls have the expected behavior.

### Understand

- Every conceptual stage is reachable and explains the intended part of the
  question.
- The final Understand stage uses the shared Given / Find component and lists
  all supplied values, equations, conditions, and relevant statement set, plus
  the exact requested quantity. Verify the notation and units, inspect the
  rendered math in the browser, and confirm it does not expose the solution.
- The visualization matches that stage's explanation.
- Navigation neither skips nor duplicates content.
- The worked solution is not revealed prematurely.

### Solve

- Every solution step is accessible and correctly ordered.
- Every Solve step shows the shared Common Student Trap component with a
  question-accurate wrong approach and correction; verify the shared import and
  inspect its rendered math and layout in the browser.
- Equations, substitutions, units, answer, and navigation are correct.
- Step navigation remains synchronized with any animation.

### Explore

- Each control changes the intended input, visualization, and derived values.
- Invalid and out-of-range inputs are handled safely.
- Reset restores the documented initial state.
- Mode changes do not leave stale values, labels, or animation state.
- Returning from Explore resets sandbox values and visibility to the documented
  baseline in each learning mode.

## Browser, responsive, and runtime checks

Use available repeatable browser automation and real-browser inspection.
Where supported, check:

- Console errors and relevant warnings; uncaught exceptions and failed network
  requests.
- Missing assets, font failures, and math-renderer initialization.
- Event-handler responsiveness and actual control effects.
- Representative responsive viewports and resizing while the simulation runs.
- Repeated mode navigation, resetting, and replaying animations.
- Reduced-motion behavior and accessibility.

Use screenshots for visual review. State limitations explicitly; do not infer
browser or visual success from unit tests.

## Regression and shared infrastructure

Run all applicable existing tests and the relevant reference tests when shared
code/assets are touched. Verify shared UI components and physics engines
affected by the change. Preserve the approved Units and Measurements simulation.
Fix the candidate rather than changing the reference; report a genuine shared
architecture limitation when that is the blocker.

## Required completion report

Every simulation task must report these items using **PASS**, **FAIL**, or
**NOT TESTED** for each check (a PASS requires actual evidence):

1. **Physics correctness**
2. **Mathematical rendering**
3. **Question mode**
4. **Understand mode**
5. **Solve mode**
6. **Explore mode**
7. **Visual consistency with the reference**
8. **Text and annotation overlap**
9. **Responsive behavior**
10. **Browser console and runtime**
11. **Regression tests**
12. **Shared-asset/component reuse:** PASS / FAIL / NOT TESTED, with actual
    imports/references, runtime evidence, or documented exception and migration
    plan
13. **Issues found and fixes applied**
14. **Remaining issues and limitations**
15. **Exact tests and viewports checked**

Do not report completion while a known reproducible in-scope defect remains in
physics, math rendering, overlapping content, a broken interaction, or a major
visual inconsistency. If unresolved, state the blocker and mark the category
FAIL or NOT TESTED.
