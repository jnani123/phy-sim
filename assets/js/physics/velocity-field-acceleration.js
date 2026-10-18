(function (global) {
  function finitePosition(position) {
    const values = [position?.x, position?.y, position?.z].map(Number);
    if (values.some(value => !Number.isFinite(value))) {
      throw new TypeError("Position coordinates must be finite numbers.");
    }
    return { x: values[0], y: values[1], z: values[2] };
  }

  function evaluateVelocity(position) {
    const { x, y, z } = finitePosition(position);
    return { x: x === 0 ? 0 : -x, y: 2 * y, z: z === 0 ? 0 : -z };
  }

  function evaluateAcceleration(position) {
    const { x, y, z } = finitePosition(position);
    return { x, y: 4 * y, z };
  }

  function magnitude(vector) {
    const values = [vector?.x, vector?.y, vector?.z].map(Number);
    if (values.some(value => !Number.isFinite(value))) {
      throw new TypeError("Vector components must be finite numbers.");
    }
    return Math.hypot(...values);
  }

  global.PYQPhysicsEngines = global.PYQPhysicsEngines || {};
  global.PYQPhysicsEngines.velocityFieldAcceleration = Object.freeze({
    evaluateVelocity,
    evaluateAcceleration,
    magnitude
  });
})(window);
