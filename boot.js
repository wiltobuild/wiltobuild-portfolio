export function createBoot({ onFinish, onSound, tone }) {
  const root = document.querySelector("#boot-screen");
  const $ = (selector) => root.querySelector(selector);
  const resources = [];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let controller = null,
    ready = Promise.resolve(),
    state = "welcome",
    sound = false,
    finishing = false;
  let inertElements = [];
  function lock() {
    inertElements = [...document.body.children]
      .filter((el) => el !== root && el.tagName !== "SCRIPT")
      .map((el) => [el, el.inert]);
    inertElements.forEach(([el]) => {
      el.inert = true;
    });
    document.body.classList.add("booting");
    root.hidden = false;
    root.classList.remove("boot-out");
    $("#boot-start").focus({ preventScroll: true });
  }
  function wait(ms, signal) {
    if (signal.aborted)
      return Promise.reject(new DOMException("Cancelled", "AbortError"));
    return new Promise((resolve, reject) => {
      let timer = setTimeout(complete, reduced.matches ? 0 : ms);
      function complete() {
        if (!$("#boot-setup").hidden) {
          timer = setTimeout(complete, 100);
          return;
        }
        signal.removeEventListener("abort", cancel);
        resolve();
      }
      function cancel() {
        clearTimeout(timer);
        reject(new DOMException("Cancelled", "AbortError"));
      }
      signal.addEventListener("abort", cancel, { once: true });
    });
  }
  function reset() {
    $("#boot-log").replaceChildren();
    $("#boot-memory").textContent = "0";
    $("#boot-resource-state").textContent = "INITIALIZING SYSTEM";
    $("#boot-command").textContent = "";
    $("#boot-adapters").textContent = "";
    $("#boot-date").textContent = new Date().toLocaleDateString("en-US");
    $("#boot-status").textContent = "Ready to start WilToBuild 95.";
    $("#boot-setup").hidden = true;
  }
  async function finish() {
    if (finishing || state === "finished") return;
    finishing = true;
    controller?.abort();
    $("#boot-status").textContent = "Preparing your workspace…";
    await ready;
    $("#boot-setup").hidden = true;
    root.classList.add("boot-out");
    if (!reduced.matches)
      await new Promise((resolve) => setTimeout(resolve, 360));
    root.hidden = true;
    document.body.classList.remove("booting");
    inertElements.forEach(([el, value]) => {
      if (el.isConnected) el.inert = value;
    });
    state = "finished";
    finishing = false;
    onFinish();
  }
  async function run() {
    if (state === "running" || finishing) return;
    state = "running";
    reset();
    $("#boot-welcome").hidden = true;
    $("#boot-terminal").hidden = false;
    root.focus({ preventScroll: true });
    controller = new AbortController();
    const signal = controller.signal;
    tone(880);
    try {
      $("#boot-status").textContent =
        "Running virtual memory and display checks.";
      for (let memory = 0; memory <= 65536; memory += 4096) {
        $("#boot-memory").textContent = String(memory).padStart(5, " ");
        await wait(65, signal);
      }
      $("#boot-memory").textContent = "65536 KB OK";
      await wait(200, signal);
      $("#boot-resource-state").textContent =
        `LOADING RESOURCES (0/${resources.length})`;
      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        const ok = await resource.promise;
        if (signal.aborted) return;
        const row = document.createElement("div");
        row.className = "boot-log-row";
        const label = document.createElement("span");
        label.textContent = `${ok ? "Loaded" : "Fallback"} ${resource.label}`;
        const progress = document.createElement("span");
        progress.textContent = `... ${Math.round(((i + 1) / resources.length) * 100)}%`;
        row.append(label, progress);
        $("#boot-log").append(row);
        while ($("#boot-log").children.length > 8)
          $("#boot-log").firstElementChild.remove();
        $("#boot-resource-state").textContent =
          `LOADING RESOURCES (${i + 1}/${resources.length})`;
        tone(180 + i * 22);
        await wait(190, signal);
      }
      $("#boot-resource-state").textContent = "FINISHED LOADING RESOURCES";
      for (const line of [
        "CRT 01  THE PERSON       [ ONLINE ]",
        "CRT 02  THE WORK         [ ONLINE ]",
        "CRT 03  THE CONNECTION   [ ONLINE ]",
      ]) {
        $("#boot-adapters").textContent += line + "\n";
        await wait(190, signal);
      }
      $("#boot-status").textContent =
        "Resources ready. Starting WilToBuild 95.";
      const command = "C:\\WIL> WIN95.EXE /THREE-SCREENS";
      for (let i = 1; i <= command.length; i++) {
        $("#boot-command").textContent = command.slice(0, i);
        await wait(18, signal);
      }
      await wait(380, signal);
      tone(523);
      await wait(110, signal);
      tone(659);
      await wait(110, signal);
      tone(784);
      await finish();
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("Startup animation unavailable:", error.message);
        await finish();
      }
    }
  }
  function setup() {
    if (state === "finished" || finishing) return;
    $("#boot-setup").hidden = !$("#boot-setup").hidden;
    if (!$("#boot-setup").hidden) $("#boot-continue").focus();
    else (state === "welcome" ? $("#boot-start") : $("#boot-skip")).focus();
  }
  function toggleSound() {
    sound = !sound;
    onSound(sound);
    tone(660);
  }
  function setSound(value) {
    sound = value;
    root.querySelectorAll("[data-boot-sound]").forEach((button) => {
      button.setAttribute("aria-pressed", String(sound));
      button.textContent = `Sound: ${sound ? "ON" : "OFF"}`;
    });
  }
  root
    .querySelectorAll("[data-boot-sound]")
    .forEach((button) => button.addEventListener("click", toggleSound));
  $("#boot-start").addEventListener("click", run);
  $("#boot-skip").addEventListener("click", finish);
  $("#boot-skip-welcome").addEventListener("click", finish);
  $("#boot-setup-button").addEventListener("click", setup);
  $("#boot-continue").addEventListener("click", setup);
  root.addEventListener("keydown", (event) => {
    if (event.key === "Delete") {
      event.preventDefault();
      setup();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      $("#boot-setup").hidden ? finish() : setup();
    }
  });
  lock();
  return {
    track(label, promise) {
      // These rows reflect actual resource checks, paced to make the boot readable.
      resources.push({
        label,
        promise: Promise.resolve(promise).then(
          () => true,
          () => false,
        ),
      });
    },
    setReady(promise) {
      ready = promise;
    },
    setSound,
    isActive: () => state !== "finished",
    restart() {
      if (state !== "finished") return;
      state = "welcome";
      finishing = false;
      reset();
      lock();
      run();
    },
  };
}
