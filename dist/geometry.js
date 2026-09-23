/* Coordinate transforms keep saved plays independent of the displayed rotation. */
(function (root) {
  const normalize = (angle) =>
    [0, 90, 180, 270].includes(Number(angle)) ? Number(angle) : 0;
  function dimensions(width, height, angle) {
    return normalize(angle) % 180
      ? { width: height, height: width }
      : { width, height };
  }
  function toScreen(p, width, height, angle) {
    switch (normalize(angle)) {
      case 90:
        return { x: height - p.y, y: p.x };
      case 180:
        return { x: width - p.x, y: height - p.y };
      case 270:
        return { x: p.y, y: width - p.x };
      default:
        return { x: p.x, y: p.y };
    }
  }
  function toCourt(p, width, height, angle) {
    switch (normalize(angle)) {
      case 90:
        return { x: p.y, y: height - p.x };
      case 180:
        return { x: width - p.x, y: height - p.y };
      case 270:
        return { x: width - p.y, y: p.x };
      default:
        return { x: p.x, y: p.y };
    }
  }
  function vectorToCourt(p, angle) {
    const origin = toCourt({ x: 0, y: 0 }, 0, 0, angle);
    const end = toCourt(p, 0, 0, angle);
    return { x: end.x - origin.x, y: end.y - origin.y };
  }
  function applyTransform(context, width, height, angle) {
    const origin = toScreen({ x: 0, y: 0 }, width, height, angle);
    context.translate(origin.x, origin.y);
    context.rotate((normalize(angle) * Math.PI) / 180);
  }
  const api = {
    normalize,
    dimensions,
    toScreen,
    toCourt,
    vectorToCourt,
    applyTransform,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CourtGeometry = api;
})(globalThis);
