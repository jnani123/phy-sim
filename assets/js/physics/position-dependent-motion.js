(function (global) {
  const MASS_KG = 0.1;

  function timeValue(value) {
    const time = Number(value);
    if (!Number.isFinite(time) || time < 0) {
      throw new TypeError("Time must be a finite, non-negative number of seconds.");
    }
    return time;
  }

  function evaluate(timeSeconds, massKg = MASS_KG) {
    const t = timeValue(timeSeconds);
    const mass = Number(massKg);
    if (!Number.isFinite(mass) || mass <= 0) {
      throw new TypeError("Mass must be a finite positive number of kilograms.");
    }
    const position = { x: 10 * t ** 2, y: 5 * t ** 3, z: 0 };
    const velocity = { x: 20 * t, y: 15 * t ** 2, z: 0 };
    const acceleration = { x: 20, y: 30 * t, z: 0 };
    const momentum = { x: mass * velocity.x, y: mass * velocity.y, z: 0 };
    const force = { x: mass * acceleration.x, y: mass * acceleration.y, z: 0 };
    const angularMomentum = {
      x: 0, y: 0,
      z: position.x * momentum.y - position.y * momentum.x
    };
    const torque = {
      x: 0, y: 0,
      z: position.x * force.y - position.y * force.x
    };
    return Object.freeze({ time: t, mass, position, velocity, acceleration, momentum, force, angularMomentum, torque });
  }

  function evaluateStatements(timeSeconds = 1) {
    const values = evaluate(timeSeconds);
    const close = (a, b) => Math.abs(a - b) < 1e-9;
    const statements = {
      A: close(values.momentum.x, 2) && close(values.momentum.y, 1.5),
      B: close(values.force.x, 2) && close(values.force.y, 3),
      C: close(values.angularMomentum.z, 15),
      D: close(values.torque.z, 20)
    };
    const options = [["A", "B", "C"], ["B", "C", "D"], ["A", "C", "D"], ["A", "B", "D"]];
    const correctOption = options.findIndex(option => option.every(letter => statements[letter]) && Object.keys(statements).every(letter => statements[letter] === option.includes(letter))) + 1;
    return Object.freeze({ ...statements, correctOption });
  }

  global.PYQPhysicsEngines = global.PYQPhysicsEngines || {};
  global.PYQPhysicsEngines.positionDependentMotion = Object.freeze({ evaluate, evaluateStatements, massKg: MASS_KG });
})(window);
