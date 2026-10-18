(function () {
  const question = window.PYQSimulationQuestionData.loadQuestion("position-dependent-motion");
  if (!question) {
    document.body.innerHTML = '<main style="max-width:680px;margin:10vh auto;padding:24px;color:#e2e8f0;font:16px Inter,sans-serif"><h1>Question simulation unavailable</h1><p>Open this simulation from its question card in the PYQ Studio.</p><button onclick="window.parent.postMessage({type:\'pyq-simulation-close\'},window.location.origin)" style="padding:10px 14px">Return to question library</button></main>';
    throw new Error("The selected position-dependent motion question is missing from the local question library.");
  }

  const engine = window.PYQPhysicsEngines.positionDependentMotion;
  function examMetadata() {
    const month = question.month || "";
    const date = month ? (question.date || "").replace(new RegExp(`\\s*${month}`, "i"), "").trim() : (question.date || "");
    return [question.exam, [date, month, question.year].filter(Boolean).join(" "), question.set && `Set ${question.set}`].filter(Boolean).join(" · ");
  }
  const colors = { position: "#a78bfa", velocity: "#38bdf8", acceleration: "#f59e0b", momentum: "#22c55e", force: "#fb7185", angularMomentum: "#c084fc", torque: "#fbbf24", axis: "#94a3b8" };
  const names = { position: "Position r", velocity: "Velocity v", acceleration: "Acceleration a", momentum: "Momentum p", force: "Force F", angularMomentum: "Angular momentum L", torque: "Torque τ" };
  const initialTime = 1;
  const state = { mode: "question", time: initialTime, understandStep: 0, solveStep: 0, visible: { position: true }, understandVisible: { position: true }, playbackStage: 0, speed: 1, timer: null, view: { yaw: Math.PI / 4, pitch: 0.42, zoom: 1, drag: null } };

  const traps = [
    { title: "Using position as velocity", wrong: "Substitute t = 1 into r and call the result velocity.", fix: "Velocity is the time derivative of position. Differentiate each component first, then substitute t = 1 s." },
    { title: "Differentiating a power incorrectly", wrong: "Differentiate 10t² as 10t or forget the exponent multiplier.", fix: "Apply the power rule: d(tⁿ)/dt = n tⁿ⁻¹. Therefore d(10t²)/dt = 20t." },
    { title: "Stopping after the first derivative", wrong: "Use velocity in F = ma without differentiating it.", fix: "Force depends on acceleration. Differentiate velocity once more to obtain a = (20, 30t), then multiply by mass." },
    { title: "Forgetting to multiply by mass", wrong: "Report v as momentum or a as force.", fix: "Use p = mv and F = ma, with m = 0.1 kg." },
    { title: "Keeping only one cross-product product", wrong: "Take 10 × 1.5 = 15 as the angular momentum.", fix: "The z-component is x pᵧ − y pₓ. Subtract 5 × 2 = 10, giving Lz = 15 − 10 = 5." },
    { title: "Reversing the cross-product order", wrong: "Calculate p × r or F × r, reversing the sign.", fix: "About the origin use L = r × p and τ = r × F, in that order." },
    { title: "Using force instead of momentum", wrong: "Evaluate r × F when checking statement C.", fix: "Angular momentum uses momentum: L = r × p. Torque uses force: τ = r × F." },
    { title: "Assuming the first cross-product term is the answer", wrong: "Read 10 × 3 = 30 as the torque.", fix: "Subtract the second term 5 × 2 = 10. Therefore τz = 30 − 10 = 20, matching D." }
  ];
  const solvedAtOne = engine.evaluate(1);
  const verdictAtOne = engine.evaluateStatements(1);
  const correctStatements = ["A", "B", "C", "D"].filter(letter => verdictAtOne[letter]);
  const solveSteps = [
    { title: "1. Read the position function", body: "The two coordinates depend on time, and the mass is 0.1 kg. We evaluate the requested statements at t = 1 s.", math: String.raw`\[\vec r(t)=10t^2\hat i+5t^3\hat j,\qquad m=0.1\,\mathrm{kg},\quad t=1\,\mathrm{s}\]\[\vec r(1)=${fmt(solvedAtOne.position.x)}\hat i+${fmt(solvedAtOne.position.y)}\hat j\,\mathrm{m}\]` },
    { title: "2. Differentiate to find velocity", body: "Velocity is the rate at which position changes with time. Differentiate the i and j components separately.", math: String.raw`\[\vec v=\frac{d\vec r}{dt}=20t\hat i+15t^2\hat j\]\[\vec v(1)=${fmt(solvedAtOne.velocity.x)}\hat i+${fmt(solvedAtOne.velocity.y)}\hat j\,\mathrm{m/s}\]` },
    { title: "3. Differentiate again for acceleration", body: "Acceleration is the rate of change of velocity, so take one more time derivative.", math: String.raw`\[\vec a=\frac{d\vec v}{dt}=20\hat i+30t\hat j\]\[\vec a(1)=${fmt(solvedAtOne.acceleration.x)}\hat i+${fmt(solvedAtOne.acceleration.y)}\hat j\,\mathrm{m/s^2}\]` },
    { title: "4. Check statement A: momentum", body: "Linear momentum equals mass times velocity. Both components are scaled by the same mass.", math: String.raw`\[\vec p=m\vec v=0.1(${fmt(solvedAtOne.velocity.x)}\hat i+${fmt(solvedAtOne.velocity.y)}\hat j)=${fmt(solvedAtOne.momentum.x)}\hat i+${fmt(solvedAtOne.momentum.y)}\hat j\,\mathrm{kg\,m/s}\]\[\therefore\ \text{A is ${verdictAtOne.A ? "correct" : "incorrect"}.}\]` },
    { title: "5. Check statement B: force", body: "Newton's second law gives force from mass and acceleration.", math: String.raw`\[\vec F=m\vec a=0.1(${fmt(solvedAtOne.acceleration.x)}\hat i+${fmt(solvedAtOne.acceleration.y)}\hat j)=${fmt(solvedAtOne.force.x)}\hat i+${fmt(solvedAtOne.force.y)}\hat j\,\mathrm{N}\]\[\therefore\ \text{B is ${verdictAtOne.B ? "correct" : "incorrect"}.}\]` },
    { title: "6. Check statement C: angular momentum", body: "For motion in the xy-plane, the cross product points along z. The determinant leaves x pᵧ − y pₓ.", math: String.raw`\[\vec L=\vec r\times\vec p=\begin{vmatrix}\hat i&\hat j&\hat k\\${fmt(solvedAtOne.position.x)}&${fmt(solvedAtOne.position.y)}&0\\${fmt(solvedAtOne.momentum.x)}&${fmt(solvedAtOne.momentum.y)}&0\end{vmatrix}=(${fmt(solvedAtOne.position.x)}\cdot${fmt(solvedAtOne.momentum.y)}-${fmt(solvedAtOne.position.y)}\cdot${fmt(solvedAtOne.momentum.x)})\hat k=${fmt(solvedAtOne.angularMomentum.z)}\hat k\,\mathrm{J\,s}\]\[\therefore\ \text{C is ${verdictAtOne.C ? "correct" : "incorrect"}; the statement claims }15\hat k.\]` },
    { title: "7. Check statement D: torque", body: "Torque about the origin is position crossed with force. Keep the same component order as for angular momentum.", math: String.raw`\[\vec\tau=\vec r\times\vec F=\begin{vmatrix}\hat i&\hat j&\hat k\\${fmt(solvedAtOne.position.x)}&${fmt(solvedAtOne.position.y)}&0\\${fmt(solvedAtOne.force.x)}&${fmt(solvedAtOne.force.y)}&0\end{vmatrix}=(${fmt(solvedAtOne.position.x)}\cdot${fmt(solvedAtOne.force.y)}-${fmt(solvedAtOne.position.y)}\cdot${fmt(solvedAtOne.force.x)})\hat k=${fmt(solvedAtOne.torque.z)}\hat k\,\mathrm{N\,m}\]\[\therefore\ \text{D is ${verdictAtOne.D ? "correct" : "incorrect"}.}\]` },
    { title: "8. Select the matching option", body: `The engine comparison marks ${correctStatements.join(", ")} as correct. Match that set to the printed answer choices.`, math: String.raw`\[\boxed{\text{Option (${verdictAtOne.correctOption}): ${correctStatements.join(", ")} only}}\]` }
  ].map((step, index) => ({ ...step, trap: traps[index] }));
  const understandStages = [
    { focus: "position", fragment: String.raw`<p class="jnani-sim-question-text">The position of an object having mass \(0.1\ \text{kg}\) as a function of time \(t\) is given as</p><div class="jnani-sim-equation mt-3">\[\vec r=(10t^2\hat i+5t^3\hat j)\ \text{m}.\]</div>` },
    { focus: "position", fragment: String.raw`<p class="jnani-sim-question-text">At \(t=1\ \text{s}\), which of the following statements are correct?</p>` },
    { focus: "motion", fragment: String.raw`<div class="space-y-2"><p class="jnani-sim-question-text">A. The linear momentum \(\vec p=(2\hat i+1.5\hat j)\ \text{kg m/s}.\)</p><p class="jnani-sim-question-text">B. The force acting on the object \(\vec F=(2\hat i+3\hat j)\ \text{N}.\)</p></div>` },
    { focus: "moments", fragment: String.raw`<div class="space-y-2"><p class="jnani-sim-question-text">C. The angular momentum of the object about its origin \(\vec L=15\hat k\ \text{J s}.\)</p><p class="jnani-sim-question-text">D. The torque acting on the object about its origin \(\vec\tau=20\hat k\ \text{N m}.\)</p></div>` },
    { focus: "all", fragment: `Choose the correct answer:<div class="jnani-pdm-options mt-3">${question.options.split("\n").map((option, index) => `<div class="jnani-sim-option">(${index + 1}) ${option.replace(/^\(?\d+\)?[.)]?\s*/, "")}</div>`).join("")}</div>` },
    { focus: "all", givenAsked: true }
  ];
  const givenAskedContent = {
    given: [String.raw`\(m=0.1\ \mathrm{kg}\)`, String.raw`\(\vec r(t)=(10t^2\hat i+5t^3\hat j)\ \mathrm m\)`, String.raw`\(t=1\ \mathrm s\)`, "Statements A-D in the question"],
    find: "Which of statements A-D are correct?"
  };

  const shell = window.PYQSimulationShell.mount({
    root: document.getElementById("simulation-shell-root"),
    question: { title: question.topic || "Position-dependent motion", chapter: question.chapter || "Laws of motion", topic: "Position-dependent motion", label: examMetadata() },
    toolbar: '<span class="jnani-sim-phase-badge">3D view · drag to orbit · scroll to zoom</span>',
    visualization: '<div class="jnani-pdm-visual"><div class="jnani-pdm-scene"><svg id="pdm-scene" role="img" aria-label="Three-dimensional view of a particle trajectory with position and moment vectors. Drag to orbit in yaw and pitch; scroll to zoom."></svg></div><div id="pdm-readout" class="jnani-pdm-readout" aria-live="polite"></div><div class="jnani-pdm-view-controls" role="group" aria-label="Scene view controls"><button type="button" data-view-zoom="out" aria-label="Zoom out" title="Zoom out">−</button><span id="pdm-zoom-level">100%</span><button type="button" data-view-zoom="in" aria-label="Zoom in" title="Zoom in">+</button><button type="button" data-view-reset aria-label="Reset scene view" title="Reset view">↺</button></div><div class="jnani-pdm-legend" aria-label="Physical quantity legend"></div></div>',
    onModeChange: setMode
  });

  const svg = document.getElementById("pdm-scene");
  function changeZoom(factor) { state.view.zoom = Math.max(0.7, Math.min(1.55, state.view.zoom * factor)); drawScene(); }
  svg.addEventListener("pointerdown", event => { state.view.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: state.view.yaw, pitch: state.view.pitch }; svg.classList.add("is-dragging"); svg.setPointerCapture(event.pointerId); });
  svg.addEventListener("pointermove", event => { const drag = state.view.drag; if (!drag || drag.id !== event.pointerId) return; state.view.yaw = drag.yaw + (event.clientX - drag.x) * 0.009; state.view.pitch = Math.max(-1.15, Math.min(1.15, drag.pitch + (event.y - drag.y) * 0.008)); drawScene(); });
  const endViewDrag = event => { if (!state.view.drag || state.view.drag.id !== event.pointerId) return; state.view.drag = null; svg.classList.remove("is-dragging"); };
  svg.addEventListener("pointerup", endViewDrag); svg.addEventListener("pointercancel", endViewDrag); svg.addEventListener("lostpointercapture", endViewDrag);
  svg.addEventListener("wheel", event => { event.preventDefault(); changeZoom(event.deltaY < 0 ? 1.08 : 1 / 1.08); }, { passive: false });
  const units = { position: "m", velocity: "m/s", acceleration: "m/s²", momentum: "kg·m/s", force: "N", angularMomentum: "J·s", torque: "N·m" };
  const variables = ["position", "velocity", "acceleration", "momentum", "force", "angularMomentum", "torque"];
  function fmt(n) { return Number(n).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1"); }
  function vector2(v) { return `(${fmt(v.x)}, ${fmt(v.y)})`; }
  function getFocusVectors(focus) {
    if (state.mode === "explore") return state.visible;
    if (state.mode === "question") { const keys = ["velocity", "acceleration", "momentum", "force", "angularMomentum", "torque"]; return { position: true, ...Object.fromEntries(keys.slice(0, state.playbackStage).map(key => [key, true])) }; }
    if (state.mode === "understand") {
      const stage = understandStages[state.understandStep];
      if (stage.focus === "motion") return { position: true, velocity: true, acceleration: true, force: true };
      if (stage.focus === "moments") return { position: true, momentum: true, force: true, angularMomentum: true, torque: true };
      if (stage.focus === "all") return state.understandVisible;
    }
    if (state.mode === "solve") {
      const step = state.solveStep;
      if (step >= 6) return { position: true, force: true, torque: true };
      if (step >= 5) return { position: true, momentum: true, angularMomentum: true };
      if (step >= 4) return { position: true, force: true };
      if (step >= 3) return { position: true, momentum: true };
      if (step >= 2) return { position: true, acceleration: true };
      if (step >= 1) return { position: true, velocity: true };
    }
    return { position: true };
  }
  function project(x, y, z = 0) {
    const { yaw, pitch, zoom } = state.view, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const horizontal = x * cy - y * sy, depth = x * sy + y * cy;
    const vertical = depth * sp + z * cp;
    const scale = 5.3 * zoom;
    return { x: 270 + horizontal * scale, y: 235 - vertical * scale, depth: depth * cp - z * sp };
  }
  function vectorArrow(from3, vector3, key, label, normalized = false) {
    const magnitude = Math.hypot(vector3.x, vector3.y, vector3.z);
    if (magnitude < 1e-9) return "";
    const factor = normalized ? 8 / magnitude : 1;
    const end3 = { x: from3.x + vector3.x * factor, y: from3.y + vector3.y * factor, z: from3.z + vector3.z * factor };
    const from = project(from3.x, from3.y, from3.z), end = project(end3.x, end3.y, end3.z);
    const mid = { x: from.x + (end.x - from.x) * 0.55, y: from.y + (end.y - from.y) * 0.55 };
    return `<line x1="${from.x}" y1="${from.y}" x2="${end.x}" y2="${end.y}" stroke="${colors[key]}" stroke-width="2.7" stroke-linecap="round" marker-end="url(#arrow-${key})"/><text class="jnani-pdm-label" x="${mid.x + 6}" y="${mid.y - 7}" fill="${colors[key]}" font-size="12" font-weight="700">${label}</text>`;
  }
  function projectedArrow(from, vector, key, label) {
    const { yaw, pitch, zoom } = state.view, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const dx = vector.x * cy - vector.y * sy;
    const depth = vector.x * sy + vector.y * cy;
    const dy = -(depth * sp + vector.z * cp);
    const length = Math.hypot(dx, dy);
    if (length < 1e-9) return "";
    const scale = 44 * zoom / length, end = { x: from.x + dx * scale, y: from.y + dy * scale };
    const labelX = end.x + (dx >= 0 ? 6 : -15), labelY = end.y + (dy >= 0 ? 15 : -7);
    return `<line x1="${from.x}" y1="${from.y}" x2="${end.x}" y2="${end.y}" stroke="${colors[key]}" stroke-width="2.7" stroke-linecap="round" marker-end="url(#arrow-${key})"/><text class="jnani-pdm-label" x="${labelX}" y="${labelY}" fill="${colors[key]}" font-size="12" font-weight="700">${label}</text>`;
  }
  function drawScene() {
    const result = engine.evaluate(state.time);
    const shown = getFocusVectors();
    const origin = project(0, 0, 0), point = project(result.position.x, result.position.y, 0);
    let drawing = `<defs>${Object.entries(colors).filter(([key]) => key !== "axis").map(([key, color]) => `<marker id="arrow-${key}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L7,3 z" fill="${color}"/></marker>`).join("")}<marker id="arrow-axis" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto"><path d="M0,0 L0,5 L6,2.5 z" fill="${colors.axis}"/></marker></defs>`;
    for (let value = 0; value <= 40; value += 10) {
      const a = project(value, 0, 0), b = project(value, 40, 0), c = project(0, value, 0), d = project(40, value, 0);
      drawing += `<line class="jnani-pdm-grid" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><line class="jnani-pdm-grid" x1="${c.x}" y1="${c.y}" x2="${d.x}" y2="${d.y}"/>`;
    }
    for (const [axis, end, label] of [["x", project(45,0,0),"X"],["y",project(0,45,0),"Y"],["z",project(0,0,24),"Z"]]) drawing += `<line class="jnani-pdm-axis" x1="${origin.x}" y1="${origin.y}" x2="${end.x}" y2="${end.y}" marker-end="url(#arrow-axis)"/><text x="${end.x + 5}" y="${end.y - 5}" fill="#e2e8f0" font-size="12">${label}</text>`;
    const trajectory = [];
    for (let t = 0; t <= 2.0001; t += 0.025) { const p = engine.evaluate(t).position, xy = project(p.x, p.y, p.z); trajectory.push(`${trajectory.length ? "L" : "M"}${xy.x.toFixed(1)},${xy.y.toFixed(1)}`); }
    drawing += `<path d="${trajectory.join(" ")}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 5"/><circle cx="${origin.x}" cy="${origin.y}" r="3" fill="#e2e8f0"/><text x="${origin.x - 11}" y="${origin.y + 16}" fill="#cbd5e1" font-size="10">O</text>`;
    if (shown.position) drawing += vectorArrow({ x: 0,y: 0,z: 0 }, result.position, "position", "r");
    const vectorScreenOffsets = { velocity:{x:-54,y:-8}, acceleration:{x:0,y:-54}, momentum:{x:54,y:-8}, force:{x:0,y:48} };
    for (const key of ["velocity", "acceleration", "momentum", "force"]) if (shown[key]) {
      const offset = vectorScreenOffsets[key], start = { x: point.x + offset.x, y: point.y + offset.y };
      drawing += `<line x1="${point.x}" y1="${point.y}" x2="${start.x}" y2="${start.y}" stroke="${colors[key]}" stroke-width="1" stroke-dasharray="2 3" opacity=".7"/>`;
      drawing += projectedArrow(start, result[key], key, ({ velocity: "v", acceleration: "a", momentum: "p", force: "F" })[key]);
    }
    for (const key of ["angularMomentum", "torque"]) if (shown[key]) {
      const label = key === "angularMomentum" ? "L" : "τ";
      const offset = key === "angularMomentum" ? {x:-42,y:-10} : {x:42,y:-10};
      if (Math.abs(result[key].z) < 1e-12) drawing += `<text x="32" y="${key === "angularMomentum" ? 112 : 148}" fill="${colors[key]}" font-size="11" class="jnani-pdm-label">${label} = 0</text>`;
      else drawing += projectedArrow({x:origin.x+offset.x,y:origin.y+offset.y},{x:0,y:0,z:Math.sign(result[key].z)},key,label);
    }
    const pointLabel = result.position.x > 30 && result.position.y > 30 ? { x: point.x - 86, y: point.y + 25 } : { x: point.x + 10, y: point.y + 17 };
    drawing += `<circle cx="${point.x}" cy="${point.y}" r="8" fill="#22c55e" fill-opacity=".17" stroke="#22c55e"/><circle cx="${point.x}" cy="${point.y}" r="4.5" fill="#22c55e" stroke="#dcfce7"/><text x="${pointLabel.x}" y="${pointLabel.y}" fill="#4ade80" font-size="11" class="jnani-pdm-label">P (${fmt(result.position.x)}, ${fmt(result.position.y)})</text>`;
    svg.setAttribute("viewBox", "0 0 540 420");
    svg.innerHTML = drawing;
    document.getElementById("pdm-zoom-level").textContent = `${Math.round(state.view.zoom * 100)}%`;
    svg.setAttribute("aria-label", `Position at t ${fmt(state.time)} seconds is ${vector2(result.position)} metres. Displayed arrows indicate direction; numerical component values are shown in Explore.`);
    document.getElementById("pdm-readout").innerHTML = `<strong>t = ${fmt(state.time)} s</strong> &nbsp; r = ${vector2(result.position)} m<br><span>Derived-arrow lengths normalized; r uses the plot scale</span>`;
    document.querySelector(".jnani-pdm-legend").innerHTML = variables.map(key => `<span><i class="jnani-pdm-dot" style="background:${colors[key]}"></i>${names[key]}</span>`).join("");
  }
  function setTimeline(index, max, label, enabled = false) {
    const slider = document.getElementById("timelineScrubber"), current = document.getElementById("time-current"), total = document.getElementById("time-total");
    if (slider) { slider.disabled = !enabled; slider.min = "0"; slider.max = String(max); slider.step = "1"; slider.value = String(index); }
    if (current) current.textContent = `${index}/${max}`;
    if (total) total.textContent = label;
    const play = document.getElementById("playPauseBtn");
    if (play) { play.disabled = !enabled; play.title = enabled ? "Reveal the physical quantities" : "Playback is available in Question mode"; }
    document.querySelectorAll(".jnani-sim-speed-group button").forEach(button => { button.disabled = !enabled; button.setAttribute("aria-pressed", Number(button.dataset.speed) === state.speed ? "true" : "false"); });
  }
  function renderQuestion() {
    const options = question.options.split("\n").map((item, index) => `<div class="jnani-sim-option">${item.replace(/^\(?\d+\)?[.)]?\s*/, `(${index + 1}) `)}</div>`).join("");
    const claims = [
      String.raw`\(\vec p=(2\hat i+1.5\hat j)\,\mathrm{kg\,m/s}\)`,
      String.raw`\(\vec F=(2\hat i+3\hat j)\,\mathrm N\)`,
      String.raw`\(\vec L=15\hat k\,\mathrm{J\,s}\)`,
      String.raw`\(\vec\tau=20\hat k\,\mathrm{N\,m}\)`
    ];
    document.getElementById("console-content").innerHTML = String.raw`<article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Question ${question.questionNumber || "29"}</div><p class="jnani-pdm-meta mt-1">${examMetadata()}</p><p class="jnani-sim-question-text mt-3">The position of an object of mass \(0.1\,\mathrm{kg}\) as a function of time is</p><div class="jnani-sim-equation mt-3">\[\vec r=(10t^2\hat i+5t^3\hat j)\,\mathrm m.\]</div><p class="jnani-sim-question-text mt-3">At \(t=1\,\mathrm s\), which of the following statements are correct?</p><div class="space-y-2 mt-3">${claims.map((claim, index) => `<div class="jnani-pdm-statement"><b>${String.fromCharCode(65 + index)}.</b> ${claim}</div>`).join("")}</div><p class="jnani-sim-question-text mt-3">Choose the correct answer.</p></article><section><div class="jnani-sim-card-label mb-2">Options</div><div class="jnani-pdm-options">${options}</div></section><p class="jnani-pdm-meta">The scene shows position first. Play reveals derived quantities without marking the answer.</p><button class="jnani-sim-control-button primary jnani-pdm-start" type="button" data-start-understanding>Start Guided Understanding <span aria-hidden="true">›</span></button>`;
    setTimeline(state.playbackStage, 6, "Reveal vectors", true);
  }
  function renderUnderstand() {
    const stage = understandStages[state.understandStep];
    const content = stage.givenAsked ? window.PYQSimulationTeaching.givenAndAsked(givenAskedContent) : stage.fragment;
    document.getElementById("console-content").innerHTML = `<div class="jnani-sim-stage-progress" style="--stage-progress:${(state.understandStep + 1) / understandStages.length * 100}%"><span></span></div><article class="jnani-sim-card">${stage.givenAsked ? '<div class="jnani-sim-content-eyebrow">Understand · Given and find</div>' : ""}${content}</article><div class="jnani-pdm-controls"><button class="jnani-sim-control-button" data-ustep="-1" ${state.understandStep === 0 ? "disabled" : ""}>Previous part</button><button class="jnani-sim-control-button primary" data-ustep="1">${state.understandStep === understandStages.length - 1 ? "Proceed to Solve →" : "Next part"}</button></div>`;
    setTimeline(state.understandStep + 1, understandStages.length, "Question parts");
  }
  function renderSolve() {
    const step = solveSteps[state.solveStep];
    document.getElementById("console-content").innerHTML = `<div class="jnani-sim-stage-progress" style="--stage-progress:${(state.solveStep + 1) / solveSteps.length * 100}%"><span></span></div><article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Solve · Step ${state.solveStep + 1} of ${solveSteps.length}</div><h2 class="jnani-sim-content-title mt-2">${step.title}</h2><p class="mt-3 leading-7 text-slate-300">${step.body}</p><div class="jnani-sim-equation mt-4 overflow-x-auto">${step.math}</div></article>${window.PYQSimulationTeaching.commonStudentTrap(step.trap)}<div class="jnani-pdm-controls"><button class="jnani-sim-control-button" data-sstep="-1" ${state.solveStep === 0 ? "disabled" : ""}>Previous step</button><button class="jnani-sim-control-button primary" data-sstep="1">${state.solveStep === solveSteps.length - 1 ? "Explore values →" : "Next step"}</button></div>`;
    setTimeline(state.solveStep + 1, solveSteps.length, "Solution steps");
  }
  function renderExplore() {
    const result = engine.evaluate(state.time);
    const vectorRows = variables.map(key => `<label><input type="checkbox" data-vector="${key}" ${state.visible[key] ? "checked" : ""}><i class="jnani-pdm-dot" style="background:${colors[key]}"></i>${names[key]}</label>`).join("");
    const valueRows = variables.map(key => {
      const v = result[key], value = key === "angularMomentum" || key === "torque" ? `${fmt(v.z)} k̂ ${units[key]}` : `${vector2(v)} ${units[key]}`;
      return `<div><small>${names[key]} · ${units[key]}</small><strong>${value}</strong></div>`;
    }).join("");
    document.getElementById("console-content").innerHTML = `<article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Explore · Sandbox</div><h2 class="jnani-sim-content-title mt-2">Change the time</h2><label class="jnani-sim-range-row mt-4"><span>t (s)</span><input type="range" min="0" max="2" step="0.05" value="${state.time}" data-time aria-label="Time in seconds"><output id="pdm-time-output">${fmt(state.time)} s</output></label><p class="jnani-pdm-meta mt-2">Arrow directions are meaningful; position uses the plot scale; derived arrows show direction with normalized lengths. Use the component values below.</p><div class="jnani-pdm-toggles mt-4">${vectorRows}</div><button class="jnani-sim-control-button mt-4" id="pdm-reset">Reset to t = 1 s</button></article><section class="jnani-sim-card"><div class="jnani-sim-card-label">Calculated values at the selected time</div><div class="jnani-pdm-values mt-3">${valueRows}</div></section>`;
    setTimeline(0, 1, "Sandbox controls");
  }
  function stopPlayback() { if (state.timer) clearInterval(state.timer); state.timer = null; const playIcon = document.getElementById("playIcon"), pauseIcon = document.getElementById("pauseIcon"); if (playIcon) playIcon.classList.remove("hidden"); if (pauseIcon) pauseIcon.classList.add("hidden"); }
  function updatePlayback() {
    state.visible = { position: true };
    const keys = ["velocity", "acceleration", "momentum", "force", "angularMomentum", "torque"];
    keys.slice(0, state.playbackStage).forEach(key => { state.visible[key] = true; });
    const playIcon = document.getElementById("playIcon"), pauseIcon = document.getElementById("pauseIcon");
    if (playIcon) playIcon.classList.toggle("hidden", !!state.timer);
    if (pauseIcon) pauseIcon.classList.toggle("hidden", !state.timer);
    setTimeline(state.playbackStage, keys.length, "Reveal vectors", true); drawScene();
  }
  function togglePlayback() {
    if (state.mode !== "question") return;
    if (state.timer) { stopPlayback(); return; }
    if (state.playbackStage >= 6) state.playbackStage = 0;
    updatePlayback();
    state.timer = setInterval(() => {
      state.playbackStage += 1;
      if (state.playbackStage >= 6) { state.playbackStage = 6; stopPlayback(); }
      updatePlayback();
    }, 900 / state.speed);
    updatePlayback();
  }
  function setMode(mode) {
    const previousMode = state.mode;
    stopPlayback();
    shell.setActiveMode(mode);
    if (mode !== previousMode && (mode === "explore" || previousMode === "explore")) { state.time = initialTime; state.visible = { position: true }; state.understandVisible = { position: true }; state.playbackStage = 0; }
    state.mode = mode;
    if (mode === "question") renderQuestion();
    else if (mode === "understand") renderUnderstand();
    else if (mode === "solve") renderSolve();
    else renderExplore();
    drawScene();
    window.PYQSimulationMath.render(document.getElementById("console-content")).catch(error => console.error(error));
    window.PYQSimulationMath.render(document.querySelector(".jnani-pdm-legend")).catch(error => console.error(error));
  }
  function navigate(mode) {
    document.querySelectorAll(".jnani-sim-tabs [data-mode]").forEach(tab => tab.setAttribute("aria-current", tab.dataset.mode === mode ? "step" : "false"));
    setMode(mode);
  }
  document.addEventListener("input", event => {
    if (event.target.matches("[data-time]")) {
      state.time = Number(event.target.value);
      const out = document.getElementById("pdm-time-output"); if (out) out.value = `${fmt(state.time)} s`;
      state.visible = { position: true, ...state.visible };
      const content = document.querySelector(".jnani-pdm-values"); if (content) { const values = engine.evaluate(state.time); content.innerHTML = variables.map(key => { const v = values[key], value = key === "angularMomentum" || key === "torque" ? `${fmt(v.z)} k̂ ${units[key]}` : `${vector2(v)} ${units[key]}`; return `<div><small>${names[key]} · ${units[key]}</small><strong>${value}</strong></div>`; }).join(""); }
      drawScene();
    }
  });
  document.addEventListener("change", event => {
    if (event.target.matches("[data-vector]")) { state.visible[event.target.dataset.vector] = event.target.checked; drawScene(); }
    if (event.target.matches("[data-understand-vector]")) { state.understandVisible[event.target.dataset.understandVector] = event.target.checked; drawScene(); }
  });
  document.addEventListener("click", event => {
    const zoom = event.target.closest("[data-view-zoom]");
    if (zoom) { changeZoom(zoom.dataset.viewZoom === "in" ? 1.15 : 1 / 1.15); return; }
    if (event.target.closest("[data-view-reset]")) { state.view.zoom = 1; state.view.yaw = Math.PI / 4; state.view.pitch = 0.42; drawScene(); return; }
    if (event.target.closest("[data-start-understanding]")) { navigate("understand"); return; }
    if (event.target.closest("#pdm-reset")) { state.time = initialTime; state.visible = { position: true }; renderExplore(); drawScene(); return; }
    const u = event.target.closest("[data-ustep]");
    if (u) { const direction = Number(u.dataset.ustep); if (direction > 0 && state.understandStep === understandStages.length - 1) { state.solveStep = 0; navigate("solve"); return; } state.understandStep = Math.max(0, Math.min(understandStages.length - 1, state.understandStep + direction)); renderUnderstand(); drawScene(); window.PYQSimulationMath.render(document.getElementById("console-content")); return; }
    const s = event.target.closest("[data-sstep]");
    if (s) { const direction = Number(s.dataset.sstep); if (direction > 0 && state.solveStep === solveSteps.length - 1) { navigate("explore"); return; } state.solveStep = Math.max(0, Math.min(solveSteps.length - 1, state.solveStep + direction)); renderSolve(); drawScene(); window.PYQSimulationMath.render(document.getElementById("console-content")); }
  });
  window.togglePlayPause = togglePlayback;
  window.setSpeed = speed => { state.speed = Number(speed) || 1; document.querySelectorAll(".jnani-sim-speed-group button").forEach(button => button.setAttribute("aria-pressed", Number(button.dataset.speed) === state.speed ? "true" : "false")); if (state.timer) { stopPlayback(); togglePlayback(); } };
  window.scrubTimeline = value => { if (state.mode !== "question") return; stopPlayback(); state.playbackStage = Math.max(0, Math.min(6, Math.round(Number(value)))); updatePlayback(); };
  window.resetAnimation = () => { stopPlayback(); state.time = initialTime; state.playbackStage = 0; state.visible = { position: true }; state.understandStep = 0; state.solveStep = 0; if (state.mode === "understand") renderUnderstand(); else if (state.mode === "solve") renderSolve(); else if (state.mode === "explore") renderExplore(); else renderQuestion(); drawScene(); };
  window.closeSimulation = () => window.parent !== window ? window.parent.postMessage({ type: "pyq-simulation-close" }, window.location.origin) : window.history.back();
  setMode("question");
})();
