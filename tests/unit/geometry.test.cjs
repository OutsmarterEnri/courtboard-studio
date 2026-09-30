const { test } = require("node:test");
const assert = require("node:assert/strict");
const geometry = require("../../dist/geometry.js");
for (const width of [800, 1500])
  for (const angle of [0, 90, 180, 270]) {
    test(`round-trip pointer coordinates: width=${width}, angle=${angle}`, () => {
      for (const p of [
        { x: 0, y: 0 },
        { x: width, y: 850 },
        { x: 240, y: 310 },
      ]) {
        const screen = geometry.toScreen(p, width, 850, angle);
        const actual = geometry.toCourt(screen, width, 850, angle);
        assert.deepEqual(actual, p);
        const size = geometry.dimensions(width, 850, angle);
        assert.ok(screen.x >= 0 && screen.x <= size.width);
        assert.ok(screen.y >= 0 && screen.y <= size.height);
      }
    });
  }
test("screen arrows remain aligned with the screen at every rotation", () => {
  for (const angle of [0, 90, 180, 270]) {
    const origin = { x: 400, y: 400 };
    const delta = geometry.vectorToCourt({ x: 5, y: 0 }, angle);
    const a = geometry.toScreen(origin, 800, 850, angle);
    const b = geometry.toScreen(
      { x: origin.x + delta.x, y: origin.y + delta.y },
      800,
      850,
      angle,
    );
    assert.equal(b.x - a.x, 5);
    assert.equal(b.y - a.y, 0);
  }
});
test("missing or unsupported rotation uses the original orientation", () => {
  for (const value of [undefined, 45, "wrong", {}, null])
    assert.equal(geometry.normalize(value), 0);
});
