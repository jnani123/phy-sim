(function (global) {
  function validateTime(timeSeconds) {
    const time = Number(timeSeconds);
    if (!Number.isFinite(time) || time < 0) {
      throw new TypeError("Time must be a finite, non-negative value in seconds.");
    }
    return time;
  }

  function angularPosition(timeSeconds) {
    const t = validateTime(timeSeconds);
    return t ** 4 / 8 - t ** 3 / 3;
  }

  function angularVelocity(timeSeconds) {
    const t = validateTime(timeSeconds);
    return t ** 3 / 2 - t ** 2;
  }

  function angularAcceleration(timeSeconds) {
    const t = validateTime(timeSeconds);
    return 3 * t ** 2 / 2 - 2 * t;
  }

  function evaluate(timeSeconds) {
    const time = validateTime(timeSeconds);
    return Object.freeze({
      time,
      theta: angularPosition(time),
      omega: angularVelocity(time),
      alpha: angularAcceleration(time)
    });
  }

  global.PYQPhysicsEngines = global.PYQPhysicsEngines || {};
  global.PYQPhysicsEngines.angularKinematics = Object.freeze({
    validateTime,
    angularPosition,
    angularVelocity,
    angularAcceleration,
    evaluate
  });
})(window);
