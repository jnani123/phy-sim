(function (global) {
  const markup = () => `
    <div class="jnani-sim-view-controls flex items-center space-x-1" role="group" aria-label="Simulation view controls">
      <button class="jnani-sim-control-button" type="button" data-sim-view="out" aria-label="Zoom out" title="Zoom out">-</button>
      <button class="jnani-sim-control-button" type="button" data-sim-view="in" aria-label="Zoom in" title="Zoom in">+</button>
      <button class="jnani-sim-control-button" type="button" data-sim-view="reset">Reset View</button>
    </div>`;

  function bind(root, handlers) {
    if (!root || !handlers) throw new TypeError("Simulation view controls need a root and handlers.");
    const onClick = event => {
      const button = event.target.closest("[data-sim-view]");
      if (!button || !root.contains(button)) return;
      const handler = handlers[button.dataset.simView];
      if (typeof handler !== "function") return;
      event.preventDefault();
      handler();
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  global.PYQSimulationViewControls = Object.freeze({ markup, bind });
})(window);
