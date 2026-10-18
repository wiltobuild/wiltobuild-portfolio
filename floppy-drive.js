export const DISK_HOME = [3.2, 2.35, 1.45];
export const DISK_INSERTED = [3.55, 1.15, 0.92];
const points = [
  DISK_HOME,
  [3.35, 2.65, 2.7],
  [3.55, 1.15, 2.65],
  [3.55, 1.15, 1.42],
  DISK_INSERTED,
];
export function floppyFrame(
  elapsed,
  { reduced = false, inserted = false } = {},
) {
  const travel = reduced || inserted ? 0 : 2400;
  const duration = travel + (reduced ? 700 : 1800);
  const reading = elapsed >= travel;
  let position = DISK_INSERTED,
    yaw = 0;
  if (!reading) {
    const segment = Math.min(3, Math.floor(Math.max(0, elapsed) / 600));
    const t = Math.max(0, Math.min(1, (elapsed - segment * 600) / 600));
    const ease = t * t * (3 - 2 * t);
    position = points[segment].map(
      (v, i) => v + (points[segment + 1][i] - v) * ease,
    );
    yaw = segment === 0 ? 0.21 * (1 - ease) : 0;
  }
  return {
    position,
    yaw,
    done: elapsed >= duration,
    phase: elapsed >= duration ? "ready" : reading ? "reading" : "inserting",
    light:
      elapsed < duration &&
      reading &&
      (reduced || Math.floor((elapsed - travel) / 180) % 3 !== 2),
  };
}
export function floppyEjectFrame(elapsed, { reduced = false } = {}) {
  const done = elapsed >= (reduced ? 300 : 2400);
  const pose = floppyFrame(reduced ? 0 : Math.max(0, 2400 - elapsed));
  return {
    ...pose,
    position: done ? DISK_HOME : pose.position,
    yaw: done ? 0.21 : pose.yaw,
    done,
    light: false,
    phase: done ? "ejected" : "ejecting",
  };
}

// Small synthesized motor / head-seek sounds. No downloaded audio or autoplay.
export function createFloppySound(getContext) {
  let enabled = false,
    phase = "idle",
    timer = null,
    motor = null,
    gain = null;
  const sources = new Set();
  function stop() {
    clearInterval(timer);
    timer = null;
    if (gain) {
      gain.gain.cancelScheduledValues(0);
      gain.gain.value = 0;
    }
    for (const source of sources) {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    }
    sources.clear();
    motor = null;
    gain?.disconnect();
    gain = null;
  }
  function play() {
    stop();
    if (!enabled || !["inserting", "reading", "ejecting"].includes(phase))
      return;
    try {
      const context = getContext();
      context.resume().catch(() => {});
      gain = context.createGain();
      gain.gain.value = 0.16;
      gain.connect(context.destination);
      const output = gain;
      const seek = () => {
        if (!enabled || !output || gain !== output) return;
        const now = context.currentTime;
        const buffer = context.createBuffer(
          1,
          Math.ceil(context.sampleRate * 0.055),
          context.sampleRate,
        );
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++)
          data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        const noise = context.createBufferSource(),
          filter = context.createBiquadFilter(),
          envelope = context.createGain();
        noise.buffer = buffer;
        filter.type = "bandpass";
        filter.frequency.value = phase === "reading" ? 1100 : 550;
        filter.Q.value = 1.4;
        envelope.gain.setValueAtTime(0.8, now);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        noise.connect(filter);
        filter.connect(envelope);
        envelope.connect(output);
        sources.add(noise);
        noise.onended = () => {
          sources.delete(noise);
          noise.disconnect();
          filter.disconnect();
          envelope.disconnect();
        };
        noise.start(now);
        noise.stop(now + 0.06);
      };
      seek();
      if (phase === "reading") {
        motor = context.createOscillator();
        motor.type = "sawtooth";
        motor.frequency.value = 73;
        const motorLevel = context.createGain();
        motorLevel.gain.value = 0.085;
        motor.connect(motorLevel);
        motorLevel.connect(output);
        sources.add(motor);
        motor.onended = () => motorLevel.disconnect();
        motor.start();
        timer = setInterval(seek, 145);
      }
    } catch {
      stop();
    }
  }
  return {
    setEnabled(value) {
      enabled = value;
      play();
    },
    setPhase(value) {
      if (value !== phase) {
        phase = value;
        play();
      }
    },
    stop() {
      phase = "idle";
      stop();
    },
  };
}
