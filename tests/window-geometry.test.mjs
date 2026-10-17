import test from "node:test";
import assert from "node:assert/strict";
import {
  fitWindow,
  resizeWindow,
  normalizeRect,
  restoreRect,
  monitorEdgeDirection,
} from "../window-geometry.js";
const desktop = { width: 960, height: 650 };
const window = { x: 150, y: 80, w: 500, h: 360 };

test("a monitor handoff requires directed travel into a horizontal edge", () => {
  assert.equal(monitorEdgeDirection(955, 960, 50), 1);
  assert.equal(monitorEdgeDirection(5, 960, -50), -1);
  assert.equal(monitorEdgeDirection(955, 960, 0), 0);
  assert.equal(monitorEdgeDirection(955, 960, -50), 0);
  assert.equal(monitorEdgeDirection(5, 960, 50), 0);
  assert.equal(monitorEdgeDirection(500, 960, 100), 0);
});
test("saved layouts restore at the same desktop size without pixel drift", () => {
  const restored = restoreRect(normalizeRect(window, desktop), desktop);
  for (const key of ["x", "y", "w", "h"])
    assert(Math.abs(restored[key] - window[key]) < 1e-8);
});
test("saved layouts follow a new monitor resolution and remain reachable", () => {
  const small = { width: 480, height: 310 };
  inside(restoreRect(normalizeRect(window, desktop), small), small);
  inside(restoreRect({ x: NaN, y: 0, w: Infinity, h: 1 }, small), small);
  inside(restoreRect(null, small), small);
});
function inside(rect, bounds) {
  assert(rect.x >= 2 && rect.y >= 2);
  assert(rect.x + rect.w <= bounds.width - 2);
  assert(rect.y + rect.h <= bounds.height - 2);
  assert(rect.w >= Math.min(280, bounds.width - 4));
  assert(rect.h >= Math.min(170, bounds.height - 4));
}
test("moving beyond any edge keeps the entire window within its monitor", () => {
  for (const x of [-1000, 20, 10000])
    for (const y of [-2000, 20, 10000])
      inside(fitWindow({ ...window, x, y }, desktop), desktop);
});
test("every resize edge stays bounded, including crossing its opposite edge", () => {
  for (const edge of ["n", "s", "e", "w", "ne", "nw", "se", "sw"])
    for (const dx of [-2000, -10, 10, 2000])
      for (const dy of [-2000, -10, 10, 2000])
        inside(resizeWindow(window, edge, dx, dy, desktop), desktop);
});
test("resizing west/north anchors the opposite edges", () => {
  const west = resizeWindow(window, "w", -70, 0, desktop);
  assert.equal(west.x + west.w, window.x + window.w);
  assert.equal(west.x, 80);
  const north = resizeWindow(window, "n", 0, -30, desktop);
  assert.equal(north.y + north.h, window.y + window.h);
  assert.equal(north.y, 50);
});
test("small mobile and landscape desktops remain usable without overflow", () => {
  for (const bounds of [
    { width: 335, height: 210 },
    { width: 280, height: 155 },
    { width: 480, height: 250 },
  ]) {
    const fitted = fitWindow(window, bounds);
    inside(fitted, bounds);
    for (const edge of ["nw", "se", "sw", "ne"])
      inside(resizeWindow(fitted, edge, 900, -900, bounds), bounds);
  }
});
