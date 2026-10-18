# JNANI Physics Asset and Component Inventory

This inventory records the repository as inspected on 2026-10-16. It describes
existing code and observed source references; a file's presence or a test's
source assertion does not prove that it loaded or behaved correctly in a
browser. Runtime status is marked **not verified** unless explicitly stated.

## Application contexts

The repository currently has two distinct user interfaces:

1. **PYQ Studio** — `index.html`, `assets/css/studio.css`, and
   `assets/js/app.js`. The studio has its own layout and design tokens, stores
   question records in browser `localStorage`, and opens the approved
   standalone simulation in an iframe.
2. **Standalone simulations** — the approved
   `assets/simulations/youngs-modulus-error.html` and the new
   `assets/simulations/velocity-field-acceleration.html`. Both mount
   `PYQSimulationShell`, reference centralized simulation assets, and read the
   selected question record from same-origin studio storage. Each keeps its
   topic-specific scene and four-mode controller separate.

The studio does not mount the standalone simulation shell. The project build
and QA standards already record this boundary. Treat shared simulation-shell
resources as shared across standalone simulations, not as shared with the
studio.

## Shared standalone-simulation foundation

| Resource | Current responsibility | Actual source references and limits |
|---|---|---|
| `assets/js/shared/simulation-shell.js` | Exposes `window.PYQSimulationShell.mount`; creates the branded header, metadata, toolbar/visualization slots, 55/45 workspace, four mode tabs, content panel, and standard playback controls. | Imported by `assets/simulations/youngs-modulus-error.html`. `tests/simulation-shell.test.cjs` checks source references and shell markup. It is not imported by `index.html` or `assets/js/app.js`. Runtime mounting has not been browser-verified in this audit. |
| `assets/css/simulation-assets.css` | Standalone stylesheet entry point: Inter and JetBrains Mono, KaTeX 0.16.8 stylesheet, shell stylesheet, and small base rules. | Linked by the approved standalone HTML. It imports Google Fonts, jsDelivr KaTeX CSS, and `simulation-shell.css`; those font and CSS resources remain network dependencies. The studio uses its own stylesheet and KaTeX 0.16.22. |
| `assets/css/simulation-shell.css` | Standalone simulation tokens, header, panels, tabs, controls, annotations/equations, and responsive rules. Understand question excerpts use neutral sentence-case labels that preserve source notation. | Imported through `simulation-assets.css`. Source casing and notation conventions are documented in `SIMULATION_BUILD_STANDARD.md`; the approved reference and candidates must be browser-checked after shared style changes. |
| `assets/js/shared/simulation-tailwind-config.js` | Sets the shared Tailwind theme extension for slate colors. | Loaded by the approved standalone HTML before the Tailwind CDN runtime. Tailwind itself is still CDN-hosted. The studio does not use this configuration. |
| `assets/js/shared/simulation-math.js` | Loads KaTeX 0.16.8 and auto-render, exports `PYQSimulationMath.ready`, `.render()`, and a compatibility `renderAllMath`. | Loaded by the standalone HTML. The page calls `renderAllMath` after drawing mode content. The studio instead loads KaTeX 0.16.22 directly and calls its own renderer in `app.js`; the math setup is therefore not shared across contexts. |
| `assets/js/shared/simulation-teaching-components.js` | Exposes `PYQSimulationTeaching.commonStudentTrap({ title, wrong, fix/why })`, a reusable Solve-mode panel with consistent “Common Student Trap”, “Wrong”, and “Fix” labels and escaped authored text. | Imported directly by both standalone simulations. Physics/trap content stays question-specific; the presentation is shared. Covered by `tests/simulation-teaching-components.test.cjs` and source-reuse assertions in `tests/simulation-shell.test.cjs`. |
| `assets/css/simulation-shell.css` responsive rules | Preserve the standalone desktop split and stack panels at narrower widths. | Directly used through `simulation-assets.css`. CSS declarations exist, but viewport behavior and overlap have not been verified in a browser during this audit. |

The shell accepts trusted, authored toolbar and visualization HTML. It safely
assigns metadata with text content, but it does not define a generic question
record schema, physics engine interface, stage-data schema, renderer contract,
or simulation registry.

## Physics, content, and visualization resources

| Resource | Current responsibility | Actual consumers and limits |
|---|---|---|
| `assets/js/physics/youngs-modulus-error.js` | `PYQPhysicsEngines.youngsModulusError.calculate(parameters)` validates inputs and calculates SI dimensions, Young's modulus, relative uncertainty, absolute uncertainty, and alpha. | Loaded by both `index.html` and the standalone simulation HTML. Covered by `tests/youngs-modulus-error.test.cjs` with baseline, changed-diameter, and invalid-input cases. This is one question-specific engine; no general physics-engine framework is present. |
| `assets/js/simulations/youngs-modulus-error.js` | Stores the question-specific Understand stages, Solve steps, and prediction challenges in `PYQSimulationConfigs`. | Loaded by `index.html` and used by `app.js` for its studio-side simulation path. The standalone HTML has another embedded set of Solve content and a separate embedded Understand path; it does not consume this configuration file. This creates parallel content sources. |
| `assets/js/simulations/youngs-modulus-error-renderer.js` | Draws a wire, length/extension annotations, diameter inset, and measurement cards to a canvas. | Loaded by `index.html`; `app.js` calls it from `drawMeasurementCanvas()`. The standalone HTML instead draws its own scene using inline functions and a different canvas. |
| `assets/js/shared/canvas-components.js` | Exposes rounded-box, label, and arrow helpers for canvas drawing. | Loaded by `index.html`; the studio-side renderer uses these helpers. The standalone simulation has independent inline drawing code and does not import this helper. Despite the `shared` directory name, its observed consumer is currently the studio-side renderer. |
| `assets/js/simulation-theme.js` | Exposes brand name, palette variable names, and fixed properties for the studio-side simulation. | Loaded by `index.html`; `app.js` and the studio renderer use it. It maps to `--sim-*` values in `studio.css`, not the `--jnani-sim-*` tokens used by the standalone shell. It is not imported by the standalone HTML. |
| `assets/simulations/youngs-modulus-error.html` | Standalone approved reference page, shell integration, embedded mode controller, inline canvas scene, question metadata display, and Explore controls. | Opened by the studio in an iframe for records whose engine is `youngs-modulus-error`. It embeds question-specific Solve data and Understand content, and now calls the shared student-trap renderer from each Solve step. |
| `assets/simulations/velocity-field-acceleration.html` and `assets/js/simulations/velocity-field-acceleration.js` | Question 28 standalone page; mounts the shared shell and implements question breakdown, three Understand stages, six Solve steps, and Explore controls/scene. Its SVG scene shows the selected particle and position vector first, with optional velocity/acceleration vectors, clearer coordinate guides/ticks, draggable orthographic rotation, and wheel zoom. Each Solve step supplies its own likely student trap to the shared renderer. | Opened through the studio's engine-to-page mapping. Uses shared shell/math/theme and teaching-component imports; the SVG field renderer and teaching content are question-specific. Browser QA verified guided entry, Understand-to-Solve and Solve-to-Explore handoffs, six trap panels, coordinate controls, camera interactions, desktop/mobile layout, and no console errors (2026-10-17). |
| `assets/simulations/position-dependent-motion.html` and `assets/js/simulations/position-dependent-motion.js` | Question 29 standalone page; mounts the shared shell and presents the original claims, five question-breakdown stages, eight worked steps with the shared trap component, and an interactive time sandbox. Its SVG scene shows the xy-plane path, position vector, selectively revealed direction arrows, and positive-z indicators for angular momentum and torque. Provides zoom buttons, wheel zoom, drag-to-rotate, and reset-view controls; 2D is retained because the source motion is planar and the out-of-plane quantities are already identified with +z markers. | Opened through the studio engine mapping. Imports the shared shell, KaTeX configuration, theme, styles, and teaching component. Calculations are imported from `assets/js/physics/position-dependent-motion.js`; the scene and question-specific instructional content remain in the controller. A small candidate-scoped tablet header wrap preserves the shared header while preventing the existing one-row header from overflowing at 768 px. Browser and regression checks for the latest view-control and shared excerpt-style changes are recorded in the completion report for this candidate. |
| `assets/js/physics/position-dependent-motion.js` | Testable Question 29 calculation functions for position, velocity, acceleration, momentum, force, angular momentum, torque, and evaluation of the four printed claims. | Imported by the standalone Question 29 controller and covered by `tests/position-dependent-motion.test.cjs`. This is a question-specific physics module; it does not establish a generic shared physics engine framework. |
| `assets/js/physics/velocity-field-acceleration.js` | Testable functions for the given velocity field, material acceleration field, and vector magnitude. | Imported by the new standalone page. Four independent expected-value/validation cases are in `tests/velocity-field-acceleration.test.cjs`. |

### Question 26 — electric-field energy density

`assets/simulations/electric-field-energy-density.html` mounts the same
`PYQSimulationShell` and imports `simulation-assets.css`, the shared Tailwind
theme, KaTeX helper, and Common Student Trap component. Its standalone
controller is `assets/js/simulations/electric-field-energy-density.js`; its
calculation helper is `assets/js/physics/electric-field-energy-density.js`.
The question-specific SVG explains field energy density through field arrows
and a highlighted volume element. The engine provides energy/volume and direct
`ε₀E²` dimension calculations, exponent extraction, comparison, and evaluation
of `2a-b+c`. The scene provides zoom buttons, wheel zoom, 2D drag-to-pan, and
reset-view controls. `assets/js/app.js` seeds the prompt-supported Q26 record and maps
that engine to the standalone page. Focused independent expected-value tests
are in `tests/electric-field-energy-density.test.cjs`. Browser and regression
evidence is recorded in `docs/Q26_SIMULATION_QA.md`.

## Studio and library resources

| Resource | Current responsibility | Actual source references and limits |
|---|---|---|
| `index.html` | Defines the PYQ Studio pages, question-entry form, taxonomy views, modal simulation workspace, and script loading. | Loads `studio.css`, direct Google Fonts, KaTeX 0.16.22, the physics/config/theme/renderer/canvas scripts, and `app.js`. The modal contains both an older in-page simulation workspace and an iframe for the standalone reference. |
| `assets/css/studio.css` | Styles the studio's light dashboard and also retains a large set of dark simulation-workspace styles. | Linked only by `index.html`. Some in-page simulation styles and markup remain even though `app.js` opens the standalone iframe (`standalone-open`) and hides the old workspace content. These are signs of a retained parallel path, not a shared standalone stylesheet. |
| `assets/js/app.js` | Holds the 20-unit syllabus/taxonomy, local question CRUD, search/filter/sort, coverage dashboard, import/export, and simulation launch and interaction logic. | Loaded by `index.html`. It contains an embedded simulation flow and legacy functions alongside the current iframe launch. Its launcher maps the approved reference plus Q26, Q28, Q29, and Q30 engines to standalone pages; a general question-to-simulation registry is not present. Q28 and Q30 localStorage migrations preserve their supplied JEE Main date/set metadata and reset parameters. The legacy Young's-modulus canvas now skips questions that use another physics engine. |
| `localStorage` record schema | Persists question text, options, source, metadata, syllabus tags, solution fields, status, and optional simulation engine/parameters. | Defined and consumed by `app.js`; the standalone reference reads key `orbit-physics-pyq-v1` and the selected `questionId` from the same origin. There is no separate schema/version migration module or shared data module in the inventory. |

### Question 30 — Kepler's third law

`assets/simulations/kepler-orbital-period.html` mounts the shared simulation
shell and references the shared asset stylesheet, Tailwind theme, math helper,
and teaching components. `assets/js/simulations/kepler-orbital-period.js`
contains the question-specific SVG orbit comparison, synchronized animation,
four-mode teaching flow, and parameter controls. Its focused calculation module
is `assets/js/physics/kepler-orbital-period.js`, with independent checks in
`tests/kepler-orbital-period.test.cjs`. The studio seeds Q30 and routes its
engine through `assets/js/app.js`.

No reusable Kepler/orbital-period calculator existed in the physics inventory,
so the focused calculation module is a justified question-specific addition.
If a later question needs the same relation, migrate the normalized period and
ratio functions into a shared orbital mechanics module and keep this simulation
as a consumer. The shared shell, math setup, teaching component, and styling are
reused directly rather than duplicated.

## Tests and QA infrastructure

| Resource | Current coverage | Limits observed |
|---|---|---|
| `tests/youngs-modulus-error.test.cjs` | Uses Node's built-in test/assert APIs to check selected physics outputs and invalid values. | No browser, rendered-math, interaction, responsive, or visual comparison checks. |
| `tests/simulation-teaching-components.test.cjs` | Checks shared trap labels, math delimiters, text escaping, `why` compatibility, and required fields. | Component markup/browser presentation is checked in standalone simulations, not in a dedicated visual regression suite. |
| `tests/velocity-field-acceleration.test.cjs` | Checks velocity/acceleration values at the supplied point, origin, another independent point, magnitudes, invalid inputs, and source contracts for math delimiters, point-first rendering, orbit/zoom, and staged vector controls. | Automated source/physics coverage is supplemented by headless Chrome interaction checks performed on 2026-10-17. |
| `tests/simulation-shell.test.cjs` | Checks approved-reference and candidate shared imports, shared tokens/components, and launcher integration. | Source-level checks only; does not verify runtime behavior or visual comparison. |
| `docs/SIMULATION_BUILD_STANDARD.md` | Documents the intended integration and existing standalone foundation, including the studio/standalone distinction. | It is instruction/documentation, not an implementation or a runtime test. |
| `docs/SIMULATION_QA_STANDARD.md` and `docs/SIMULATION_ACCEPTANCE_CHECKLIST.md` | Define the mandatory candidate, reference, physics, math, interaction, responsive, overlap, browser, and regression checks. | This audit did not execute those checks; each simulation task must still report evidence for the checks it actually performs. |

No browser automation configuration or visual-regression tooling was found in
the repository file inventory. This is an inventory finding, not a claim that
such tooling cannot be installed or run in the environment.

## Vision-document status

Present:

- `AGENTS.md`
- `docs/SIMULATION_BUILD_STANDARD.md`
- `docs/SIMULATION_QA_STANDARD.md`
- `docs/SIMULATION_ACCEPTANCE_CHECKLIST.md`
- `docs/JNANI_DESIGN_STANDARD.md` — standalone console contract and current
  source-derived visual token baseline.
- `docs/SIMULATION_CONTENT_STANDARD.md` — student-learning sufficiency rubric
  for the four shared modes.

Still not present in the inspected file inventory, though called for by the
project vision:

- `docs/PHYSICS_ENGINE_STANDARD.md` — verified engine conventions and shared
  calculation boundaries.
- This inventory was missing before this document was added.

The design standard records implementation values, not a claim of measured
pixel-perfect correspondence. Continue to verify the shared presentation in a
real browser when adding or changing simulations.

## Alignment findings and minimal migration plan

### Already supported by source

- The standalone reference actually mounts the shared shell and links the
  shared simulation CSS, Tailwind theme configuration, and math helper.
- One question's physics is in a separate calculation module and has focused
  unit tests.
- The studio stores source question details separately from the source answer,
  AI explanation, and verified solution fields.
- Mandatory QA and acceptance requirements are written down.

### Gaps to close before scaling

1. **Choose one simulation presentation/content path.** The studio-side legacy
   simulation workspace and standalone reference contain overlapping mode,
   canvas, and teaching logic. First trace which path is intentionally retained;
   then remove or migrate obsolete pieces in a separately scoped code change.
   Do not delete them based on this documentation audit alone.
2. **Make the standalone integration reusable.** Define a small question
   simulation interface/registry that maps a question's engine identifier to
   its data, physics module, visualization, and mode content while using the
   shared shell. Keep the new interface compatible with the current approved
   question and regression-check it before adding another candidate.
3. **Prevent content drift.** Decide which file owns the approved reference's
   Understand and Solve data; have all live presentation paths consume that
   source instead of keeping parallel copies.
4. **Complete the physics-engine standard.** Document engine conventions and
   calculation boundaries from actual code and tests.
5. **Build repeatable browser QA.** Add browser checks for a candidate and the
   approved reference when practical; until then, run and report manual browser
   checks as required by the QA standard.
6. **Validate the workflow with one new question.** Only after the integration
   and QA path is ready, implement one new question and confirm actual shared
   imports, all four modes, parameter effects, responsive behavior, and
   reference regression.

This inventory itself changes no runtime behavior. It establishes the current
baseline and flags migration work without claiming that the remaining vision
has already been achieved.
