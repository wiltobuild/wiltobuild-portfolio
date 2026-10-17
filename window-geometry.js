const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function normalizeRect(rect, bounds) {
  return {
    x: rect.x / bounds.width,
    y: rect.y / bounds.height,
    w: rect.w / bounds.width,
    h: rect.h / bounds.height,
  };
}
export function restoreRect(rect, bounds) {
  const valid =
    rect && ["x", "y", "w", "h"].every((k) => Number.isFinite(rect[k]));
  const r = valid ? rect : { x: 0.1, y: 0.05, w: 0.8, h: 0.85 };
  return fitWindow(
    {
      x: r.x * bounds.width,
      y: r.y * bounds.height,
      w: r.w * bounds.width,
      h: r.h * bounds.height,
    },
    bounds,
  );
}

export function fitWindow(rect, bounds) {
  const width = Math.max(1, bounds.width - 4);
  const height = Math.max(1, bounds.height - 4);
  const w = clamp(rect.w, Math.min(280, width), width);
  const h = clamp(rect.h, Math.min(170, height), height);
  return {
    x: clamp(rect.x, 2, Math.max(2, bounds.width - w - 2)),
    y: clamp(rect.y, 2, Math.max(2, bounds.height - h - 2)),
    w,
    h,
  };
}

export function resizeWindow(rect, edge, dx, dy, bounds) {
  const minW = Math.min(280, bounds.width - 4);
  const minH = Math.min(170, bounds.height - 4);
  let left = rect.x,
    top = rect.y,
    right = rect.x + rect.w,
    bottom = rect.y + rect.h;
  if (edge.includes("w")) left = clamp(left + dx, 2, right - minW);
  if (edge.includes("e"))
    right = clamp(right + dx, left + minW, bounds.width - 2);
  if (edge.includes("n")) top = clamp(top + dy, 2, bottom - minH);
  if (edge.includes("s"))
    bottom = clamp(bottom + dy, top + minH, bounds.height - 2);
  return fitWindow(
    { x: left, y: top, w: right - left, h: bottom - top },
    bounds,
  );
}
