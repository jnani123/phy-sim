(function () {
  const questionId = new URLSearchParams(window.location.search).get("questionId");
  const library = JSON.parse(localStorage.getItem("orbit-physics-pyq-v1") || "[]");
  const question = library.find(item => item.id === questionId && item.simulation?.engine === "angular-kinematics");
  if (!question) {
    document.body.innerHTML = '<main style="max-width:680px;margin:10vh auto;padding:24px;color:#e2e8f0;font:16px Inter,sans-serif"><h1>Question simulation unavailable</h1><p>Open this simulation from its question card in the PYQ Studio.</p><button onclick="window.parent.postMessage({type:\'pyq-simulation-close\'},window.location.origin)" style="padding:10px 14px">Return to question library</button></main>';
    throw new Error("The selected angular-kinematics question is missing from the local question library.");
  }

  const engine = window.PYQPhysicsEngines.angularKinematics;
  const MAX_TIME = 10;
  const PLAYBACK_SECONDS = 18;
  const VIEW = { width: 840, height: 420 };
  const state = {
    mode: "question", time: 0, understandStep: 0, solveStep: 0, speed: 1,
    playing: false, frame: null, lastFrame: null,
    view: { zoom: 1, x: 0, y: 0, drag: null },
    showOmega: true, showAlpha: false
  };

  const traps = [
    { title: "Differentiating only once", wrong: "Use dθ/dt as the angular acceleration.", fix: "The first derivative is angular velocity. Differentiate once more to obtain angular acceleration." },
    { title: "Applying the power rule incorrectly", wrong: "Keep the exponent unchanged when differentiating t⁴/8.", fix: "The power rule gives (4/8)t³ = t³/2; differentiating −t³/3 gives −t²." },
    { title: "Dropping the negative term", wrong: "Use α = 3t²/2 + 2t.", fix: "The derivative of −t² is −2t, so retain the negative sign in the expression." },
    { title: "Substituting into angular velocity", wrong: "Evaluate ω(10) and report 400 as the angular acceleration.", fix: "The question asks for α. Substitute t=10 into α(t)=3t²/2−2t, giving 150−20=130 rad/s²." },
    { title: "Confusing the angle's revolutions with the answer", wrong: "Reduce θ modulo 2π and use that value for angular acceleration.", fix: "Modulo 2π is only for drawing the particle on the circle. Angular acceleration comes from the second derivative and is 130 rad/s², option (3)." }
  ];

  const understand = [
    { fragment: String.raw`A particle is rotating in a circular path and at any instant its motion can be described as`, focus: "path" },
    { fragment: String.raw`\[\theta=\frac{5t^4}{40}-\frac{t^3}{3}.\]`, focus: "position" },
    { fragment: String.raw`The angular acceleration of the particle after 10 seconds is ______ \(\text{rad/s}^2\).`, focus: "requested" },
    { caption: "Given and find", focus: "requested", givenAsked: true }
  ];
  const givenAskedContent = {
    given: [String.raw`\(\theta=\frac{5t^4}{40}-\frac{t^3}{3}\)`, String.raw`\(t=10\ \mathrm{s}\)`],
    find: String.raw`\(\alpha\) after \(10\ \mathrm{s}\), in \(\mathrm{rad/s^2}\)`
  };

  function solveSteps() {
    return [
      { title: "Write the angular-position function", body: "The given function describes angular position in radians as time changes.", math: String.raw`\[\theta=\frac{5t^4}{40}-\frac{t^3}{3}=\frac{t^4}{8}-\frac{t^3}{3}\]`, trap: traps[0] },
      { title: "Differentiate to find angular velocity", body: "Angular velocity is the rate of change of angular position. Differentiate each term with respect to time.", math: String.raw`\[\omega=\frac{d\theta}{dt}=\frac{4t^3}{8}-\frac{3t^2}{3}=\frac{t^3}{2}-t^2\quad\text{rad/s}\]`, trap: traps[1] },
      { title: "Differentiate again for angular acceleration", body: "Angular acceleration is the rate of change of angular velocity, or the second derivative of angular position.", math: String.raw`\[\alpha=\frac{d\omega}{dt}=\frac{d^2\theta}{dt^2}=\frac{3t^2}{2}-2t\quad\text{rad/s}^2\]`, trap: traps[2] },
      { title: "Substitute the requested time", body: "Set t=10 s in the angular-acceleration expression. Keep the units from the second derivative.", math: String.raw`\[\alpha(10)=\frac32(10)^2-2(10)=150-20=130\quad\text{rad/s}^2\]`, trap: traps[3] },
      { title: "Select the matching option", body: "The calculated angular acceleration is 130 rad/s², which matches the third printed choice.", math: String.raw`\[\boxed{\alpha(10)=130\ \text{rad/s}^2}\qquad\text{Option (3)}\]`, trap: traps[4] }
    ];
  }

  function fmt(value, digits = 6) {
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) < 1e-10) return "0";
    return Number(value.toPrecision(digits)).toString();
  }
  function examLabel() {
    const date = [question.date, question.month, question.year].filter(Boolean).join(" ");
    return [question.exam, date, question.session && `Session ${question.session}`, question.set && `Set ${question.set}`].filter(Boolean).join(" · ");
  }
  function questionHtml() {
    const options = question.options.split("\n").map((option, index) => {
      const value = option.replace(/^\s*\(?\d+\)?[.)]?\s*/, "");
      return String.raw`<div class="jnani-sim-option"><strong>(${index + 1})</strong> \(${value}\)</div>`;
    }).join("");
    return String.raw`<article class="jnani-sim-card"><div class="jnani-sim-card-label">Question ${question.questionNumber}</div><p class="jnani-ak-question jnani-sim-question-text mt-3">A particle is rotating in a circular path and at any instant its motion can be described as</p><div class="jnani-sim-equation jnani-ak-equation mt-3">\[\theta=\frac{5t^4}{40}-\frac{t^3}{3}.\]</div><p class="jnani-ak-question jnani-sim-question-text mt-3">The angular acceleration of the particle after 10 seconds is ______ \(\text{rad/s}^2\).</p></article><section class="mt-4"><div class="jnani-sim-card-label mb-3">Options</div><div class="jnani-sim-option-grid">${options}</div></section><button class="jnani-sim-control-button primary mt-5 w-full" data-start-understanding type="button">Start Guided Understanding <span aria-hidden="true">›</span></button>`;
  }
  function understandHtml() {
    const stage = understand[state.understandStep];
    const content = stage.givenAsked ? window.PYQSimulationTeaching.givenAndAsked(givenAskedContent) : `<div class="jnani-sim-question-fragment mt-4"><span>${stage.fragment}</span></div>`;
    return `<div class="jnani-sim-stage-progress" style="--stage-progress:${(state.understandStep + 1) / understand.length * 100}%"><span></span></div><article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Question part ${state.understandStep + 1} of ${understand.length}</div>${content}</article><div class="jnani-ak-nav"><button class="jnani-sim-control-button" data-ustep="-1" ${state.understandStep === 0 ? "disabled" : ""}>Previous part</button><button class="jnani-sim-control-button primary" data-ustep="1">${state.understandStep === understand.length - 1 ? "Start Solve" : "Next part"}</button></div>`;
  }
  function solveHtml() {
    const steps = solveSteps(), step = steps[state.solveStep];
    return `<article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Solve · Step ${state.solveStep + 1} of ${steps.length}</div><h2 class="jnani-sim-content-title mt-2">${step.title}</h2><p class="mt-3 leading-7 text-slate-300">${step.body}</p><div class="jnani-sim-equation jnani-ak-equation mt-4 overflow-x-auto">${step.math}</div></article>${window.PYQSimulationTeaching.commonStudentTrap(step.trap)}<div class="jnani-ak-nav"><button class="jnani-sim-control-button" data-sstep="-1" ${state.solveStep === 0 ? "disabled" : ""}>Previous step</button><button class="jnani-sim-control-button primary" data-sstep="1">${state.solveStep === steps.length - 1 ? "Explore motion" : "Next step"}</button></div>`;
  }
  function exploreHtml() {
    const result = engine.evaluate(state.time);
    return String.raw`<article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Explore · Angular-motion lab</div><h2 class="jnani-sim-content-title mt-2">Inspect the motion at any time</h2><div class="jnani-ak-controls"><label class="jnani-ak-time"><span>Time</span><input type="range" min="0" max="10" step="0.001" value="${state.time}" data-explore-time aria-label="Time in seconds"><output data-time-output>${state.time.toFixed(3)} s</output></label><div class="jnani-ak-points" aria-label="Explore key times"><button type="button" data-time-point="0">t = 0 s</button><button type="button" data-time-point="1.3333333333333333">t = 4/3 s</button><button type="button" data-time-point="2">t = 2 s</button><button type="button" data-time-point="10">t = 10 s</button></div><div class="jnani-ak-toggles"><label><input type="checkbox" data-toggle-omega ${state.showOmega ? "checked" : ""}>Show angular-velocity direction</label><label><input type="checkbox" data-toggle-alpha ${state.showAlpha ? "checked" : ""}>Show angular-acceleration direction</label></div></div><div class="jnani-ak-values"><div><small>Angular position \(\theta\) (rad)</small><strong data-value-theta>${fmt(result.theta)}</strong></div><div><small>Angular velocity \(\omega\) (rad/s)</small><strong data-value-omega>${fmt(result.omega)}</strong></div><div class="jnani-ak-highlight"><small>Angular acceleration \(\alpha\) (rad/s²)</small><strong data-value-alpha>${fmt(result.alpha)}</strong></div><div><small>Direction at this time</small><strong data-direction>${result.omega < 0 ? "Negative angular direction" : result.omega > 0 ? "Positive angular direction" : "Momentarily at rest"}</strong></div></div><p class="jnani-ak-note">The displayed angle keeps its full value. The particle’s location on the circle uses the equivalent angle modulo \(2\pi\), so repeated revolutions remain readable.</p><button type="button" class="jnani-sim-control-button mt-3" data-explore-reset>Reset time and indicators</button></article>`;
  }

  const toolbar = `<span class="jnani-sim-phase-badge" data-phase-badge>Angular position from the given function</span><div class="jnani-ak-view" role="group" aria-label="Scene view controls"><button type="button" data-view="out" aria-label="Zoom out">−</button><button type="button" data-view="in" aria-label="Zoom in">+</button><button type="button" data-view="reset">Reset View</button></div>`;
  const visualization = `<div class="jnani-ak-visual"><div class="jnani-ak-scene"><svg id="angular-scene" viewBox="0 0 840 420" role="img" aria-label="A particle moves around a circular path according to its angular-position function"><title>Angular position, velocity and acceleration</title><desc>The particle position follows theta(t). The direction reverses at t equals 2 seconds when angular velocity changes from negative to positive.</desc><defs><marker id="ak-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8z" fill="#f97316"/></marker><marker id="ak-alpha-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8z" fill="#fbbf24"/></marker><marker id="ak-angle-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7z" fill="#a78bfa"/></marker></defs><circle class="jnani-ak-orbit" cx="420" cy="210" r="132"/><line id="ak-radius" class="jnani-ak-radius" x1="420" y1="210" x2="552" y2="210"/><path id="ak-angle" class="jnani-ak-angle" marker-end="url(#ak-angle-arrow)"/><line id="ak-omega-vector" class="jnani-ak-vector" marker-end="url(#ak-arrow)"/><path id="ak-alpha-indicator" fill="none" stroke="#fbbf24" stroke-width="4" marker-end="url(#ak-alpha-arrow)"/><circle class="jnani-ak-center" cx="420" cy="210" r="7"/><text class="jnani-ak-label" x="432" y="230">O</text><circle id="ak-particle" class="jnani-ak-particle" cx="552" cy="210" r="9"/><text id="ak-theta-label" class="jnani-ak-mono" x="500" y="196">θ</text><text x="420" y="390" text-anchor="middle" fill="#64748b" font-size="11" font-family="Inter,sans-serif">Circular path · angle shown modulo 2π for position only</text></svg></div><div class="jnani-ak-clock"><span>Simulated time <strong data-clock-time>0.00 s</strong></span><span data-clock-theta-wrap>θ <strong data-clock-theta>0 rad</strong></span><span data-clock-direction-wrap>ω sign <strong data-clock-direction>At rest</strong></span><span data-clock-alpha-wrap>α sign <strong data-clock-alpha>Zero</strong></span></div><div class="jnani-ak-legend"><span><i class="jnani-ak-dot"></i>Particle</span><span><i class="jnani-ak-dot" style="background:#22c55e"></i>Radius and angular position</span><span><i class="jnani-ak-dot" style="background:#f97316"></i>Angular-velocity direction</span><span><i class="jnani-ak-dot" style="background:#fbbf24"></i>Angular-acceleration direction</span></div></div>`;

  const shell = window.PYQSimulationShell.mount({
    root: document.getElementById("simulation-shell-root"),
    question: { title: question.topic || "Angular kinematics", chapter: question.chapter || "Rotational Motion", topic: "Angular position, velocity and acceleration", label: examLabel() },
    toolbar, visualization, onModeChange: setMode
  });
  const svg = document.getElementById("angular-scene");

  function updateView() {
    const width = VIEW.width / state.view.zoom, height = VIEW.height / state.view.zoom;
    svg.setAttribute("viewBox", `${VIEW.width / 2 - width / 2 - state.view.x} ${VIEW.height / 2 - height / 2 - state.view.y} ${width} ${height}`);
  }
  function updateScene() {
    const value = engine.evaluate(state.time);
    const phase = ((value.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const cx = 420, cy = 210, radius = 132;
    const px = cx + radius * Math.cos(phase), py = cy - radius * Math.sin(phase);
    const particle = document.getElementById("ak-particle");
    particle.setAttribute("cx", px); particle.setAttribute("cy", py);
    const radial = document.getElementById("ak-radius");
    radial.setAttribute("x2", px); radial.setAttribute("y2", py);
    const arcRadius = 38;
    const ax = cx + arcRadius * Math.cos(phase), ay = cy - arcRadius * Math.sin(phase);
    document.getElementById("ak-angle").setAttribute("d", phase < 0.025 ? "" : `M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 ${phase > Math.PI ? 1 : 0} 0 ${ax} ${ay}`);
    const tangent = document.getElementById("ak-omega-vector");
    const direction = Math.sign(value.omega);
    const tangentScale = 46 * direction;
    tangent.setAttribute("x1", px); tangent.setAttribute("y1", py);
    tangent.setAttribute("x2", px - Math.sin(phase) * tangentScale);
    tangent.setAttribute("y2", py - Math.cos(phase) * tangentScale);
    tangent.style.display = direction !== 0 && (state.mode === "explore" ? state.showOmega : state.mode !== "understand") ? "" : "none";
    const alphaArc = document.getElementById("ak-alpha-indicator");
    const alphaDirection = Math.sign(value.alpha);
    alphaArc.setAttribute("d", alphaDirection === 0 ? "" : `M ${cx + 55} ${cy} A 55 55 0 0 ${alphaDirection > 0 ? 0 : 1} ${cx + 55 * Math.cos(0.9)} ${cy - 55 * Math.sin(0.9)}`);
    const requestedFocus = state.mode === "understand" && understand[state.understandStep].focus === "requested";
    alphaArc.style.display = alphaDirection !== 0 && (requestedFocus || (state.showAlpha && state.mode === "explore")) ? "" : "none";
    const thetaLabel = document.getElementById("ak-theta-label");
    thetaLabel.setAttribute("x", (cx + px) / 2); thetaLabel.setAttribute("y", (cy + py) / 2 - 8);
    const focus = state.mode === "understand" ? understand[state.understandStep].focus : "all";
    const visual = document.querySelector(".jnani-ak-visual");
    if (visual) { visual.dataset.mode = state.mode; visual.dataset.focus = focus; }
    svg.classList.toggle("is-focus-path", focus === "path");
    svg.classList.toggle("is-focus-position", focus === "position");
    svg.classList.toggle("is-focus-requested", focus === "requested");
    const clockTime = document.querySelector("[data-clock-time]"), clockTheta = document.querySelector("[data-clock-theta]");
    const clockDirection = document.querySelector("[data-clock-direction]"), clockAlpha = document.querySelector("[data-clock-alpha]");
    if (clockTime) clockTime.textContent = `${state.time.toFixed(2)} s`;
    if (clockTheta) clockTheta.textContent = `${fmt(value.theta)} rad`;
    if (clockDirection) clockDirection.textContent = value.omega < 0 ? "Negative" : value.omega > 0 ? "Positive" : "At rest";
    if (clockAlpha) clockAlpha.textContent = value.alpha < 0 ? "Negative" : value.alpha > 0 ? "Positive" : "Zero";
    const output = document.querySelector("[data-time-output]"), slider = document.querySelector("[data-explore-time]");
    if (output) output.textContent = `${state.time.toFixed(3)} s`;
    if (slider) slider.value = state.time;
    const values = [["[data-value-theta]", fmt(value.theta)], ["[data-value-omega]", fmt(value.omega)], ["[data-value-alpha]", fmt(value.alpha)]];
    values.forEach(([selector, text]) => { const element = document.querySelector(selector); if (element) element.textContent = text; });
    const directionLabel = document.querySelector("[data-direction]");
    if (directionLabel) directionLabel.textContent = value.omega < 0 ? "Negative angular direction" : value.omega > 0 ? "Positive angular direction" : "Momentarily at rest";
    updateView();
  }
  function renderMath() {
    window.PYQSimulationMath.render(document.getElementById("console-content")).catch(error => console.error("Math rendering failed", error));
  }
  function setTimeline(value, max = MAX_TIME, label = "Time (s)") {
    const slider = document.getElementById("timelineScrubber");
    const current = document.getElementById("time-current"), total = document.getElementById("time-total");
    if (!slider || !current || !total) return;
    slider.min = 0; slider.max = max; slider.step = max <= MAX_TIME ? 0.01 : 1; slider.value = value;
    current.textContent = state.mode === "question" || state.mode === "explore" ? `${state.time.toFixed(1)}s` : `${value}/${max}`;
    total.textContent = state.mode === "question" || state.mode === "explore" ? "10.0s" : label;
  }
  function renderMode(mode = state.mode) {
    shell.setActiveMode(mode);
    const content = document.getElementById("console-content");
    content.innerHTML = mode === "question" ? questionHtml() : mode === "understand" ? understandHtml() : mode === "solve" ? solveHtml() : exploreHtml();
    if (mode === "question") setTimeline(state.time);
    else if (mode === "understand") setTimeline(state.understandStep + 1, understand.length, "Question parts");
    else if (mode === "solve") setTimeline(state.solveStep + 1, solveSteps().length, "Solution steps");
    else setTimeline(state.time);
    renderMath();
    updateScene();
  }
  function stopPlayback() {
    state.playing = false;
    if (state.frame !== null) cancelAnimationFrame(state.frame);
    state.frame = null; state.lastFrame = null;
    const play = document.getElementById("playIcon"), pause = document.getElementById("pauseIcon");
    if (play) play.classList.remove("hidden");
    if (pause) pause.classList.add("hidden");
  }
  function setMode(mode) {
    const previous = state.mode;
    stopPlayback();
    if (previous === "explore" && mode !== "explore") { state.time = 0; state.showOmega = true; state.showAlpha = false; }
    if (mode === "explore" && previous !== "explore") { state.time = 0; state.showOmega = true; state.showAlpha = false; }
    if (mode === "understand" && previous !== "understand") { state.understandStep = 0; state.time = 0; }
    if (mode === "solve" && previous !== "solve") state.solveStep = 0;
    state.mode = mode;
    renderMode(mode);
  }
  function tick(now) {
    if (!state.playing) return;
    if (state.lastFrame !== null) state.time = Math.min(MAX_TIME, state.time + (now - state.lastFrame) * state.speed * MAX_TIME / (PLAYBACK_SECONDS * 1000));
    state.lastFrame = now;
    updateScene(); setTimeline(state.time);
    if (state.time >= MAX_TIME) { stopPlayback(); return; }
    state.frame = requestAnimationFrame(tick);
  }
  window.togglePlayPause = function () {
    if (state.playing) { stopPlayback(); return; }
    if (state.time >= MAX_TIME) state.time = 0;
    state.playing = true;
    const play = document.getElementById("playIcon"), pause = document.getElementById("pauseIcon");
    if (play) play.classList.add("hidden"); if (pause) pause.classList.remove("hidden");
    state.lastFrame = null; state.frame = requestAnimationFrame(tick);
  };
  window.resetAnimation = function () { stopPlayback(); state.time = 0; updateScene(); setTimeline(state.mode === "understand" ? state.understandStep + 1 : state.mode === "solve" ? state.solveStep + 1 : 0, state.mode === "understand" ? understand.length : state.mode === "solve" ? solveSteps().length : MAX_TIME); };
  window.setSpeed = function (speed) { state.speed = Number(speed); };
  window.scrubTimeline = function (raw) {
    stopPlayback(); const value = Number(raw);
    if (state.mode === "understand") { state.understandStep = Math.max(0, Math.min(understand.length - 1, Math.round(value - 1))); state.time = [0, 1, 10, 10][state.understandStep]; }
    else if (state.mode === "solve") state.solveStep = Math.max(0, Math.min(solveSteps().length - 1, Math.round(value - 1)));
    else state.time = Math.max(0, Math.min(MAX_TIME, value));
    if (state.mode === "understand" || state.mode === "solve") renderMode(); else { updateScene(); setTimeline(state.time); }
  };
  window.resetView = function () { state.view = { zoom: 1, x: 0, y: 0, drag: null }; updateView(); };
  window.closeSimulation = function () { stopPlayback(); window.parent.postMessage({ type: "pyq-simulation-close" }, window.location.origin); };

  document.getElementById("console-content").addEventListener("click", event => {
    const button = event.target.closest("button"); if (!button) return;
    if (button.hasAttribute("data-start-understanding")) { setMode("understand"); return; }
    if (button.dataset.ustep) { const next = state.understandStep + Number(button.dataset.ustep); if (next < 0) return; if (next >= understand.length) { setMode("solve"); return; } state.understandStep = next; state.time = [0, 1, 10, 10][next]; renderMode(); return; }
    if (button.dataset.sstep) { const next = state.solveStep + Number(button.dataset.sstep); if (next < 0) return; if (next >= solveSteps().length) { setMode("explore"); return; } state.solveStep = next; renderMode(); return; }
    if (button.dataset.timePoint !== undefined) { state.time = Number(button.dataset.timePoint); updateScene(); setTimeline(state.time); return; }
    if (button.hasAttribute("data-explore-reset")) { state.time = 0; state.showOmega = true; state.showAlpha = false; renderMode(); return; }
  });
  document.getElementById("console-content").addEventListener("input", event => {
    const target = event.target;
    if (target.matches("[data-explore-time]")) { stopPlayback(); state.time = Number(target.value); updateScene(); setTimeline(state.time); }
    if (target.matches("[data-toggle-omega]")) { state.showOmega = target.checked; updateScene(); }
    if (target.matches("[data-toggle-alpha]")) { state.showAlpha = target.checked; updateScene(); }
  });
  document.getElementById("simulation-shell-root").addEventListener("click", event => {
    const button = event.target.closest("[data-view]"); if (!button) return;
    if (button.dataset.view === "reset") window.resetView();
    else state.view.zoom = Math.max(0.75, Math.min(2.5, state.view.zoom * (button.dataset.view === "in" ? 1.2 : 1 / 1.2))), updateView();
  });
  svg.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    state.view.drag = { id: event.pointerId, px: event.clientX, py: event.clientY, x: state.view.x, y: state.view.y };
    svg.classList.add("is-dragging"); svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener("pointermove", event => {
    const drag = state.view.drag; if (!drag || drag.id !== event.pointerId) return;
    const rect = svg.getBoundingClientRect();
    state.view.x = drag.x + (event.clientX - drag.px) * VIEW.width / rect.width / state.view.zoom;
    state.view.y = drag.y + (event.clientY - drag.py) * VIEW.height / rect.height / state.view.zoom;
    updateView();
  });
  const endDrag = event => { if (!state.view.drag || state.view.drag.id !== event.pointerId) return; state.view.drag = null; svg.classList.remove("is-dragging"); };
  svg.addEventListener("pointerup", endDrag); svg.addEventListener("pointercancel", endDrag); svg.addEventListener("lostpointercapture", endDrag);
  svg.addEventListener("wheel", event => { event.preventDefault(); state.view.zoom = Math.max(0.75, Math.min(2.5, state.view.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1))); updateView(); }, { passive: false });
  window.addEventListener("pagehide", stopPlayback);
  setMode("question");
})();
