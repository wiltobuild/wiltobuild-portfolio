import test from "node:test";
import assert from "node:assert/strict";
import {
  floppyFrame,
  floppyEjectFrame,
  DISK_HOME,
  DISK_INSERTED,
  createFloppySound,
} from "../floppy-drive.js";

test("disk clears the desktop before descending and only reads after insertion", () => {
  assert.deepEqual(floppyFrame(0).position, DISK_HOME);
  const lifted = floppyFrame(600).position;
  assert.ok(lifted[1] > 2.5 && lifted[2] - 0.22 > 2.25);
  const lowered = floppyFrame(1200).position;
  assert.equal(lowered[1], 1.15);
  assert.ok(lowered[2] - 0.22 > 2.25);
  assert.equal(floppyFrame(2399).phase, "inserting");
  assert.deepEqual(floppyFrame(2400).position, DISK_INSERTED);
  assert.equal(floppyFrame(2400).phase, "reading");
  assert.equal(floppyFrame(4200).done, true);
  assert.equal(floppyFrame(4200).light, false);
});
test("normal reading blinks; reduced motion uses a short steady indicator; inserted disks reread", () => {
  assert.equal(floppyFrame(2400).light, true);
  assert.equal(floppyFrame(2800).light, false);
  for (const t of [0, 200, 500]) {
    const reduced = floppyFrame(t, { reduced: true });
    assert.equal(reduced.phase, "reading");
    assert.equal(reduced.light, true);
    assert.deepEqual(reduced.position, DISK_INSERTED);
  }
  assert.equal(floppyFrame(700, { reduced: true }).done, true);
  assert.equal(floppyFrame(0, { inserted: true }).phase, "reading");
  assert.equal(floppyFrame(1800, { inserted: true }).done, true);
});
test("sound is opt-in, can be muted mid-read, and cannot restart after stopping", () => {
  let contexts = 0,
    starts = 0,
    stops = 0;
  const param = () => ({
    value: 0,
    setValueAtTime() {},
    exponentialRampToValueAtTime() {},
    cancelScheduledValues() {},
  });
  const node = () => ({
    gain: param(),
    frequency: param(),
    Q: param(),
    connect() {},
    disconnect() {},
    start() {
      starts++;
    },
    stop() {
      stops++;
    },
  });
  const audio = createFloppySound(() => {
    contexts++;
    return {
      currentTime: 0,
      sampleRate: 1000,
      destination: {},
      resume: () => Promise.resolve(),
      createGain: node,
      createOscillator: node,
      createBufferSource: node,
      createBiquadFilter: node,
      createBuffer: () => ({ getChannelData: () => new Float32Array(55) }),
    };
  });
  audio.setPhase("reading");
  assert.equal(contexts, 0);
  audio.setEnabled(true);
  assert.ok(starts >= 2);
  audio.setEnabled(false);
  const before = starts;
  assert.ok(stops >= 2);
  audio.setPhase("ejecting");
  assert.equal(starts, before);
  audio.stop();
  audio.setEnabled(true);
  assert.equal(starts, before);
});

test("eject clears the desk and returns the disk to its original pose", () => {
  assert.deepEqual(floppyEjectFrame(0).position, DISK_INSERTED);
  assert.ok(floppyEjectFrame(1200).position[2] > 2.25);
  assert.ok(floppyEjectFrame(1800).position[1] > 2.5);
  assert.deepEqual(floppyEjectFrame(2400).position, DISK_HOME);
  assert.equal(floppyEjectFrame(2400).done, true);
  assert.equal(floppyEjectFrame(2400).light, false);
  assert.equal(floppyEjectFrame(300, { reduced: true }).done, true);
});
