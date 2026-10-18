import {
  createDiscoveryStore,
  STICKERS,
} from "./discovery-state.js?v=doom-20261018";

export const EGG_TITLES = {
  terminal: "MS-DOS Prompt",
  floppy: "Rune archive — The forgotten rune",
  incident: "Pager 95 — Demo rescue",
  stickers: "My sticker album",
};
export const eggPage = () => '<div class="egg-app"></div>';
const runeRounds = [
  {
    name: "The bramble gate",
    clue: "Roots grip the lock. A warm spark will set it free.",
    answer: "ember",
    success: "The roots retreat. The first seal opens.",
  },
  {
    name: "The flooded stair",
    clue: "The stepping stones sleep beneath a rising tide. Still the water.",
    answer: "frost",
    success: "The tide freezes into a bridge. The second seal opens.",
  },
  {
    name: "The silent bell",
    clue: "A bell hangs beyond your reach. It needs a breath of moving air.",
    answer: "gale",
    success: "The bell rings. The guardian bows. The archive is yours.",
  },
];
const incidents = [
  {
    title: "01 / Find the boundary",
    text: "Friday, 16:55. The client can open the demo, but saving a ticket fails. The API health check passes. A browser request shows 403 with an origin-denied message. The new demo hostname is absent from the API’s allowed origins.",
    choices: [
      "Restart every service",
      "Compare the failed request with the origin configuration",
      "Disable all access checks",
    ],
    correct: 1,
    why: "Trace the observed failure first. A healthy API and an explicit origin error point to the browser-to-API boundary—not a general outage.",
    success:
      "Diagnosis confirmed: the new demo origin is missing. Authentication is healthy.",
  },
  {
    title: "02 / Make a bounded repair",
    text: "The intended demo hostname is confirmed with the client. The configuration change is ready for the preview environment. Which repair keeps the boundary intact?",
    choices: [
      "Allow every origin",
      "Remove authentication for the demo",
      "Add only the approved demo origin and keep authentication enabled",
    ],
    correct: 2,
    why: "Use the smallest change that addresses the evidence. A wildcard or disabled authentication would widen access unnecessarily.",
    success:
      "The approved origin is added to the preview configuration. Access checks remain enabled.",
  },
  {
    title: "03 / Verify and hand off",
    text: "The preview configuration is deployed. The health check is still green. What makes this ready for the client?",
    choices: [
      "Run the client’s save-and-reload flow, check rejected origins, then document the change and rollback",
      "Declare success because the health check passes",
      "Close the ticket without testing the browser",
    ],
    correct: 0,
    why: "Verify the original user workflow and the boundary you changed. A health check alone cannot prove that a browser can save a ticket.",
    success:
      "Ticket saved and reloaded. Unapproved origins are still rejected. Handoff and rollback notes delivered.",
  },
];

export function createEasterEggs({ navigate, toast, onChange, onReadDisk }) {
  let diskLoaded = false;
  const diskListeners = new Set();
  let storage;
  try {
    storage = localStorage;
  } catch {
    storage = {
      getItem() {
        return null;
      },
      setItem() {
        throw new Error("Storage unavailable");
      },
    };
  }
  const store = createDiscoveryStore(storage);
  store.subscribe(onChange);
  function award(id) {
    if (store.award(id))
      toast(`Sticker unlocked: ${STICKERS.find((s) => s.id === id).title}`);
  }
  function mount(entry) {
    const root = entry.content.querySelector(".egg-app");
    store.discover(entry.name);
    if (entry.name === "terminal") {
      award("terminal");
      mountTerminal(root);
    }
    if (entry.name === "floppy") {
      award("floppy");
      entry.cleanup = mountFloppy(root);
    }
    if (entry.name === "incident") mountIncident(root);
    if (entry.name === "stickers") {
      const render = () => renderAlbum(root);
      render();
      entry.cleanup = store.subscribe(render);
    }
  }
  function mountTerminal(root) {
    root.innerHTML = `<div class="dos-shell"><p>Wil DOS [Version 95.10]<br>Personal workstation · simulated shell</p><p>Type HELP for commands. This prompt only controls this portfolio.</p><div class="dos-output" role="log" aria-label="Terminal output" aria-live="polite" aria-relevant="additions"></div><form class="dos-form"><label>C:\\WIL&gt; <input aria-label="DOS command" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="160"></label><button type="submit">Enter</button></form></div>`;
    const input = root.querySelector("input"),
      output = root.querySelector(".dos-output"),
      history = [];
    let cursor = 0;
    const print = (message) => {
      const line = document.createElement("p");
      line.textContent = message;
      output.append(line);
      while (output.children.length > 80) output.firstElementChild.remove();
    };
    const routes = {
      "a:": "doom",
      floppy: "doom",
      "doom.exe": "doom",
      "rune.exe": "floppy",
      "incident.exe": "incident",
      stickers: "stickers",
      projects: "projects",
      about: "about",
      contact: "contact",
      "runelord.exe": "runelord",
      "runespeak.exe": "runespeak",
      "sudo hire wil": "contact",
      "deploy --friday": "incident",
    };
    root.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = input.value.trim(),
        cmd = raw.toLowerCase().replace(/\s+/g, " ");
      if (!cmd) return;
      history.push(raw);
      cursor = history.length;
      input.value = "";
      print(`C:\\WIL> ${raw}`);
      if (cmd === "cls" || cmd === "clear") output.replaceChildren();
      else if (cmd === "help")
        print(
          "HELP  DIR  WHOAMI  CLS  EXIT\nPROJECTS / ABOUT / CONTACT — open portfolio files\nA: — inspect the floppy drive\nINCIDENT.EXE — answer the pager\nSTICKERS — view your discoveries\nRUNELORD.EXE / RUNESPEAK.EXE — launch a game\nPsst… try DEPLOY --FRIDAY or SUDO HIRE WIL.",
        );
      else if (cmd === "dir")
        print(
          "Directory of C:\\WIL\nABOUT.TXT       PROJECTS/       CONTACT.TXT\nINCIDENT.EXE    STICKERS.DAT    COMMAND.COM\nA:  DEFINITELY_NOT_A_GAME — disk ready",
        );
      else if (cmd === "whoami")
        print(
          "William Sheppard\nForward Deployed Engineer / Product & Software Engineer\n10+ years deploying complex systems on-site with clients.\nType ABOUT to read the story, or PROJECTS to try the work.",
        );
      else if (cmd === "exit") entryClose(root);
      else if (routes[cmd]) {
        print(`Opening ${routes[cmd]}…`);
        navigate(routes[cmd]);
      } else
        print(
          `Bad command or file name: ${raw}\nType HELP for available commands.`,
        );
      input.scrollIntoView({ block: "nearest" });
    });
    input.addEventListener("keydown", (e) => {
      if (!["ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      cursor = Math.max(
        0,
        Math.min(history.length, cursor + (e.key === "ArrowUp" ? -1 : 1)),
      );
      input.value = history[cursor] || "";
    });
  }
  function entryClose(root) {
    root.closest(".app-window").querySelector('[data-action="close"]').click();
  }
  function mountFloppy(root) {
    let feedback = "",
      loaded = diskLoaded;
    function render() {
      const step = store.snapshot().runeStep,
        won = step === 3;
      root.innerHTML = `<div class="egg-panel"><p class="egg-eyebrow">A: / 1.44 MB / ARCHIVE RECOVERED</p><h3>The forgotten rune</h3><p class="egg-caption">A tiny standalone encounter from Wil’s workstation. Three seals. No timer. Your progress is saved.</p>${!loaded && !won ? `<div class="disk-art" aria-hidden="true"><span>DEFINITELY<br>NOT A GAME</span></div><p>The disk label is suspiciously specific.</p><button data-egg="load">Read disk / begin encounter</button>` : won ? `<div class="rune-sprite victory" aria-hidden="true">ᚱ</div><h4>Archive restored!</h4><p>The guardian leaves you a rune trophy and a sticker. Look for both on the computer when you return to the desk.</p><div class="egg-actions"><button data-egg="replay">Play again</button><a href="#stickers">View stickers</a><a href="#runelord">Play the full RuneLord game →</a></div>` : `<div class="rune-stage"><div class="rune-sprite" aria-hidden="true">ᚱ</div><div><p class="egg-eyebrow">SEAL ${step + 1} OF 3</p><h4>${runeRounds[step].name}</h4><p>${runeRounds[step].clue}</p></div></div><div class="seal-meter" aria-label="${step} of 3 seals opened">${[0, 1, 2].map((i) => `<span class="${i < step ? "open" : ""}">${i < step ? "✓" : "◇"}</span>`).join("")}</div><p>Choose a rune to open the seal:</p><div class="egg-actions"><button data-rune="ember">ᚲ Ember</button><button data-rune="frost">ᛁ Frost</button><button data-rune="gale">ᚨ Gale</button></div>`}<p class="egg-feedback" role="status">${feedback}</p><p class="egg-save">${store.isPersistent() ? "Progress saved in this browser." : "Storage is unavailable. Progress lasts for this visit."}</p></div>`;
      if (loaded && !won)
        root.querySelector(".rune-sprite").innerHTML =
          `<svg viewBox="0 0 48 56" aria-hidden="true" shape-rendering="crispEdges"><path fill="#7890a8" d="M12 4h24v6h4v15h-4v4h7v17h-7v7H24v-9h-4v9H8V35h4V25H8V10h4z"/><path fill="#aab9ca" d="M14 7h18v5H14zm-1 21h21v13H13z"/><path fill="#152b40" d="M13 14h22v8H13zm5 10h12v3H18z"/><path fill="#baffed" d="M16 16h5v4h-5zm11 0h5v4h-5z"/><path fill="#243c51" d="M21 30h3v10h-3zm3 0h5v3h-5zm2 4h3v2h-3zm3 2h3v4h-3z"/><path fill="#4b627b" d="M4 32h8v14H4zm32 0h8v14h-8z"/></svg>`;
      root.querySelector('[data-egg="load"]')?.addEventListener("click", () => {
        loaded = true;
        render();
        focusFirst(root);
      });
      root
        .querySelector('[data-egg="replay"]')
        ?.addEventListener("click", () => {
          store.progress("rune", 0);
          loaded = true;
          feedback = "Your trophy and sticker stay unlocked.";
          render();
          focusFirst(root);
        });
      root.querySelectorAll("[data-rune]").forEach((button) =>
        button.addEventListener("click", () => {
          if (button.dataset.rune === runeRounds[step].answer) {
            feedback = runeRounds[step].success;
            store.progress("rune", step + 1);
            if (step === 2) award("rune");
          } else
            feedback =
              "The seal glows, but stays closed. Read the clue and try another rune. No progress lost.";
          render();
          focusFirst(root);
        }),
      );
    }
    const ready = () => {
      loaded = true;
      render();
    };
    diskListeners.add(ready);
    render();
    return () => diskListeners.delete(ready);
  }
  function mountIncident(root) {
    let feedback = "";
    function render() {
      const step = store.snapshot().incidentStep;
      root.innerHTML = `<div class="egg-panel incident-panel"><p class="egg-eyebrow">PAGER 95 / TRAINING SIMULATION</p><h3>It works locally. The client is waiting.</h3><p class="egg-caption">A fictional demo incident. No real systems are affected. Diagnose → repair → verify.</p><div class="pager-display">${step === 3 ? "RESOLVED · CLIENT VERIFIED" : `DEMO SAVE FAILED · STEP ${step + 1}/3`}</div>${step === 3 ? `<h4>Service restored. Trust preserved.</h4><p>You followed the evidence, kept access checks intact, and verified the customer’s workflow. That’s a Friday worth a sticker.</p><div class="egg-actions"><button data-replay>Replay simulation</button><a href="#stickers">View stickers</a><a href="#experience">Explore Wil’s experience →</a></div>` : `<h4>${incidents[step].title}</h4><p>${incidents[step].text}</p><div class="incident-choices">${incidents[step].choices.map((text, i) => `<button data-choice="${i}"><b>${i + 1}.</b> ${text}</button>`).join("")}</div>`}<p class="egg-feedback" role="status">${feedback}</p><p class="egg-save">${store.isPersistent() ? "Progress saved in this browser. Take your time." : "Storage is unavailable. Progress lasts for this visit."}</p></div>`;
      root.querySelector("[data-replay]")?.addEventListener("click", () => {
        store.progress("incident", 0);
        feedback = "Your sticker stays unlocked.";
        render();
        focusFirst(root);
      });
      root.querySelectorAll("[data-choice]").forEach((button) =>
        button.addEventListener("click", () => {
          if (Number(button.dataset.choice) === incidents[step].correct) {
            feedback = incidents[step].success;
            store.progress("incident", step + 1);
            if (step === 2) award("incident");
          } else
            feedback = incidents[step].why + " Try again; no progress lost.";
          render();
          focusFirst(root);
        }),
      );
    }
    render();
  }
  function renderAlbum(root) {
    const state = store.snapshot();
    root.innerHTML = `<div class="egg-panel"><p class="egg-eyebrow">PERSONAL WORKSTATION / DISCOVERIES</p><h3>Small adventures. Permanent souvenirs.</h3><p>${state.stickers.length} of ${STICKERS.length} stickers collected. Unlocked stickers also appear on the computer case.</p><div class="sticker-grid">${STICKERS.map(
      (s) => {
        const unlocked = state.stickers.includes(s.id);
        return `<article class="sticker-card ${unlocked ? "unlocked" : "locked"}"><div class="collectible-sticker" style="--sticker-color:${s.color}" aria-hidden="true">${unlocked ? s.mark : "?"}</div><h4>${unlocked ? s.title : "Undiscovered sticker"}</h4><p>${unlocked ? s.detail : s.hint}</p><span>${unlocked ? "COLLECTED ✓" : "NOT YET FOUND"}</span></article>`;
      },
    ).join(
      "",
    )}</div><div class="egg-actions">${state.discovered.includes("terminal") ? '<a href="#terminal">DOS prompt</a>' : ""}${state.discovered.includes("floppy") ? '<a href="#floppy">Floppy encounter</a>' : ""}${state.discovered.includes("incident") ? '<a href="#incident">Incident challenge</a>' : ""}<a href="#home">Back to the desk →</a></div><p class="egg-save">${store.isPersistent() ? "Saved on this device and browser. Clearing site data clears your collection." : "Browser storage is unavailable; discoveries will last for this visit only."}</p></div>`;
  }
  function focusFirst(root) {
    root.querySelector("button, a")?.focus({ preventScroll: true });
  }
  return {
    mount,
    discoverDisk() {
      store.discover("floppy");
      award("floppy");
    },
    snapshot: store.snapshot,
    diskReady() {
      diskLoaded = true;
      diskListeners.forEach((fn) => fn());
    },
  };
}
