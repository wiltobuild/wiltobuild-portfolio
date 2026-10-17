const STORAGE_KEY = "wtb-desktop-icons-v1";
const clamp = (n, max = 1) => Math.max(0, Math.min(max, n));

export function arrangeDesktopIcons(screens, pointOnScreen, onSaveError) {
  let saved = {};
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (value && typeof value === "object" && !Array.isArray(value))
      saved = value;
  } catch {
    /* A missing or invalid layout starts with the normal desktop grid. */
  }
  let warned = false;
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      if (!warned) onSaveError?.();
      warned = true;
    }
  }
  screens.forEach((screen, id) => {
    const area = screen.querySelector(".desktop-icons");
    const icons = [...area.querySelectorAll("a")];
    const positions = new Map();
    const previous = saved[id];
    saved[id] = {};
    for (const icon of icons) {
      const value = previous?.[icon.hash.slice(1)];
      if (Number.isFinite(value?.x) && Number.isFinite(value?.y))
        saved[id][icon.hash.slice(1)] = {
          x: clamp(value.x),
          y: clamp(value.y),
        };
      icon.draggable = false;
      icon.title = "Drag to arrange · Alt + arrow keys to move";
      icon.setAttribute("aria-describedby", `${id}-icon-help`);
    }
    const help = document.createElement("p");
    help.id = `${id}-icon-help`;
    help.className = "sr-only";
    help.textContent =
      "Drag icons anywhere on this desktop. Positions are saved for each monitor. Alt and arrow keys move the focused icon; add Shift for smaller steps. Enter opens the application.";
    screen.append(help);
    area.classList.add("free-icons");
    let gesture = null,
      suppressClick = null;
    const limits = () => ({
      x: Math.max(0, area.clientWidth - 90),
      y: Math.max(0, area.clientHeight - 76),
    });
    function place(icon, x, y) {
      const max = limits();
      const p = { x: clamp(x, max.x), y: clamp(y, max.y) };
      positions.set(icon, p);
      icon.style.left = `${p.x}px`;
      icon.style.top = `${p.y}px`;
      return p;
    }
    function remember(icon) {
      const p = positions.get(icon),
        max = limits();
      saved[id][icon.hash.slice(1)] = {
        x: max.x ? p.x / max.x : 0,
        y: max.y ? p.y / max.y : 0,
      };
      save();
    }
    function layout() {
      if (!area.clientWidth || !area.clientHeight) return;
      if (gesture) finish(false);
      const columns = Math.max(1, Math.floor((area.clientWidth + 4) / 94));
      const step = (area.clientWidth + 4) / columns;
      const max = limits();
      icons.forEach((icon, index) => {
        const p = saved[id][icon.hash.slice(1)];
        place(
          icon,
          p ? p.x * max.x : (index % columns) * step,
          p ? p.y * max.y : Math.floor(index / columns) * 84,
        );
      });
    }
    function point(event) {
      const projected = pointOnScreen(id, event.clientX, event.clientY);
      if (projected) return projected;
      const rect = area.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) * area.clientWidth) / rect.width,
        y: ((event.clientY - rect.top) * area.clientHeight) / rect.height,
      };
    }
    function finish(commit) {
      if (!gesture) return;
      const g = gesture;
      gesture = null;
      if (g.moved) {
        suppressClick = g.icon;
        if (commit) remember(g.icon);
        else place(g.icon, g.start.x, g.start.y);
      }
      g.icon.classList.remove("dragging-icon");
      document.body.classList.remove("dragging-desktop-icon");
      if (g.icon.hasPointerCapture(g.pointerId))
        g.icon.releasePointerCapture(g.pointerId);
    }
    area.addEventListener("pointerdown", (event) => {
      const icon = event.target.closest("a");
      if (
        !icon ||
        !area.contains(icon) ||
        event.button !== 0 ||
        !event.isPrimary ||
        screen.inert
      )
        return;
      suppressClick = null;
      const start = positions.get(icon);
      if (!start) return;
      icon.focus({ preventScroll: true });
      gesture = {
        icon,
        start: { ...start },
        origin: point(event),
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        moved: false,
      };
      icon.setPointerCapture(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    });
    area.addEventListener("pointermove", (event) => {
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      const g = gesture;
      if (
        !g.moved &&
        Math.hypot(event.clientX - g.clientX, event.clientY - g.clientY) < 5
      )
        return;
      g.moved = true;
      g.icon.classList.add("dragging-icon");
      document.body.classList.add("dragging-desktop-icon");
      const p = point(event);
      place(g.icon, g.start.x + p.x - g.origin.x, g.start.y + p.y - g.origin.y);
      event.preventDefault();
      event.stopPropagation();
    });
    area.addEventListener("pointerup", (event) => {
      if (gesture?.pointerId === event.pointerId) finish(true);
    });
    area.addEventListener("pointercancel", () => finish(false));
    area.addEventListener("lostpointercapture", () => finish(false));
    window.addEventListener("blur", () => finish(false));
    area.addEventListener(
      "click",
      (event) => {
        if (suppressClick && event.target.closest("a") === suppressClick) {
          suppressClick = null;
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true,
    );
    area.addEventListener("dragstart", (event) => event.preventDefault());
    area.addEventListener("keydown", (event) => {
      const icon = event.target.closest("a");
      suppressClick = null;
      if (event.key === "Escape" && gesture) {
        event.preventDefault();
        event.stopPropagation();
        finish(false);
        return;
      }
      if (!icon || !event.altKey || !event.key.startsWith("Arrow")) return;
      event.preventDefault();
      event.stopPropagation();
      const p = positions.get(icon),
        step = event.shiftKey ? 1 : 10;
      if (!p) return;
      place(
        icon,
        p.x +
          (event.key === "ArrowRight"
            ? step
            : event.key === "ArrowLeft"
              ? -step
              : 0),
        p.y +
          (event.key === "ArrowDown"
            ? step
            : event.key === "ArrowUp"
              ? -step
              : 0),
      );
      remember(icon);
    });
    new ResizeObserver(layout).observe(area);
    layout();
  });
}
