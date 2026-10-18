(function () {
  const params = new URLSearchParams(window.location.search);
  const questionId = params.get("questionId");
  const library = JSON.parse(localStorage.getItem("orbit-physics-pyq-v1") || "[]");
  const question = library.find(item => item.id === questionId && item.simulation?.engine === "electric-field-energy-density");
  if (!question) {
    document.body.innerHTML = '<main style="max-width:680px;margin:10vh auto;padding:24px;color:#e2e8f0;font:16px Inter,sans-serif"><h1>Question simulation unavailable</h1><p>Open this simulation from its question card in the PYQ Studio.</p><button onclick="window.parent.postMessage({type:\'pyq-simulation-close\'},window.location.origin)" style="padding:10px 14px">Return to question library</button></main>';
    throw new Error("The selected electric-field energy-density question is missing from the local question library.");
  }

  const engine = window.PYQPhysicsEngines.electricFieldEnergyDensity;
  const state = { mode: "question", stage: 0, solveStep: 0, playback: 0, speed: 1, timer: null, exponents: { a: "", b: "", c: "" }, revealed: false, method: "energy", view: { zoom: 1, x: 0, y: 0, drag: null } };
  const id = "jee-main-q26-electric-field-energy-density";
  const math = String.raw;
  const examLabel = [question.exam, [question.date, question.month, question.year].filter(Boolean).join(" "), question.set && `Set ${question.set}`].filter(Boolean).join(" · ");
  const trapData = [
    { title: "Treating the coefficient as a dimension", wrong: "Assign dimensions to the numerical factor 1/2.", fix: "A pure number is dimensionless, so it does not change the dimensions of ε₀E²." },
    { title: "Multiplying the volume dimension", wrong: "Multiply by L³ when dividing energy by volume.", fix: "Division subtracts exponents: L² − L³ = L⁻¹." },
    { title: "Reading the dimensions from the symbols", wrong: "Assume ε₀ and E individually have the requested MLT dimensions.", fix: "The question gives their product. The direct SI check shows the current dimension cancels." },
    { title: "Matching powers to the wrong base", wrong: "Take a from L or b from M.", fix: "Match bases in order: M gives a, L gives b, and T gives c." },
    { title: "Losing the negative sign", wrong: "Evaluate 2(1) − (−1) as 2 − 1.", fix: "Subtracting a negative adds it: 2 − (−1) = 3, then 3 + (−2) = 1." },
    { title: "Selecting by option position alone", wrong: "Choose a number without checking it against the computed expression.", fix: "The calculated value is 1; compare it with the printed choices to select option (2)." }
  ];
  const solveSteps = [
    { title: "Identify the physical quantity", body: "The expression is the electric-field energy density in vacuum. Energy density means energy stored per unit volume.", equation: String.raw`\[u=\frac12\varepsilon_0E^2=\frac{\text{Energy}}{\text{Volume}}\]`, trap: trapData[0] },
    { title: "Write energy and volume dimensions", body: "Use the fundamental dimensions of energy and volume, then divide by subtracting the volume exponent.", equation: String.raw`\[[\text{Energy}]=ML^2T^{-2},\qquad[\text{Volume}]=L^3\]\[ [u]=\frac{ML^2T^{-2}}{L^3}=ML^{-1}T^{-2}\]`, trap: trapData[1] },
    { title: "Check directly from ε₀ and E", body: "As an independent check, use SI base dimensions. The current dimension I cancels between permittivity and the squared field.", equation: String.raw`\[[\varepsilon_0]=M^{-1}L^{-3}T^4I^2,\quad[E]=MLT^{-3}I^{-1}\]\[[\varepsilon_0E^2]=(M^{-1}L^{-3}T^4I^2)(MLT^{-3}I^{-1})^2=ML^{-1}T^{-2}\]`, trap: trapData[2] },
    { title: "Compare with the requested form", body: "Match each base dimension with the same base in MᵃLᵇTᶜ.", equation: String.raw`\[ML^{-1}T^{-2}=M^aL^bT^c\]\[a=1,\qquad b=-1,\qquad c=-2\]`, trap: trapData[3] },
    { title: "Evaluate the expression", body: "Substitute the exponents carefully. The minus sign before b acts on the negative value b = −1.", equation: String.raw`\[2a-b+c=2(1)-(-1)+(-2)\]\[=2+1-2=1\]`, trap: trapData[4] },
    { title: "Match the printed choice", body: "The calculated value 1 appears as option (2).", equation: String.raw`\[\boxed{2a-b+c=1}\qquad\text{Option (2)}\]`, trap: trapData[5] }
  ];
  const understand = [
    { text: String.raw`<p class="jnani-sim-question-text">The dimensional formula of</p><div class="jnani-sim-equation mt-3">\[\frac12\varepsilon_0E^2\]</div>`, focus: "expr" },
    { text: String.raw`<p class="jnani-sim-question-text">is</p><div class="jnani-sim-equation mt-3">\[M^aL^bT^c.\]</div>`, focus: "powers" },
    { text: String.raw`<p class="jnani-sim-question-text">The value of</p><div class="jnani-sim-equation mt-3">\[2a-b+c\]</div><p class="jnani-sim-question-text">is ______.</p><div class="jnani-eed-options mt-3"><div class="jnani-eed-option"><strong>(1)</strong>\(0\)</div><div class="jnani-eed-option"><strong>(2)</strong>\(1\)</div><div class="jnani-eed-option"><strong>(3)</strong>\(-1\)</div><div class="jnani-eed-option"><strong>(4)</strong>\(2\)</div></div>`, focus: "request" },
    { focus: "request", givenAsked: true }
  ];
  const givenAskedContent = {
    given: [String.raw`Dimensional formula of \(\frac12\varepsilon_0E^2\)`, String.raw`\(\varepsilon_0\) is the permittivity of vacuum; \(E\) is the electric field`, String.raw`Requested form: \(M^aL^bT^c\)`],
    find: String.raw`\(2a-b+c\)`
  };

  const toolbar = `<span class="jnani-sim-phase-badge">Energy-density dimensions</span><div class="jnani-eed-view-controls" aria-label="Illustration view controls"><button class="jnani-sim-control-button" type="button" data-view="out" title="Zoom out" aria-label="Zoom out">−</button><button class="jnani-sim-control-button" type="button" data-view="in" title="Zoom in" aria-label="Zoom in">+</button><button class="jnani-sim-control-button" type="button" data-view="reset" title="Reset view" aria-label="Reset view">Reset View</button></div>`;
  const visualization = `<div class="jnani-eed-visual"><div class="jnani-eed-scene" aria-label="Conceptual electric field energy-density illustration"><svg viewBox="0 0 640 420" role="img" aria-labelledby="eed-title eed-desc"><title id="eed-title">Energy stored in an electric-field region</title><desc id="eed-desc">Parallel field arrows pass through a highlighted volume element. The diagram is conceptual and does not represent a measured scale.</desc><defs><linearGradient id="eed-volume" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#38bdf8" stop-opacity=".24"/><stop offset="1" stop-color="#22c55e" stop-opacity=".14"/></linearGradient><marker id="eed-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8z" fill="#38bdf8"/></marker><marker id="eed-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8z" fill="#22c55e"/></marker></defs><rect x="28" y="30" width="584" height="348" rx="18" fill="#0b1220" stroke="#263449" stroke-width="2"/><g class="eed-field"><path d="M80 130H550M80 185H550M80 240H550M80 295H550" stroke="#38bdf8" stroke-width="2" opacity=".72" marker-end="url(#eed-arrow)"/><path d="M125 116v28M290 171v28M450 226v28" stroke="#7dd3fc" stroke-width="1.5" marker-end="url(#eed-arrow)"/></g><g class="eed-volume"><path d="M250 138l105-42 111 42-105 44z" fill="url(#eed-volume)" stroke="#22c55e" stroke-width="2"/><path d="M250 138v105l111 45V182M361 182l105-44v105l-105 45" fill="url(#eed-volume)" stroke="#22c55e" stroke-width="2"/><path d="M250 243l105-44 111 44" fill="none" stroke="#86efac" stroke-dasharray="5 5" opacity=".8"/><text x="290" y="226" fill="#bbf7d0" font-size="18" font-family="Inter,sans-serif">ΔV</text></g><text x="94" y="93" fill="#7dd3fc" font-size="20" font-family="Inter,sans-serif">E</text><path d="M91 101h82" stroke="#38bdf8" stroke-width="2" marker-end="url(#eed-arrow)"/><g class="eed-quantity"><rect x="381" y="303" width="184" height="48" rx="10" fill="#172338" stroke="#334155"/><text x="397" y="324" fill="#86efac" font-size="14" font-family="Inter,sans-serif">Energy density</text><text x="397" y="343" fill="#e2e8f0" font-size="16" font-family="Inter,sans-serif">u = ½ ε₀E²</text></g><text x="62" y="354" fill="#94a3b8" font-size="12" font-family="Inter,sans-serif">Conceptual field region · not to scale</text></svg></div><div class="jnani-eed-legend"><span><i class="jnani-eed-dot"></i>Electric field E</span><span><i class="jnani-eed-dot" style="background:#22c55e"></i>Highlighted volume ΔV</span><span>ε₀ Vacuum permittivity</span></div></div>`;
  const shell = window.PYQSimulationShell.mount({
    root: document.getElementById("simulation-shell-root"),
    question: { title: "Electric-field energy density", chapter: question.chapter, topic: question.topic, label: examLabel },
    toolbar,
    visualization,
    onModeChange: renderMode
  });

  function renderMath() { window.PYQSimulationMath.render(document.getElementById("console-content")).catch(error => console.error("Math rendering failed", error)); }
  function resetSandbox() { state.exponents = { a: "", b: "", c: "" }; state.revealed = false; state.method = "energy"; }
  function stopPlayback() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    const play = document.getElementById("playIcon"), pause = document.getElementById("pauseIcon");
    if (play) play.classList.remove("hidden"); if (pause) pause.classList.add("hidden");
  }
  function setTimeline(value, total = 100, label = "Energy-density concept") {
    const current = document.getElementById("time-current"), end = document.getElementById("time-total"), slider = document.getElementById("timelineScrubber");
    if (current) current.textContent = total === 100 ? `${(value / 100 * 6).toFixed(1)}s` : `${value}/${total}`;
    if (end) end.textContent = total === 100 ? "6.0s" : label;
    if (slider) { slider.max = total; slider.value = value; }
  }
  function applyView() {
    const svg = document.querySelector(".jnani-eed-scene svg");
    if (!svg) return;
    const width = 640 / state.view.zoom, height = 420 / state.view.zoom;
    svg.setAttribute("viewBox", `${320 - width / 2 - state.view.x} ${210 - height / 2 - state.view.y} ${width} ${height}`);
  }
  function zoomView(direction) {
    state.view.zoom = Math.min(2.5, Math.max(0.7, state.view.zoom * (direction > 0 ? 1.2 : 1 / 1.2)));
    applyView();
  }
  function renderScene() {
    const scene = document.querySelector(".jnani-eed-scene");
    if (!scene) return;
    const focus = state.mode === "understand" ? understand[state.stage].focus : "all";
    scene.dataset.focus = focus;
    scene.dataset.playback = String(Math.min(3, Math.max(1, Math.ceil(state.playback))));
    applyView();
    const field = scene.querySelector(".eed-field"), volume = scene.querySelector(".eed-volume"), quantity = scene.querySelector(".eed-quantity");
    if (state.mode === "question") {
      field.style.opacity = "1";
      volume.style.opacity = "1";
      quantity.style.opacity = "1";
    } else if (focus === "expr") { field.style.opacity = "1"; volume.style.opacity = ".9"; quantity.style.opacity = "1"; }
    else if (focus === "powers") { field.style.opacity = ".45"; volume.style.opacity = "1"; quantity.style.opacity = ".5"; }
    else if (focus === "request") { field.style.opacity = ".45"; volume.style.opacity = ".55"; quantity.style.opacity = ".75"; }
    else { field.style.opacity = "1"; volume.style.opacity = "1"; quantity.style.opacity = "1"; }
  }
  function questionHtml() {
    const opts = question.options.split("\n").map(line => line.replace(/^\s*/, "")).filter(Boolean);
    return `<article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Question ${question.questionNumber}</div><div class="jnani-eed-question jnani-sim-question-text mt-3">The dimensional formula of <span class="jnani-eed-equation">\\(\\frac12\\varepsilon_0 E^2\\)</span>, where \\(\\varepsilon_0\\) is the permittivity of vacuum and \\(E\\) is the electric field, is \\(M^aL^bT^c\\). The value of \\(2a-b+c\\) is ______.</div></article><section><div class="jnani-sim-card-label mb-3">Options</div><div class="jnani-eed-options">${opts.map((option,index)=>{const value=option.slice(option.indexOf(".")+1).trim();return `<div class="jnani-eed-option"><strong>(${index+1})</strong>\\(${value.replace("-","-")}\\)</div>`}).join("")}</div></section><button class="jnani-sim-control-button primary jnani-eed-start" type="button" data-start>Start Guided Understanding <span aria-hidden="true">›</span></button>`;
  }
  function understandHtml() {
    const stage = understand[state.stage];
    const content = stage.givenAsked ? window.PYQSimulationTeaching.givenAndAsked(givenAskedContent) : stage.text;
    return `<div class="jnani-sim-stage-progress" style="--stage-progress:${(state.stage + 1) / understand.length * 100}%"><span></span></div><article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Understand · Part ${state.stage + 1} of ${understand.length}</div><div class="mt-4">${content}</div></article><div class="jnani-eed-controls"><button class="jnani-sim-control-button" data-ustep="-1" ${state.stage === 0 ? "disabled" : ""}>Previous part</button><button class="jnani-sim-control-button primary" data-ustep="1">${state.stage === understand.length - 1 ? "Start Solve" : "Next part"}</button></div>`;
  }
  function solveHtml() {
    const step = solveSteps[state.solveStep];
    return `<article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Solve · Step ${state.solveStep + 1} of ${solveSteps.length}</div><h2 class="jnani-sim-content-title mt-2">${step.title}</h2><p class="mt-3 leading-7 text-slate-300">${step.body}</p><div class="jnani-sim-equation mt-4 overflow-x-auto">${step.equation}</div></article>${window.PYQSimulationTeaching.commonStudentTrap(step.trap)}<div class="jnani-eed-controls"><button class="jnani-sim-control-button" data-sstep="-1" ${state.solveStep === 0 ? "disabled" : ""}>Previous step</button><button class="jnani-sim-control-button primary" data-sstep="1">${state.solveStep === solveSteps.length - 1 ? "Explore dimensions" : "Next step"}</button></div>`;
  }
  function exponentValues() {
    return Object.fromEntries(["a", "b", "c"].map(key => [key, state.exponents[key] === "" ? null : Number(state.exponents[key])]));
  }
  function sandboxHtml() {
    const values = exponentValues(), complete = Object.values(values).every(Number.isInteger), result = complete ? engine.evaluateExpression(values) : null;
    const terms = ["M", "L", "T"].map((base,index) => {
      const key = ["a", "b", "c"][index], value = values[key];
      return `<label class="jnani-eed-exp-row"><span>${base}</span><input class="jnani-eed-exp-input" data-exp="${key}" type="number" step="1" min="-10" max="10" value="${state.exponents[key]}" aria-label="Exponent ${key}" placeholder="${key}"></label>`;
    }).join("");
    const displayPowers = state.revealed ? { a: 1, b: -1, c: -2 } : values;
    const powerCards = ["a", "b", "c"].map((key,index)=>{const val=displayPowers[key];return `<div class="jnani-eed-power"><span>${["M","L","T"][index]}</span><strong>${val == null ? "—" : `${val > 0 ? "+" : ""}${val}`}</strong><small>${val == null ? "power" : val > 0 ? "positive" : val < 0 ? "negative" : "zero"}</small></div>`}).join("");
    const direct = engine.directFieldDimensions(), energy = engine.energyDensityDimensions();
    const comparison = state.method === "energy"
      ? String.raw`\[[u]=\frac{ML^2T^{-2}}{L^3}=ML^{-1}T^{-2}\]`
      : String.raw`\[[\varepsilon_0E^2]=(M^{-1}L^{-3}T^4I^2)(MLT^{-3}I^{-1})^2=ML^{-1}T^{-2}\quad(I^0)\]`;
    return `<article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Explore · Dimensional sandbox</div><h2 class="jnani-sim-content-title mt-2">Try exponent values</h2><p class="mt-2 text-sm leading-6 text-slate-300">Enter integer powers for the requested form \\(M^aL^bT^c\\). The expression updates from your entries.</p><div class="jnani-eed-exponents mt-4">${terms}</div><div class="jnani-sim-equation mt-4">\\[M^{${values.a ?? "a"}}L^{${values.b ?? "b"}}T^{${values.c ?? "c"}}\\]</div><div class="jnani-eed-message" aria-live="polite" data-feedback>${complete ? `Computed value: ${result}` : "Enter all three integer exponents to calculate 2a − b + c."}</div><div class="jnani-sim-equation mt-2">\\[2a-b+c=${complete ? `2(${values.a})-(${values.b})+(${values.c})=${result}` : "—"}\\]</div><div class="flex flex-wrap gap-2 mt-3"><button class="jnani-sim-control-button" data-check ${complete ? "" : "disabled"}>Check exponents</button><button class="jnani-sim-control-button" data-reveal>${state.revealed ? "Verified exponents shown" : "Reveal verified exponents"}</button><button class="jnani-sim-control-button" data-reset>Reset sandbox</button></div><div class="jnani-eed-power-grid mt-4">${powerCards}</div><p class="jnani-eed-message mt-2" data-sandbox-result aria-live="polite">${state.revealed ? "Verified: a = 1, b = −1, c = −2." : "The verified powers remain hidden until you ask to reveal them."}</p></article><article class="jnani-sim-card"><div class="jnani-sim-content-eyebrow">Independent dimensional check</div><div class="jnani-eed-methods mt-3"><button class="jnani-sim-control-button ${state.method === "energy" ? "primary" : ""}" data-method="energy">Energy ÷ volume</button><button class="jnani-sim-control-button ${state.method === "direct" ? "primary" : ""}" data-method="direct">Direct ε₀E²</button></div><div class="jnani-sim-equation mt-4 overflow-x-auto" data-method-result>${comparison}</div><p class="mt-3 text-sm text-slate-400">Both routes give \\(${engine.dimensionString(energy)}\\). The coefficient \\(\\frac12\\) is dimensionless.</p><div class="flex gap-2 mt-3"><button class="jnani-sim-control-button" data-check-method>Compare both methods</button></div><p class="jnani-eed-message mt-2" data-method-feedback aria-live="polite"></p></article>`;
  }
  function renderMode(mode) {
    stopPlayback();
    shell.setActiveMode(mode);
    const previousMode = state.mode;
    if (previousMode === "explore" && mode !== "explore") resetSandbox();
    state.mode = mode;
    if (mode === "question") state.playback = 0;
    if (mode === "understand" && previousMode !== "understand") { state.stage = 0; state.playback = 3; }
    if (mode === "solve" && previousMode !== "solve") { state.solveStep = 0; state.playback = 3; }
    if (mode === "explore" && previousMode !== "explore") { resetSandbox(); state.playback = 3; }
    const content = document.getElementById("console-content");
    content.innerHTML = mode === "question" ? questionHtml() : mode === "understand" ? understandHtml() : mode === "solve" ? solveHtml() : sandboxHtml();
    if (mode === "question") setTimeline(state.playback * 100 / 3);
    else if (mode === "understand") setTimeline(state.stage + 1, understand.length, "Question parts");
    else if (mode === "solve") setTimeline(state.solveStep + 1, solveSteps.length, "Solution steps");
    else setTimeline(0, 1, "Sandbox controls");
    renderScene(); renderMath();
  }
  function updateSandbox() {
    const current = Object.fromEntries(["a", "b", "c"].map(key => [key, document.querySelector(`[data-exp="${key}"]`)?.value ?? ""]));
    state.exponents = current;
    const cursor = document.activeElement?.dataset?.exp;
    renderMode("explore");
    if (cursor) document.querySelector(`[data-exp="${cursor}"]`)?.focus();
  }
  document.getElementById("console-content").addEventListener("click", event => {
    const button = event.target.closest("button"); if (!button) return;
    if (button.hasAttribute("data-start")) { renderMode("understand"); return; }
    if (button.dataset.ustep) { const next = state.stage + Number(button.dataset.ustep); if (next < 0) return; if (next >= understand.length) { state.mode = "understand"; renderMode("solve"); return; } state.stage = next; renderMode("understand"); return; }
    if (button.dataset.sstep) { const next = state.solveStep + Number(button.dataset.sstep); if (next < 0) return; if (next >= solveSteps.length) { renderMode("explore"); return; } state.solveStep = next; renderMode("solve"); return; }
    if (button.hasAttribute("data-reset")) { resetSandbox(); renderMode("explore"); return; }
    if (button.hasAttribute("data-reveal")) { state.revealed = true; renderMode("explore"); return; }
    if (button.hasAttribute("data-check")) { const values = exponentValues(), right = values.a === 1 && values.b === -1 && values.c === -2; const target = document.querySelector("[data-sandbox-result]"); if (target) target.textContent = right ? "Correct: these exponents match the verified dimensional formula." : "Not yet. Compare each entered power with the dimensional formula from the two independent methods."; return; }
    if (button.dataset.method) { state.method = button.dataset.method; renderMode("explore"); return; }
    if (button.hasAttribute("data-check-method")) { const ok = engine.equivalentDimensions(engine.energyDensityDimensions(), engine.directFieldDimensions()); const target = document.querySelector("[data-method-feedback]"); if (target) target.textContent = ok ? "Both methods agree: ML⁻¹T⁻²; the I power cancels in the direct check." : "The methods do not agree; review the exponent arithmetic."; return; }
  });
  document.getElementById("console-content").addEventListener("input", event => { if (event.target.matches("[data-exp]")) updateSandbox(); });

  document.getElementById("simulation-shell-root").addEventListener("click", event => {
    const button = event.target.closest("[data-view]"); if (!button) return;
    if (button.dataset.view === "reset") window.resetView();
    else zoomView(button.dataset.view === "in" ? 1 : -1);
  });
  const sceneSvg = document.querySelector(".jnani-eed-scene svg");
  sceneSvg.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    state.view.drag = { pointerX: event.clientX, pointerY: event.clientY, x: state.view.x, y: state.view.y };
    sceneSvg.classList.add("is-dragging"); sceneSvg.setPointerCapture(event.pointerId);
  });
  sceneSvg.addEventListener("pointermove", event => {
    if (!state.view.drag) return;
    const rect = sceneSvg.getBoundingClientRect();
    state.view.x = state.view.drag.x + (event.clientX - state.view.drag.pointerX) * 640 / rect.width / state.view.zoom;
    state.view.y = state.view.drag.y + (event.clientY - state.view.drag.pointerY) * 420 / rect.height / state.view.zoom;
    applyView();
  });
  const endSceneDrag = () => { state.view.drag = null; sceneSvg.classList.remove("is-dragging"); };
  sceneSvg.addEventListener("pointerup", endSceneDrag); sceneSvg.addEventListener("pointercancel", endSceneDrag);
  sceneSvg.addEventListener("wheel", event => { event.preventDefault(); zoomView(event.deltaY < 0 ? 1 : -1); }, { passive: false });

  window.togglePlayPause = function () {
    if (state.timer) { stopPlayback(); return; }
    if (state.mode !== "question") { state.playback = 3; renderScene(); return; }
    if (state.playback >= 3) state.playback = 0;
    const play = document.getElementById("playIcon"), pause = document.getElementById("pauseIcon");
    if (play) play.classList.add("hidden"); if (pause) pause.classList.remove("hidden");
    state.timer = setInterval(() => { state.playback = Math.min(3, state.playback + 0.04 * state.speed); setTimeline(state.playback * 100 / 3); renderScene(); if (state.playback >= 3) stopPlayback(); }, 80);
  };
  window.resetAnimation = function () { stopPlayback(); state.playback = state.mode === "question" ? 0 : 3; if (state.mode === "explore") resetSandbox(); renderMode(state.mode); };
  window.setSpeed = function (speed) { state.speed = Number(speed); document.querySelectorAll(".speed-btn").forEach(button => { const selected = Number(button.dataset.speed) === state.speed; button.setAttribute("aria-pressed", String(selected)); button.classList.toggle("bg-green-500", selected); button.classList.toggle("text-slate-950", selected); }); };
  window.scrubTimeline = function (value) { stopPlayback(); if (state.mode === "question") { state.playback = Number(value) / 100 * 3; renderScene(); } else if (state.mode === "understand") { state.stage = Math.min(understand.length - 1, Math.max(0, Math.round(Number(value) - 1))); renderMode("understand"); } else if (state.mode === "solve") { state.solveStep = Math.min(solveSteps.length - 1, Math.max(0, Math.round(Number(value) - 1))); renderMode("solve"); } };
  window.resetView = function () { state.view = { zoom: 1, x: 0, y: 0, drag: null }; applyView(); };
  window.closeSimulation = function () { stopPlayback(); window.parent.postMessage({ type: "pyq-simulation-close" }, window.location.origin); };
  window.addEventListener("pagehide", stopPlayback);
  renderMode("question");
})();
