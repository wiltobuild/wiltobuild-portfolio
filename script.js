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
  linkedin: "https://www.linkedin.com/",
  x: "https://x.com/"
};

const MODULES = {
  home: { number: "00", label: "Home", kicker: "System overview" },
  experience: { number: "01", label: "Experience", kicker: "Systems practice" },
  skills: { number: "02", label: "Skills", kicker: "Applied tools" },
  projects: { number: "03", label: "Projects", kicker: "Project bays" },
  credentials: { number: "04", label: "Credentials", kicker: "Training record" },
  contact: { number: "05", label: "Contact", kicker: "Open channels" }
};

const MODULE_ORDER = Object.keys(MODULES);

const EXPERIENCE_STEPS = {
  requirements: {
    title: "Clarify what the client needs the system to do.",
    application: "Define the user, task, constraints, and expected behavior before choosing tools."
  },
  systems: {
    title: "Connect devices, interfaces, networks, and control logic.",
    application: "Map inputs, dependencies, state changes, outputs, and failure cases before implementation."
  },
  troubleshooting: {
    title: "Trace faults through a working system under real constraints.",
    application: "Reproduce the problem, isolate variables, test assumptions, and verify the correction."
  },
  handoff: {
    title: "Explain behavior to clients, technicians, and support teams.",
    application: "Document decisions clearly so the software can be understood, used, and maintained."
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
    description: "Space for a practical application that uses an AI model to support a defined user task."
  },
  {
    id: "slot-2",
    status: "Reserved",
    title: "Interface case study",
    description: "Space for an interface project documented from requirements through responsive implementation."
  },
  {
    id: "slot-3",
    status: "Next to publish",
    title: "Primary project",
    description: "The first complete case study will document the problem, decisions, implementation, testing, and result."
  },
  {
    id: "slot-4",
    status: "Reserved",
    title: "Systems utility",
    description: "Space for a small software tool informed by automation, diagnostics, or support work."
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
  systemStatus.textContent = `Routing to ${module.label}`;
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
      controller.inert = false;
      controller.classList.add("is-online");
    }, reduceMotion.matches ? 0 : 220);
  }

  if (reduceMotion.matches || (hasBooted && !forceBoot)) {
    bootScreen.classList.add("is-complete");
    bootScreen.setAttribute("aria-hidden", "true");
    controller.inert = false;
    controller.classList.add("is-online");
    return;
  }

  const duration = 1850;
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

function createExperienceWorkbench() {
  const buttons = Array.from(document.querySelectorAll("[data-experience-step]"));
  const title = document.querySelector("[data-experience-title]");
  const application = document.querySelector("[data-experience-application]");

  function select(stepName, focus = false) {
    const step = EXPERIENCE_STEPS[stepName];
    if (!step) return;
    buttons.forEach((button) => {
      const isSelected = button.dataset.experienceStep === stepName;
      button.setAttribute("aria-selected", String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
      if (isSelected && focus) button.focus();
    });
    title.textContent = step.title;
    application.textContent = step.application;
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

  function select(focusName) {
    buttons.forEach((button) => {
      const isActive = button.dataset.skillFocus === focusName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    cards.forEach((card) => {
      card.classList.toggle("is-supported", card.dataset.supports.split(" ").includes(focusName));
    });
    summary.textContent = SKILL_FOCUS[focusName];
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
      <dl class="project-template">
        <div><dt>Problem</dt><dd>To be documented</dd></div>
        <div><dt>Build</dt><dd>To be documented</dd></div>
        <div><dt>Result</dt><dd>To be documented</dd></div>
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
    status.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")} - ${PROJECTS[currentIndex].status}`;
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
createExperienceWorkbench();
createSkillFilter();
createProjectCarousel();
createMobileSwipeNavigation();
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
