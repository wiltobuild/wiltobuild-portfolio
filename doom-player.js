import { unzipSync, zipSync, strToU8 } from "./assets/vendor/fflate.js";
const status = document.querySelector("#status");
let player,
  ci,
  bundleUrl,
  stopped = false,
  sound = false,
  active = true;
function applyState() {
  if (!ci) return;
  if (sound && active && !document.hidden) ci.unmute();
  else ci.mute();
  if (active && !document.hidden) ci.resume();
  else ci.pause();
}
window.addEventListener("message", (event) => {
  if (
    event.source !== parent ||
    event.origin !== location.origin ||
    event.data?.type !== "doom-state"
  )
    return;
  sound = event.data.sound === true;
  active = event.data.active === true;
  applyState();
  if (active) {
    window.focus();
    document.body.focus({ preventScroll: true });
  }
});
document.addEventListener("visibilitychange", applyState);
window.addEventListener("pagehide", () => {
  stopped = true;
  player?.stop();
  if (bundleUrl) URL.revokeObjectURL(bundleUrl);
});
async function start() {
  try {
    // Keep the official shareware distribution intact on disk; unpack only in memory.
    const response = await fetch("./assets/doom/doom19s.zip");
    if (!response.ok) throw new Error("The game archive could not be loaded.");
    const distribution = unzipSync(
      new Uint8Array(await response.arrayBuffer()),
    );
    const first = distribution["DOOMS_19.1"],
      second = distribution["DOOMS_19.2"];
    const installed = new Uint8Array(first.length + second.length);
    installed.set(first);
    installed.set(second, first.length);
    const files = unzipSync(installed);
    files[".jsdos/"] = new Uint8Array();
    files[".jsdos/dosbox.conf"] = strToU8(
      `[sdl]\nautolock=false\n[dosbox]\nmachine=svga_s3\nmemsize=16\n[render]\naspect=false\nscaler=none\n[cpu]\ncore=auto\ncycles=auto\n[mixer]\nrate=22050\n[sblaster]\nsbtype=sb16\nsbbase=220\nirq=7\ndma=1\nhdma=5\n[autoexec]\n@echo off\nmount c .\nc:\nDOOM.EXE -warp 1 1 -skill 3\n`,
    );
    files["DEFAULT.CFG"] = strToU8(
      "mouse_sensitivity 5\nsfx_volume 8\nmusic_volume 6\nshow_messages 1\nscreenblocks 11\ndetaillevel 0\nsnd_channels 8\nsnd_musicdevice 3\nsnd_sfxdevice 3\nsnd_sbport 544\nsnd_sbirq 7\nsnd_sbdma 1\nuse_mouse 1\nuse_joystick 0\nkey_right 77\nkey_left 75\nkey_up 17\nkey_down 31\nkey_strafeleft 30\nkey_straferight 32\nkey_fire 29\nkey_use 57\nkey_strafe 56\nkey_speed 42\n",
    );
    bundleUrl = URL.createObjectURL(
      new Blob([zipSync(files, { level: 0 })], { type: "application/zip" }),
    );
    if (stopped) return;
    window.emulators.pathPrefix = new URL(
      "./assets/vendor/js-dos/",
      location.href,
    ).href;
    player = window.Dos(document.querySelector("#dos"), {
      clickToStart: false,
      noSideBar: true,
      noFullscreen: true,
      noSocialLinks: true,
      layersOptions: { optionControls: [] },
      style: "none",
    });
    ci = await player.run(bundleUrl);
    if (stopped) {
      await player.stop();
      return;
    }
    applyState();
    status.hidden = true;
    document.body.dataset.gameState = "running";
    parent.postMessage({ type: "doom-ready" }, location.origin);
    document.body.focus({ preventScroll: true });
  } catch (error) {
    status.replaceChildren(
      document.createTextNode(
        "DOOM could not start. Close this window and insert the disk again.",
      ),
    );
    document.body.dataset.gameState = "error";
    console.error("Doom startup:", error);
  }
}
start();
