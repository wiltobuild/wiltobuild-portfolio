const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const controller = document.querySelector("[data-controller]");
const displayScreen = document.querySelector(".display-screen");
const views = Array.from(document.querySelectorAll("[data-view]"));
const navigationButtons = Array.from(document.querySelectorAll("[data-nav]"));
const stateNavigationButtons = Array.from(document.querySelectorAll(".wordmark, .module-nav [data-nav], .mobile-dock [data-nav]"));
const screenNumber = document.querySelector("[data-screen-number]");
const screenName = document.querySelector("[data-screen-name]");
const viewKicker = document.querySelector("[data-view-kicker]");
const viewTitle = document.querySelector("[data-view-title]");
const systemStatus = document.querySelector("[data-system-status]");
const clock = document.querySelector("[data-clock]");
const footerNextButton = document.querySelector("[data-footer-next]");
const footerNextLabel = document.querySelector("[data-footer-next-label]");
const transitionFrom = document.querySelector("[data-transition-from]");
const transitionTo = document.querySelector("[data-transition-to]");
const controlToast = document.querySelector("[data-control-toast]");

const SOCIAL_URLS = {
  github: "https://github.com/wiltobuild",
  linkedin: "https://www.linkedin.com/in/william-sheppard-230a82132/",
  x: "https://x.com/WillBeBuilding"
};

const MODULES = {
  home: { number: "00", label: "Home", kicker: "System overview" },
  experience: { number: "01", label: "Experience", kicker: "Systems practice" },
  skills: { number: "02", label: "Skills", kicker: "Applied tools" },
  projects: { number: "03", label: "Projects", kicker: "Future case studies" },
  credentials: { number: "04", label: "Credentials", kicker: "Training record" },
  contact: { number: "05", label: "Contact", kicker: "Profiles and contact" }
};

const PRESETS = {
  explore: ["home", "experience", "skills", "projects", "credentials", "contact"],
  hiring: ["home", "experience", "skills", "contact"],
  technical: ["experience", "skills", "credentials", "contact"]
};

const NEXT_PROMPTS = {
  home: "Return to the system overview",
  experience: "Trace my systems experience",
  skills: "See how I apply development tools",
  projects: "Review future case study slots",
  credentials: "Review my technical training",
  contact: "Open my contact channels"
};

const EXPERIENCE_STEPS = {
  requirements: {
    title: "Clarify what the client needs the system to do.",
    application: "Define the user, task, constraints, and expected behavior before choosing tools.",
    state: "Requirement confirmed",
    activeNodes: ["client"],
    activeLinks: []
  },
  interface: {
    title: "Shape controls and feedback around the person using the room.",
    application: "Design interface states and feedback so the user can understand what the software is doing.",
    state: "Interface behavior mapped",
    activeNodes: ["client", "interface"],
    activeLinks: ["1"]
  },
  logic: {
    title: "Connect interface commands to system state and device behavior.",
    application: "Map inputs, dependencies, state changes, outputs, and failure cases before implementation.",
    state: "Control path mapped",
    activeNodes: ["client", "interface", "processor"],
    activeLinks: ["1", "2"]
  },
  troubleshooting: {
    title: "Trace faults through a working system under real constraints.",
    application: "Reproduce the problem, isolate variables, test assumptions, and verify the correction.",
    state: "Behavior verified",
    activeNodes: ["client", "interface", "processor", "devices"],
    activeLinks: ["1", "2", "3"]
  },
  handoff: {
    title: "Explain behavior to clients, technicians, and support teams.",
    application: "Document decisions clearly so the software can be understood, used, and maintained.",
    state: "System ready",
    activeNodes: ["client", "interface", "processor", "devices", "room"],
    activeLinks: ["1", "2", "3", "4"]
  }
};

const TRANSFER_STEPS = {
  understand: {
    av: "Clarify the real need, room conditions, and operating constraints.",
    software: "Define the user, task, expected behavior, and limits before choosing tools."
  },
  map: {
    av: "Trace sources, destinations, control paths, networks, and dependencies.",
    software: "Map inputs, state, logic, outputs, dependencies, and failure cases."
  },
  build: {
    av: "Program control behavior and connect devices into one usable system.",
    software: "Use Claude Code and Codex to move from a reviewed plan to a working version."
  },
  test: {
    av: "Verify operation in the actual room and isolate faults when behavior differs.",
    software: "Check expected behavior, edge cases, responsive layouts, and user flow."
  },
  explain: {
    av: "Hand off the system clearly to clients, technicians, and support teams.",
    software: "Document decisions and behavior so the result can be understood and maintained."
  }
};

const SKILL_FOCUS = {
  develop: "Turn a defined requirement into a working interface or small application.",
  troubleshoot: "Trace dependencies, isolate faults, test assumptions, and verify behavior.",
  communicate: "Explain technical decisions clearly to users, clients, and collaborators."
};

const PROJECTS = [
  {
    id: "slot-1",
    status: "Reserved",
    title: "AI workflow application",
    description: "Space for a practical application that uses an AI model to support a defined user task.",
    evidence: ["User need and limits", "Workflow and model decisions", "Observed task result"]
  },
  {
    id: "slot-2",
    status: "Reserved",
    title: "Interface case study",
    description: "Space for an interface project documented from requirements through responsive implementation.",
    evidence: ["Interface requirement", "Responsive implementation", "Usability checks"]
  },
  {
    id: "slot-3",
    status: "Planned first case study",
    title: "Primary project",
    description: "This slot is reserved for the first complete case study documenting the problem, decisions, implementation, testing, and result.",
    evidence: ["Problem and constraints", "Implementation decisions", "Testing and result"]
  },
  {
    id: "slot-4",
    status: "Reserved",
    title: "Systems utility",
    description: "Space for a small software tool informed by automation, diagnostics, or support work.",
    evidence: ["Operational problem", "Diagnostic logic", "Observed result"]
  }
];

let activeModule = "home";
let transitionRun = 0;
let activePreset = "explore";
let audioEnabled = false;
let audioContext;
let toastTimer;

function wait(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function showControlToast(message) {
  window.clearTimeout(toastTimer);
  controlToast.textContent = message;
  controlToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => controlToast.classList.remove("is-visible"), 2200);
}

function playPanelTone(frequency = 520, duration = 0.045) {
  if (!audioEnabled) return;
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.025, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function getNextModule(moduleName) {
  const sequence = PRESETS[activePreset];
  const currentIndex = sequence.indexOf(moduleName);
  if (currentIndex < 0) return sequence[0];
  return sequence[(currentIndex + 1) % sequence.length];
}

function configureSocialLinks() {
  document.querySelectorAll("[data-social]").forEach((link) => {
    const url = SOCIAL_URLS[link.dataset.social];
    if (url) link.href = url;
  });
}

function moduleFromLocation() {
  const hash = window.location.hash.replace(/^#/, "").split("/")[0];
  return MODULES[hash] ? hash : "home";
}

function updateHistory(moduleName, method = "push") {
  const hash = moduleName === "home" ? "#home" : `#${moduleName}`;
  if (window.location.hash === hash) return;
  const action = method === "replace" ? "replaceState" : "pushState";
  window.history[action]({ module: moduleName }, "", hash);
}

function setNavigationState(moduleName) {
  stateNavigationButtons.forEach((button) => {
    const isActive = button.dataset.nav === moduleName;
    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  const activeMobileButton = document.querySelector(`.mobile-dock [data-nav="${moduleName}"]`);
  activeMobileButton?.scrollIntoView({
    behavior: reduceMotion.matches ? "auto" : "smooth",
    block: "nearest",
    inline: "center"
  });
}

function updateInterface(moduleName) {
  const module = MODULES[moduleName];
  const nextName = getNextModule(moduleName);
  const nextModule = MODULES[nextName];
  screenNumber.textContent = module.number;
  screenName.textContent = module.label;
  viewKicker.textContent = module.kicker;
  viewTitle.textContent = module.label;
  footerNextButton.dataset.nextModule = nextName;
  footerNextLabel.textContent = NEXT_PROMPTS[nextName];
  footerNextLabel.dataset.mobileLabel = nextModule.label;
  footerNextButton.setAttribute("aria-label", `${NEXT_PROMPTS[nextName]}. Open ${nextModule.label}.`);
  document.title = moduleName === "home" ? "Wil Sheppard | WilToBuild" : `${module.label} | WilToBuild`;
  controller.dataset.module = moduleName;
  setNavigationState(moduleName);
}

async function activateModule(moduleName, options = {}) {
  if (!MODULES[moduleName]) moduleName = "home";
  const { updateUrl = true, focusScreen = false, animate = true } = options;

  if (moduleName === activeModule && document.querySelector(`[data-view="${moduleName}"]`).classList.contains("is-active")) {
    if (updateUrl) updateHistory(moduleName);
    return;
  }

  const runId = ++transitionRun;
  const module = MODULES[moduleName];
  transitionFrom.textContent = MODULES[activeModule].label;
  transitionTo.textContent = module.label;
  systemStatus.textContent = `Opening ${module.label}`;
  controller.classList.toggle("is-switching", animate && !reduceMotion.matches);
  playPanelTone(420);

  if (animate && !reduceMotion.matches) await wait(190);
  if (runId !== transitionRun) return;

  views.forEach((view) => {
    const isActive = view.dataset.view === moduleName;
    view.hidden = !isActive;
    view.classList.toggle("is-active", isActive);
    view.classList.remove("is-entering");
    if (isActive) {
      view.scrollTop = 0;
      void view.offsetWidth;
      if (animate && !reduceMotion.matches) view.classList.add("is-entering");
    }
  });

  activeModule = moduleName;
  updateInterface(moduleName);
  if (updateUrl) updateHistory(moduleName);

  if (animate && !reduceMotion.matches) await wait(270);
  if (runId !== transitionRun) return;
  controller.classList.remove("is-switching");
  systemStatus.textContent = `${module.label} active`;
  if (focusScreen) {
    document.querySelector(`[data-view="${moduleName}"] h1, [data-view="${moduleName}"] h2`)?.focus({ preventScroll: true });
  }
}

function createBootSequence() {
  const bootScreen = document.querySelector("[data-boot-screen]");
  const bootStatus = document.querySelector("[data-boot-status]");
  const bootPercent = document.querySelector("[data-boot-percent]");
  const bootProgress = document.querySelector("[data-boot-progress]");
  const bootSkip = document.querySelector("[data-boot-skip]");
  const forceBoot = new URLSearchParams(window.location.search).get("boot") === "1";
  const hasBooted = window.sessionStorage.getItem("wiltobuild-booted") === "true";
  let completed = false;
  let animationFrame = 0;

  controller.inert = true;
  controller.classList.add("is-booting");

  function revealController() {
    bootScreen.hidden = true;
    controller.inert = false;
    controller.classList.remove("is-booting");
    controller.classList.add("is-online");
  }

  function complete() {
    if (completed) return;
    completed = true;
    window.cancelAnimationFrame(animationFrame);
    bootProgress.style.width = "100%";
    bootPercent.textContent = "03 / 03";
    bootStatus.textContent = "Portfolio ready";
    window.sessionStorage.setItem("wiltobuild-booted", "true");
    window.setTimeout(() => {
      bootScreen.classList.add("is-complete");
      bootScreen.setAttribute("aria-hidden", "true");
      window.setTimeout(revealController, reduceMotion.matches ? 0 : 340);
    }, reduceMotion.matches ? 0 : 140);
  }

  if (reduceMotion.matches || (hasBooted && !forceBoot)) {
    bootScreen.classList.add("is-complete");
    bootScreen.setAttribute("aria-hidden", "true");
    revealController();
    return;
  }

  const duration = 1250;
  const startedAt = performance.now();
  const statuses = [
    [0, "Starting WilToBuild", "01 / 03"],
    [38, "Loading portfolio modules", "02 / 03"],
    [78, "Preparing interface", "03 / 03"]
  ];

  function render(time) {
    const progress = Math.min(100, Math.round(((time - startedAt) / duration) * 100));
    const currentStatus = statuses.reduce((current, item) => progress >= item[0] ? item : current, statuses[0]);
    bootProgress.style.width = `${progress}%`;
    bootPercent.textContent = currentStatus[2];
    bootStatus.textContent = currentStatus[1];
    if (progress >= 100) {
      complete();
      return;
    }
    animationFrame = window.requestAnimationFrame(render);
  }

  bootSkip.addEventListener("click", complete);
  animationFrame = window.requestAnimationFrame(render);
}

function createTransferConsole() {
  const buttons = Array.from(document.querySelectorAll("[data-transfer-step]"));
  const avOutput = document.querySelector("[data-transfer-av]");
  const softwareOutput = document.querySelector("[data-transfer-software]");
  const count = document.querySelector("[data-transfer-count]");
  const output = document.querySelector(".transfer-output");
  const signal = document.querySelector("[data-transfer-signal]");

  function select(stepName, focus = false) {
    const step = TRANSFER_STEPS[stepName];
    const activeIndex = buttons.findIndex((button) => button.dataset.transferStep === stepName);
    if (!step || activeIndex < 0) return;

    buttons.forEach((button, index) => {
      const isSelected = index === activeIndex;
      button.setAttribute("aria-selected", String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
      button.classList.toggle("is-upstream", index < activeIndex);
      if (isSelected && focus) button.focus();
    });

    avOutput.textContent = step.av;
    softwareOutput.textContent = step.software;
    count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(buttons.length).padStart(2, "0")}`;
    signal.style.width = `${((activeIndex + 1) / buttons.length) * 100}%`;
    signal.classList.remove("is-routing");
    void signal.offsetWidth;
    if (!reduceMotion.matches) signal.classList.add("is-routing");
    output.setAttribute("aria-labelledby", buttons[activeIndex].id);
    output.classList.remove("is-updating");
    void output.offsetWidth;
    if (!reduceMotion.matches) output.classList.add("is-updating");
    playPanelTone(500 + (activeIndex * 45));
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => select(button.dataset.transferStep));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (index + direction + buttons.length) % buttons.length;
      select(buttons[nextIndex].dataset.transferStep, true);
    });
  });
  select("understand");
}

function createExperienceWorkbench() {
  const buttons = Array.from(document.querySelectorAll("[data-experience-step]"));
  const title = document.querySelector("[data-experience-title]");
  const application = document.querySelector("[data-experience-application]");
  const counter = document.querySelector("[data-experience-counter]");
  const state = document.querySelector("[data-experience-state]");
  const detail = document.querySelector(".signal-detail");
  const systemNodes = Array.from(document.querySelectorAll("[data-system-node]"));
  const systemLinks = Array.from(document.querySelectorAll("[data-system-link]"));

  function select(stepName, focus = false) {
    const step = EXPERIENCE_STEPS[stepName];
    if (!step) return;
    const activeIndex = buttons.findIndex((button) => button.dataset.experienceStep === stepName);
    buttons.forEach((button, index) => {
      const isSelected = index === activeIndex;
      button.setAttribute("aria-selected", String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
      button.classList.toggle("is-upstream", index < activeIndex);
      if (isSelected && focus) button.focus();
    });
    systemNodes.forEach((node) => {
      const isActive = step.activeNodes.includes(node.dataset.systemNode);
      node.classList.toggle("is-active", isActive);
      node.querySelector("[data-node-state]").textContent = isActive ? "Active" : "Standby";
    });
    systemLinks.forEach((link) => {
      link.classList.toggle("is-active", step.activeLinks.includes(link.dataset.systemLink));
    });
    title.textContent = step.title;
    application.textContent = step.application;
    counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(buttons.length).padStart(2, "0")}`;
    state.textContent = step.state;
    detail.setAttribute("aria-labelledby", buttons[activeIndex].id);
    detail.classList.remove("is-updating");
    void detail.offsetWidth;
    if (!reduceMotion.matches) detail.classList.add("is-updating");
    playPanelTone(470 + (activeIndex * 55));
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => select(button.dataset.experienceStep));
    button.addEventListener("keydown", (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (index + direction + buttons.length) % buttons.length;
      select(buttons[nextIndex].dataset.experienceStep, true);
    });
  });
  select("requirements");
}

function createUtilityControls() {
  const drawer = document.querySelector("[data-utility-drawer]");
  const utilityButtons = Array.from(document.querySelectorAll("[data-utility]"));
  const closeButton = document.querySelector("[data-utility-close]");
  const panels = Array.from(document.querySelectorAll("[data-utility-panel]"));
  const sceneButtons = Array.from(document.querySelectorAll("[data-scene]"));
  const presetButtons = Array.from(document.querySelectorAll("[data-preset]"));
  const audioButton = document.querySelector('[data-utility="audio"]');
  let openPanel = "";

  function closeDrawer() {
    drawer.hidden = true;
    openPanel = "";
    utilityButtons.forEach((button) => {
      if (button.dataset.utility !== "audio") button.setAttribute("aria-expanded", "false");
      button.classList.remove("is-active");
    });
    panels.forEach((panel) => { panel.hidden = true; });
  }

  function openDrawer(panelName) {
    const isSamePanel = !drawer.hidden && openPanel === panelName;
    if (isSamePanel) {
      closeDrawer();
      return;
    }
    openPanel = panelName;
    drawer.hidden = false;
    panels.forEach((panel) => { panel.hidden = panel.dataset.utilityPanel !== panelName; });
    utilityButtons.forEach((button) => {
      const isActive = button.dataset.utility === panelName;
      if (button.dataset.utility !== "audio") button.setAttribute("aria-expanded", String(isActive));
      button.classList.toggle("is-active", isActive);
    });
    playPanelTone(620);
  }

  function applyScene(sceneName, announce = true) {
    document.documentElement.dataset.scene = sceneName;
    window.localStorage.setItem("wiltobuild-scene", sceneName);
    sceneButtons.forEach((button) => {
      const isActive = button.dataset.scene === sceneName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    if (announce) {
      showControlToast(`${sceneName[0].toUpperCase()}${sceneName.slice(1)} lighting scene recalled`);
      playPanelTone(680);
    }
  }

  function applyPreset(presetName, announce = true) {
    activePreset = PRESETS[presetName] ? presetName : "explore";
    presetButtons.forEach((button) => {
      const isActive = button.dataset.preset === activePreset;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    updateInterface(activeModule);
    if (announce) {
      const presetLabel = activePreset === "hiring" ? "Hiring manager" : activePreset[0].toUpperCase() + activePreset.slice(1);
      showControlToast(`${presetLabel} sequence recalled`);
      playPanelTone(720);
    }
  }

  utilityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const controlName = button.dataset.utility;
      if (controlName === "audio") {
        audioEnabled = !audioEnabled;
        button.classList.toggle("is-active", audioEnabled);
        button.setAttribute("aria-pressed", String(audioEnabled));
        button.title = audioEnabled ? "Disable interface audio" : "Enable interface audio";
        showControlToast(`Interface audio ${audioEnabled ? "enabled" : "muted"}`);
        playPanelTone(760, 0.07);
        return;
      }
      openDrawer(controlName);
    });
  });

  sceneButtons.forEach((button) => button.addEventListener("click", () => applyScene(button.dataset.scene)));
  presetButtons.forEach((button) => button.addEventListener("click", () => applyPreset(button.dataset.preset)));
  closeButton.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !drawer.hidden) closeDrawer();
  });

  applyScene(window.localStorage.getItem("wiltobuild-scene") || "work", false);
  applyPreset("explore", false);
}

function createSkillFilter() {
  const buttons = Array.from(document.querySelectorAll("[data-skill-focus]"));
  const routes = Array.from(document.querySelectorAll("[data-supports]"));
  const summary = document.querySelector("[data-skill-summary]");
  const status = document.querySelector("[data-skill-status]");

  function select(focusName) {
    buttons.forEach((button) => {
      const isActive = button.dataset.skillFocus === focusName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    let supportedCount = 0;
    routes.forEach((route) => {
      const isSupported = route.dataset.supports.split(" ").includes(focusName);
      route.classList.toggle("is-routed", isSupported);
      route.querySelector("[data-route-state]").textContent = isSupported ? "Connected" : "Standby";
      if (isSupported) supportedCount += 1;
    });
    summary.textContent = SKILL_FOCUS[focusName];
    status.textContent = `${supportedCount} connected capabilities`;
  }

  buttons.forEach((button) => button.addEventListener("click", () => select(button.dataset.skillFocus)));
  select("develop");
}

function createProjectCarousel() {
  const queue = document.querySelector("[data-project-track]");
  const workspace = document.querySelector("[data-project-workspace]");
  const status = document.querySelector("[data-project-status]");
  let currentIndex = 2;

  queue.innerHTML = PROJECTS.map((project, index) => `
    <button type="button" class="project-queue-item" data-project-id="${project.id}" data-project-index="${index}" aria-label="Show project slot ${index + 1}: ${project.title}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${project.title}</strong>
      <small>${project.status}</small>
    </button>
  `).join("");

  const queueButtons = Array.from(queue.querySelectorAll("[data-project-id]"));

  function renderWorkspace(project, index) {
    workspace.innerHTML = `
      <div class="project-card-header"><span>${project.status}</span><b>Slot ${String(index + 1).padStart(2, "0")}</b></div>
      <div class="project-workspace-body">
        <div>
          <p>Future case study</p>
          <h3>${project.title}</h3>
          <span>${project.description}</span>
        </div>
        <dl class="project-template" aria-label="Planned case study evidence">
          <div><dt>Context</dt><dd>${project.evidence[0]}</dd></div>
          <div><dt>Decisions</dt><dd>${project.evidence[1]}</dd></div>
          <div><dt>Evidence</dt><dd>${project.evidence[2]}</dd></div>
        </dl>
      </div>
    `;
  }

  function setActive(index) {
    currentIndex = Math.max(0, Math.min(PROJECTS.length - 1, index));
    renderWorkspace(PROJECTS[currentIndex], currentIndex);
    queueButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === currentIndex;
      button.classList.toggle("is-active", isActive);
      if (isActive) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });
    status.textContent = `Slot ${String(currentIndex + 1).padStart(2, "0")} of ${String(PROJECTS.length).padStart(2, "0")} / ${PROJECTS[currentIndex].status}`;
  }

  function goTo(index) {
    const safeIndex = Math.max(0, Math.min(PROJECTS.length - 1, index));
    setActive(safeIndex);
    queueButtons[safeIndex].scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "nearest",
      inline: "center"
    });
  }

  workspace.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    goTo(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
  });
  queueButtons.forEach((button, index) => button.addEventListener("click", () => goTo(index)));
  setActive(currentIndex);
}

function createMobileDockCue() {
  const dock = document.querySelector(".mobile-dock");
  const shell = document.querySelector("[data-mobile-dock-shell]");

  function update() {
    const remaining = dock.scrollWidth - dock.clientWidth - dock.scrollLeft;
    shell.classList.toggle("is-at-start", dock.scrollLeft < 4);
    shell.classList.toggle("is-at-end", remaining < 4);
  }

  dock.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

navigationButtons.forEach((button) => {
  button.addEventListener("click", () => activateModule(button.dataset.nav, { focusScreen: true }));
});
footerNextButton.addEventListener("click", () => activateModule(footerNextButton.dataset.nextModule, { focusScreen: true }));

window.addEventListener("popstate", () => activateModule(moduleFromLocation(), { updateUrl: false }));
reduceMotion.addEventListener("change", () => controller.classList.remove("is-switching"));

document.querySelector("#year").textContent = new Date().getFullYear();
configureSocialLinks();
createUtilityControls();
createTransferConsole();
createExperienceWorkbench();
createSkillFilter();
createProjectCarousel();
createMobileDockCue();
updateClock();
window.setInterval(updateClock, 30000);
activeModule = moduleFromLocation();
views.forEach((view) => {
  const isActive = view.dataset.view === activeModule;
  view.hidden = !isActive;
  view.classList.toggle("is-active", isActive);
});
updateInterface(activeModule);
systemStatus.textContent = activeModule === "home" ? "System ready" : `${MODULES[activeModule].label} active`;
if (!window.location.hash) updateHistory(activeModule, "replace");
createBootSequence();
