# Q32 Parallel-Plate Capacitor Simulation QA

Question: JEE Main 2026, 2 April, Set 1, Q32. The prompt supplies choices and
the printed answer (2). Its geometry explicitly places dielectric and air in
successive halves of the plate separation.

## Required QA report

| Category | Status | Evidence |
| --- | --- | --- |
| Physics correctness | PASS | Independently derived C₁=2KC=10C, C₂=2C, series equivalent C_f=5C/3, and 66.67% increase. Focused tests also cover f=0, f=1, K=1, and invalid bounds. |
| Mathematical rendering | NOT TESTED | Generated KaTeX delimiters are source-tested and content is passed to the shared math renderer. Browser rendering and glyph/overflow inspection were unavailable. |
| Question mode | PASS | Runtime smoke test verified the question prompt and all four options are inserted. No browser visual inspection. |
| Understand mode | PASS | Runtime smoke test verifies the source fragment is rendered and the non-source arrangement explanation is absent. The shared Given / Find component is used for the final recap. No browser visual inspection. |
| Solve mode | PASS | Runtime smoke test verified the first derivation and shared Common Student Trap. Every authored solution step is associated with a trap in the controller data. No browser visual inspection. |
| Explore mode | PASS | Physics unit tests verify the calculator and safe endpoints. Runtime smoke test verifies Explore content; browser slider interaction was not exercised. |
| Visual consistency with the reference | NOT TESTED | Source imports the approved shared shell and centralized simulation assets, but no candidate/reference browser comparison was performed. |
| Text and annotation overlap | NOT TESTED | No browser screenshots or live DOM geometry inspection were available. |
| Responsive behavior | NOT TESTED | No browser viewport checks were performed. |
| Browser console and runtime | NOT TESTED | Served page and both Q32 scripts returned HTTP 200; automated controller smoke test ran. Real-browser console inspection was unavailable. |
| Regression tests | PASS | All 60 tests in `tests/*.test.cjs` passed serially, including `simulation-shell`, `simulation-teaching-components`, `simulation-question-data`, `simulation-given-asked`, and `youngs-modulus-error`. |
| Shared-asset/component reuse | PASS | HTML imports `simulation-assets.css`, shared Tailwind config, `simulation-math.js`, shared question-data helper, teaching components, and shell. Controller mounts the shell and calls the shared Given / Find and Common Student Trap renderers. Runtime smoke test exercised controller startup and all four modes. |
| Issues found and fixes applied | PASS | Fixed the insertion animation so K remains 5 while only filled thickness changes; removed the extra inferred Understand stage and its explanatory copy; replaced the pulse-like circuit graphic with a conventional two-capacitor series diagram shown separately during Solve. Added regression assertions and a cache-busting version. |
| Remaining issues and limitations | NOT TESTED | Real-browser inspection of math, visuals, controls, responsive layout, and console remains outstanding. Do not treat automated smoke coverage as visual/browser acceptance. |
| Exact tests and viewports checked | PASS | Ran all `tests/*.test.cjs` files in one Node process (62 tests, 0 failures). No browser viewports were checked. |

## Acceptance checklist status

- [x] Read supplied Q32 question, choices, and solution; no geometry ambiguity remains.
- [x] Independently calculated the expected answer and tested boundary cases.
- [x] Kept the material constant K fixed through the insertion animation; only
      the dielectric thickness changes.
- [x] Removed inferred/non-question Understand content; only original question
      fragments and the required final Given / Find recap remain.
- [x] Removed the pulse-like drawing and show a conventional series-capacitor
      schematic separately from the physical capacitor diagram during Solve.
- [x] Replaced corrupted text in the capacitor's visible labels and metadata;
      the source now contains no mojibake markers.
- [x] Imported the shared `simulation-view-controls.js` component and aligned
      Zoom out, Zoom in, and Reset View together in the workspace toolbar.
- [x] Added a Solve-stage series-equivalent diagram with dielectric-green C1
      and air-blue C2, labeled `C1 = 10C` and `C2 = 2C`.
- [x] Inspected the approved reference page, shared shell, shared math and
      teaching components, styles, registry, and candidate architecture before
      implementation. The approved reference was not modified.
- [x] Reused the shared shell, centralized styles/theme/math, question-data
      handoff, Given / Find recap, and Common Student Trap component by imports
      and calls.
- [x] Kept the capacitor calculation in a separate physics engine and the
      Q32 teaching/visualization in a separate controller/page.
- [x] Added focused calculation tests and runtime smoke coverage for all four
      modes; ran the full existing test suite.
- [ ] Inspect actual KaTeX output in a browser in every mode and meaningful
      state.
- [ ] Exercise play/pause/replay, timeline, navigation tabs/`aria-current`,
      sliders, reset, zoom, drag, and mode-reset behavior in a real browser.
- [ ] Compare candidate and approved reference screenshots at matching
      desktop/tablet/mobile viewports; inspect overlap and responsive behavior.
- [ ] Inspect browser console, fonts, network failures, reduced motion, and
      keyboard operation.
- [x] Verify served Q32 page and its JS assets return HTTP 200.
- [x] Preserve the approved Errors in Measurements simulation and run its
      physics regression test.

Browser checks remain incomplete because this session does not expose browser
automation tooling. No visual or pixel-accuracy claim is made.
