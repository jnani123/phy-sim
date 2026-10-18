# Simulation Acceptance Checklist

Complete this checklist for every new simulation and every modification to an
existing simulation. Follow [`SIMULATION_QA_STANDARD.md`](SIMULATION_QA_STANDARD.md)
for the detailed procedure. **Do not mark a check PASS without evidence.** Use
NOT TESTED when a check was not performed, and explain why.

## Scope and reference

- [ ] Read the question, choices, and supplied solution; identify ambiguities.
- [ ] Independently calculate expected results and identify affected tests,
      shared code/assets, and regressions.
- [ ] Inspect the actual approved reference:
      `assets/simulations/youngs-modulus-error.html`.
- [ ] Mount `PYQSimulationShell` from `assets/js/shared/simulation-shell.js`;
      pass question metadata, topic toolbar/visualization, and the mode-change
      handler through its integration interface.
- [ ] Reference `assets/css/simulation-assets.css`, the centralized Tailwind
      theme config, and `assets/js/shared/simulation-math.js`.
- [ ] Inventory the current asset/component resources, including the actual
      imports in the reference, `index.html`, shared styles, theme, and helpers.
- [ ] Reuse applicable shared branding, fonts, tokens, CSS, math setup, shell,
      navigation, panels, controls, and helpers through actual imports or
      references—not appearance alone.
- [ ] Keep question physics/diagrams/teaching separate from shared UI. Do not
      copy embedded shared assets into each question; extract safely where
      practical and regression-test the reference.
- [ ] Document any justified duplication or architecture limitation and its
      minimal migration plan. Do not claim shared-foundation acceptance until
      the candidate demonstrably uses it.
- [ ] Preserve the approved reference and verify relevant reference regression
      tests.

## Physics and math

- [ ] Formulas and derivation match the question and governing physics.
- [ ] Signs, vector operations, directions, coordinates, substitutions, and
      arithmetic are independently checked.
- [ ] SI conversions, dimensions, units, significant figures, approximations,
      answer options, and displayed result agree.
- [ ] Boundary, unusual, invalid, and out-of-range inputs behave safely.
- [ ] Tests use independent expected values where practical.
- [ ] Inspect actual browser-rendered inline/display math in every mode and
      meaningful state: symbols, vectors, indices, fractions/roots/derivatives,
      signs, units, fonts, wrapping, clipping, and overflow.
- [ ] Approved math library/configuration is reused; no renderer initialization
      or missing-glyph failures remain.

## Mode and interaction checks

### Question

- [ ] Full question, every answer choice, notation, and metadata are visible
      and correct.
- [ ] Playback and other available controls work as specified.
- [ ] Zoom out, Zoom in, and Reset View use the shared
      `simulation-view-controls.js` component, appear together in the workspace
      toolbar, and reset both zoom and pan.

### Understand

- [ ] Every conceptual stage is reachable and focused on understanding the
      question.
- [ ] Compare each Understand excerpt word-for-word against the supplied
      question. Exclude explanatory prose, inferred subquestions, added
      conclusions/headings, and stages not traceable to a contiguous source
      fragment; retain only the required final shared Given / Find recap.
- [ ] The final Understand stage uses the shared Given / Find component,
      covers every supplied value, equation, condition and relevant statement
      set, preserves question notation/units, renders math through the shared
      renderer, and does not reveal the solution.
- [ ] Excerpts and stage-specific visualization match the explanation.
- [ ] Previous/next/revisit behavior is correct; the worked solution is not
      revealed early.

### Solve

- [ ] All ordered solution steps are reachable; math, substitutions, and units
      are correct.
- [ ] Every Solve step includes the shared Common Student Trap component with a
      question-specific wrong approach and correction.
- [ ] Navigation and animation stay synchronized.
- [ ] Verify fixed material properties remain constant during animation and
      confirm no decorative pulse/wave effect appears unless it models the
      stated physics. Check equivalent-circuit symbols use conventional shapes
      and do not cover the physical scene.
- [ ] Final result matches the independent calculation and selected option.

### Explore

- [ ] Each relevant input/control visibly updates the intended scene and
      derived results.
- [ ] Invalid/out-of-range input is safe; reset restores the documented
      initial state.
- [ ] Mode changes reset sandbox values and visible quantities to the documented
      baseline.
- [ ] Spatial 3D figures/scenes can be dragged freely in horizontal, vertical,
      and diagonal directions; these gestures orbit in both yaw and pitch.
- [ ] Dragging the view leaves physics values unchanged; reset restores the
      initial viewpoint.

- [ ] Verify relevant play, pause, restart, speed, stage navigation, sliders,
      dropdowns, keyboard controls, reset, and replay by observing their effects.

## Visual, responsive, and runtime checks

- [ ] Compare all four modes and meaningful states against the approved
      reference: header, metadata, navigation, typography, colors, spacing,
      panels, controls, scene, equations, and transitions.
- [ ] Inspect matching candidate/reference screenshots at representative
      desktop, tablet, and mobile sizes; do not claim pixel-perfect comparison
      unless it was measured.
- [ ] Check text/equation/label collisions, clipping, hidden controls, z-index,
      scene annotation collisions, and resized canvas content.
- [ ] Check for unintended horizontal overflow and content behind sticky/fixed
      controls.
- [ ] Inspect console errors, uncaught exceptions, failed requests, missing
      assets/fonts, and math-rendering initialization.
- [ ] Resize during animation, navigate modes repeatedly, and reset/replay where
      applicable.
- [ ] After each Next/Previous and guided mode transition, confirm the matching
      tab highlight and `aria-current="step"` stay synchronized with content.
- [ ] For 2D panning, confirm dragging right/down moves the scene right/down;
      confirm reset restores the initial view.
- [ ] Check accessibility and reduced-motion behavior where supported.

## Automated tests and completion

- [ ] Run the focused candidate physics/unit tests.
- [ ] Run all applicable existing automated tests.
- [ ] Run regression tests for shared components/engines and the approved
      reference when affected.
- [ ] Run `tests/simulation-shell.test.cjs` to guard shared-shell integration
      and `tests/youngs-modulus-error.test.cjs` for the reference physics.
- [ ] Verify candidate shared-resource imports/references in source and actual
      runtime behavior; verify shared-resource changes do not regress the
      approved reference.
- [ ] Record every failure; fix all reproducible in-scope issues.
- [ ] Repeat affected checks after fixes and run the full applicable regression
      suite again.
- [ ] Report each category below as PASS / FAIL / NOT TESTED with evidence.

## Required QA report

1. **Physics correctness:** PASS / FAIL / NOT TESTED — evidence
2. **Mathematical rendering:** PASS / FAIL / NOT TESTED — evidence
3. **Question mode:** PASS / FAIL / NOT TESTED — evidence
4. **Understand mode:** PASS / FAIL / NOT TESTED — evidence
5. **Solve mode:** PASS / FAIL / NOT TESTED — evidence
6. **Explore mode:** PASS / FAIL / NOT TESTED — evidence
7. **Visual consistency with the reference:** PASS / FAIL / NOT TESTED — evidence
8. **Text and annotation overlap:** PASS / FAIL / NOT TESTED — evidence
9. **Responsive behavior:** PASS / FAIL / NOT TESTED — viewports/evidence
10. **Browser console and runtime:** PASS / FAIL / NOT TESTED — evidence
11. **Regression tests:** PASS / FAIL / NOT TESTED — exact commands/results
12. **Shared-asset/component reuse:** PASS / FAIL / NOT TESTED — imports,
    references, runtime evidence, or documented limitation/migration plan
13. **Issues found and fixes applied**
14. **Remaining issues and limitations**
15. **Exact tests and viewports actually checked**

Do not report completion if any known reproducible in-scope physics, rendering,
overlap, interaction, or major visual defect remains. Explain any blocker and
mark the affected category FAIL or NOT TESTED.
