# Question 30 Simulation QA

Question: JEE Main, 2 April 2026, Set 1 — Kepler's Third Law: Comparing
Orbital Time Periods.

## Acceptance results

1. **Physics correctness — PASS.** From Kepler's third law for a planet whose
   mass is negligible relative to its star,
   \(T=2\pi\sqrt{r^3/(GM_s)}\). Therefore
   \(T_2/T_1=(2R/R)^{3/2}\sqrt{2M/(4M)}=2\). Independently checked normalized
   periods are \(T_1/T_0=1/\sqrt2\), \(T_2/T_0=\sqrt2\), and
   \(\omega_2/\omega_1=1/2\). Option (2) is correct.
2. **Mathematical rendering — PASS.** Browser KaTeX rendered the Question,
   all three Understand parts, and all six Solve steps. The question view had
   14 rendered KaTeX nodes; each Understand part and each Solve step had
   rendered equations. The solution screenshot was visually inspected.
3. **Question mode — PASS.** The full prompt, two system-value cards, all four
   choices, metadata, and Start Guided Understanding control appeared. The
   studio listed Q30 under Unit 6, Gravitation, and its launch button opened
   the standalone simulation iframe.
4. **Understand mode — PASS.** All three source-question parts were reachable;
   the final ratio remained unknown until Solve. Each Next transition selected
   the Understand tab and set `aria-current="step"` correctly.
5. **Solve mode — PASS.** All six ordered steps rendered equations and the
   shared Common Student Trap component. Every Next transition kept Solve
   selected; the final step advanced to Explore. Step 4 and its trap were
   visually inspected at desktop size.
6. **Explore mode — PASS.** Both masses and radii have sliders. Direct radius
   and mass changes updated the ratio to 0.707 and 0.577 in tested states; the
   equal-mass/double-radius and equal-radius/double-mass presets gave 2.83 and
   0.707. Reset restored the question values and ratio 2. The derived angular
   speed ratio and normalized periods are displayed.
7. **Visual consistency with the reference — PASS.** Matching 1600×1000
   screenshots of Q30 and the approved Errors in Measurements simulation were
   inspected side by side. Q30 uses the same shared header, four tabs, canvas
   and content split, dark palette, controls, typography, and metadata style.
   This was a visual review, not a pixel comparison.
8. **Text and annotation overlap — PASS.** Question and Solve screenshots,
   the diagram at initial and synchronized times, and the common trap card were
   visually inspected. The 2D orbit drawing keeps radius and planet labels
   separated; the full prompt and options fit their card at desktop size.
9. **Responsive behavior — PASS.** Browser sizes 1600×1000, 1024×768, and
   390×844 were checked in all four modes. No document-level horizontal
   scrolling occurred. At 1024 px a header action initially extended past the
   viewport; a Q30-scoped responsive header rule fixed it, and all modes were
   retested. The mobile layout remains vertically scrollable.
10. **Browser console and runtime — PASS.** Q30 loaded without failed
    resources or uncaught exceptions. The studio-to-iframe launch also ran
    without console errors after guarding its legacy Young's-modulus canvas
    against non-measurement questions.
11. **Regression tests — PASS.** All 35 tests passed when each
    `tests/*.test.cjs` file was run serially with Node. This includes Q30's
    focused engine and routing tests, the shared-shell and teaching-component
    tests, the approved reference's physics test, and Q26–Q29 tests. The
    `node --test` worker invocation was blocked by sandbox `spawn EPERM`; direct
    serial execution completed every test file successfully.
12. **Shared-asset/component reuse — PASS.** The page imports the shared
    simulation assets, Tailwind theme, math helper, teaching components, and
    `simulation-shell.js`; the controller mounts `PYQSimulationShell`, uses
    its mode state, and renders the shared Common Student Trap. These resources
    were also loaded in the browser. No shared shell or approved-reference
    files were changed. There was no existing reusable Kepler calculation
    module, so Q30 has a focused engine; the inventory records a migration
    path if another question needs shared orbital calculations.
13. **Issues found and fixes applied.** Corrected Q30's taxonomy unit to Unit
    6 (Gravitation), fixed the 1024 px header overflow, prevented the studio's
    legacy Young's-modulus canvas from processing Q30 parameters, and advanced
    the studio cache version to `20261017-19` so the launcher fix loads in the
    browser.
14. **Remaining issues and limitations.** No known in-scope defects remain.
    The visualization uses circular 2D orbits as a readable schematic; time is
    normalized in units of \(T_1\), and mass/radius sliders are multiples of
    \(M\) and \(R\), not real astronomical measurements. The calculation uses
    the standard negligible-planet-mass approximation. Session and shift were
    not supplied and remain blank.
15. **Exact tests and viewports checked.** Ran every file in `tests/` serially;
    specifically, `kepler-orbital-period.test.cjs`,
    `simulation-shell.test.cjs`, `simulation-teaching-components.test.cjs`,
    and `youngs-modulus-error.test.cjs` passed. Browser checks covered
    Question, Understand, Solve, Explore, tab highlighting, all Next
    transitions, playback/pause/reset, timeline synchronization at \(t=T_1\),
    mass/radius sliders, presets/reset, zoom buttons, two-axis drag/reset,
    studio routing, console output, and all four modes at 1600×1000,
    1024×768, and 390×844. Candidate Question and Solve screenshots and the
    approved reference Question screenshot were captured and inspected.
