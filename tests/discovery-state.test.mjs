import test from "node:test";
import assert from "node:assert/strict";
import {
  createDiscoveryStore,
  normalizeDiscoveries,
  DISCOVERY_KEY,
} from "../discovery-state.js";

test("discovery, rewards and in-progress challenges survive a new visit", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
  const first = createDiscoveryStore(storage);
  first.discover("floppy");
  first.award("floppy");
  first.progress("rune", 2);
  first.discover("incident");
  first.progress("incident", 1);
  const restored = createDiscoveryStore(storage);
  assert.deepEqual(restored.snapshot(), first.snapshot());
  assert.equal(restored.award("floppy"), false);
  restored.award("rune");
  restored.progress("rune", 0);
  assert.ok(
    restored.snapshot().stickers.includes("rune"),
    "replaying does not erase souvenirs",
  );
  assert.ok(values.has(DISCOVERY_KEY));
});
test("invalid saved values cannot create unknown rewards or invalid challenge indexes", () => {
  const state = normalizeDiscoveries({
    discovered: ["floppy", "floppy", "evil"],
    stickers: ["rune", "evil"],
    runeStep: 500,
    incidentStep: "2",
  });
  assert.deepEqual(state.discovered, ["floppy"]);
  assert.deepEqual(state.stickers, ["rune"]);
  assert.equal(state.runeStep, 3);
  assert.equal(state.incidentStep, 0);
  const store = createDiscoveryStore({
    getItem: () => "{broken",
    setItem() {},
  });
  assert.equal(store.snapshot().runeStep, 0);
});
test("blocked storage keeps discoveries usable for the current visit", () => {
  const store = createDiscoveryStore({
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
  });
  store.discover("terminal");
  store.award("terminal");
  assert.equal(store.isPersistent(), false);
  assert.ok(store.snapshot().stickers.includes("terminal"));
  const copy = store.snapshot();
  copy.stickers.length = 0;
  assert.equal(store.snapshot().stickers.length, 1);
});
