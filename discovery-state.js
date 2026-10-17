export const DISCOVERY_KEY = "wtb-discoveries-v1";
export const STICKERS = [
  {
    id: "terminal",
    title: "Prompt explorer",
    mark: "C:\\>",
    color: "#c7e4bc",
    hint: "There is more than one way to Run a program.",
    detail: "Found the secret DOS prompt.",
  },
  {
    id: "floppy",
    title: "Disk detective",
    mark: "A:",
    color: "#e9c787",
    hint: "That floppy on the desk looks suspicious.",
    detail: "Opened the mysterious floppy disk.",
  },
  {
    id: "rune",
    title: "Rune keeper",
    mark: "ᚱ",
    color: "#c9c4ef",
    hint: "The floppy has a guardian. Read its clues.",
    detail: "Completed the three-rune encounter.",
  },
  {
    id: "incident",
    title: "Friday survivor",
    mark: "OK",
    color: "#b6dfdf",
    hint: "A pager is waiting for an engineer.",
    detail: "Diagnosed, repaired, and verified the demo.",
  },
];
const names = new Set(["terminal", "floppy", "incident", "stickers"]);
export function normalizeDiscoveries(raw) {
  const bounded = (n) =>
    Number.isInteger(n) ? Math.max(0, Math.min(3, n)) : 0;
  return {
    version: 1,
    discovered: Array.isArray(raw?.discovered)
      ? [...new Set(raw.discovered.filter((id) => names.has(id)))]
      : [],
    stickers: Array.isArray(raw?.stickers)
      ? [
          ...new Set(
            raw.stickers.filter((id) => STICKERS.some((s) => s.id === id)),
          ),
        ]
      : [],
    runeStep: bounded(raw?.runeStep),
    incidentStep: bounded(raw?.incidentStep),
  };
}
export function createDiscoveryStore(storage) {
  let state;
  try {
    state = normalizeDiscoveries(JSON.parse(storage.getItem(DISCOVERY_KEY)));
  } catch {
    state = normalizeDiscoveries();
  }
  const listeners = new Set();
  let persistent = true;
  const snapshot = () => structuredClone(state);
  function update(change) {
    const next = normalizeDiscoveries({ ...state, ...change });
    if (JSON.stringify(next) === JSON.stringify(state)) return;
    state = next;
    try {
      storage.setItem(DISCOVERY_KEY, JSON.stringify(state));
    } catch {
      persistent = false;
    }
    listeners.forEach((fn) => fn(snapshot()));
  }
  return {
    snapshot,
    isPersistent: () => persistent,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    discover(id) {
      update({ discovered: [...state.discovered, id] });
    },
    award(id) {
      if (state.stickers.includes(id)) return false;
      update({ stickers: [...state.stickers, id] });
      return true;
    },
    progress(kind, step) {
      update({ [kind === "rune" ? "runeStep" : "incidentStep"]: step });
    },
  };
}
