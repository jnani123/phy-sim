# Simulation Content Standard

Use this standard to decide whether a question simulation is useful to a
student. The four learning modes are a shared journey, not four copies of the
same explanation. Keep the UI consistent through
[`JNANI_DESIGN_STANDARD.md`](JNANI_DESIGN_STANDARD.md); make the physics and
teaching content specific to the question.

## Learning journey

### 1. Question

- Show the complete original question, units, givens, and all answer options.
- Make the requested quantity clear without silently changing the wording.
- Provide a visualization that represents the physical setup and identifies
  relevant quantities. Clearly label schematic or not-to-scale drawings.
- Let students inspect the scene with the shared playback controls where
  animation is meaningful.

### 2. Understand

- Break the supplied question into its meaningful original fragments, in the
  same order and notation as the source. Each stage contains only a contiguous
  source excerpt and the corresponding visual state.
- Do not add explanatory prose, inferred questions, conceptual conclusions,
  additional headings, or facts that are not stated in that question. Teaching
  and interpretation belong in Solve.
- Keep excerpt labels neutral and minimal; the excerpt itself must remain exact.
- Make the final Understand stage a concise **Given / Find** recap. List every
  supplied numerical value, function, condition, and relevant statement or
  choice set, then state exactly what the question asks the student to find.
  Preserve the question's symbols, case, notation, and units. Render equations
  through the shared `PYQSimulationMath` setup and reuse
  `PYQSimulationTeaching.givenAndAsked`; do not calculate, reveal the answer,
  or add derivation in this recap.

### 3. Solve

- Show the reasoning in a logical sequence, from model/equation to substitution
  to arithmetic.
- Explain consequential choices, assumptions, signs, conversions, units, and
  approximations.
- Check dimensions and relate the computed result back to the requested form
  and answer option.
- Call out a likely misconception when it is relevant, and explain the reason
  it fails.

### 4. Explore

- Let students change meaningful physical inputs or assumptions.
- Show how the scene and derived quantities respond; explain the direction of
  change and the governing relationship.
- Enforce physically meaningful bounds and handle invalid values clearly.
- Provide a reliable reset and preserve consistency when students switch
  modes.

## Completeness test

A simulation is ready for student use when a student can:

1. Understand the setup and identify what is being asked.
2. Explain which physical principle applies and why.
3. Follow the derivation and verify the result, units, and answer format.
4. Change a meaningful input and predict, observe, and explain its effect.

If a mode does not fit the question, adapt its teaching purpose while keeping
the shared four-mode navigation. For example, an Explore mode may vary an
assumption or compare limiting cases when the original question has no
experimental slider. Do not leave a mode empty or add unrelated interactions
just to fill the console.

## Review prompts

Before completion, ask:

- Could a student understand the diagram and symbols without a teacher beside
  them?
- Does the explanation teach why the equation applies, not only how to insert
  numbers?
- Can the student detect a common wrong turn and understand its consequence?
- Does the visualization respond to controls in a way that agrees with the
  mathematics?
- Can the student transfer the key relationship to a changed input or limiting
  case?

Record any unavoidable limitation in the simulation QA report. This content
standard complements, and does not replace, the independent physics audit,
unit tests, real-browser checks, interaction coverage, and responsive checks
required by `SIMULATION_QA_STANDARD.md`.
