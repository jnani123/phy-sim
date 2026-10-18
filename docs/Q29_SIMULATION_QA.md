# Question 29 Simulation QA

Question: JEE Main, 2 April 2026, Set 1 — Position-Dependent Motion.

## Acceptance results

1. **Physics correctness — PASS.** Independently evaluated at (t=1\,\mathrm{s}): \(\vec r=(10,5)\,\mathrm m\), \(\vec v=(20,15)\,\mathrm{m/s}\), \(\vec a=(20,30)\,\mathrm{m/s^2}\), \(\vec p=(2,1.5)\,\mathrm{kg\,m/s}\), \(\vec F=(2,3)\,\mathrm N\), \(L_z=5\,\mathrm{J\,s}\), and \(\tau_z=20\,\mathrm{N\,m}\). The correct statements are A, B, and D (option 4).
2. **Mathematical rendering — PASS.** Browser-rendered KaTeX appeared in Question, all equation-bearing Understand excerpts, and every Solve step. Lowercase \(i\), \(j\), \(r\), and \(t\) retain the question notation.
3. **Question mode — PASS.** Prompt and seven KaTeX blocks rendered; play advanced the reveal to `1/6`, pause worked, and reset restored the initial reveal.
4. **Understand mode — PASS.** All five excerpts were reachable. They contain only the question text/options plus navigation and progress; no extra titles, explanation, or “Question context” label. The rendered statement excerpt was visually inspected.
5. **Solve mode — PASS.** All eight ordered steps were reached; each showed rendered math and the shared Common Student Trap component.
6. **Explore mode — PASS.** Time and all seven vector toggles changed the displayed values/scene. Reset restored t=1 s and the position-only baseline. Browser checks confirmed returning from Explore to both Solve and Understand restores t=1 and position-only visibility.
7. **Visual consistency with the reference — PASS.** Candidate and approved Units and Measurements reference screenshots were inspected at 1280×900. Shared header, mode tabs, panels, typography, tokens, and controls align with the reference; this was a visual review, not a pixel comparison.
8. **Text and annotation overlap — PASS.** Inspected the all-vectors (t=2\,\mathrm{s}) scene at desktop and Understand excerpt screenshot. Mobile DOM bounds confirmed the readout and view controls do not overlap.
9. **Responsive behavior — PASS.** Browser viewports: desktop 1280×900, tablet 900×900, and mobile 390×844. No horizontal document overflow at any checked width.
10. **Browser console and runtime — PASS.** No uncaught browser exceptions or failed network requests during the interaction run.
11. **Regression tests — PASS.** All 22 tests passed by running each file serially: `node tests/position-dependent-motion.test.cjs`, `node tests/simulation-shell.test.cjs`, `node tests/simulation-teaching-components.test.cjs`, `node tests/velocity-field-acceleration.test.cjs`, and `node tests/youngs-modulus-error.test.cjs`. `node --test` could not spawn child processes in this environment (`EPERM`); direct serial execution completed the same test files successfully.
12. **Shared-asset/component reuse — PASS.** Q29 continues to import/mount the shared simulation shell, shared asset/theme/math resources, and shared Common Student Trap component. The approved reference was left unchanged.
13. **Issues found and fixes applied.** Explore state now resets when entering or leaving the sandbox; Understand renders the original question excerpts in neutral styling; the flat z-axis rotation was replaced by an orbit camera with independent yaw and pitch, zoom, and reset; derived-vector labels were spaced around the particle; mobile readout/control overlap was removed; duplicated “April” metadata was corrected. Cache versions were advanced for the studio and standalone simulation.
14. **Remaining issues and limitations — NONE KNOWN.** Camera projection is an interactive 3D-style orthographic view of this planar trajectory and its out-of-plane moment vectors; it is not a physical 3D renderer.
15. **Exact checks and viewports.** Browser exercised Question play/pause/reset, all Understand parts, all Solve steps/traps, Explore time and quantity toggles/reset, return-from-Explore-to-Solve and return-from-Explore-to-Understand baseline resets, horizontal yaw drag, vertical pitch drag, zoom and reset, desktop/tablet/mobile widths, and the approved reference screenshot. The focused and regression test commands are listed above.
