# JNANI Physics project instructions

## Simulation work is not complete until QA passes

For every new simulation and every change to an existing simulation, follow
[`docs/SIMULATION_QA_STANDARD.md`](docs/SIMULATION_QA_STANDARD.md) and complete
[`docs/SIMULATION_ACCEPTANCE_CHECKLIST.md`](docs/SIMULATION_ACCEPTANCE_CHECKLIST.md).
This is a mandatory completion gate, not optional guidance.

- Inspect the approved Units and Measurements — Errors in Measurements
  simulation before implementing UI, interactions, or math rendering. Treat its
  actual implementation as the reference; do not modify it to make a candidate
  pass.
- Before implementing a question, inventory existing shared assets and
  components. Reuse them by actual imports/references, not merely by matching
  their appearance. Keep question-specific physics and teaching content
  separate; document any justified duplication or architecture limitation and
  its minimal migration plan.
- Every standalone simulation must mount
  `assets/js/shared/simulation-shell.js` and reference the centralized
  `assets/css/simulation-assets.css`, shared Tailwind theme, and
  `assets/js/shared/simulation-math.js`. Do not independently recreate the
  shared header, navigation, panels, playback controls, tokens, or math setup.
- Verify shared-resource reuse in source and in the running browser, and run
  regression tests for the approved reference when shared resources change.
  Documentation alone does not establish that a future simulation uses the
  shared foundation.
- Independently verify the physics and equations, then run relevant unit tests,
  the candidate in a real browser, all learning modes and meaningful controls,
  responsive and overlap checks, and applicable regression tests.
- Fix every reproducible, in-scope defect and repeat affected checks. A page
  loading or code compiling is not evidence that a simulation is complete.
- Keep the active Question/Understand/Solve/Explore tab synchronized with the
  content after every navigation path, and confirm its `aria-current="step"`.
  For free 2D panning, dragging right/down must move the visible scene in the
  same direction; include each axis and reset in QA.
- Report each required QA category as PASS, FAIL, or NOT TESTED with evidence.
  Never claim visual or pixel-perfect comparison that was not actually done.

See [`docs/SIMULATION_BUILD_STANDARD.md`](docs/SIMULATION_BUILD_STANDARD.md)
for implementation requirements. Keep changes scoped to the requested
simulation; preserve the approved reference and shared behavior.
