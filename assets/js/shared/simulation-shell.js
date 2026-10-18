(function (global) {
  const modes = [
    ["question", "1. Question"],
    ["understand", "2. Understand"],
    ["solve", "3. Solve"],
    ["explore", "4. Explore"]
  ];

  /**
   * @typedef {Object} SimulationQuestionMetadata
   * @property {string} title
   * @property {string} chapter
   * @property {string} topic
   * @property {string} label
   *
   * Mounts the approved shared UI. Visualization and toolbar markup must be
   * authored by the trusted question implementation; metadata is assigned as
   * text, never interpolated into HTML.
   */
  function mount({ root, question, toolbar = "", visualization = "", onModeChange } = {}) {
    if (!root || !question || !question.title || typeof onModeChange !== "function") {
      throw new TypeError("The shared simulation shell requires a root, question title, and mode handler.");
    }

    root.innerHTML = `
      <header class="jnani-sim-header bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div class="jnani-sim-header-main flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="jnani-sim-brand-mark w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-green-500/20">JP</div>
            <span class="jnani-sim-brand-name font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">JNANI PHYSICS</span>
          </div>
          <div class="jnani-sim-breadcrumb hidden md:flex items-center space-x-2 text-sm text-slate-400 border-l border-slate-800 pl-4">
            <span data-shell-chapter></span>
            <span class="text-slate-600" aria-hidden="true">/</span>
            <span class="text-green-400 font-medium" data-shell-topic></span>
          </div>
        </div>
        <div class="jnani-sim-header-actions flex items-center space-x-3">
          <div id="header-badge" class="jnani-sim-metadata bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono-num text-slate-300"></div>
          <button onclick="closeSimulation()" class="jnani-sim-header-button bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700" type="button" aria-label="Return to question library">← Back</button>
          <button class="jnani-sim-header-button primary bg-green-500 hover:bg-green-600 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md shadow-green-500/10 flex items-center space-x-1.5" type="button">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <span>Quick Sandbox</span>
          </button>
        </div>
      </header>
      <main class="jnani-sim-layout flex-1 flex flex-col lg:flex-row overflow-hidden">
        <section class="jnani-sim-canvas-panel lg:w-[55%] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 relative overflow-hidden" aria-label="Simulation workspace">
          <div class="jnani-sim-canvas-toolbar p-3 px-4 bg-slate-900/50 border-b border-slate-800/60 flex items-center justify-between z-10 backdrop-blur">
            <div class="flex items-center space-x-2">
              <div class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true"></div>
              <span id="canvas-status-title" class="jnani-sim-canvas-label text-xs font-semibold tracking-wider text-slate-300 uppercase">Live Experiment Workspace</span>
            </div>
            <div class="flex items-center space-x-2" data-shell-toolbar></div>
          </div>
          <div data-shell-visualization></div>
          <div class="jnani-sim-controls p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10" id="sim-controls-bar">
            <div class="flex items-center space-x-2">
              <button id="playPauseBtn" onclick="togglePlayPause()" class="jnani-sim-control-button primary w-10 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-slate-950 flex items-center justify-center transition-colors shadow-md shadow-green-500/20" title="Play / Pause" type="button">
                <svg id="playIcon" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>
                <svg id="pauseIcon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
              </button>
              <button onclick="resetAnimation()" class="jnani-sim-control-button p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors" title="Replay / Reset" type="button">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </button>
              <div class="h-6 w-px bg-slate-800 mx-1" aria-hidden="true"></div>
              <div class="jnani-sim-speed-group flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700" aria-label="Playback speed">
                <button onclick="setSpeed(0.5)" class="speed-btn px-2 py-1 rounded text-xs font-mono-num text-slate-400 hover:text-white" data-speed="0.5" aria-pressed="false" type="button">0.5x</button>
                <button onclick="setSpeed(1.0)" class="speed-btn px-2 py-1 rounded text-xs font-mono-num bg-green-500 text-slate-950 font-bold" data-speed="1.0" aria-pressed="true" type="button">1.0x</button>
                <button onclick="setSpeed(1.5)" class="speed-btn px-2 py-1 rounded text-xs font-mono-num text-slate-400 hover:text-white" data-speed="1.5" aria-pressed="false" type="button">1.5x</button>
              </div>
            </div>
            <div class="flex-1 min-w-[180px] max-w-[300px] flex items-center space-x-3 px-2">
              <span id="time-current" class="text-xs font-mono-num text-slate-400">0.0s</span>
              <input type="range" id="timelineScrubber" min="0" max="100" value="0" step="0.1" oninput="scrubTimeline(this.value)" class="jnani-sim-timeline w-full accent-green-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg" aria-label="Simulation timeline">
              <span id="time-total" class="text-xs font-mono-num text-slate-400">12.0s</span>
            </div>
          </div>
        </section>
        <section class="jnani-sim-learning-panel lg:w-[45%] flex flex-col bg-slate-900 overflow-hidden" aria-label="Question and learning modes">
          <nav class="jnani-sim-tabs grid grid-cols-4 border-b border-slate-800 bg-slate-900/90 text-xs font-medium" aria-label="Learning modes">
            ${modes.map(([mode, label], index) => `<button id="tab-${mode}" aria-current="${index === 0 ? "step" : "false"}" class="py-3 px-2 text-center border-b-2 ${index === 0 ? "border-green-500 text-green-400 bg-slate-800/40" : "border-transparent text-slate-400 hover:text-slate-200"} transition-all flex flex-col items-center justify-center space-y-0.5" type="button" data-mode="${mode}"><span class="font-bold">${label}</span></button>`).join("")}
          </nav>
          <div class="jnani-sim-content flex-1 overflow-y-auto p-6 space-y-6" id="console-content"></div>
        </section>
      </main>`;

    root.querySelector("[data-shell-toolbar]").innerHTML = toolbar;
    root.querySelector("[data-shell-visualization]").innerHTML = visualization;

    function setMetadata(metadata = {}) {
      root.querySelector("[data-shell-chapter]").textContent = metadata.chapter ?? "";
      root.querySelector("[data-shell-topic]").textContent = metadata.topic ?? question.title;
      root.querySelector("#header-badge").textContent = metadata.label ?? "";
      global.document.title = `JNANI Physics | ${metadata.title ?? metadata.topic ?? question.title}`;
    }

    function setActiveMode(mode) {
      if (!modes.some(([id]) => id === mode)) throw new TypeError(`Unknown simulation mode: ${mode}`);
      root.querySelectorAll(".jnani-sim-tabs [data-mode]").forEach(tab => {
        const active = tab.dataset.mode === mode;
        tab.setAttribute("aria-current", active ? "step" : "false");
        tab.classList.toggle("border-green-500", active);
        tab.classList.toggle("text-green-400", active);
        tab.classList.toggle("bg-slate-800/40", active);
        tab.classList.toggle("border-transparent", !active);
        tab.classList.toggle("text-slate-400", !active);
      });
    }

    root.querySelector(".jnani-sim-tabs").addEventListener("click", event => {
      const button = event.target.closest("[data-mode]");
      if (!button) return;
      setActiveMode(button.dataset.mode);
      if (onModeChange) onModeChange(button.dataset.mode);
    });
    root.addEventListener("click", event => {
      if (event.target.closest(".jnani-sim-header-button.primary") && onModeChange) {
        onModeChange("explore");
      }
    });

    setMetadata(question);
    return Object.freeze({ setMetadata, setActiveMode });
  }

  global.PYQSimulationShell = Object.freeze({ mount, modes: Object.freeze(modes.map(([id]) => id)) });
})(window);
