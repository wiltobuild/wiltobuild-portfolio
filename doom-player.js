import { unzipSync, zipSync, strToU8 } from "./assets/vendor/fflate.js";
import { DOOM_SAVE_KEY, encodeSave, decodeSave } from "./doom-save.js";
const $ = (s) => document.querySelector(s),
  status = $("#status"),
  picker = $("#picker"),
  saveLabel = $("#save-status");
const maps = [
  "Hangar",
  "Nuclear Plant",
  "Toxin Refinery",
  "Command Control",
  "Phobos Lab",
  "Central Processing",
  "Computer Station",
  "Phobos Anomaly",
  "Military Base",
];
let player,
  ci,
  bundleUrl,
  saved,
  saveKey = DOOM_SAVE_KEY,
  filesPromise,
  saving,
  launching = false,
  ready = false,
  quickSlot = false,
  active = true,
  sound = false,
  stopped = false,
  map = 1,
  skill = 3;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  saved = decodeSave(localStorage.getItem(DOOM_SAVE_KEY));
} catch {}
function notice(text) {
  saveLabel.textContent = text;
}
function state() {
  if (!ci) return;
  const running = (active && !document.hidden && picker.hidden) || !!saving;
  running ? ci.resume() : ci.pause();
  sound && running && !saving ? ci.unmute() : ci.mute();
}
async function key(code) {
  ci.sendKeyEvent(code, true);
  await delay(65);
  ci.sendKeyEvent(code, false);
  await delay(65);
}
async function checkpoint() {
  if (saving) return saving;
  if (!ready || !ci) return true;
  saving = (async () => {
    notice("Saving to floppy…");
    $("#save").disabled = true;
    ci.resume();
    ci.mute();
    // Reserve native quick-save slot 1. Later saves need only F6 + Y.
    await key(295);
    if (!quickSlot) {
      await key(49);
      await key(257);
      if (!saved) for (const c of "FLOPPY") await key(c.charCodeAt(0));
      await key(257);
    } else await key(89);
    await delay(180);
    const changes = unzipSync(await ci.persist());
    const name = Object.keys(changes).find((n) =>
      /(^|\/)doomsav0\.dsg$/i.test(n),
    );
    const bytes = name && changes[name];
    if (!bytes || bytes.at(-1) !== 0x1d)
      throw new Error(
        "No playable checkpoint yet. Try saving after the level starts.",
      );
    const value = encodeSave(bytes, { map, skill, savedAt: Date.now() });
    quickSlot = true;
    localStorage.setItem(saveKey, value);
    saved = decodeSave(value);
    quickSlot = true;
    notice(
      "Saved " +
        new Date(saved.savedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
    );
    return true;
  })()
    .catch((error) => {
      notice("Save failed: " + error.message);
      return false;
    })
    .finally(() => {
      saving = null;
      $("#save").disabled = false;
      state();
    });
  return saving;
}
async function gameFiles() {
  const response = await fetch("./assets/doom/doom19s.zip");
  if (!response.ok) throw new Error("Unable to load the game disk.");
  const archive = unzipSync(new Uint8Array(await response.arrayBuffer()));
  const a = archive["DOOMS_19.1"],
    b = archive["DOOMS_19.2"],
    data = new Uint8Array(a.length + b.length);
  data.set(a);
  data.set(b, a.length);
  return unzipSync(data);
}
async function launch(resume = false, level = 1) {
  if (launching) return;
  launching = true;
  $("#maps").disabled = true;
  if (saving) await saving;
  ready = false;
  quickSlot = false;
  picker.hidden = true;
  status.hidden = false;
  status.textContent = resume
    ? "Restoring floppy save…"
    : "Loading " + maps[level - 1] + "…";
  try {
    await player?.stop();
    ci = null;
    saveKey = resume ? $("#saved-run").value : `${DOOM_SAVE_KEY}.map.${level}`;
    try {
      saved = decodeSave(localStorage.getItem(saveKey));
    } catch {
      saved = null;
    }
    if (resume && !saved)
      throw new Error("That save is unavailable. Choose a map to begin.");
    if (bundleUrl) URL.revokeObjectURL(bundleUrl);
    const files = { ...(await (filesPromise ||= gameFiles())) };
    map = resume ? saved.map : level;
    skill = resume ? saved.skill : Number($("#skill").value);
    files[".jsdos/"] = new Uint8Array();
    if (resume) files["doomsav0.dsg"] = saved.bytes;
    files[".jsdos/dosbox.conf"] = strToU8(
      `[sdl]\nautolock=false\n[dosbox]\nmachine=svga_s3\nmemsize=16\n[render]\naspect=false\nscaler=none\n[cpu]\ncore=auto\ncycles=auto\n[mixer]\nrate=22050\n[sblaster]\nsbtype=sb16\nsbbase=220\nirq=7\ndma=1\nhdma=5\n[autoexec]\n@echo off\nmount c .\nc:\nDOOM.EXE ${resume ? "-loadgame 0" : `-warp 1 ${map} -skill ${skill}`}\n`,
    );
    files["DEFAULT.CFG"] = strToU8(
      "mouse_sensitivity 5\nsfx_volume 8\nmusic_volume 6\nshow_messages 1\nscreenblocks 10\ndetaillevel 0\nsnd_channels 8\nsnd_musicdevice 3\nsnd_sfxdevice 3\nsnd_sbport 544\nsnd_sbirq 7\nsnd_sbdma 1\nuse_mouse 1\nuse_joystick 0\nkey_right 77\nkey_left 75\nkey_up 17\nkey_down 31\nkey_strafeleft 30\nkey_straferight 32\nkey_fire 57\nkey_use 29\nkey_strafe 56\nkey_speed 42\n",
    );
    // Each selected map has its own checkpoint; the original save stays intact.
    if (!resume && saved) files["doomsav0.dsg"] = saved.bytes;
    bundleUrl = URL.createObjectURL(
      new Blob([zipSync(files, { level: 0 })], { type: "application/zip" }),
    );
    window.emulators.pathPrefix = new URL(
      "./assets/vendor/js-dos/",
      location.href,
    ).href;
    $("#dos").replaceChildren();
    player = window.Dos($("#dos"), {
      clickToStart: false,
      noSideBar: true,
      noFullscreen: true,
      noSocialLinks: true,
      layersOptions: { optionControls: [] },
      style: "none",
    });
    ci = await player.run(bundleUrl);
    await player.setAutolock(false);
    if (stopped) {
      await player.stop();
      return;
    }
    ci.mute();
    await delay(3500);
    ready = true;
    status.hidden = true;
    document.body.dataset.gameState = "running";
    state();
    parent.postMessage({ type: "doom-ready" }, location.origin);
    window.focus();
    document.body.focus({ preventScroll: true });
    await checkpoint();
  } catch (error) {
    status.hidden = false;
    status.textContent = error.message;
    notice("Game could not start. Use Maps to retry.");
  } finally {
    launching = false;
    $("#maps").disabled = false;
  }
}
function showMaps() {
  picker.hidden = false;
  state();
  const runs = [];
  for (const key of [
    DOOM_SAVE_KEY,
    ...maps.map((_, i) => `${DOOM_SAVE_KEY}.map.${i + 1}`),
  ]) {
    try {
      const run = decodeSave(localStorage.getItem(key));
      if (run) runs.push({ key, run });
    } catch {}
  }
  $("#saved-run").replaceChildren(
    ...runs.map(({ key, run }) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${key === DOOM_SAVE_KEY ? "Original run · " : ""}${maps[run.map - 1]} · ${new Date(run.savedAt).toLocaleString()}`;
      option.selected = key === saveKey;
      return option;
    }),
  );
  $("#saved-choice").hidden = runs.length === 0;
  $("#resume").hidden = runs.length === 0;
  $("#continue").hidden = !ready;
  document.body.dataset.gameState = "map-select";
}
$("#maps").onclick = async () => {
  showMaps();
  if (ready) await checkpoint();
};
$("#resume").onclick = () => launch(true);
$("#continue").onclick = () => {
  if (ready) {
    picker.hidden = true;
    state();
    document.body.focus();
  }
};
$("#save").onclick = async () => {
  await checkpoint();
  document.body.focus();
};
$("#map-list").replaceChildren(
  ...maps.map((name, i) => {
    const button = document.createElement("button");
    button.textContent = `E1M${i + 1} · ${name}`;
    button.onclick = () => launch(false, i + 1);
    return button;
  }),
);
window.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (picker.hidden) $("#maps").click();
      return;
    }
    if (saving) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (/^F\d+$/.test(event.key)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.key === "F6") checkpoint();
    }
  },
  true,
);
window.addEventListener("message", async (event) => {
  if (event.source !== parent || event.origin !== location.origin) return;
  if (event.data?.type === "doom-save-request") {
    const ok = await checkpoint();
    parent.postMessage(
      { type: "doom-saved", id: event.data.id, ok },
      location.origin,
    );
    return;
  }
  if (event.data?.type !== "doom-state") return;
  const wasActive = active;
  active = event.data.active === true;
  sound = event.data.sound === true;
  if (wasActive && !active && ready) await checkpoint();
  state();
  if (active && picker.hidden) {
    window.focus();
    document.body.focus({ preventScroll: true });
  }
});
setInterval(() => {
  if (ready && active && !document.hidden && picker.hidden) checkpoint();
}, 15000);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && ready) checkpoint();
  state();
});
window.addEventListener("pagehide", () => {
  stopped = true;
  player?.stop();
  if (bundleUrl) URL.revokeObjectURL(bundleUrl);
});
notice(
  saved
    ? "Saved game available · choose Resume saved game"
    : "Autosaves every 15 seconds · saved on this browser",
);
showMaps();

$("#controls-toggle").onclick = () => {
  const panel = $("#controls-help");
  panel.hidden = !panel.hidden;
  $("#controls-toggle").setAttribute("aria-expanded", String(!panel.hidden));
};
