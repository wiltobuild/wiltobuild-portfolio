export function mountDoomWindow(entry, { getSound, isActive, eject }) {
  const frame = entry.content.querySelector("iframe");
  const send = () =>
    frame.contentWindow?.postMessage(
      { type: "doom-state", sound: getSound(), active: isActive(entry) },
      location.origin,
    );
  const ready = (event) => {
    if (
      event.origin !== location.origin ||
      event.source !== frame.contentWindow ||
      event.data?.type !== "doom-ready"
    )
      return;
    send();
    if (isActive(entry)) frame.focus({ preventScroll: true });
  };
  const observer = new MutationObserver(send);
  observer.observe(entry.el, {
    attributes: true,
    attributeFilter: ["class", "hidden"],
  });
  document
    .querySelectorAll(".monitor-screen")
    .forEach((screen) =>
      observer.observe(screen, {
        attributes: true,
        attributeFilter: ["inert"],
      }),
    );
  window.addEventListener("message", ready);
  window.addEventListener("desktop-sound-change", send);
  frame.addEventListener("load", send);
  const button = document.createElement("button");
  button.textContent = "Eject disk";
  button.dataset.ejectDoom = "";
  button.onclick = eject;
  entry.el.querySelector(".window-menubar").append(button);
  entry.el.querySelector(".window-status-text").textContent =
    "WASD move · ←/→ turn · Ctrl fire · Space use · Esc menu";
  const previous = entry.cleanup;
  entry.cleanup = () => {
    previous?.();
    observer.disconnect();
    window.removeEventListener("message", ready);
    window.removeEventListener("desktop-sound-change", send);
  };
}
