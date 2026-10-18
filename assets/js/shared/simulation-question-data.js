(function (global) {
  function loadQuestion(engine) {
    const params = new URLSearchParams(global.location.search);
    const id = params.get("questionId");
    if (!id || !engine) return null;
    const matches = question => question && question.id === id && question.simulation?.engine === engine;
    const encoded = params.get("questionData");
    if (encoded) {
      try {
        const passed = JSON.parse(encoded);
        if (matches(passed)) return passed;
      } catch (error) {
        console.warn("The question data in the simulation link could not be read; checking the saved library.", error);
      }
    }
    try {
      const library = JSON.parse(global.localStorage.getItem("orbit-physics-pyq-v1") || "[]");
      if (Array.isArray(library)) return library.find(matches) || null;
    } catch (error) {
      console.error("The saved question library could not be read.", error);
    }
    return null;
  }

  global.PYQSimulationQuestionData = Object.freeze({ loadQuestion });
})(window);
