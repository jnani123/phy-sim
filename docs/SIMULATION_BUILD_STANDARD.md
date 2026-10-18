# Simulation Build Standard

This document governs implementation of every JNANI Physics question
simulation. The [`SIMULATION_QA_STANDARD.md`](SIMULATION_QA_STANDARD.md) is the
mandatory verification and completion gate; follow it for every new simulation
and every simulation change. The root [`AGENTS.md`](../AGENTS.md) makes this
requirement applicable to project work.

The shared presentation contract is
[`JNANI_DESIGN_STANDARD.md`](JNANI_DESIGN_STANDARD.md). The learning-content
bar is [`SIMULATION_CONTENT_STANDARD.md`](SIMULATION_CONTENT_STANDARD.md).
Question authors should focus their implementation on the physics, scene, and
teaching journey; the shared shell owns the recurring console experience.

## Before implementation

- Read the question, options, and supplied solution. Independently derive the
  physics, expected values, units, and answer; identify ambiguities before
  coding.
- Inspect the approved Units and Measurements — Errors in Measurements
  implementation at `assets/simulations/youngs-modulus-error.html`, its
  calculation/renderer files, and `assets/css/simulation-shell.css`.
- Inventory existing assets and components before implementation. Inspect
  `index.html`, `assets/css/simulation-shell.css`, `assets/css/studio.css`,
  `assets/js/simulation-theme.js`, `assets/js/shared/canvas-components.js`,
  the approved simulation, and its imported scripts/styles to establish what
  is actually shared. Also inspect applicable physics engines, math rendering,
  registries, tests, and regression surfaces; verify current paths and imports
  rather than relying on this list alone.
- Reuse the existing logo/brand asset, fonts, design tokens, shared styles,
  math-rendering configuration, application shell, header, navigation, panels,
  controls, and helpers wherever applicable. New simulations must import or
  reference shared resources; visual resemblance alone is not reuse. Keep
  question-specific physics, diagrams, animation, and teaching content
  separate from shared UI.
- Do not copy embedded reference markup or assets into each question. Where an
  approved-reference resource is embedded and can safely be extracted, extract
  it as a shared resource, preserve the reference's appearance and behavior,
  and add regression coverage. Do not duplicate shared components/assets
  without a documented, justified exception.
- Integrate through `assets/js/shared/simulation-shell.js`:

  ```js
  const shell = window.PYQSimulationShell.mount({
    root: document.getElementById("simulation-shell-root"),
    question: { title, chapter, topic, label },
    toolbar: questionToolbarMarkup,
    visualization: questionVisualizationMarkup,
    onModeChange: mode => renderQuestionMode(mode)
  });
  shell.setMetadata({ title, chapter, topic, label });
  ```

  The shell owns the shared branded header, metadata, 55/45 responsive
  workspace, four mode tabs, playback/speed/timeline controls, and the
  `#console-content` panel. The question controller owns the question record,
  physics engine, Understand-stage/solution data and renderer, and any
  topic-specific controls/visualization. Put mode content in `#console-content`;
  use the `onModeChange` callback for all four mode transitions. Supply only
  trusted authored toolbar/visualization markup. Header metadata is rendered as
  text. For a canvas-only topic, provide its canvas fragment; no shared
  drawing/physics engine is imposed.
- Keep the highlighted mode tab synchronized with the mode content for every
  navigation path. The shared shell provides `shell.setActiveMode(mode)`;
  call it whenever the controller changes mode, including Next/Previous,
  guided transitions, playback timeline navigation, and sandbox entry/exit.
  Verify both the active styling and `aria-current` after each transition.
- Keep the approved reference unchanged. Do not alter shared assets in a way
  that risks changing its visual or functional behavior without explicit scope
  and regression evidence.

### Shared-resource baseline

The standalone simulation foundation is now:

- `assets/js/shared/simulation-shell.js`: shared branding/header, metadata,
  responsive canvas/content layout, four-mode navigation, and playback controls.
  The approved JP logo is a shared text/CSS mark (no separate logo image exists).
- `assets/js/shared/simulation-view-controls.js`: shared Zoom out, Zoom in,
  Reset View markup and event binding for the workspace toolbar. Import it and
  supply topic-specific zoom/reset callbacks; do not recreate this control row.
- `assets/css/simulation-assets.css`: one stylesheet entry point for the
  approved Google Fonts, KaTeX stylesheet, simulation shell CSS, and base font
  rules.
- `assets/css/simulation-shell.css`: common tokens, component styling, and
  responsive behavior. Its `--jnani-sim-*` variables are the source of truth
  for shared presentation values; see `JNANI_DESIGN_STANDARD.md`.
- `assets/js/shared/simulation-tailwind-config.js`: common Tailwind theme
  configuration used before the CDN runtime.
- `assets/js/shared/simulation-math.js`: pinned KaTeX 0.16.8 loader and common
  auto-render delimiter/error configuration.
- `tests/simulation-shell.test.cjs`: regression checks that the approved page
  mounts these shared resources rather than declaring a parallel shell.

`assets/css/studio.css`, `assets/js/simulation-theme.js`, and
`assets/js/shared/canvas-components.js` exist for the studio/other rendering
work; do not assume a simulation consumes them unless its imports/runtime show
that it does. The studio page currently has its own app shell and KaTeX 0.16.22;
it is not the standalone simulation shell and is outside this simulation-shell
extraction. The Tailwind runtime remains a CDN dependency; its approved theme
configuration is centralized locally. Keep these distinctions explicit when
checking resource reuse.

## Implementation requirements

- Keep question data, physics calculations, visualization, explanations, and
  answer choices consistent with the independently verified solution.
- Keep physics calculations in an appropriate testable engine/helper and make
  validation behavior explicit for invalid inputs.
- Use the approved math renderer and project UI conventions. Ensure equations
  are readable in prose, cards, controls, scenes, and narrow panels.
- Choose the scene dimension that best explains the physics. Use 3D when depth,
  spatial orientation, or out-of-plane behavior matters; keep planar topics in
  2D when 3D would add visual noise. In either case, provide zoom in/out and a
  reset-view control. A spatial 3D scene must let students drag the figure/scene
  in every direction: horizontal dragging changes camera yaw and vertical
  dragging changes camera pitch. Do not limit orbit to a single axis. Keep view
  controls discoverable and separate from playback and learning navigation.
  Dragging the view must not silently change the simulated physics values.
  For free scene panning, dragging right/down must move the visible scene
  right/down with the pointer; do not invert either axis. Verify horizontal
  and vertical drag independently, including reset-view behavior.
- Playback should show the complete baseline setup immediately, then animate
  or reveal meaningful changes in a clear sequence. Do not leave an empty scene
  when playback is expected to teach the setup.
- Animation must alter only the physical quantities that actually change in
  the described process. Treat fixed material properties (for example,
  dielectric constant K) as constants unless the question explicitly varies
  them; do not animate them as if they changed with insertion or time.
- Keep animation visually literal and restrained. Do not add decorative pulse,
  wave, oscillation, or traveling effects unless that behavior is part of the
  physics being taught. Equivalent-circuit symbols must use conventional shapes
  and must not obscure the physical scene.
- Returning from Explore to another learning mode restores the documented
  baseline time and visible quantities. Re-entering Explore starts from that
  same baseline so sandbox values do not leak between modes.
- In Understand, preserve the question's original notation, variable names,
  vector symbols, capitalization, and labels. Keep excerpt labels neutral and
  in sentence case; do not turn question text into colored all-caps headings.
- Understand is strictly a question-breakup view: each content stage must show
  only an exact, contiguous excerpt from the supplied question and its matching
  visual state. Do not add explanatory sentences, inferred subquestions,
  conceptual conclusions, extra stage headings, or material-arrangement
  statements that are absent from the question. The only additional content is
  the required final shared Given / Find recap. Put teaching and inference in
  Solve. Compare every Understand excerpt word-for-word with the source and
  verify there are no added explanation stages.
- Provide coherent Question, Understand, Solve, and Explore experiences where
  applicable. Understand teaches what the question asks; Solve presents the
  derivation. Keep stage navigation, controls, animation, and displayed values
  synchronized.
- Every Solve step must include a question-specific **Common Student Trap**:
  name a plausible wrong approach and explain the correction. Render it with
  `assets/js/shared/simulation-teaching-components.js` via
  `PYQSimulationTeaching.commonStudentTrap`; do not recreate its markup in a
  question page. Import the shared component in every standalone simulation.
- Build responsive layouts and accessible controls; support keyboard and
  reduced-motion preferences where applicable.
- Add focused tests with independent expected values for physics, units,
  edge-cases, and any meaningful state transformations. Prefer reusable
  data-driven tests and helpers.
- Make surgical, scoped changes; do not change the approved simulation to
  accommodate a candidate.

## Mandatory QA before completion

Follow every applicable item in
[`SIMULATION_QA_STANDARD.md`](SIMULATION_QA_STANDARD.md) and complete the
[`SIMULATION_ACCEPTANCE_CHECKLIST.md`](SIMULATION_ACCEPTANCE_CHECKLIST.md):

1. Run candidate unit and applicable automated tests.
2. Verify the candidate's actual shared-resource imports/references in source
   and at runtime. Record exceptions or limitations and their migration plan.
3. Open the served simulation in a real browser; inspect every mode and
   meaningful stage/interaction, not just first load.
4. Independently audit the physics and inspect all actual rendered math.
5. Compare candidate and approved reference at matching representative
   viewports; inspect responsive behavior and visual/canvas overlaps.
6. Verify expected behavior for every control and relevant reset/replay path.
7. Inspect runtime errors, failed requests, assets, fonts, and renderer
   initialization.
8. Fix reproducible in-scope failures, repeat affected checks, and run the full
   applicable regression suite again.
9. Provide the mandatory evidence-based pass/fail report. Mark unchecked
   categories NOT TESTED and describe any environment limitations.

A successful build, static inspection, or isolated unit-test pass is not
completion. No known reproducible in-scope defect may remain when reporting a
simulation as complete.
