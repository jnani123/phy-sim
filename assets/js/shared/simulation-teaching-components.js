(function (global) {
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function commonStudentTrap({ title, wrong, fix, why } = {}) {
    const correction = fix ?? why;
    if (!title || !wrong || !correction) {
      throw new TypeError("A student trap requires a title, wrong approach, and correction.");
    }
    return `<aside class="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl space-y-2" aria-label="Common student trap">
      <div class="flex items-center space-x-2 text-amber-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <span class="text-xs font-bold uppercase tracking-wider">Common Student Trap: ${escapeHtml(title)}</span>
      </div>
      <div class="text-red-400 font-mono-num text-xs"><span class="text-slate-500 font-sans">✕ Wrong:</span> ${escapeHtml(wrong)}</div>
      <div class="text-slate-300 text-xs"><span class="text-green-400 font-sans font-semibold">✓ Fix:</span> ${escapeHtml(correction)}</div>
    </aside>`;
  }

  function givenAndAsked({ given, find } = {}) {
    if (!Array.isArray(given) || given.length === 0 || given.some(item => typeof item !== "string") || typeof find !== "string" || !find) {
      throw new TypeError("A given-and-asked recap requires given items and a requested quantity.");
    }
    return `<section class="jnani-sim-given-asked" aria-label="Given information and requested quantity">
      <div class="jnani-sim-given-asked-column"><h3>Given</h3><ul>${given.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
      <div class="jnani-sim-given-asked-column"><h3>Find</h3><p>${escapeHtml(find)}</p></div>
    </section>`;
  }

  global.PYQSimulationTeaching = Object.freeze({ commonStudentTrap, givenAndAsked });
})(window);
