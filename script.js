const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const body = document.body;
const openButton = document.querySelector("[data-commission]");
const homeButton = document.querySelector("[data-home-action]");
const headerContext = document.querySelector("[data-header-context]");
const routeContext = document.querySelector("[data-route-context]");
const routeNodes = Array.from(document.querySelectorAll("[data-module]"));
const contentPanel = document.querySelector("[data-content-dock]");
const contentRoute = document.querySelector("[data-dock-route]");
const contentSections = Array.from(document.querySelectorAll("[data-panel]"));
const closeButton = document.querySelector("[data-close-module]");
const skipLink = document.querySelector(".skip-link");

const SOCIAL_URLS = {
  github: "https://github.com/wiltobuild",
  linkedin: "https://www.linkedin.com/",
  x: "https://x.com/"
};

const MODULES = {
  experience: {
    label: "Experience",
    preview: "AV work applied to software"
  },
  skills: {
    label: "Skills",
    preview: "Tools connected to practical tasks"
  },
  projects: {
    label: "Projects",
    preview: "Reserved space for future case studies"
  },
  credentials: {
    label: "Credentials",
    preview: "Crestron and CTS training"
  },
  contact: {
    label: "Contact",
    preview: "Profiles and current availability"
  }
};

const EXPERIENCE_STEPS = {
  requirements: {
    source: "AV responsibility",
    title: "Clarify what the client needs the system to do.",
    application: "Define the user, task, constraints, and expected behavior before choosing tools."
  },
  systems: {
    source: "AV responsibility",
    title: "Connect devices, interfaces, networks, and control logic.",
    application: "Map inputs, dependencies, state changes, outputs, and failure cases before implementation."
  },
  troubleshooting: {
    source: "AV responsibility",
    title: "Trace faults through a working system under real constraints.",
    application: "Reproduce the problem, isolate variables, test assumptions, and verify the correction."
  },
  handoff: {
    source: "AV responsibility",
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

const exploredModules = new Set();
let currentModule = null;
let transitionRun = 0;
let routeRenderer = null;
let projectCarousel = null;

function wait(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function configureSocialLinks() {
  document.querySelectorAll("[data-social]").forEach((link) => {
    const url = SOCIAL_URLS[link.dataset.social];
    if (url) link.href = url;
  });
}

function getLocationState() {
  const hash = window.location.hash.replace(/^#/, "");

  if (!hash || hash === "top") return { mode: "hero", module: null, projectId: null };
  if (hash === "portfolio" || hash === "system") return { mode: "system", module: null, projectId: null };

  const [moduleName, projectId] = hash.split("/");
  if (!MODULES[moduleName]) return { mode: "hero", module: null, projectId: null };

  return {
    mode: "system",
    module: moduleName,
    projectId: moduleName === "projects" ? projectId || "slot-3" : null
  };
}

function hashFor(moduleName, projectId = null) {
  if (!moduleName) return "#portfolio";
  if (moduleName === "projects") return `#projects/${projectId || projectCarousel?.currentId || "slot-3"}`;
  return `#${moduleName}`;
}

function updateHistory(hash, method = "push") {
  if (window.location.hash === hash) return;
  const action = method === "replace" ? "replaceState" : "pushState";
  window.history[action]({ hash }, "", hash);
}

function updateInterfaceCopy(moduleName = null) {
  const label = moduleName ? MODULES[moduleName].label : "Portfolio overview";
  headerContext.textContent = moduleName ? `${label} / Wil Sheppard` : "Wil Sheppard / Portfolio";
  contentRoute.textContent = label;
  routeContext.textContent = moduleName ? MODULES[moduleName].preview : "Explore the sections";
}

function showSection(sectionName, shouldAnimate = true) {
  const selected = contentSections.find((section) => section.dataset.panel === sectionName);
  if (!selected) return;

  contentSections.forEach((section) => {
    const isSelected = section === selected;
    section.hidden = !isSelected;
    section.classList.toggle("is-active", isSelected);
    section.classList.remove("is-entering");
  });

  if (shouldAnimate && !reduceMotion.matches) {
    void selected.offsetWidth;
    selected.classList.add("is-entering");
  }

  selected.scrollTop = 0;
}

function syncModuleState(moduleName) {
  currentModule = moduleName;
  body.dataset.activeModule = moduleName || "none";

  routeNodes.forEach((node) => {
    const isActive = node.dataset.module === moduleName;
    const isExplored = exploredModules.has(node.dataset.module);
    node.classList.toggle("is-active", isActive);
    node.classList.toggle("is-explored", isExplored && !isActive);
    node.setAttribute("aria-pressed", String(isActive));
  });

  routeRenderer?.setActiveModule(moduleName, exploredModules);
}

function enterHero(options = {}) {
  transitionRun += 1;
  body.dataset.mode = "hero";
  body.classList.remove("is-routing");
  openButton.disabled = false;
  openButton.setAttribute("aria-expanded", "false");
  contentPanel.inert = true;
  syncModuleState(null);
  showSection("idle", false);
  updateInterfaceCopy();
  routeRenderer?.reset();

  if (window.innerWidth <= 900) {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }

  if (options.updateUrl) updateHistory("#top");
}

function enterSystem(moduleName = null, options = {}) {
  const {
    updateUrl = false,
    historyMethod = "push",
    animateSection = true,
    projectId = null,
    focusContent = false
  } = options;

  transitionRun += 1;
  body.dataset.mode = "system";
  body.classList.remove("is-routing");
  openButton.disabled = false;
  openButton.setAttribute("aria-expanded", "true");
  contentPanel.inert = false;

  if (moduleName) exploredModules.add(moduleName);
  syncModuleState(moduleName);
  showSection(moduleName || "idle", animateSection);
  updateInterfaceCopy(moduleName);

  if (moduleName === "projects" && projectCarousel) {
    projectCarousel.goToId(projectId || "slot-3", {
      behavior: "auto",
      updateUrl: false,
      announce: false
    });
  }

  if (updateUrl) updateHistory(hashFor(moduleName, projectId), historyMethod);

  if (focusContent) {
    window.setTimeout(() => contentPanel.focus({ preventScroll: true }), reduceMotion.matches ? 0 : 420);
  }
}

async function openPortfolio(moduleName = null, options = {}) {
  const { updateUrl = true, focusContent = false, projectId = null } = options;

  if (body.dataset.mode !== "hero") {
    if (moduleName) activateModule(moduleName, { updateUrl, focusContent, projectId });
    return;
  }

  const runId = ++transitionRun;
  openButton.blur();
  body.dataset.mode = reduceMotion.matches ? "system" : "opening";
  openButton.disabled = true;
  openButton.setAttribute("aria-expanded", "true");
  headerContext.textContent = "Opening portfolio";
  contentPanel.inert = true;

  if (moduleName) {
    routeNodes.find((node) => node.dataset.module === moduleName)?.classList.add("is-routing");
    routeRenderer?.pulseModule(moduleName);
  }

  if (updateUrl) updateHistory(hashFor(moduleName, projectId));
  if (!reduceMotion.matches) await wait(560);
  if (runId !== transitionRun) return;

  enterSystem(moduleName, {
    animateSection: true,
    projectId,
    focusContent
  });

  if (window.innerWidth <= 900) {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 260);
  }
}

async function activateModule(moduleName, options = {}) {
  if (!MODULES[moduleName]) return;

  if (body.dataset.mode === "hero") {
    await openPortfolio(moduleName, options);
    return;
  }

  const {
    updateUrl = true,
    focusContent = false,
    projectId = moduleName === "projects" ? projectCarousel?.currentId || "slot-3" : null
  } = options;

  if (currentModule === moduleName) {
    if (focusContent) contentPanel.focus({ preventScroll: true });
    return;
  }

  const runId = ++transitionRun;
  const selectedNode = routeNodes.find((node) => node.dataset.module === moduleName);
  body.classList.add("is-routing");
  selectedNode?.classList.add("is-routing");
  routeRenderer?.pulseModule(moduleName);

  if (updateUrl) updateHistory(hashFor(moduleName, projectId));
  if (!reduceMotion.matches) await wait(340);
  if (runId !== transitionRun) return;

  selectedNode?.classList.remove("is-routing");
  enterSystem(moduleName, {
    animateSection: true,
    projectId,
    focusContent
  });
}

async function showOverview(options = {}) {
  if (currentModule === null) return;

  const runId = ++transitionRun;
  body.classList.add("is-routing");
  routeRenderer?.setActiveModule(null, exploredModules);
  if (options.updateUrl !== false) updateHistory("#portfolio");
  if (!reduceMotion.matches) await wait(220);
  if (runId !== transitionRun) return;
  enterSystem(null, { animateSection: true });
}

function applyLocationState(options = {}) {
  const state = getLocationState();

  if (state.mode === "hero") {
    enterHero();
    return;
  }

  enterSystem(state.module, {
    animateSection: options.animate === true,
    projectId: state.projectId
  });
}

function createRouteRenderer() {
  const routePanel = document.querySelector("[data-routing-console]");
  const canvas = routePanel.querySelector(".route-canvas");
  const context = canvas.getContext("2d");
  const hub = routePanel.querySelector("[data-controller-core]");
  let width = 0;
  let height = 0;
  let activeModule = null;
  let previewModule = null;
  let pulseModuleName = null;
  let pulseStartedAt = 0;
  let explored = new Set();
  let animationFrame = null;

  function fit() {
    const bounds = routePanel.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    draw(performance.now());
  }

  function centerOf(element) {
    const panelBounds = routePanel.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    return {
      x: bounds.left - panelBounds.left + bounds.width / 2,
      y: bounds.top - panelBounds.top + bounds.height / 2
    };
  }

  function routePoints(from, to) {
    const midpointX = from.x + (to.x - from.x) * 0.52;
    return [from, { x: midpointX, y: from.y }, { x: midpointX, y: to.y }, to];
  }

  function drawPath(points, color, lineWidth = 1, dashed = false, offset = 0) {
    context.save();
    if (dashed) {
      context.setLineDash([7, 8]);
      context.lineDashOffset = offset;
    }
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
    context.restore();
  }

  function pointAlong(points, progress) {
    const segments = points.slice(1).map((point, index) => ({
      from: points[index],
      to: point,
      length: Math.hypot(point.x - points[index].x, point.y - points[index].y)
    }));
    const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
    let remaining = totalLength * progress;

    for (const segment of segments) {
      if (remaining <= segment.length) {
        const ratio = segment.length === 0 ? 0 : remaining / segment.length;
        return {
          x: segment.from.x + (segment.to.x - segment.from.x) * ratio,
          y: segment.from.y + (segment.to.y - segment.from.y) * ratio
        };
      }
      remaining -= segment.length;
    }

    return points[points.length - 1];
  }

  function drawSignal(points, progress) {
    const point = pointAlong(points, progress);
    context.beginPath();
    context.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
    context.fillStyle = "rgba(183, 239, 91, 1)";
    context.shadowColor = "rgba(183, 239, 91, 0.8)";
    context.shadowBlur = 14;
    context.fill();
    context.shadowBlur = 0;
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    if (width < 1 || height < 1 || window.innerWidth <= 900) return;

    const hubPosition = centerOf(hub);
    const pulseProgress = Math.min(1, (time - pulseStartedAt) / 620);

    routeNodes.forEach((node) => {
      const moduleName = node.dataset.module;
      const nodePosition = centerOf(node);
      const isActive = moduleName === activeModule;
      const isPreviewed = moduleName === previewModule;
      const isExplored = explored.has(moduleName);
      const isPulsing = moduleName === pulseModuleName && pulseProgress < 1;
      const points = routePoints(hubPosition, nodePosition);

      let color = "rgba(240, 242, 235, 0.1)";
      let lineWidth = 1;
      if (isExplored) color = "rgba(120, 174, 190, 0.4)";
      if (isPreviewed) color = "rgba(255, 121, 84, 0.8)";
      if (isActive || isPulsing) {
        color = "rgba(183, 239, 91, 0.9)";
        lineWidth = 1.8;
      }

      drawPath(points, color, lineWidth, isActive || isPulsing, -pulseProgress * 42);

      if ((isActive || isPulsing) && body.dataset.mode !== "hero") {
        const dockPoints = routePoints(nodePosition, { x: width + 12, y: nodePosition.y });
        drawPath(dockPoints, color, lineWidth, true, -pulseProgress * 42);
        if (isPulsing) drawSignal(dockPoints, pulseProgress);
      } else if (isPulsing || isPreviewed) {
        drawSignal(points, isPulsing ? pulseProgress : 0.72);
      }
    });
  }

  function render(time) {
    draw(time);
    if (!reduceMotion.matches && time - pulseStartedAt < 720) {
      animationFrame = window.requestAnimationFrame(render);
    } else {
      animationFrame = null;
    }
  }

  function startAnimation() {
    if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    if (reduceMotion.matches) {
      draw(performance.now());
      return;
    }
    animationFrame = window.requestAnimationFrame(render);
  }

  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(routePanel);

  return {
    setActiveModule(moduleName, exploredSet) {
      activeModule = moduleName;
      explored = new Set(exploredSet);
      previewModule = null;
      pulseStartedAt = performance.now();
      startAnimation();
    },
    setPreviewModule(moduleName) {
      previewModule = moduleName;
      routeNodes.forEach((node) => node.classList.toggle("is-previewed", node.dataset.module === moduleName));
      pulseStartedAt = performance.now();
      startAnimation();
    },
    pulseModule(moduleName) {
      pulseModuleName = moduleName;
      pulseStartedAt = performance.now();
      startAnimation();
    },
    reset() {
      activeModule = null;
      previewModule = null;
      pulseModuleName = null;
      explored = new Set();
      pulseStartedAt = performance.now();
      startAnimation();
    },
    fit
  };
}

function createExperienceWorkbench() {
  const buttons = Array.from(document.querySelectorAll("[data-experience-step]"));
  const source = document.querySelector("[data-experience-source]");
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

    source.textContent = step.source;
    title.textContent = step.title;
    application.textContent = step.application;
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => select(button.dataset.experienceStep));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (index + direction + buttons.length) % buttons.length;
      select(buttons[nextIndex].dataset.experienceStep, true);
    });
  });

  select("requirements");
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
      const supportedTasks = card.dataset.supports.split(" ");
      card.classList.toggle("is-supported", supportedTasks.includes(focusName));
    });

    summary.textContent = SKILL_FOCUS[focusName];
  }

  buttons.forEach((button) => button.addEventListener("click", () => select(button.dataset.skillFocus)));
  select("develop");
}

function createProjectCarousel() {
  const track = document.querySelector("[data-project-track]");
  const previousButton = document.querySelector("[data-carousel-previous]");
  const nextButton = document.querySelector("[data-carousel-next]");
  const indicators = document.querySelector("[data-carousel-indicators]");
  const status = document.querySelector("[data-carousel-status]");
  let currentIndex = 2;
  let scrollTimer = null;
  let programmaticScroll = false;

  track.innerHTML = PROJECTS.map((project, index) => `
    <article class="project-card" data-project-id="${project.id}" aria-label="Project placeholder ${index + 1}: ${project.title}">
      <div class="project-card-header">
        <span>${project.status}</span>
        <b>Project ${String(index + 1).padStart(2, "0")}</b>
      </div>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <dl class="project-template">
        <div><dt>Problem</dt><dd>To be documented</dd></div>
        <div><dt>Build</dt><dd>To be documented</dd></div>
        <div><dt>Result</dt><dd>To be documented</dd></div>
      </dl>
    </article>
  `).join("");

  indicators.innerHTML = PROJECTS.map((project, index) => `
    <button type="button" data-project-index="${index}" aria-label="Show ${project.title}"></button>
  `).join("");

  const cards = Array.from(track.querySelectorAll("[data-project-id]"));
  const indicatorButtons = Array.from(indicators.querySelectorAll("[data-project-index]"));

  function updateActiveState(index, announce = true) {
    currentIndex = Math.max(0, Math.min(PROJECTS.length - 1, index));
    const project = PROJECTS[currentIndex];

    cards.forEach((card, cardIndex) => card.setAttribute("aria-current", String(cardIndex === currentIndex)));
    indicatorButtons.forEach((button, buttonIndex) => button.setAttribute("aria-current", String(buttonIndex === currentIndex)));
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === PROJECTS.length - 1;
    status.textContent = `${currentIndex + 1} of ${PROJECTS.length} / ${project.status}`;

    if (announce) routeRenderer?.pulseModule("projects");
  }

  function targetScrollLeft(index) {
    const card = cards[index];
    return card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
  }

  function goTo(index, options = {}) {
    const {
      behavior = reduceMotion.matches ? "auto" : "smooth",
      updateUrl = true,
      announce = true
    } = options;
    const safeIndex = Math.max(0, Math.min(PROJECTS.length - 1, index));

    programmaticScroll = true;
    track.scrollTo({ left: targetScrollLeft(safeIndex), behavior });
    updateActiveState(safeIndex, announce);

    if (updateUrl && currentModule === "projects") {
      updateHistory(`#projects/${PROJECTS[safeIndex].id}`, "replace");
    }

    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => { programmaticScroll = false; }, behavior === "smooth" ? 420 : 0);
  }

  function nearestIndex() {
    const center = track.scrollLeft + track.clientWidth / 2;
    return cards.reduce((closest, card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(center - cardCenter);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
  }

  track.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      if (programmaticScroll) return;
      const index = nearestIndex();
      updateActiveState(index, true);
      if (currentModule === "projects") updateHistory(`#projects/${PROJECTS[index].id}`, "replace");
    }, 120);
  }, { passive: true });

  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goTo(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
  });

  previousButton.addEventListener("click", () => goTo(currentIndex - 1));
  nextButton.addEventListener("click", () => goTo(currentIndex + 1));
  indicatorButtons.forEach((button, index) => button.addEventListener("click", () => goTo(index)));

  const resizeObserver = new ResizeObserver(() => goTo(currentIndex, {
    behavior: "auto",
    updateUrl: false,
    announce: false
  }));
  resizeObserver.observe(track);
  updateActiveState(currentIndex, false);

  return {
    get currentId() {
      return PROJECTS[currentIndex].id;
    },
    goToId(projectId, options = {}) {
      const index = PROJECTS.findIndex((project) => project.id === projectId);
      goTo(index >= 0 ? index : 2, options);
    }
  };
}

openButton.addEventListener("click", () => openPortfolio());
homeButton.addEventListener("click", () => enterHero({ updateUrl: true }));
closeButton.addEventListener("click", () => showOverview({ updateUrl: true }));

skipLink.addEventListener("click", (event) => {
  event.preventDefault();
  if (body.dataset.mode === "hero") {
    openPortfolio(null, { focusContent: true });
  } else {
    contentPanel.focus({ preventScroll: true });
  }
});

routeNodes.forEach((node, index) => {
  const moduleName = node.dataset.module;

  node.addEventListener("click", () => activateModule(moduleName));
  node.addEventListener("pointerenter", () => {
    routeContext.textContent = MODULES[moduleName].preview;
    routeRenderer?.setPreviewModule(moduleName);
  });
  node.addEventListener("pointerleave", () => {
    routeContext.textContent = currentModule ? MODULES[currentModule].preview : "Explore the sections";
    routeRenderer?.setPreviewModule(null);
  });
  node.addEventListener("focus", () => {
    routeContext.textContent = MODULES[moduleName].preview;
    routeRenderer?.setPreviewModule(moduleName);
  });
  node.addEventListener("blur", () => {
    routeContext.textContent = currentModule ? MODULES[currentModule].preview : "Explore the sections";
    routeRenderer?.setPreviewModule(null);
  });
  node.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % routeNodes.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + routeNodes.length) % routeNodes.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = routeNodes.length - 1;
    routeNodes[nextIndex].focus();
  });
});

document.querySelector("[data-overview-action]").addEventListener("click", (event) => {
  activateModule(event.currentTarget.dataset.overviewAction, { focusContent: true });
});

window.addEventListener("popstate", () => applyLocationState({ animate: true }));
reduceMotion.addEventListener("change", () => routeRenderer?.fit());

document.querySelector("#year").textContent = new Date().getFullYear();
configureSocialLinks();
routeRenderer = createRouteRenderer();
createExperienceWorkbench();
createSkillFilter();
projectCarousel = createProjectCarousel();
applyLocationState({ animate: false });
