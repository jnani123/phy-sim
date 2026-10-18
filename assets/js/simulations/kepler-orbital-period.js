(function () {
  const questionId = new URLSearchParams(window.location.search).get("questionId");
  const library = JSON.parse(localStorage.getItem("orbit-physics-pyq-v1") || "[]");
  const question = library.find(item => item.id === questionId && item.simulation?.engine === "kepler-orbital-period");
  if (!question) {
    document.body.innerHTML = '<main style="max-width:680px;margin:10vh auto;padding:24px;color:#e2e8f0;font:16px Inter,sans-serif"><h1>Question simulation unavailable</h1><p>Open this simulation from its question card in the PYQ Studio.</p><button onclick="window.parent.postMessage({type:\'pyq-simulation-close\'},window.location.origin)" style="padding:10px 14px">Return to question library</button></main>';
    throw new Error("The selected Kepler question is missing from the local question library.");
  }

  const engine = window.PYQPhysicsEngines.keplerOrbitalPeriod;
  const DEFAULTS = { ...engine.DEFAULT_PARAMETERS };
  const VIEW = { width: 840, height: 420 };
  const DURATION_SECONDS = 12;
  const state = {
    mode: "question", understandStep: 0, solveStep: 0,
    parameters: { ...DEFAULTS }, elapsedT1: 0, speed: 1,
    frame: null, lastFrameTime: null,
    view: { zoom: 1, x: 0, y: 0, drag: null }
  };

  const traps = [
    { title: "Using the mass of the planet", wrong: "Use a planet's mass in Kepler's third-law comparison.", fix: "For a planet much lighter than its star, the central-star mass sets the gravitational parameter in this relation." },
    { title: "Reversing the mass ratio", wrong: "Multiply by the square root of the second star's mass over the first.", fix: "The period is inversely proportional to the square root of central mass, so the ratio contains √(Mₛ₁/Mₛ₂)." },
    { title: "Forgetting the radius exponent", wrong: "Treat the period as directly proportional to orbital radius.", fix: "Kepler's third law gives T ∝ r^(3/2), so doubling radius contributes 2^(3/2)." },
    { title: "Mixing the two systems", wrong: "Pair the second orbit's radius with the first star's mass.", fix: "Keep each planet with its own central star: (r₂/r₁)^(3/2)√(Mₛ₁/Mₛ₂)." },
    { title: "Ignoring one physical effect", wrong: "Use only the radius factor or only the mass factor.", fix: "Both act together: the larger radius lengthens the period, while the larger central mass shortens it." },
    { title: "Picking an option before simplifying", wrong: "Select a choice from one factor before combining both changes.", fix: "Combine 2^(3/2) and 1/√2 first; the ratio is 2, which matches option (2)." }
  ];

  const understand = [
    { focus: "system1", fragment: String.raw`<p class="jnani-sim-question-text">A planet \(P_1\) is moving around a star of mass \(2M\) in an orbit of radius \(R\).</p>` },
    { focus: "system2", fragment: String.raw`<p class="jnani-sim-question-text">Another planet \(P_2\) is moving around another star of mass \(4M\) in an orbit of radius \(2R\).</p>` },
    { focus: "compare", fragment: String.raw`<p class="jnani-sim-question-text">The ratio of time periods of revolution of \(P_2\) and \(P_1\) is ______.</p><div class="jnani-sim-equation mt-3">\[\frac{T_2}{T_1}=?\]</div>` },
    { focus: "compare", givenAsked: true }
  ];
  const givenAskedContent = {
    given: [String.raw`Planet \(P_1\): star mass \(2M\), orbit radius \(R\)`, String.raw`Planet \(P_2\): star mass \(4M\), orbit radius \(2R\)`],
    find: String.raw`\(\frac{T_2}{T_1}\)`
  };

  function pretty(value, digits = 3) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toPrecision(digits)).toString();
  }
  function examLabel() {
    const date = [question.date, question.month, question.year].filter(Boolean).join(" ");
    return [question.exam, date, question.set && `Set ${question.set}`].filter(Boolean).join(" · ");
  }
  function questionHtml() {
    const options = question.options.split("\n").map((option, index) => {
      const value = option.replace(/^\s*\(?\d+\)?[.)]?\s*/, "").replace(/1\s*\/\s*2/g, String.raw`\frac{1}{2}`).replace(/1\s*\/\s*4/g, String.raw`\frac{1}{4}`);
      return `<div class="jnani-sim-option"><strong>(${index + 1})</strong> \\(${value}\\)</div>`;
    }).join("");
    return `<article class="jnani-sim-card"><div class="jnani-sim-card-label">Question ${question.questionNumber}</div><p class="jnani-kep-question jnani-sim-question-text mt-3">A planet \\(P_1\\) is moving around a star of mass \\(2M\\) in an orbit of radius \\(R\\). Another planet \\(P_2\\) is moving around another star of mass \\(4M\\) in an orbit of radius \\(2R\\). The ratio of time periods of revolution of \\(P_2\\) and \\(P_1\\) is ______.</p><div class="jnani-kep-systems"><div class="jnani-kep-system-card"><strong>System 1</strong><div>\\(M_{s1}=2M,\\quad r_1=R\\)</div></div><div class="jnani-kep-system-card"><strong>System 2</strong><div>\\(M_{s2}=4M,\\quad r_2=2R\\)</div></div></div></article><section><div class="jnani-sim-card-label mb-3">Options</div><div class="jnani-sim-option-grid">${options}</div></section><button class="jnani-sim-control-button primary" data-start-understanding type="button">Start Guided Understanding <span aria-hidden="true">&rsaquo;</span></button>`;
  }

  function understandHtml() {
    const stage = understand[state.understandStep];
    const content = stage.givenAsked ? window.PYQSimulationTeaching.givenAndAsked(givenAskedContent) : stage.fragment;
    return `<div class="jnani-sim-stage-progress" style="--stage-progress:${(state.understandStep + 1) / understand.length * 100}%"><span></span></div><article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Understand · Part ${state.understandStep + 1} of ${understand.length}</div><div class="mt-4">${content}</div></article><div class="jnani-kep-understand-note">${stage.givenAsked ? "This recap lists the two systems and the requested period ratio without calculating it." : "The diagram highlights the system or comparison named in this part. No period ratio is calculated here."}</div><div class="jnani-kep-nav"><button class="jnani-sim-control-button" data-ustep="-1" ${state.understandStep === 0 ? "disabled" : ""}>Previous part</button><button class="jnani-sim-control-button primary" data-ustep="1">${state.understandStep === understand.length - 1 ? "Start Solve" : "Next part"}</button></div>`;
  }
  function solveSteps() {
    return [
      { title: "Use Kepler's third law", body: "For a planet orbiting a central star, the square of the period is proportional to the cube of the orbital radius and inversely proportional to the star's mass.", math: String.raw`\[T^2=\frac{4\pi^2r^3}{GM_s}\]\[\therefore\quad T=\frac{2\pi r^{3/2}}{\sqrt{GM_s}}\]` },
      { title: "Write the first system's period", body: "System 1 has central mass 2M and orbital radius R. Keep these values paired for P_1.", math: String.raw`\[M_{s1}=2M,\quad r_1=R\]\[T_1=\frac{2\pi R^{3/2}}{\sqrt{G(2M)}}\]` },
      { title: "Write the second system's period", body: "System 2 has central mass 4M and orbital radius 2R. Its radius is twice the first orbit, and its star is twice as massive as the first star.", math: String.raw`\[M_{s2}=4M,\quad r_2=2R\]\[T_2=\frac{2\pi(2R)^{3/2}}{\sqrt{G(4M)}}\]` },
      { title: "Form the requested ratio", body: "Divide T_2 by T_1. The common constants G, M, R and 2pi cancel into the radius and mass ratios.", math: String.raw`\[\frac{T_2}{T_1}=\left(\frac{r_2}{r_1}\right)^{3/2}\sqrt{\frac{M_{s1}}{M_{s2}}}\]\[=2^{3/2}\sqrt{\frac{2M}{4M}}\]` },
      { title: "Combine the radius and mass effects", body: "Doubling the radius alone multiplies the period by 2^(3/2). Doubling the central-star mass contributes 1/sqrt(2). Both effects are needed.", math: String.raw`\[2^{3/2}\sqrt{\frac{2}{4}}=2\sqrt2\cdot\frac1{\sqrt2}=2\]` },
      { title: "State the answer", body: "The second planet's period is twice the first planet's period. Match the result to the printed choices.", math: String.raw`\[\boxed{\frac{T_2}{T_1}=2}\qquad\text{Option (2)}\]` }
    ].map((step, index) => ({ ...step, trap: traps[index] }));
  }

  function solveHtml() {
    const step = solveSteps()[state.solveStep];
    return `<article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Solve · Step ${state.solveStep + 1} of ${solveSteps().length}</div><h2 class="jnani-sim-content-title mt-2">${step.title}</h2><p class="mt-3 leading-7 text-slate-300">${step.body}</p><div class="jnani-sim-equation mt-4 overflow-x-auto">${step.math}</div></article>${window.PYQSimulationTeaching.commonStudentTrap(step.trap)}<div class="jnani-kep-nav"><button class="jnani-sim-control-button" data-sstep="-1" ${state.solveStep === 0 ? "disabled" : ""}>Previous step</button><button class="jnani-sim-control-button primary" data-sstep="1">${state.solveStep === solveSteps().length - 1 ? "Explore orbits" : "Next step"}</button></div>`;
  }
  function exploreHtml() {
    const controls = [
      ["mass1", "Star mass · system 1", 0.5, 4, 0.1, "M"],
      ["radius1", "Orbit radius · system 1", 0.5, 2, 0.05, "R"],
      ["mass2", "Star mass · system 2", 0.5, 8, 0.1, "M"],
      ["radius2", "Orbit radius · system 2", 0.5, 4, 0.05, "R"]
    ].map(([key, label, min, max, step, unit]) => `<label class="jnani-kep-control"><span>${label}</span><input type="range" data-${unit === "M" ? "mass" : "radius"}="${key}" min="${min}" max="${max}" step="${step}" value="${state.parameters[key]}" aria-label="${label}"><output data-value="${key}">${pretty(state.parameters[key])}${unit}</output></label>`).join("");
    return String.raw`<article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Explore · Orbital comparison lab</div><h2 class="jnani-sim-content-title mt-2">Change the systems</h2><p class="mt-2 text-sm leading-6 text-slate-300">Mass controls are multiples of M; radius controls are multiples of R. Periods are normalized by \(T_0=2\pi\sqrt{R^3/(GM)}\); no real astronomical values are assumed.</p><div class="jnani-kep-controls">${controls}</div><div class="jnani-kep-presets mt-4"><button type="button" data-preset="radius">Equal masses · double radius</button><button type="button" data-preset="mass">Equal radii · double mass</button><button type="button" data-orbit-reset>Reset to question</button></div><div class="jnani-kep-results"><div><small>\(T_1/T_0\)</small><strong data-period="first">—</strong></div><div><small>\(T_2/T_0\)</small><strong data-period="second">—</strong></div><div class="jnani-kep-result-main"><small>\(T_2/T_1\)</small><strong data-period-ratio>—</strong></div><div><small>\(\omega_2/\omega_1\)</small><strong data-speed-ratio>—</strong></div></div><p class="jnani-kep-task">Try: compare the radius-only effect with the mass-only effect, then reset to the printed question. The two planets always share the same elapsed-time clock.</p></article>`;
  }

  const toolbar = `<span class="jnani-sim-phase-badge">Circular orbits · relative scale</span><div class="jnani-kep-view-controls" role="group" aria-label="Orbit view controls"><button type="button" data-view="out" aria-label="Zoom out" title="Zoom out">−</button><button type="button" data-view="in" aria-label="Zoom in" title="Zoom in">+</button><button type="button" data-view="reset" aria-label="Reset view" title="Reset view">Reset View</button></div>`;
  const visualization = `<div class="jnani-kep-visual"><div class="jnani-kep-scene"><svg id="kepler-scene" viewBox="0 0 840 420" role="img" aria-label="Side-by-side comparison of planets orbiting stars. System 2 has twice the orbit radius and twice the star mass at the question's initial values."><title>Two-system Kepler orbital comparison</title><desc>Both planets move counterclockwise from a common elapsed-time clock. The second orbit's radius is drawn at twice the first orbit's radius.</desc><defs><marker id="kepler-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7z" fill="#22c55e"/></marker></defs><g id="orbit-system-1" class="jnani-kep-system"><text x="210" y="43" text-anchor="middle" class="jnani-kep-system-title">SYSTEM 1 · P₁</text><circle id="orbit-1" class="jnani-kep-orbit" cx="210" cy="205" r="74"/><line id="radius-line-1" class="jnani-kep-radius" x1="210" y1="205" x2="284" y2="205" marker-end="url(#kepler-arrow)"/><text id="radius-label-1" class="jnani-kep-radius-label" x="247" y="225" text-anchor="middle">R</text><circle id="star-1" class="jnani-kep-star" cx="210" cy="205" r="12"/><text id="star-label-1" class="jnani-kep-label" x="210" y="239" text-anchor="middle">2M</text><circle id="planet-1" class="jnani-kep-planet" cx="210" cy="131" r="7"/><text id="planet-label-1" class="jnani-kep-planet-label" x="221" y="126">P₁</text></g><g id="orbit-system-2" class="jnani-kep-system"><text x="630" y="43" text-anchor="middle" class="jnani-kep-system-title">SYSTEM 2 · P₂</text><circle id="orbit-2" class="jnani-kep-orbit" cx="630" cy="205" r="148"/><line id="radius-line-2" class="jnani-kep-radius" x1="630" y1="205" x2="778" y2="205" marker-end="url(#kepler-arrow)"/><text id="radius-label-2" class="jnani-kep-radius-label" x="704" y="225" text-anchor="middle">2R</text><circle id="star-2" class="jnani-kep-star" cx="630" cy="205" r="14"/><text id="star-label-2" class="jnani-kep-label" x="630" y="239" text-anchor="middle">4M</text><circle id="planet-2" class="jnani-kep-planet" cx="630" cy="57" r="7"/><text id="planet-label-2" class="jnani-kep-planet-label" x="641" y="52">P₂</text></g><text x="420" y="389" text-anchor="middle" fill="#64748b" font-size="11" font-family="Inter,sans-serif">Relative orbit sizes · schematic, not to astronomical scale</text></svg></div><div class="jnani-kep-clock"><span>Shared elapsed time <strong data-elapsed>0.00 T₁</strong></span><span>P₁ revolutions <strong data-revs="first">0.00</strong></span><span>P₂ revolutions <strong data-revs="second">0.00</strong></span></div><div class="jnani-kep-legend"><span><i class="jnani-kep-dot"></i>Central star (mass)</span><span><i class="jnani-kep-dot" style="background:#38bdf8"></i>Planet</span><span><i class="jnani-kep-dot" style="background:#22c55e"></i>Orbit radius</span></div></div>`;
  const shell = window.PYQSimulationShell.mount({
    root: document.getElementById("simulation-shell-root"),
    question: { title: question.topic || "Kepler's Third Law", chapter: question.chapter || "Gravitation", topic: "Kepler's Third Law: Comparing Orbital Time Periods", label: examLabel() },
    toolbar,
    visualization,
    onModeChange: setMode
  });

  const svg = document.getElementById("kepler-scene");
  function updateView() {
    const width = VIEW.width / state.view.zoom, height = VIEW.height / state.view.zoom;
    svg.setAttribute("viewBox", `${VIEW.width / 2 - width / 2 - state.view.x} ${VIEW.height / 2 - height / 2 - state.view.y} ${width} ${height}`);
    const level = document.querySelector("[data-zoom-level]");
    if (level) level.textContent = `${Math.round(state.view.zoom * 100)}%`;
  }
  function sceneParameters() {
    return state.mode === "explore" ? state.parameters : DEFAULTS;
  }
  function renderScene() {
    const p = sceneParameters();
    const orbital = engine.orbitalState(p, state.elapsedT1);
    const maxRadius = Math.max(p.radius1, p.radius2);
    const scale = 148 / maxRadius;
    const radii = [p.radius1 * scale, p.radius2 * scale];
    const centers = [210, 630];
    const masses = [p.mass1, p.mass2];
    const phases = [orbital.phase1, orbital.phase2];
    for (let index = 0; index < 2; index++) {
      const n = index + 1, cx = centers[index], radius = radii[index];
      const orbit = document.getElementById(`orbit-${n}`);
      orbit.setAttribute("r", radius);
      const radiusLine = document.getElementById(`radius-line-${n}`);
      radiusLine.setAttribute("x1", cx); radiusLine.setAttribute("y1", 205); radiusLine.setAttribute("x2", cx + radius); radiusLine.setAttribute("y2", 205);
      const radiusLabel = document.getElementById(`radius-label-${n}`);
      radiusLabel.setAttribute("x", cx + radius / 2); radiusLabel.setAttribute("y", 225);
      radiusLabel.textContent = `${pretty(p[`radius${n}`])}R`;
      const star = document.getElementById(`star-${n}`);
      star.setAttribute("r", 7 + 3 * Math.sqrt(masses[index]));
      document.getElementById(`star-label-${n}`).textContent = `${pretty(masses[index])}M`;
      const px = cx + radius * Math.cos(phases[index]);
      const py = 205 - radius * Math.sin(phases[index]);
      const planet = document.getElementById(`planet-${n}`);
      planet.setAttribute("cx", px); planet.setAttribute("cy", py);
      const planetLabel = document.getElementById(`planet-label-${n}`);
      planetLabel.setAttribute("x", px + 10); planetLabel.setAttribute("y", py - 9);
      const group = document.getElementById(`orbit-system-${n}`);
      const focus = state.mode === "understand" ? understand[state.understandStep].focus : "all";
      group.classList.toggle("is-muted", (focus === "system1" && n === 2) || (focus === "system2" && n === 1));
      group.classList.toggle("is-focus", focus === `system${n}` || focus === "compare");
    }
    const elapsed = document.querySelector("[data-elapsed]");
    if (elapsed) elapsed.textContent = `${state.elapsedT1.toFixed(2)} T₁`;
    const rev1 = document.querySelector('[data-revs="first"]'), rev2 = document.querySelector('[data-revs="second"]');
    if (rev1) rev1.textContent = pretty(state.elapsedT1, 2);
    if (rev2) rev2.textContent = pretty(state.elapsedT1 / orbital.ratio, 2);
    updateView();
  }
  function setTimeline(value, max = 2, label = "T₁ elapsed") {
    const current = document.getElementById("time-current"), total = document.getElementById("time-total"), slider = document.getElementById("timelineScrubber");
    if (!current || !total || !slider) return;
    slider.min = 0; slider.max = max; slider.step = max <= 2 ? 0.01 : 1; slider.value = value;
    current.textContent = state.mode === "question" || state.mode === "explore" ? `${Number(value).toFixed(2)} T₁` : `${value}/${max}`;
    total.textContent = state.mode === "question" || state.mode === "explore" ? "2.00 T₁" : label;
  }
  function updateExploreMetrics() {
    const result = engine.calculate(state.parameters);
    for (const key of ["mass1", "radius1", "mass2", "radius2"]) {
      const out = document.querySelector(`[data-value="${key}"]`);
      if (out) out.textContent = `${pretty(state.parameters[key])}${key.startsWith("mass") ? "M" : "R"}`;
    }
    const first = document.querySelector('[data-period="first"]'), second = document.querySelector('[data-period="second"]');
    const ratio = document.querySelector("[data-period-ratio]"), speedRatio = document.querySelector("[data-speed-ratio]");
    if (first) first.textContent = pretty(result.normalizedPeriods.first);
    if (second) second.textContent = pretty(result.normalizedPeriods.second);
    if (ratio) ratio.textContent = pretty(result.ratio);
    if (speedRatio) speedRatio.textContent = pretty(result.angularSpeedRatio);
  }
  function renderMath() {
    window.PYQSimulationMath.render(document.getElementById("console-content")).catch(error => console.error("Math rendering failed", error));
  }
  function renderMode(mode = state.mode) {
    shell.setActiveMode(mode);
    const content = document.getElementById("console-content");
    content.innerHTML = mode === "question" ? questionHtml() : mode === "understand" ? understandHtml() : mode === "solve" ? solveHtml() : exploreHtml();
    if (mode === "question") setTimeline(state.elapsedT1);
    else if (mode === "understand") setTimeline(state.understandStep + 1, understand.length, "Question parts");
    else if (mode === "solve") setTimeline(state.solveStep + 1, solveSteps().length, "Solution steps");
    else setTimeline(state.elapsedT1);
    if (mode === "explore") updateExploreMetrics();
    renderScene();
    renderMath();
  }
  function stopPlayback() {
    if (state.frame !== null) cancelAnimationFrame(state.frame);
    state.frame = null; state.lastFrameTime = null;
    const play = document.getElementById("playIcon"), pause = document.getElementById("pauseIcon");
    if (play) play.classList.remove("hidden");
    if (pause) pause.classList.add("hidden");
  }
  function setMode(mode) {
    const previous = state.mode;
    stopPlayback();
    if (previous === "explore" && mode !== "explore") { state.parameters = { ...DEFAULTS }; state.elapsedT1 = 0; }
    if (mode === "explore" && previous !== "explore") { state.parameters = { ...DEFAULTS }; state.elapsedT1 = 0; }
    if (mode === "understand" && previous !== "understand") state.understandStep = 0;
    if (mode === "solve" && previous !== "solve") state.solveStep = 0;
    state.mode = mode;
    renderMode(mode);
  }
  function tick(now) {
    if (state.frame === null) return;
    if (state.lastFrameTime !== null) state.elapsedT1 = Math.min(2, state.elapsedT1 + (now - state.lastFrameTime) * state.speed / (DURATION_SECONDS * 1000 / 2));
    state.lastFrameTime = now;
    renderScene();
    setTimeline(state.elapsedT1);
    if (state.elapsedT1 >= 2) { stopPlayback(); return; }
    state.frame = requestAnimationFrame(tick);
  }
  window.togglePlayPause = function () {
    if (state.frame !== null) { stopPlayback(); return; }
    if (state.elapsedT1 >= 2) state.elapsedT1 = 0;
    const play = document.getElementById("playIcon"), pause = document.getElementById("pauseIcon");
    if (play) play.classList.add("hidden");
    if (pause) pause.classList.remove("hidden");
    state.lastFrameTime = null;
    state.frame = requestAnimationFrame(tick);
  };
  window.resetAnimation = function () { stopPlayback(); state.elapsedT1 = 0; renderScene(); if (state.mode === "understand") setTimeline(state.understandStep + 1, understand.length, "Question parts"); else if (state.mode === "solve") setTimeline(state.solveStep + 1, solveSteps().length, "Solution steps"); else setTimeline(0); };
  window.setSpeed = function (speed) {
    state.speed = Number(speed);
    document.querySelectorAll(".speed-btn").forEach(button => {
      const selected = Number(button.dataset.speed) === state.speed;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("bg-green-500", selected);
      button.classList.toggle("text-slate-950", selected);
    });
  };
  window.scrubTimeline = function (value) {
    stopPlayback();
    const number = Number(value);
    if (state.mode === "understand") state.understandStep = Math.max(0, Math.min(understand.length - 1, Math.round(number - 1)));
    else if (state.mode === "solve") state.solveStep = Math.max(0, Math.min(solveSteps().length - 1, Math.round(number - 1)));
    else state.elapsedT1 = Math.max(0, Math.min(2, number));
    if (state.mode === "question" || state.mode === "explore") { renderScene(); setTimeline(state.elapsedT1); }
    else renderMode(state.mode);
  };
  window.resetView = function () { state.view = { zoom: 1, x: 0, y: 0, drag: null }; updateView(); };
  window.closeSimulation = function () { stopPlayback(); window.parent.postMessage({ type: "pyq-simulation-close" }, window.location.origin); };

  document.getElementById("console-content").addEventListener("click", event => {
    const button = event.target.closest("button"); if (!button) return;
    if (button.hasAttribute("data-start-understanding")) { setMode("understand"); return; }
    if (button.dataset.ustep) {
      const next = state.understandStep + Number(button.dataset.ustep);
      if (next < 0) return;
      if (next >= understand.length) { setMode("solve"); return; }
      state.understandStep = next; renderMode("understand"); return;
    }
    if (button.dataset.sstep) {
      const next = state.solveStep + Number(button.dataset.sstep);
      if (next < 0) return;
      if (next >= solveSteps().length) { setMode("explore"); return; }
      state.solveStep = next; renderMode("solve"); return;
    }
    if (button.dataset.preset === "radius") { state.parameters = { ...DEFAULTS, mass2: DEFAULTS.mass1, radius2: 2 * DEFAULTS.radius1 }; renderMode("explore"); return; }
    if (button.dataset.preset === "mass") { state.parameters = { ...DEFAULTS, radius2: DEFAULTS.radius1, mass2: 2 * DEFAULTS.mass1 }; renderMode("explore"); return; }
    if (button.hasAttribute("data-orbit-reset")) { state.parameters = { ...DEFAULTS }; state.elapsedT1 = 0; renderMode("explore"); return; }
  });
  document.getElementById("console-content").addEventListener("input", event => {
    const slider = event.target.closest("[data-mass],[data-radius]");
    if (!slider) return;
    const key = slider.dataset.mass || slider.dataset.radius;
    state.parameters[key] = Number(slider.value);
    updateExploreMetrics();
    renderScene();
  });
  document.getElementById("simulation-shell-root").addEventListener("click", event => {
    const button = event.target.closest("[data-view]"); if (!button) return;
    if (button.dataset.view === "reset") window.resetView();
    else state.view.zoom = Math.max(0.7, Math.min(2.5, state.view.zoom * (button.dataset.view === "in" ? 1.2 : 1 / 1.2))), updateView();
  });
  svg.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    state.view.drag = { pointerId: event.pointerId, pointerX: event.clientX, pointerY: event.clientY, x: state.view.x, y: state.view.y };
    svg.classList.add("is-dragging"); svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener("pointermove", event => {
    const drag = state.view.drag; if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = svg.getBoundingClientRect();
    state.view.x = drag.x + (event.clientX - drag.pointerX) * VIEW.width / rect.width / state.view.zoom;
    state.view.y = drag.y + (event.clientY - drag.pointerY) * VIEW.height / rect.height / state.view.zoom;
    updateView();
  });
  const endDrag = event => { if (!state.view.drag || state.view.drag.pointerId !== event.pointerId) return; state.view.drag = null; svg.classList.remove("is-dragging"); };
  svg.addEventListener("pointerup", endDrag); svg.addEventListener("pointercancel", endDrag); svg.addEventListener("lostpointercapture", endDrag);
  svg.addEventListener("wheel", event => { event.preventDefault(); state.view.zoom = Math.max(0.7, Math.min(2.5, state.view.zoom * (event.deltaY < 0 ? 1.12 : 1 / 1.12))); updateView(); }, { passive: false });
  window.addEventListener("pagehide", stopPlayback);
  setMode("question");
})();
