import {
  fitWindow,
  resizeWindow,
  normalizeRect,
  restoreRect,
  monitorEdgeDirection,
} from "./window-geometry.js?v=doom-20261018";

const STORAGE = "wtb-desktop-layout-v2";
const monitorIds = ["about", "projects", "contact"];
export function createWindowManager({
  screens,
  titles,
  render,
  onActive,
  onTransfer,
  onFollow,
  pointOnScreen,
  hitScreen,
}) {
  const entries = new Map(),
    desktops = new Map();
  let monitor = "projects",
    focused = null,
    z = 1,
    gesture = null,
    restoring = false;
  const screenFor = (id) => screens.get(id);
  const layerFor = (id) => screenFor(id).querySelector(".role-window-layer");
  const tasksFor = (id) => screenFor(id).querySelector(".role-taskbar-windows");
  const bounds = (id) => ({
    width: layerFor(id).clientWidth || 960,
    height: layerFor(id).clientHeight || 640,
  });
  const visibleEntries = () =>
    [...entries.values()].filter((e) => e.monitor === monitor && !e.minimized);
  const ghost = document.querySelector("#window-drag-ghost");
  function save() {
    if (restoring) return;
    try {
      localStorage.setItem(
        STORAGE,
        JSON.stringify({
          version: 2,
          windows: [...entries.values()].map((e) => ({
            name: e.name,
            monitor: e.monitor,
            rect: normalizeRect(e.rect, bounds(e.monitor)),
            minimized: e.minimized,
            maximized: e.maximized,
            z: Number(e.el.style.zIndex) || 1,
          })),
        }),
      );
    } catch {
      /* Private browsing can disable persistence; the desktop still works. */
    }
  }
  function deactivate(entry) {
    if (!entry) return;
    entry.el.classList.remove("is-active");
    entry.el.dispatchEvent(new Event("desktop:deactivate"));
    entry.task.setAttribute("aria-pressed", "false");
    entry.task.setAttribute("aria-label", `Activate ${titles[entry.name]}`);
  }
  function focus(entry, moveFocus = true) {
    if (!entry) return;
    if (focused !== entry) deactivate(focused);
    monitor = entry.monitor;
    focused = entry;
    desktops.set(monitor, entry.name);
    entry.minimized = false;
    entry.el.hidden = false;
    entry.el.classList.add("is-active");
    entry.el.style.zIndex = String(++z);
    entry.task.setAttribute("aria-pressed", "true");
    entry.task.setAttribute("aria-label", `Minimize ${titles[entry.name]}`);
    screenFor(monitor).classList.remove("desktop-only");
    onActive(entry);
    if (moveFocus && !screenFor(monitor).inert)
      entry.content.focus({ preventScroll: true });
  }
  function focusNext() {
    const next = visibleEntries().sort(
      (a, b) => +b.el.style.zIndex - +a.el.style.zIndex,
    )[0];
    if (next) focus(next);
    else {
      deactivate(focused);
      focused = null;
      screenFor(monitor).classList.add("desktop-only");
      onActive(null);
    }
  }
  function apply(entry) {
    const b = bounds(entry.monitor);
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
    entry.el.querySelector("[data-move-monitor]").value = entry.monitor;
  }
  function maximize(entry) {
    focus(entry, false);
    entry.maximized = !entry.maximized;
    apply(entry);
    save();
  }
  function minimize(entry) {
    deactivate(entry);
    entry.minimized = true;
    entry.el.hidden = true;
    entry.task.setAttribute("aria-label", `Restore ${titles[entry.name]}`);
    if (focused === entry) {
      focused = null;
      focusNext();
    }
    save();
  }
  function close(entry) {
    deactivate(entry);
    entry.cleanup?.();
    entry.el.remove();
    entry.task.remove();
    entries.delete(entry.name);
    if (focused === entry) {
      focused = null;
      focusNext();
    }
    if (desktops.get(entry.monitor) === entry.name)
      desktops.delete(entry.monitor);
    save();
  }
  function moveNode(parent, node) {
    // moveBefore preserves iframe browsing contexts, including an in-progress game.
    if (parent.moveBefore && node.isConnected) parent.moveBefore(node, null);
    else parent.append(node);
  }
  function transfer(entry, id, rect = entry.rect, following = false) {
    if (!screens.has(id)) return;
    const old = entry.monitor;
    entry.monitor = id;
    entry.el.dataset.monitorWindow = id;
    if (old !== id) {
      moveNode(layerFor(id), entry.el);
      moveNode(tasksFor(id), entry.task);
    }
    entry.rect = fitWindow(rect, bounds(id));
    apply(entry);
    focus(entry, false);
    save();
    if (old !== id) onTransfer(entry, following);
  }
  function point(event, id) {
    const projected = pointOnScreen?.(id, event.clientX, event.clientY);
    if (projected) return projected;
    const layer = layerFor(id),
      r = layer.getBoundingClientRect();
    return {
      x: ((event.clientX - r.left) * layer.clientWidth) / r.width,
      y: ((event.clientY - r.top) * layer.clientHeight) / r.height,
    };
  }
  function dropTarget(event) {
    return (
      document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest("[data-drop-monitor]")?.dataset.dropMonitor ||
      hitScreen?.(event.clientX, event.clientY)
    );
  }
  function endGesture(event) {
    if (!gesture || (event && event.pointerId !== gesture.id)) return;
    const g = gesture;
    cancelAnimationFrame(g.frame);
    if (event?.type === "pointerup" && !g.edge && g.arranged) {
      const id = dropTarget(event);
      if (id && id !== g.entry.monitor) {
        const p = point(event, id),
          b = bounds(id);
        g.entry.maximized = false;
        transfer(g.entry, id, {
          ...g.entry.rect,
          x: Math.min(b.width, p.x) - g.offset.x,
          y: Math.min(b.height, p.y) - g.offset.y,
        });
      }
    }
    g.entry.el.classList.remove("is-moving");
    if (document.documentElement.hasPointerCapture(g.id))
      document.documentElement.releasePointerCapture(g.id);
    gesture = null;
    ghost.hidden = true;
    document.body.classList.remove("dragging-window");
    screens.forEach((s) =>
      s.classList.remove("manipulating-window", "drop-target"),
    );
    document
      .querySelectorAll("[data-drop-monitor]")
      .forEach((b) => b.classList.remove("drop-target"));
    save();
  }
  function begin(event, entry, edge) {
    if (event.button !== 0 || screenFor(entry.monitor).inert) return;
    if (edge && entry.maximized) return;
    event.preventDefault();
    event.stopPropagation();
    focus(entry, false);
    const p = point(event, entry.monitor);
    if (entry.maximized) {
      entry.maximized = false;
      entry.rect.x = Math.max(2, p.x - entry.rect.w / 2);
      entry.rect.y = Math.max(2, p.y - 12);
      apply(entry);
    }
    gesture = {
      entry,
      edge,
      point: p,
      rect: { ...entry.rect },
      offset: { x: p.x - entry.rect.x, y: p.y - entry.rect.y },
      id: event.pointerId,
      arranged: document.body.classList.contains("arrange-mode"),
      client: { clientX: event.clientX, clientY: event.clientY },
      startX: event.clientX,
      following: false,
      edgeArmed: true,
      frame: 0,
    };
    document.documentElement.setPointerCapture(event.pointerId);
    entry.el.classList.add("is-moving");
    screens.forEach((s) => s.classList.add("manipulating-window"));
    document.body.classList.add("dragging-window");
  }
  function followPointer(g) {
    if (gesture !== g || !g.following) return;
    const p = point(g.client, g.entry.monitor);
    const b = bounds(g.entry.monitor);
    // Until the new screen reaches the pointer, keep the entering edge and
    // vertical position. Projecting onto a still-distant screen would jump.
    if (p.x >= 0 && p.x <= b.width && p.y >= 0 && p.y <= b.height) {
      g.entry.rect = fitWindow(
        { ...g.entry.rect, x: p.x - g.offset.x, y: p.y - g.offset.y },
        b,
      );
      apply(g.entry);
    }
    g.frame = requestAnimationFrame(() => followPointer(g));
  }
  window.addEventListener("pointermove", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const g = gesture,
      e = g.entry,
      p = point(event, e.monitor),
      b = bounds(e.monitor);
    g.client = { clientX: event.clientX, clientY: event.clientY };
    if (!g.edge && !g.arranged) {
      if (g.following) return;
      if (
        !g.following &&
        !g.edgeArmed &&
        p.x > b.width * 0.18 &&
        p.x < b.width * 0.82
      ) {
        g.edgeArmed = true;
        g.startX = event.clientX;
      }
      const direction =
        !g.following &&
        g.edgeArmed &&
        p.y > -24 &&
        p.y < b.height + 24 &&
        monitorEdgeDirection(p.x, b.width, event.clientX - g.startX);
      const next =
        direction && monitorIds[monitorIds.indexOf(e.monitor) + direction];
      if (next) {
        g.following = true;
        g.edgeArmed = false;
        transfer(
          e,
          next,
          {
            ...e.rect,
            x: direction > 0 ? 2 : bounds(next).width - e.rect.w - 2,
          },
          true,
        );
        const flight = onFollow(e);
        followPointer(g);
        Promise.resolve(flight).finally(() => {
          if (gesture !== g) return;
          g.following = false;
          cancelAnimationFrame(g.frame);
          g.startX = g.client.clientX;
        });
        return;
      }
      e.rect = fitWindow(
        { ...e.rect, x: p.x - g.offset.x, y: p.y - g.offset.y },
        b,
      );
      apply(e);
      return;
    }
    const id = !g.edge && dropTarget(event);
    screens.forEach((s, key) =>
      s.classList.toggle("drop-target", id === key && key !== e.monitor),
    );
    document
      .querySelectorAll("[data-drop-monitor]")
      .forEach((button) =>
        button.classList.toggle(
          "drop-target",
          button.dataset.dropMonitor === id,
        ),
      );
    if ((!g.edge && id && id !== e.monitor) || (!g.edge && g.arranged && !id)) {
      ghost.textContent = `▰ ${titles[e.name]}${id ? " → Screen " + (monitorIds.indexOf(id) + 1) : " · drop on a screen"}`;
      ghost.hidden = false;
      ghost.style.left = `${event.clientX + 14}px`;
      ghost.style.top = `${event.clientY + 14}px`;
    } else {
      ghost.hidden = true;
      e.rect = g.edge
        ? resizeWindow(g.rect, g.edge, p.x - g.point.x, p.y - g.point.y, b)
        : fitWindow({ ...e.rect, x: p.x - g.offset.x, y: p.y - g.offset.y }, b);
      apply(e);
    }
  });
  window.addEventListener("pointerup", endGesture);
  window.addEventListener("pointercancel", endGesture);
  window.addEventListener("blur", () => endGesture());
  function keyboard(event, entry, resize = false) {
    if (event.target !== event.currentTarget || !event.key.startsWith("Arrow"))
      return;
    event.preventDefault();
    event.stopPropagation();
    const dx =
        event.key === "ArrowRight" ? 10 : event.key === "ArrowLeft" ? -10 : 0,
      dy = event.key === "ArrowDown" ? 10 : event.key === "ArrowUp" ? -10 : 0;
    if (event.ctrlKey && event.shiftKey && dx) {
      const next =
        monitorIds[monitorIds.indexOf(entry.monitor) + Math.sign(dx)];
      if (next) transfer(entry, next);
      return;
    }
    if (entry.maximized) return;
    entry.rect =
      resize || event.shiftKey
        ? resizeWindow(entry.rect, "se", dx, dy, bounds(entry.monitor))
        : fitWindow(
            { ...entry.rect, x: entry.rect.x + dx, y: entry.rect.y + dy },
            bounds(entry.monitor),
          );
    apply(entry);
    save();
  }
  function open(name, options = {}) {
    if (entries.has(name)) {
      const e = entries.get(name);
      focus(e);
      return e;
    }
    const id = options.monitor || monitor,
      b = bounds(id),
      count = [...entries.values()].filter((e) => e.monitor === id).length,
      key = `app-${name}`;
    const el = document.createElement("section");
    el.className = "app-window";
    el.dataset.app = name;
    el.dataset.monitorWindow = id;
    el.setAttribute("aria-labelledby", `${key}-title`);
    el.innerHTML = `<header class="window-titlebar" tabindex="0" aria-label="Move ${titles[name]} window"><h2 id="${key}-title">${titles[name]}</h2><div class="window-buttons"><button data-action="minimize" aria-label="Minimize ${titles[name]}">_</button><button data-action="maximize" aria-label="Maximize ${titles[name]}" aria-pressed="false">□</button><button data-action="close" aria-label="Close ${titles[name]}">×</button></div></header><div class="window-menubar"><span>C:\\WIL\\${name.toUpperCase()}</span><label>Move to <select data-move-monitor aria-label="Move ${titles[name]} to monitor"><option value="about">01 · Left</option><option value="projects">02 · Middle</option><option value="contact">03 · Right</option></select></label><button data-action="print">Print</button></div><div class="window-content" tabindex="0"></div><footer class="window-status"><span class="window-status-text">Ready · positions saved automatically</span><span>Desktop 95 / Personal edition</span></footer>${["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((edge) => `<${edge === "se" ? "button" : "span"} class="resize-handle resize-${edge}" data-resize="${edge}" ${edge === "se" ? `aria-label="Resize ${titles[name]} window" title="Drag to resize; arrow keys also resize"` : 'aria-hidden="true"'}></${edge === "se" ? "button" : "span"}>`).join("")}`;
    const task = document.createElement("button");
    task.className = "window-task";
    task.textContent = titles[name];
    task.title = titles[name];
    const entry = {
      key,
      name,
      monitor: id,
      el,
      task,
      content: el.querySelector(".window-content"),
      minimized: false,
      maximized: !!options.maximized,
      cleanup: null,
      projectIndex: 0,
      rect: options.rect
        ? restoreRect(options.rect, b)
        : fitWindow(
            {
              x: b.width < 550 ? 7 : 88 + (count % 4) * 25,
              y: 14 + (count % 4) * 25,
              w: b.width * (b.width < 550 ? 0.94 : 0.82),
              h: b.height * 0.85,
            },
            b,
          ),
    };
    entries.set(name, entry);
    layerFor(id).append(el);
    tasksFor(id).append(task);
    render(entry);
    el.addEventListener("pointerdown", () => {
      if (focused !== entry) focus(entry, false);
    });
    el.addEventListener("focusin", () => {
      if (focused !== entry) focus(entry, false);
    });
    const bar = el.querySelector(".window-titlebar");
    bar.addEventListener("pointerdown", (e) => {
      if (!e.target.closest("button")) begin(e, entry, null);
    });
    bar.addEventListener("dblclick", (e) => {
      if (!e.target.closest("button")) maximize(entry);
    });
    bar.addEventListener("keydown", (e) => keyboard(e, entry));
    el.querySelectorAll("[data-resize]").forEach((h) => {
      h.addEventListener("pointerdown", (e) =>
        begin(e, entry, h.dataset.resize),
      );
      h.addEventListener("keydown", (e) => keyboard(e, entry, true));
    });
    el.querySelector('[data-action="minimize"]').onclick = () =>
      minimize(entry);
    el.querySelector('[data-action="maximize"]').onclick = () =>
      maximize(entry);
    el.querySelector('[data-action="close"]').onclick = () => close(entry);
    el.querySelector('[data-action="print"]').onclick = () => {
      focus(entry, false);
      window.print();
    };
    el.querySelector("[data-move-monitor]").onchange = (e) =>
      transfer(entry, e.target.value);
    task.onclick = () => {
      focused === entry && !entry.minimized ? minimize(entry) : focus(entry);
      save();
    };
    apply(entry);
    focus(entry, !restoring);
    if (options.minimized) minimize(entry);
    save();
    return entry;
  }
  const previousBounds = new Map();
  const observer = new ResizeObserver(() => {
    for (const [id] of screens) {
      if (!layerFor(id).clientWidth || !layerFor(id).clientHeight) continue;
      const b = bounds(id),
        old = previousBounds.get(id);
      if (old && (old.width !== b.width || old.height !== b.height))
        for (const e of entries.values())
          if (e.monitor === id) {
            e.rect = restoreRect(normalizeRect(e.rect, old), b);
            apply(e);
          }
      previousBounds.set(id, b);
    }
  });
  screens.forEach((_, id) => observer.observe(layerFor(id)));
  window.addEventListener("pagehide", save);
  return {
    open,
    closeApp(name) {
      const entry = entries.get(name);
      if (entry) close(entry);
    },
    active: () => focused,
    monitorOf: (name) => entries.get(name)?.monitor,
    lastRoute: (id) => desktops.get(id),
    hasMonitor: (id) => desktops.has(id),
    initialize() {
      restoring = true;
      // Hidden templates have no usable bounds. Establish the real screen size
      // before restoring so the first observer callback cannot rescale it twice.
      screens.forEach((_, id) => previousBounds.set(id, bounds(id)));
      let saved;
      try {
        saved = JSON.parse(localStorage.getItem(STORAGE));
      } catch {}
      if (saved?.version === 2 && Array.isArray(saved.windows)) {
        saved.windows
          .filter(
            (e) => e && Object.hasOwn(titles, e.name) && screens.has(e.monitor),
          )
          .sort((a, b) => a.z - b.z)
          .forEach((e) => open(e.name, e));
      } else {
        open("runelord", { monitor: "about", maximized: true });
        open("contact", { monitor: "contact" });
      }
      // Make About the landing window without resetting other windows or icon positions.
      const landing = open("about", { monitor: "projects", maximized: true });
      landing.maximized = true;
      apply(landing);
      restoring = false;
      deactivate(focused);
      focused = null;
      screens.forEach((_, id) => previousBounds.set(id, bounds(id)));
      save();
    },
    resume() {
      focusNext();
      return focused;
    },
    isActive: (entry) =>
      focused === entry &&
      !entry.el.hidden &&
      !screenFor(entry.monitor).inert &&
      !document.body.classList.contains("booting"),
    setMonitor(id) {
      if (monitor !== id) {
        deactivate(focused);
        focused = null;
        monitor = id;
      }
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
