# JNANI Physics Simulation Design Standard

This is the source-of-truth contract for every standalone simulation console.
The shared implementation is `assets/js/shared/simulation-shell.js`, with
reusable view controls in `assets/js/shared/simulation-view-controls.js`, styled
through `assets/css/simulation-assets.css` and
`assets/css/simulation-shell.css`. New simulations mount that shell and supply
only question metadata, topic-specific toolbar/visualization content, and mode
content. They must not create their own branded header, mode navigation,
workspace split, or playback controls.

## Shared console contract

- Header: JP text mark and JNANI PHYSICS brand, chapter/topic breadcrumb,
  question metadata, Back, and Quick Sandbox actions.
- Workspace: simulation/visualization on the left and learning console on the
  right at desktop widths. The source token split is 55fr/45fr.
- Canvas area: shared live-workspace toolbar, a question-owned visualization
  slot, and shared play/pause, replay, speed, and timeline controls. Every scene
  that supports zoom/pan uses `PYQSimulationViewControls` for the standard
  Zoom out, Zoom in, Reset View toolbar group, matching the approved Units
  console placement. Questions supply only the three view callbacks. Spatial 3D scenes
  let students drag the scene freely in any direction: horizontal and vertical
  pointer movement must orbit the viewpoint in both yaw and pitch, rather than
  rotating around one fixed axis. Planar 2D scenes use a view interaction suited
  to their geometry.
- Learning area: shared four-step navigation (Question, Understand, Solve,
  Explore) and one scrollable content panel.
- Narrow layouts: stack the visualization and learning areas; keep controls
  usable and content in normal page flow.
- Metadata is inserted as text. Question-specific content is rendered inside
  the shared content panel and uses the same shared font, colors, math setup,
  and responsive conventions. Use shared content classes such as
  `.jnani-sim-card`, `.jnani-sim-card-label`, `.jnani-sim-content-title`,
  `.jnani-sim-step-title`, `.jnani-sim-option-grid`, and `.jnani-sim-option`
  for repeated cards, labels, headings, and answer options.

## Visual tokens

`assets/css/simulation-shell.css` owns the `--jnani-sim-*` tokens. Current
baseline values are recorded here so reviewers can detect unintended drift;
the CSS token is authoritative if this document and implementation diverge.

| Area | Shared baseline |
|---|---|
| Fonts | Inter for interface and prose; JetBrains Mono for measurements and compact numeric metadata; KaTeX 0.16.8 for math |
| Color | Slate navy canvas `#020617`, panel `#0f172a`, raised panel `#1e293b`, border `#334155`, text `#e2e8f0`, muted text `#94a3b8`, green accent `#22c55e` |
| Desktop panels | 55fr simulation / 45fr learning console at widths of 1024px and above |
| Header | 60px minimum height; 24px inline padding; 18px brand title |
| Workspace toolbar and mode tabs | 49px minimum height each |
| Learning content | 24px desktop padding, reduced to 16px on small phones |
| Common spacing | 4, 8, 12, 16, and 24px steps |
| Common corners | 6px compact and 8px standard |
| Responsive breakpoints | 1023px for stacked workspace; 760px for compact phone header and spacing |

These are the present approved reference values, not a claim of pixel-perfect
measurement against a screenshot. Change the shared CSS and this document
together when a deliberate design-system update is approved. A one-off
question must not override shell tokens to imitate a different console.

## What each simulation may customize

- The physical scene, diagrams, animation, and labels needed to explain that
  topic.
- A small toolbar fragment for controls unique to that experiment.
- The Question, Understand, Solve, and Explore content inside the shared
  console panel.
- Data and calculation modules for that question, isolated from shared UI.

Customization must fit the shell's layout and use shared tokens/components.
Topic controls must not replace or reposition shared navigation, header, or
playback controls. Keep the four modes and their meaning consistent from one
question to another.

Choose 3D when depth or out-of-plane behavior helps explain the physics; use 2D
for planar topics where it keeps the relationships clearer. In Understand,
retain the question's original notation, vector symbols, variable names,
capitalization, and labels. Excerpt headings use neutral sentence case and must
not recolor or capitalize the source math for decoration.

## Student-learning sufficiency

Use `SIMULATION_CONTENT_STANDARD.md` to decide whether an experience teaches
enough. Visual polish and a correct final answer alone do not establish
sufficiency. Each simulation must meet the content standard and pass the
project's physics, interaction, and browser QA gates.
