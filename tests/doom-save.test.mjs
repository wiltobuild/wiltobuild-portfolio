import test from "node:test";
import assert from "node:assert/strict";
import { encodeSave, decodeSave } from "../doom-save.js";
test("native save bytes survive storage roundtrip", () => {
  const bytes = Uint8Array.from({ length: 200 }, (_, i) => i);
  bytes[199] = 0x1d;
  const restored = decodeSave(
    encodeSave(bytes, { map: 3, skill: 2, savedAt: 123 }),
  );
  assert.deepEqual(restored.bytes, bytes);
  assert.equal(restored.map, 3);
});
test("corrupt or unsupported saves are ignored", () => {
  for (const value of [
    "bad",
    "null",
    "{}",
    '{"version":2,"data":"AA=="}',
    encodeSave(new Uint8Array(100), { map: 1 }),
  ])
    assert.equal(decodeSave(value), null);
});
