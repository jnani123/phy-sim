# Question 26 Simulation — QA Record

**Candidate:** Dimensional analysis of electric-field energy density  
**Browser check:** Headless Chrome 155, served from the project root on
`127.0.0.1:8000`  
**Reference:** `assets/simulations/youngs-modulus-error.html`  
**Shared resources changed:** None

## Required QA categories

1. **Physics and dimensional correctness — PASS.** Independently checked
   energy per volume: `ML²T⁻² / L³ = ML⁻¹T⁻²`; `1/2` is dimensionless;
   `a=1, b=-1, c=-2`; `2a-b+c=1`. Direct multiplication of `[ε₀E²]`
   independently gives the same powers and cancels the current dimension `I`.
2. **Mathematical rendering — PASS.** The candidate uses the shared KaTeX
   0.16.8 loader/configuration. Browser screenshots show the fraction, epsilon
   subscript, squared field, dimensional powers, negative exponents, division,
   and the parenthesized subtraction in Question, Understand, Solve, and
   Explore. No KaTeX error elements were present on the candidate.
3. **Question mode — PASS.** The full Q26 statement and all four options
   rendered. The default scene shows the field arrows, highlighted volume,
   and energy-density label before playback begins. Play/pause, 1.5× speed,
   timeline scrubbing, and returning to the initial timeline were checked.
   Zoom buttons, wheel zoom, pointer-drag panning in both screen directions,
   and reset-view were also checked; 2D panning is used because this diagram
   does not need a 3D viewpoint.
4. **Understand mode — PASS.** All three original-question fragments advanced
   and rendered. The first two stages did not expose solved exponent values;
   the third presented the requested expression and original options.
5. **Solve mode — PASS.** All six derivation steps rendered in order, each with
   the imported shared Common Student Trap component and its Wrong/Fix fields.
   The final step computed 1 and matched option (2).
6. **Explore / Sandbox mode — PASS.** Blank input state, each exponent input,
   dynamic formula/value, answer check, energy/volume method, direct `ε₀E²`
   method, method comparison, explicit reveal, reset, and reset on leaving and
   re-entering Explore were exercised in-browser.
7. **UI/UX consistency — PASS.** Candidate and approved reference screenshots
   were inspected at 1600×1000. The candidate mounts the same header, metadata
   area, 55/45 desktop panels, four tabs, content cards, and playback controls.
   The illustration itself is question-specific. This was a visual comparison,
   not a pixel-perfect measurement.
8. **Text and equation overlap — PASS.** Inspected desktop screenshots for
   Question, Understand parts 1–3, Solve steps 1 and 6, and Explore, plus the
   mobile Explore screenshot. No clipped or overlapping equation/label was
   observed. The 1024 px header wrap was adjusted after the first overflow
   check and rechecked.
9. **Responsive behavior — PASS.** Checked 1600×1000, 1024×768, and 390×844.
   The document had no horizontal overflow at any checked viewport. The narrow
   layout stacks the scene and learning console, and its content remains
   scrollable. The 1024 px and 390 px layouts were rechecked with the added
   view controls.
10. **Browser console and runtime — PASS.** The actual PYQ Studio Q26 card was
    opened; its iframe resolved to the new standalone page and mounted the
    shared shell. The candidate was then exercised directly. No uncaught
    runtime exceptions, failed requests, or KaTeX error nodes were recorded.
    The approved reference page also loaded and mounted its shared shell.
11. **Calculation and interaction tests — PASS.** Focused Q26 tests cover
    independent expected dimensions, the direct current-cancellation check,
    exponent matching, the negative-sign result, and invalid inputs.
12. **Regression tests — PASS.** Shared shell, teaching component, approved
    Young’s modulus engine, Question 28, and Question 29 suites passed. The
    shared shell was updated for programmatic mode highlighting; the approved
    reference was opened in Chrome and its four mode tabs remained synchronized.
13. **Issues found and fixes applied.** Fixed JavaScript string escaping that
    initially consumed TeX backslashes; rejected null exponent values instead
    of coercing them to zero; preserved sandbox inputs and current steps during
    re-renders; added the Q26 engine to PYQ Studio’s simulation-card registry;
    and wrapped the candidate header at tablet widths after detecting
    horizontal overflow. In this follow-up, synchronized tab highlight and
    `aria-current` with all mode transitions, corrected inverted horizontal and
    vertical pan directions, and set the exam metadata to JEE Main, 2nd April
    2026, Set 1. Repeated focused tests and browser checks afterward.
14. **Remaining issues and limitations.** The field/volume illustration is a
    conceptual static SVG, intentionally without 3D orbit controls or physics
    sliders. The standalone UI inherits the project’s CDN-hosted Tailwind,
    KaTeX, and font dependencies.
15. **Exact checks and viewports.** Ran `node --check` on the Q26 engine,
    controller, and studio app; ran the six test files listed below; ran the
    complete Q26 Chrome workflow and inspected screenshots at 1600×1000,
    1024×768, and 390×844.

## Automated test results

- `node tests/electric-field-energy-density.test.cjs` — 5 passed.
- `node tests/simulation-shell.test.cjs` — 7 passed.
- `node tests/simulation-teaching-components.test.cjs` — 2 passed.
- `node tests/youngs-modulus-error.test.cjs` — 3 passed.
- `node tests/velocity-field-acceleration.test.cjs` — 5 passed.
- `node tests/position-dependent-motion.test.cjs` — 5 passed.

The initial browser run used `.qa-q26-run.cjs` as a temporary local QA driver;
the follow-up used an isolated headless Chrome check for mode transitions,
two-axis pan direction, reset, exam metadata, and approved-reference mode-tab
regression. Temporary drivers and screenshots were removed after inspection.
