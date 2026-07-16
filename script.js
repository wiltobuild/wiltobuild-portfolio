const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const controller = document.querySelector("[data-controller]");
const displayScreen = document.querySelector(".display-screen");
const views = Array.from(document.querySelectorAll("[data-view]"));
const navigationButtons = Array.from(document.querySelectorAll("[data-nav]"));
const screenNumber = document.querySelector("[data-screen-number]");
const screenName = document.querySelector("[data-screen-name]");
const viewKicker = document.querySelector("[data-view-kicker]");
const viewTitle = document.querySelector("[data-view-title]");
const systemStatus = document.querySelector("[data-system-status]");
const clock = document.querySelector("[data-clock]");

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

const MODULE_ORDER = Object.keys(MODULES);

const EXPERIENCE_STEPS = {
  requirements: {
    title: "Clarify what the client needs the system to do.",
    application: "Define the user, task, constraints, and expected behavior before choosing tools.",
    state: "Requirement confirmed"
  },
  systems: {
    title: "Connect devices, interfaces, networks, and control logic.",
    application: "Map inputs, dependencies, state changes, outputs, and failure cases before implementation.",
    state: "Dependencies mapped"
  },
  troubleshooting: {
    title: "Trace faults through a working system under real constraints.",
    application: "Reproduce the problem, isolate variables, test assumptions, and verify the correction.",
    state: "Behavior verified"
  },
  handoff: {
    title: "Explain behavior to clients, technicians, and support teams.",
    application: "Document decisions clearly so the software can be understood, used, and maintained.",
    state: "System ready"
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
    status: "Next to publish",
    title: "Primary project",
    description: "The first complete case study will document the problem, decisions, implementation, testing, and result.",
    evidence: ["Problem and constraints", "Implementation decisions", "Testing and result"]
  },
  {
    id: "slot-4",
    status: "Reserved",
    title: "Systems utility",
    description: "Space for a small software tool informed by automation, diagnostics, or support work.",
    evidence: ["Operational problem", "Diagnostic logic", "Verified improvement"]
  }
];

let activeModule = "home";
let transitionRun = 0;

function wait(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
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
  navigationButtons.forEach((button) => {
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
  screenNumber.textContent = module.number;
  screenName.textContent = module.label;
  viewKicker.textContent = module.kicker;
  viewTitle.textContent = module.label;
  document.title = moduleName === "home" ? "Wil Sheppard | WilToBuild" : `${module.label} | WilToBuild`;
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
  systemStatus.textContent = `Opening ${module.label}`;
  controller.classList.toggle("is-switching", animate && !reduceMotion.matches);

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
  if (focusScreen) displayScreen.focus({ preventScroll: true });
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
    bootPercent.textContent = "100%";
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

  const duration = 1550;
  const startedAt = performance.now();
  const statuses = [
    [0, "Initializing portfolio system"],
    [26, "Loading identity and experience"],
    [58, "Connecting project modules"],
    [82, "Verifying interface states"]
  ];

  function render(time) {
    const progress = Math.min(100, Math.round(((time - startedAt) / duration) * 100));
    const currentStatus = statuses.reduce((label, item) => progress >= item[0] ? item[1] : label, statuses[0][1]);
    bootProgress.style.width = `${progress}%`;
    bootPercent.textContent = `${String(progress).padStart(2, "0")}%`;
    bootStatus.textContent = currentStatus;
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

  function select(stepName, focus = false) {
    const step = TRANSFER_STEPS[stepName];
    const activeIndex = buttons.findIndex((button) => button.dataset.transferStep === stepName);
    if (!step || activeIndex < 0) return;

    buttons.forEach((button, index) => {
      const isSelected = index === activeIndex;
      button.setAttribute("aria-selected", String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
      button.classList.toggle("is-complete", index < activeIndex);
      if (isSelected && focus) button.focus();
    });

    avOutput.textContent = step.av;
    softwareOutput.textContent = step.software;
    count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(buttons.length).padStart(2, "0")}`;
    output.classList.remove("is-updating");
    void output.offsetWidth;
    if (!reduceMotion.matches) output.classList.add("is-updating");
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
}

function createExperienceWorkbench() {
  const buttons = Array.from(document.querySelectorAll("[data-experience-step]"));
  const title = document.querySelector("[data-experience-title]");
  const application = document.querySelector("[data-experience-application]");
  const counter = document.querySelector("[data-experience-counter]");
  const state = document.querySelector("[data-experience-state]");
  const detail = document.querySelector(".signal-detail");

  function select(stepName, focus = false) {
    const step = EXPERIENCE_STEPS[stepName];
    if (!step) return;
    const activeIndex = buttons.findIndex((button) => button.dataset.experienceStep === stepName);
    buttons.forEach((button, index) => {
      const isSelected = index === activeIndex;
      button.setAttribute("aria-selected", String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
      button.classList.toggle("is-complete", index < activeIndex);
      if (isSelected && focus) button.focus();
    });
    title.textContent = step.title;
    application.textContent = step.application;
    counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(buttons.length).padStart(2, "0")}`;
    state.textContent = step.state;
    detail.classList.remove("is-updating");
    void detail.offsetWidth;
    if (!reduceMotion.matches) detail.classList.add("is-updating");
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
}

function createSkillFilter() {
  const buttons = Array.from(document.querySelectorAll("[data-skill-focus]"));
  const cards = Array.from(document.querySelectorAll("[data-supports]"));
  const summary = document.querySelector("[data-skill-summary]");
  const status = document.querySelector("[data-skill-status]");

  function select(focusName) {
    buttons.forEach((button) => {
      const isActive = button.dataset.skillFocus === focusName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    let supportedCount = 0;
    cards.forEach((card) => {
      const isSupported = card.dataset.supports.split(" ").includes(focusName);
      card.classList.toggle("is-supported", isSupported);
      if (isSupported) supportedCount += 1;
    });
    summary.textContent = SKILL_FOCUS[focusName];
    status.textContent = `${supportedCount} connected capabilities`;
  }

  buttons.forEach((button) => button.addEventListener("click", () => select(button.dataset.skillFocus)));
  select("develop");
}

function createProjectCarousel() {
  const track = document.querySelector("[data-project-track]");
  const previousButton = document.querySelector("[data-project-previous]");
  const nextButton = document.querySelector("[data-project-next]");
  const indicators = document.querySelector("[data-project-indicators]");
  const status = document.querySelector("[data-project-status]");
  let currentIndex = 2;
  let scrollTimer = 0;

  track.innerHTML = PROJECTS.map((project, index) => `
    <article class="project-card" data-project-id="${project.id}" aria-label="Project placeholder ${index + 1}: ${project.title}">
      <div class="project-card-header"><span>${project.status}</span><b>Bay ${String(index + 1).padStart(2, "0")}</b></div>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <dl class="project-template" aria-label="Planned case study evidence">
        <div><dt>Context</dt><dd>${project.evidence[0]}</dd></div>
        <div><dt>Decisions</dt><dd>${project.evidence[1]}</dd></div>
        <div><dt>Evidence</dt><dd>${project.evidence[2]}</dd></div>
      </dl>
    </article>
  `).join("");

  indicators.innerHTML = PROJECTS.map((project, index) => `<button type="button" data-project-index="${index}" aria-label="Show ${project.title}"></button>`).join("");
  const cards = Array.from(track.querySelectorAll("[data-project-id]"));
  const indicatorButtons = Array.from(indicators.querySelectorAll("[data-project-index]"));

  function setActive(index) {
    currentIndex = Math.max(0, Math.min(PROJECTS.length - 1, index));
    cards.forEach((card, cardIndex) => card.setAttribute("aria-current", String(cardIndex === currentIndex)));
    indicatorButtons.forEach((button, buttonIndex) => button.setAttribute("aria-current", String(buttonIndex === currentIndex)));
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === PROJECTS.length - 1;
    status.textContent = `Slot ${String(currentIndex + 1).padStart(2, "0")} of ${String(PROJECTS.length).padStart(2, "0")} / ${PROJECTS[currentIndex].status}`;
  }

  function goTo(index, behavior = reduceMotion.matches ? "auto" : "smooth") {
    const safeIndex = Math.max(0, Math.min(PROJECTS.length - 1, index));
    const card = cards[safeIndex];
    const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left, behavior });
    setActive(safeIndex);
  }

  function nearestIndex() {
    const center = track.scrollLeft + track.clientWidth / 2;
    return cards.reduce((closest, card, index) => {
      const distance = Math.abs(card.offsetLeft + card.clientWidth / 2 - center);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
  }

  track.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => setActive(nearestIndex()), 100);
  }, { passive: true });
  track.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    goTo(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
  });
  previousButton.addEventListener("click", () => goTo(currentIndex - 1));
  nextButton.addEventListener("click", () => goTo(currentIndex + 1));
  indicatorButtons.forEach((button, index) => button.addEventListener("click", () => goTo(index)));
  new ResizeObserver(() => goTo(currentIndex, "auto")).observe(track);
  window.setTimeout(() => goTo(currentIndex, "auto"), 0);
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

function createMobileSwipeNavigation() {
  let startX = 0;
  let startY = 0;
  let ignoreGesture = false;

  displayScreen.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    ignoreGesture = Boolean(event.target.closest(".project-bay, .segmented-control, .signal-stages, a, button, summary"));
  }, { passive: true });

  displayScreen.addEventListener("touchend", (event) => {
    if (ignoreGesture || window.innerWidth > 800) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    if (Math.abs(deltaX) < 70 || Math.abs(deltaY) > 55) return;
    const currentIndex = MODULE_ORDER.indexOf(activeModule);
    const nextIndex = Math.max(0, Math.min(MODULE_ORDER.length - 1, currentIndex + (deltaX < 0 ? 1 : -1)));
    if (nextIndex !== currentIndex) activateModule(MODULE_ORDER[nextIndex]);
  }, { passive: true });
}

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

navigationButtons.forEach((button) => {
  button.addEventListener("click", () => activateModule(button.dataset.nav));
});

window.addEventListener("popstate", () => activateModule(moduleFromLocation(), { updateUrl: false }));
reduceMotion.addEventListener("change", () => controller.classList.remove("is-switching"));

document.querySelector("#year").textContent = new Date().getFullYear();
configureSocialLinks();
createTransferConsole();
createExperienceWorkbench();
createSkillFilter();
createProjectCarousel();
createMobileSwipeNavigation();
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
