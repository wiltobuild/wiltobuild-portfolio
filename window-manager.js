import { fitWindow, resizeWindow } from "./window-geometry.js";

export function createWindowManager({ screen, titles, render, onActive }) {
  const layer = screen.querySelector("#window-layer");
  const tasks = screen.querySelector("#taskbar-windows");
  const entries = new Map();
  const desktops = new Map();
  let monitor = null,
    focused = null,
    z = 1,
    gesture = null;
  const bounds = () => ({
    width: layer.clientWidth || 640,
    height: layer.clientHeight || 420,
  });
  const desktop = () => {
    if (!desktops.has(monitor)) desktops.set(monitor, { last: null });
    return desktops.get(monitor);
  };
  const visibleEntries = () =>
    [...entries.values()].filter((e) => e.monitor === monitor && !e.minimized);
  function deactivate(entry) {
    if (!entry) return;
    entry.el.classList.remove("is-active");
    entry.el.dispatchEvent(new Event("desktop:deactivate"));
    entry.task.setAttribute("aria-pressed", "false");
    entry.task.setAttribute("aria-label", `Activate ${titles[entry.name]}`);
  }
  function focus(entry, moveFocus = true) {
    if (!entry || entry.monitor !== monitor) return;
    if (focused !== entry) deactivate(focused);
    focused = entry;
    desktop().last = entry.name;
    entry.minimized = false;
    entry.el.hidden = false;
    entry.el.inert = false;
    entry.el.classList.add("is-active");
    entry.el.style.zIndex = String(++z);
    entry.task.setAttribute("aria-pressed", "true");
    entry.task.setAttribute("aria-label", `Minimize ${titles[entry.name]}`);
    screen.classList.remove("desktop-only");
    onActive(entry);
    if (moveFocus) entry.content.focus({ preventScroll: true });
  }
  function focusNext() {
    const next = visibleEntries().sort(
      (a, b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex),
    )[0];
    if (next) focus(next);
    else {
      deactivate(focused);
      focused = null;
      screen.classList.add("desktop-only");
      onActive(null);
      screen.querySelector("#start").focus({ preventScroll: true });
    }
  }
  function apply(entry) {
    const b = bounds();
    if (!entry.initialized && layer.clientWidth && layer.clientHeight) {
      entry.rect = initialRect(entry.order, b);
      entry.initialized = true;
    }
    const rect = entry.maximized
      ? { x: 2, y: 2, w: b.width - 4, h: b.height - 4 }
      : fitWindow(entry.rect, b);
    if (!entry.maximized) entry.rect = rect;
    Object.assign(entry.el.style, {
      left: `${rect.x}px`,
      top: `${rect.y}px`,
      width: `${rect.w}px`,
      height: `${rect.h}px`,
    });
    entry.el.classList.toggle("compact-window", rect.w < 570);
    entry.el.classList.toggle("is-maximized", entry.maximized);
    const max = entry.el.querySelector('[data-action="maximize"]');
    max.setAttribute(
      "aria-label",
      `${entry.maximized ? "Restore" : "Maximize"} ${titles[entry.name]}`,
    );
    max.setAttribute("aria-pressed", String(entry.maximized));
    max.textContent = entry.maximized ? "❐" : "□";
  }
  function maximize(entry) {
    focus(entry, false);
    entry.maximized = !entry.maximized;
    apply(entry);
  }
  function minimize(entry) {
    deactivate(entry);
    entry.minimized = true;
    entry.el.hidden = true;
    entry.el.inert = true;
    entry.task.setAttribute("aria-label", `Restore ${titles[entry.name]}`);
    if (focused === entry) {
      focused = null;
      focusNext();
    }
  }
  function close(entry) {
    deactivate(entry);
    entry.cleanup?.();
    entry.el.remove();
    entry.task.remove();
    entries.delete(entry.key);
    if (focused === entry) {
      focused = null;
      focusNext();
    }
    if (desktop().last === entry.name) desktop().last = focused?.name || null;
  }
  function pointerPosition(event) {
    const rect = layer.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * layer.clientWidth) / rect.width,
      y: ((event.clientY - rect.top) * layer.clientHeight) / rect.height,
    };
  }
  function endGesture() {
    if (gesture) gesture.entry.el.classList.remove("is-moving");
    gesture = null;
    screen.classList.remove("manipulating-window");
  }
  function begin(event, entry, edge) {
    if (event.button !== 0 || screen.inert || entry.maximized) return;
    event.preventDefault();
    focus(entry, false);
    const point = pointerPosition(event);
    gesture = {
      entry,
      edge,
      point,
      rect: { ...entry.rect },
      id: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    entry.el.classList.add("is-moving");
    screen.classList.add("manipulating-window");
  }
  layer.addEventListener("pointermove", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const { entry, edge, point, rect } = gesture;
    const current = pointerPosition(event),
      dx = current.x - point.x,
      dy = current.y - point.y;
    entry.rect = edge
      ? resizeWindow(rect, edge, dx, dy, bounds())
      : fitWindow({ ...rect, x: rect.x + dx, y: rect.y + dy }, bounds());
    apply(entry);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) =>
    layer.addEventListener(type, endGesture),
  );
  function keyboard(event, entry, resize = false) {
    if (event.target !== event.currentTarget || !event.key.startsWith("Arrow"))
      return;
    event.preventDefault();
    if (entry.maximized) return;
    const dx =
      event.key === "ArrowRight" ? 10 : event.key === "ArrowLeft" ? -10 : 0;
    const dy =
      event.key === "ArrowDown" ? 10 : event.key === "ArrowUp" ? -10 : 0;
    entry.rect =
      resize || event.shiftKey
        ? resizeWindow(entry.rect, "se", dx, dy, bounds())
        : fitWindow(
            { ...entry.rect, x: entry.rect.x + dx, y: entry.rect.y + dy },
            bounds(),
          );
    apply(entry);
  }
  function initialRect(count, b) {
    const compact = b.width < 550;
    return fitWindow(
      {
        x: compact ? 7 : 90 + (count % 4) * 25,
        y: 12 + (count % 4) * 25,
        w: compact ? b.width - 14 : b.width * 0.78,
        h: compact ? b.height - 22 : b.height * 0.83,
      },
      b,
    );
  }
  function open(name) {
    const key = `${monitor}-${name}`;
    if (entries.has(key)) {
      const entry = entries.get(key);
      focus(entry);
      return entry;
    }
    const b = bounds(),
      count = [...entries.values()].filter((e) => e.monitor === monitor).length;
    const el = document.createElement("section");
    el.className = "app-window";
    el.dataset.app = name;
    el.dataset.monitorWindow = monitor;
    el.setAttribute("aria-labelledby", `${key}-title`);
    el.innerHTML = `<header class="window-titlebar" tabindex="0" aria-label="Move ${titles[name]} window" aria-describedby="window-help"><h2 id="${key}-title">${titles[name]}</h2><div class="window-buttons"><button data-action="minimize" aria-label="Minimize ${titles[name]}">_</button><button data-action="maximize" aria-label="Maximize ${titles[name]}" aria-pressed="false">□</button><button data-action="close" aria-label="Close ${titles[name]}">×</button></div></header><div class="window-menubar"><span>C:\\WIL\\${name.toUpperCase()}</span><button data-action="print">Print</button></div><div class="window-content" tabindex="0"></div><footer class="window-status"><span class="window-status-text">Ready</span><span>WilToBuild / Personal edition</span></footer>${["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((edge) => `<${edge === "se" ? "button" : "span"} class="resize-handle resize-${edge}" data-resize="${edge}" ${edge === "se" ? `aria-label="Resize ${titles[name]} window" title="Drag to resize; arrow keys also resize"` : 'aria-hidden="true"'}></${edge === "se" ? "button" : "span"}>`).join("")}`;
    const task = document.createElement("button");
    task.className = "window-task";
    task.textContent = titles[name];
    task.title = titles[name];
    const entry = {
      key,
      name,
      monitor,
      el,
      task,
      content: el.querySelector(".window-content"),
      minimized: false,
      maximized: false,
      cleanup: null,
      projectIndex: 0,
      initialized: !!layer.clientWidth,
      order: count,
      rect: initialRect(count, b),
    };
    entries.set(key, entry);
    layer.append(el);
    tasks.append(task);
    render(entry);
    el.addEventListener("pointerdown", () => {
      if (focused !== entry) focus(entry, false);
    });
    el.addEventListener("focusin", () => {
      if (focused !== entry) focus(entry, false);
    });
    const titlebar = el.querySelector(".window-titlebar");
    titlebar.addEventListener("pointerdown", (e) => {
      if (!e.target.closest("button")) begin(e, entry, null);
    });
    titlebar.addEventListener("dblclick", (e) => {
      if (!e.target.closest("button")) maximize(entry);
    });
    titlebar.addEventListener("keydown", (e) => keyboard(e, entry));
    el.querySelectorAll("[data-resize]").forEach((handle) => {
      handle.addEventListener("pointerdown", (e) =>
        begin(e, entry, handle.dataset.resize),
      );
      handle.addEventListener("keydown", (e) => keyboard(e, entry, true));
    });
    el.querySelector('[data-action="minimize"]').addEventListener("click", () =>
      minimize(entry),
    );
    el.querySelector('[data-action="maximize"]').addEventListener("click", () =>
      maximize(entry),
    );
    el.querySelector('[data-action="close"]').addEventListener("click", () =>
      close(entry),
    );
    el.querySelector('[data-action="print"]').addEventListener("click", () => {
      focus(entry, false);
      window.print();
    });
    task.addEventListener("click", () =>
      focused === entry && !entry.minimized ? minimize(entry) : focus(entry),
    );
    apply(entry);
    focus(entry);
    return entry;
  }
  const observer = new ResizeObserver(() => {
    if (!layer.clientWidth || !layer.clientHeight) return;
    endGesture();
    entries.forEach((entry) => {
      if (entry.monitor === monitor) apply(entry);
    });
  });
  observer.observe(layer);
  return {
    open,
    lastRoute: (id) => desktops.get(id)?.last,
    hasMonitor: (id) => desktops.has(id),
    resume() {
      const entry = visibleEntries().sort(
        (a, b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex),
      )[0];
      if (entry) focus(entry);
      else {
        focused = null;
        screen.classList.add("desktop-only");
        onActive(null);
      }
      return entry;
    },
    active: () => focused,
    isActive: (entry) =>
      focused === entry &&
      !entry.el.hidden &&
      !screen.inert &&
      !document.body.classList.contains("booting"),
    setMonitor(id) {
      if (monitor === id) return;
      endGesture();
      deactivate(focused);
      focused = null;
      monitor = id;
      entries.forEach((entry) => {
        entry.el.hidden = entry.monitor !== id || entry.minimized;
        entry.el.inert = entry.el.hidden;
        entry.task.hidden = entry.monitor !== id;
        if (entry.monitor === id) apply(entry);
      });
    },
    suspend() {
      endGesture();
      deactivate(focused);
    },
    showDesktop() {
      visibleEntries().forEach(minimize);
    },
  };
}
