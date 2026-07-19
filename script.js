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
const presetStatus = document.querySelector("[data-preset-status]");
const presetName = document.querySelector("[data-preset-name]");
const presetProgress = document.querySelector("[data-preset-progress]");
const presetPosition = document.querySelector("[data-preset-position]");
const reviewedSummary = document.querySelector("[data-reviewed-summary]");

function loadReviewedModules() {
  try {
    return JSON.parse(window.localStorage.getItem("wiltobuild-reviewed-modules") || "[]");
  } catch {
    return [];
  }
}

const reviewedModules = new Set(loadReviewedModules());

const SOCIAL_URLS = {
  github: "https://github.com/wiltobuild",
  linkedin: "https://www.linkedin.com/in/william-sheppard-230a82132/",
  x: "https://x.com/WillBeBuilding"
};

const MODULES = {
  home: { number: "00", label: "Home", kicker: "System overview" },
  experience: { number: "01", label: "Experience", kicker: "Systems practice" },
  agents: { number: "02", label: "Agents", kicker: "Workflow" },
  skills: { number: "03", label: "Skills", kicker: "Applied tools" },
  projects: { number: "04", label: "Projects", kicker: "Current builds" },
  credentials: { number: "05", label: "Credentials", kicker: "Training record" },
  contact: { number: "06", label: "Contact", kicker: "Profiles and contact" }
};

const PRESETS = {
  explore: ["home", "experience", "agents", "skills", "projects", "credentials", "contact"],
  hiring: ["home", "experience", "agents", "skills", "contact"],
  technical: ["experience", "agents", "skills", "credentials", "contact"]
};

const NEXT_PROMPTS = {
  home: "Return to the system overview",
  experience: "Trace my systems experience",
  agents: "Explore my AI workflow",
  skills: "See how I apply development tools",
  projects: "Review current projects",
  credentials: "Review my technical training",
  contact: "Open my contact channels"
};

const EXPERIENCE_STEPS = {
  requirements: {
    title: "Translate client needs into room behavior, scope, and constraints.",
    application: "Gather requirements directly with executives, facility teams, vendors, and end users before choosing a software approach.",
    state: "Requirement confirmed",
    activeNodes: ["client"],
    activeLinks: []
  },
  interface: {
    title: "Shape Crestron controls and feedback around real room users.",
    application: "Carry the same user-first approach into software: make states and feedback understandable for technical and nontechnical users.",
    state: "Interface behavior mapped",
    activeNodes: ["client", "interface"],
    activeLinks: ["1"]
  },
  logic: {
    title: "Build SIMPL Windows logic across control, hardware, and network dependencies.",
    application: "Map inputs, state changes, outputs, dependencies, and failure cases before implementation—whether the system is a room or an application.",
    state: "Control path mapped",
    activeNodes: ["client", "interface", "processor"],
    activeLinks: ["1", "2"]
  },
  troubleshooting: {
    title: "Trace faults across devices, networks, technicians, and vendor constraints.",
    application: "Reproduce the problem, isolate variables, coordinate the right people, test assumptions, and verify the correction in software.",
    state: "Behavior verified",
    activeNodes: ["client", "interface", "processor", "devices"],
    activeLinks: ["1", "2", "3"]
  },
  handoff: {
    title: "Commission, document, and explain a verified system to the people who rely on it.",
    application: "Carry clear handoff into software: document decisions, translate technical behavior, and leave systems maintainable after launch.",
    state: "System ready",
    activeNodes: ["client", "interface", "processor", "devices", "room"],
    activeLinks: ["1", "2", "3", "4"]
  }
};

const AGENTS = {
  athena: {
    role: "Planner",
    title: "Planner / Architecture and Delegation",
    model: "Claude Opus 4.8",
    scope: "Architecture and delegation",
    description: "Handles architecture, complex planning, delegation, and unresolved ambiguity before work moves to a specialist."
  },
  hephaestus: {
    role: "Builder",
    title: "Builder // Implementation Workhorse",
    model: "Terra 5.6",
    scope: "Coding and execution",
    description: "Edits files, works in the terminal, debugs implementation, and runs tests against the plan."
  },
  argus: {
    role: "Watcher",
    title: "Watcher // All-Seeing Eye",
    model: "Claude Haiku 4.5",
    scope: "Monitoring and status",
    description: "Classifies logs, summarizes activity, detects failures, and posts concise updates while work is in progress."
  },
  themis: {
    role: "Reviewer",
    title: "Reviewer // Quality Gatekeeper",
    model: "Claude Sonnet 5",
    scope: "Plans, code, and tests",
    description: "Reviews plans, diffs, tests, and completed work with enough reasoning depth for practical code judgment."
  },
  mnemosyne: {
    role: "Memory",
    title: "Memory // Decision Archive",
    model: "Claude Haiku 4.5",
    scope: "Structured project memory",
    description: "Extracts decisions, preferences, and useful facts into structured memory, paired with an embedding model for retrieval."
  },
  hermes: {
    role: "Relay",
    title: "Relay // Message and Tool Courier",
    model: "Claude Haiku 4.5",
    scope: "Routing and communication",
    description: "Handles tool selection, message formatting, structured JSON, and communication between agents."
  },
  aegis: {
    role: "Security",
    title: "Security // Risk and Policy Sentinel",
    model: "Claude Sonnet 5",
    scope: "Risk and policy review",
    description: "Flags risky actions, permission requests, suspicious commands, exposed secrets, and possible policy violations."
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

const CREDENTIALS = {
  crestron: {
    issuer: "Crestron",
    status: "Completed",
    title: "Silver Programmer",
    description: "Programming training focused on control logic, device behavior, interfaces, and deployable automation.",
    practice: "I used this training to build and support control programs whose behavior had to remain understandable in real rooms.",
    area: "Control programming",
    demonstrates: "Structured logic and system behavior",
    applied: "Software state, dependencies, and testing",
    badge: { src: "assets/credential-crestron.png", alt: "Crestron Certified Programmer badge" }
  },
  cts: {
    issuer: "AVIXA",
    status: "Certified",
    title: "Certified Technology Specialist",
    description: "AV industry training covering system principles, requirements, installation context, and client communication.",
    practice: "I applied this foundation while translating client needs into systems that technicians could install, test, and support.",
    area: "AV systems integration",
    demonstrates: "Requirements, signal flow, and technical communication",
    applied: "System mapping, implementation context, and support",
    badge: { src: "assets/credential-cts.png", alt: "AVIXA CTS certification badge" }
  }
};

const PROJECTS = [
  {
    id: "irys",
    status: "Private / Active build",
    kind: "Windows desktop companion",
    title: "iRYS",
    description: "A lightweight Windows companion with an eye-shaped overlay that communicates local application and coding-agent activity through distinct visual states.",
    visual: "assets/irys-animated-visual/index.html",
    labels: ["Platform", "System boundary", "Current evidence"],
    evidence: ["C# and .NET 8 desktop application", "Local tray controls and secured loopback events", "Interactive overlay states, local settings, and test project"],
    access: "Repository private during active development"
  },
  {
    id: "sidequest-nyc",
    status: "Public / v1.5A",
    kind: "NYC itinerary web application",
    title: "SideQuest NYC",
    description: "A guided static web app that turns six traveler preferences into a small NYC itinerary using local data and route-aware recommendation logic.",
    visual: "assets/sidequest-animated-visual/index.html",
    labels: ["Local data", "Recommendation logic", "User controls"],
    evidence: ["104 NYC places with neighborhood and coordinate data", "Scored matching, geographic fallback, and route ordering", "Stop swapping, route estimates, Maps links, and quest copying"],
    links: [
      { label: "Open live project", url: "https://wiltobuild.github.io/sidequest-nyc/" },
      { label: "View repository", url: "https://github.com/wiltobuild/sidequest-nyc" }
    ]
  },
  {
    id: "slot-3",
    status: "Planned first case study",
    kind: "Future case study",
    title: "Primary project",
    description: "This slot is reserved for the first complete case study documenting the problem, decisions, implementation, testing, and result.",
    labels: ["Context", "Decisions", "Evidence"],
    evidence: ["Problem and constraints", "Implementation decisions", "Testing and result"]
  },
  {
    id: "slot-4",
    status: "Reserved",
    kind: "Future case study",
    title: "Systems utility",
    description: "Space for a small software tool informed by automation, diagnostics, or support work.",
    labels: ["Context", "Decisions", "Evidence"],
    evidence: ["Operational problem", "Diagnostic logic", "Observed result"]
  }
];

let activeModule = "home";
let transitionRun = 0;
let activePreset = "explore";
let audioEnabled = false;
let audioContext;
let toastTimer;
const activeServiceAudio = new Set();

function wait(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function showControlToast(message) {
  window.clearTimeout(toastTimer);
  controlToast.textContent = message;
  controlToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => controlToast.classList.remove("is-visible"), 2200);
}

function updateReviewedModules() {
  stateNavigationButtons.forEach((button) => {
    button.classList.toggle("is-reviewed", reviewedModules.has(button.dataset.nav));
  });
  const reviewedInPreset = PRESETS[activePreset].filter((moduleName) => reviewedModules.has(moduleName)).length;
  presetStatus.dataset.reviewed = `${reviewedInPreset}/${PRESETS[activePreset].length}`;
  reviewedSummary.textContent = `${reviewedInPreset} / ${PRESETS[activePreset].length} reviewed`;
  presetStatus.classList.toggle("is-complete", reviewedInPreset === PRESETS[activePreset].length);
}

function markModuleReviewed(moduleName, message) {
  if (!MODULES[moduleName] || reviewedModules.has(moduleName)) return;
  reviewedModules.add(moduleName);
  window.localStorage.setItem("wiltobuild-reviewed-modules", JSON.stringify([...reviewedModules]));
  updateReviewedModules();
  const sequenceComplete = PRESETS[activePreset].every((name) => reviewedModules.has(name));
  if (sequenceComplete) {
    const label = { explore: "Full portfolio", hiring: "Hiring manager", technical: "Technical" }[activePreset];
    showControlToast(`${label} review complete`);
    systemStatus.textContent = `${label} route verified`;
  } else if (message) {
    showControlToast(message);
  }
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

function playToneSequence(notes, options = {}) {
  if (!audioEnabled) return;
  const { type = "sine", volume = 0.018, service = false } = options;
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  const startedAt = audioContext.currentTime;

  notes.forEach(([frequency, offset, duration]) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const begins = startedAt + offset;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, begins);
    gain.gain.setValueAtTime(volume, begins);
    gain.gain.exponentialRampToValueAtTime(0.0001, begins + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(begins);
    oscillator.stop(begins + duration);
    if (service) {
      activeServiceAudio.add(oscillator);
      oscillator.addEventListener("ended", () => activeServiceAudio.delete(oscillator), { once: true });
    }
  });
}

function stopServiceAudio() {
  activeServiceAudio.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch {
      // The oscillator may already have ended.
    }
  });
  activeServiceAudio.clear();
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
    link.addEventListener("click", () => markModuleReviewed("contact", "Contact channel opened"));
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
  document.documentElement.dataset.activeView = moduleName;
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
  const sequence = PRESETS[activePreset];
  const sequenceIndex = Math.max(0, sequence.indexOf(moduleName));
  const presetLabels = { explore: "Full portfolio", hiring: "Hiring manager", technical: "Technical" };
  const label = presetLabels[activePreset];
  presetName.textContent = label;
  presetPosition.textContent = `${String(sequenceIndex + 1).padStart(2, "0")} / ${String(sequence.length).padStart(2, "0")}`;
  presetProgress.style.width = `${((sequenceIndex + 1) / sequence.length) * 100}%`;
  presetStatus.setAttribute("aria-label", `${label} preset, step ${sequenceIndex + 1} of ${sequence.length}. Open preset controls.`);
  setNavigationState(moduleName);
  updateReviewedModules();
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
  const completion = document.querySelector("[data-transfer-complete]");
  const instruction = document.querySelector("[data-transfer-instruction]");
  const revealItems = Array.from(document.querySelectorAll("[data-home-reveal]"));

  function select(stepName, focus = false) {
    const step = TRANSFER_STEPS[stepName];
    const activeIndex = buttons.findIndex((button) => button.dataset.transferStep === stepName);
    if (!step || activeIndex < 0) return;

    buttons.forEach((button, index) => {
      const isSelected = index === activeIndex;
      button.setAttribute("aria-selected", String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
      button.classList.toggle("is-upstream", index < activeIndex);
      button.classList.toggle("is-next", index === activeIndex + 1);
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
    revealItems.forEach((item) => item.classList.toggle("is-revealed", activeIndex + 1 >= Number(item.dataset.homeReveal)));
    const isComplete = activeIndex === buttons.length - 1;
    completion.hidden = !isComplete;
    completion.classList.toggle("is-visible", isComplete);
    document.querySelector(".transfer-console").classList.toggle("is-complete", isComplete);
    instruction.textContent = isComplete ? "Route verified. Continue into the full systems path." : "Select each stage to trace how the experience transfers.";
    instruction.classList.toggle("is-complete", isComplete);
    if (isComplete) markModuleReviewed("home", "Home system route verified");
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

function createHomePanels() {
  const buttons = Array.from(document.querySelectorAll("[data-home-panel-button]"));
  const panels = Array.from(document.querySelectorAll("[data-home-panel]"));
  const openProcessButton = document.querySelector("[data-home-open-process]");

  function select(panelName) {
    buttons.forEach((button) => {
      const isActive = button.dataset.homePanelButton === panelName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    panels.forEach((panel) => panel.classList.toggle("is-mobile-active", panel.dataset.homePanel === panelName));
    document.querySelector(".home-view").scrollTop = 0;
  }

  buttons.forEach((button) => button.addEventListener("click", () => select(button.dataset.homePanelButton)));
  openProcessButton.addEventListener("click", () => select("process"));
  select("identity");
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
    if (activeIndex === buttons.length - 1) markModuleReviewed("experience", "Experience system path verified");
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

function createAgentConsole() {
  const consoleElement = document.querySelector("[data-agent-console]");
  const buttons = Array.from(document.querySelectorAll("[data-agent]"));
  const panel = document.querySelector("#agent-panel");
  const rootButton = document.querySelector(".agent-root");
  const name = document.querySelector("[data-agent-name]");
  const role = document.querySelector("[data-agent-role]");
  const model = document.querySelector("[data-agent-model]");
  const scope = document.querySelector("[data-agent-scope]");
  const description = document.querySelector("[data-agent-description]");
  const counter = document.querySelector("[data-agent-counter]");
  const status = document.querySelector("[data-agent-status]");
  const route = document.querySelector("[data-agent-route]");
  const visitedSpecialists = new Set();

  function select(agentName, focus = false) {
    const agent = AGENTS[agentName];
    if (!agent) return;
    const activeIndex = buttons.findIndex((button) => button.dataset.agent === agentName);

    buttons.forEach((button, index) => {
      const isSelected = index === activeIndex;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-selected", String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
      if (isSelected && focus) button.focus();
    });

    if (agentName !== "athena") visitedSpecialists.add(agentName);
    buttons.forEach((button) => button.classList.toggle("is-visited", button.dataset.agent === "athena" || visitedSpecialists.has(button.dataset.agent)));
    rootButton.classList.toggle("is-routing", agentName !== "athena");
    consoleElement.dataset.activeAgent = agentName;
    consoleElement.classList.remove("is-routing");
    void consoleElement.offsetWidth;
    if (agentName !== "athena" && !reduceMotion.matches) consoleElement.classList.add("is-routing");
    name.textContent = agentName.charAt(0).toUpperCase() + agentName.slice(1);
    role.textContent = agent.title;
    model.textContent = agent.model;
    scope.textContent = agent.scope;
    description.textContent = agent.description;
    counter.textContent = agentName === "athena" ? "Root / 07" : `${String(activeIndex).padStart(2, "0")} / 07`;
    status.textContent = `${agent.role} channel active`;
    route.textContent = agentName === "athena" ? "Athena / Planning" : `Athena / ${name.textContent}`;
    panel.setAttribute("aria-labelledby", buttons[activeIndex].id);
    panel.classList.remove("is-updating");
    void panel.offsetWidth;
    if (!reduceMotion.matches) panel.classList.add("is-updating");
    if (visitedSpecialists.size === buttons.length - 1) markModuleReviewed("agents", "AI workflow reviewed");
    playPanelTone(500 + (activeIndex * 45));
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => select(button.dataset.agent));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = buttons.length - 1;
      else nextIndex = (index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
      select(buttons[nextIndex].dataset.agent, true);
    });
  });

  select("athena");
}

function createUtilityControls() {
  const drawer = document.querySelector("[data-utility-drawer]");
  const utilityButtons = Array.from(document.querySelectorAll("[data-utility]"));
  const closeButton = document.querySelector("[data-utility-close]");
  const panels = Array.from(document.querySelectorAll("[data-utility-panel]"));
  const sceneButtons = Array.from(document.querySelectorAll("[data-scene]"));
  const presetButtons = Array.from(document.querySelectorAll("[data-preset]"));
  const auxiliaryButton = document.querySelector('[data-utility="auxiliary"]');
  const lightingButton = document.querySelector('[data-utility="lighting"]');
  const sceneRecallName = document.querySelector("[data-scene-recall-name]");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  let openPanel = "";
  let sceneRecallTimer;

  function closeDrawer() {
    drawer.hidden = true;
    openPanel = "";
    utilityButtons.forEach((button) => {
      if (button.dataset.utility !== "audio") button.setAttribute("aria-expanded", "false");
      if (button.dataset.utility !== "audio") button.classList.remove("is-active");
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
    const legacyScenes = { presentation: "daylight", night: "work" };
    const validScenes = ["work", "daylight", "party"];
    const requestedScene = legacyScenes[sceneName] || sceneName;
    const activeScene = validScenes.includes(requestedScene) ? requestedScene : "work";
    const sceneLabels = { work: "Work", daylight: "Daylight", party: "Party" };
    const themeColors = { work: "#111715", daylight: "#edf1ef", party: "#11101d" };

    document.documentElement.dataset.scene = activeScene;
    themeColor.content = themeColors[activeScene];
    lightingButton.dataset.currentScene = activeScene;
    lightingButton.title = `Lighting scenes / ${sceneLabels[activeScene]} active`;
    window.localStorage.setItem("wiltobuild-scene", activeScene);
    sceneButtons.forEach((button) => {
      const isActive = button.dataset.scene === activeScene;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    window.dispatchEvent(new CustomEvent("wiltobuild:scenechange", { detail: { scene: activeScene } }));
    if (announce) {
      window.clearTimeout(sceneRecallTimer);
      sceneRecallName.textContent = sceneLabels[activeScene];
      document.documentElement.classList.remove("is-recalling");
      void document.documentElement.offsetWidth;
      document.documentElement.classList.add("is-recalling");
      systemStatus.textContent = `Recalling ${sceneLabels[activeScene]} scene`;
      showControlToast(`${sceneLabels[activeScene]} lighting scene recalled`);
      playToneSequence({
        work: [[460, 0, 0.05], [560, 0.06, 0.07]],
        daylight: [[520, 0, 0.05], [680, 0.06, 0.05], [820, 0.12, 0.08]],
        party: [[440, 0, 0.045], [660, 0.05, 0.045], [880, 0.1, 0.09]]
      }[activeScene], { volume: 0.014 });
      sceneRecallTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("is-recalling");
        systemStatus.textContent = `${sceneLabels[activeScene]} environment active`;
      }, reduceMotion.matches ? 30 : 700);
    }
  }

  function applyPreset(presetName, announce = true) {
    activePreset = PRESETS[presetName] ? presetName : "explore";
    window.localStorage.setItem("wiltobuild-preset", activePreset);
    presetButtons.forEach((button) => {
      const isActive = button.dataset.preset === activePreset;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    updateInterface(activeModule);
    if (announce) {
      const presetLabel = { explore: "Full portfolio", hiring: "Hiring manager", technical: "Technical" }[activePreset];
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
      if (controlName === "auxiliary") {
        auxiliaryButton.classList.remove("is-discovery");
        window.localStorage.setItem("wiltobuild-service-discovered", "true");
      }
      openDrawer(controlName);
    });
  });

  sceneButtons.forEach((button) => button.addEventListener("click", () => applyScene(button.dataset.scene)));
  presetButtons.forEach((button) => button.addEventListener("click", () => applyPreset(button.dataset.preset)));
  presetStatus.addEventListener("click", () => openDrawer("presets"));
  closeButton.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !drawer.hidden) closeDrawer();
  });

  applyScene(window.localStorage.getItem("wiltobuild-scene") || "work", false);
  applyPreset(window.localStorage.getItem("wiltobuild-preset") || "explore", false);
  auxiliaryButton.classList.toggle("is-discovery", window.localStorage.getItem("wiltobuild-service-discovered") !== "true");
}

function createCredentialTerminal() {
  const buttons = Array.from(document.querySelectorAll("[data-credential]"));
  const record = document.querySelector(".credential-record");
  const fields = {
    issuer: document.querySelector("[data-credential-issuer]"),
    status: document.querySelector("[data-credential-status]"),
    title: document.querySelector("[data-credential-title]"),
    description: document.querySelector("[data-credential-description]"),
    practice: document.querySelector("[data-credential-practice]"),
    area: document.querySelector("[data-credential-area]"),
    demonstrates: document.querySelector("[data-credential-demonstrates]"),
    applied: document.querySelector("[data-credential-applied]")
  };
  const badge = document.querySelector("[data-credential-badge]");
  const reviewedCredentials = new Set();

  function select(credentialName, focus = false) {
    const credential = CREDENTIALS[credentialName];
    const activeIndex = buttons.findIndex((button) => button.dataset.credential === credentialName);
    if (!credential || activeIndex < 0) return;
    buttons.forEach((button, index) => {
      const isSelected = index === activeIndex;
      button.setAttribute("aria-selected", String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
      if (isSelected && focus) button.focus();
    });
    Object.entries(fields).forEach(([name, field]) => { field.textContent = credential[name]; });
    badge.src = credential.badge.src;
    badge.alt = credential.badge.alt;
    reviewedCredentials.add(credentialName);
    record.setAttribute("aria-labelledby", buttons[activeIndex].id);
    record.classList.remove("is-updating");
    void record.offsetWidth;
    if (!reduceMotion.matches) record.classList.add("is-updating");
    if (reviewedCredentials.size === buttons.length) markModuleReviewed("credentials", "Training records reviewed");
    playPanelTone(560 + (activeIndex * 70));
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => select(button.dataset.credential));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (index + direction + buttons.length) % buttons.length;
      select(buttons[nextIndex].dataset.credential, true);
    });
  });
  select("crestron");
}

function createServiceMode() {
  const serviceMode = document.querySelector("[data-service-mode]");
  const serviceTitle = document.querySelector("[data-service-title]");
  const launchButtons = Array.from(document.querySelectorAll("[data-service-launch]"));
  const appButtons = Array.from(document.querySelectorAll("[data-service-app]"));
  const appViews = Array.from(document.querySelectorAll("[data-service-view]"));
  const exitButton = document.querySelector("[data-service-exit]");
  const utilityDrawer = document.querySelector("[data-utility-drawer]");
  const serviceLoaderTitle = document.querySelector("[data-service-loader-title]");
  const navigationSurfaces = [
    document.querySelector(".control-rail"),
    document.querySelector(".mobile-dock-shell")
  ].filter(Boolean);
  let activeApp = "routing";
  let serviceLoaderTimer;
  let serviceReturnFocus = null;
  let serviceReturnScroll = 0;

  function selectApp(appName) {
    if (activeApp === "snake" && appName !== "snake") {
      if (snakeStarting) cancelSnakeCountdown();
      if (snakeRunning) {
        stopSnake();
        setSnakeState("paused");
      }
      stopServiceAudio();
    }
    activeApp = appName;
    appButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.serviceApp === appName));
    appViews.forEach((view) => { view.hidden = view.dataset.serviceView !== appName; });
    serviceTitle.textContent = appName === "routing" ? "Signal routing" : "WTB Snake";
    if (appName === "snake") drawSnake();
  }

  function openService(appName) {
    controlToast.classList.remove("is-visible");
    serviceReturnFocus = document.activeElement;
    serviceReturnScroll = document.querySelector(".screen-view.is-active")?.scrollTop || 0;
    utilityDrawer.hidden = true;
    document.querySelectorAll("[data-utility]").forEach((button) => {
      if (button.dataset.utility !== "audio") {
        button.setAttribute("aria-expanded", "false");
        button.classList.remove("is-active");
      }
    });
    serviceMode.hidden = false;
    displayScreen.inert = true;
    footerNextButton.inert = true;
    navigationSurfaces.forEach((surface) => { surface.inert = true; });
    controller.classList.add("is-servicing");
    serviceMode.classList.add("is-initializing");
    serviceLoaderTitle.textContent = appName === "routing" ? "Signal routing" : "WTB Snake";
    selectApp(appName);
    window.clearTimeout(serviceLoaderTimer);
    serviceLoaderTimer = window.setTimeout(() => {
      serviceMode.classList.remove("is-initializing");
      exitButton.focus();
    }, reduceMotion.matches ? 0 : 680);
    playPanelTone(780, 0.08);
  }

  function closeService() {
    window.clearTimeout(serviceLoaderTimer);
    cancelSnakeCountdown();
    stopServiceAudio();
    if (snakeRunning) {
      stopSnake();
      setSnakeState("paused");
    }
    serviceMode.classList.remove("is-initializing");
    serviceMode.hidden = true;
    displayScreen.inert = false;
    footerNextButton.inert = false;
    navigationSurfaces.forEach((surface) => { surface.inert = false; });
    controller.classList.remove("is-servicing");
    const activeView = document.querySelector(".screen-view.is-active");
    if (activeView) activeView.scrollTop = serviceReturnScroll;
    const returnTarget = serviceReturnFocus instanceof HTMLElement && serviceReturnFocus.offsetParent !== null
      ? serviceReturnFocus
      : document.querySelector('[data-utility="auxiliary"]');
    returnTarget.focus();
    showControlToast("Service application closed");
  }

  launchButtons.forEach((button) => button.addEventListener("click", () => openService(button.dataset.serviceLaunch)));
  appButtons.forEach((button) => button.addEventListener("click", () => selectApp(button.dataset.serviceApp)));
  exitButton.addEventListener("click", closeService);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !serviceMode.hidden) closeService();
  });

  const routingBoard = document.querySelector("[data-routing-board]");
  const routingMoves = document.querySelector("[data-routing-moves]");
  const routingStatus = document.querySelector("[data-routing-status]");
  const routingReset = document.querySelector("[data-routing-reset]");
  const routingModules = ["Source", "Switch", "Logic", "Output", "Room"];
  const routingTargets = [0, 0, 0, 0, 0];
  let routingRotations = [];
  let moves = 0;
  let routingEnergyTimers = [];

  function isRouteSolved() {
    return routingRotations.every((rotation, index) => rotation % 4 === routingTargets[index]);
  }

  function getConnectedModuleCount() {
    let connected = 0;
    while (connected < routingRotations.length && routingRotations[connected] % 4 === routingTargets[connected]) {
      connected += 1;
    }
    return connected;
  }

  function renderRoute() {
    routingEnergyTimers.forEach((timer) => window.clearTimeout(timer));
    routingEnergyTimers = [];
    const solved = isRouteSolved();
    const connectedCount = getConnectedModuleCount();
    routingBoard.innerHTML = routingModules.map((moduleName, index) => `
      <button type="button" class="routing-tile ${routingRotations[index] === routingTargets[index] ? "is-aligned" : "is-misaligned"} ${index < connectedCount ? "is-connected" : ""}" data-routing-tile="${index}" data-rotation="${routingRotations[index]}" aria-label="Rotate ${moduleName} module">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <div class="routing-hardware" aria-hidden="true">
          <i class="routing-port routing-port-in"></i>
          <b class="routing-dial" style="--route-rotation: ${routingRotations[index] * 90}deg"><i></i></b>
          <i class="routing-port routing-port-out"></i>
        </div>
        <strong>${moduleName}</strong>
        <small>${index < connectedCount ? "Signal active" : routingRotations[index] === routingTargets[index] ? "Aligned / waiting" : "Input misaligned"}</small>
      </button>
    `).join("");
    routingMoves.textContent = String(moves).padStart(2, "0");
    routingStatus.textContent = solved ? "System verified / route complete" : `${connectedCount} of ${routingModules.length} modules carrying signal`;
    routingStatus.classList.toggle("is-complete", solved);
    routingBoard.classList.toggle("is-complete", solved);
    routingBoard.classList.toggle("has-interacted", moves > 0);
    routingBoard.style.setProperty("--route-progress", `${(connectedCount / routingModules.length) * 90}%`);
    if (solved) {
      routingBoard.querySelectorAll("[data-routing-tile]").forEach((button, index) => {
        const energize = () => button.classList.add("is-energized");
        if (reduceMotion.matches) {
          energize();
        } else {
          routingEnergyTimers.push(window.setTimeout(energize, index * 115));
        }
      });
    }
    routingBoard.querySelectorAll("[data-routing-tile]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.routingTile);
        routingRotations[index] = (routingRotations[index] + 1) % 4;
        moves += 1;
        renderRoute();
        if (isRouteSolved()) {
          showControlToast("Signal route verified");
          playPanelTone(880, 0.12);
        } else {
          playPanelTone(index < getConnectedModuleCount() ? 610 : 430 + (index * 35));
        }
      });
    });
  }

  function resetRoute() {
    routingRotations = routingTargets.map((target) => (target + 1 + Math.floor(Math.random() * 3)) % 4);
    moves = 0;
    renderRoute();
  }
  routingReset.addEventListener("click", resetRoute);
  resetRoute();

  const canvas = document.querySelector("[data-snake-canvas]");
  const context = canvas.getContext("2d");
  const scoreOutput = document.querySelector("[data-snake-score]");
  const highOutput = document.querySelector("[data-snake-high]");
  const highInlineOutput = document.querySelector("[data-snake-high-inline]");
  const snakeStatus = document.querySelector("[data-snake-status]");
  const snakeToggle = document.querySelector("[data-snake-toggle]");
  const snakeCommand = document.querySelector("[data-snake-command]");
  const snakeCommandHint = document.querySelector("[data-snake-command-hint]");
  const snakeFlash = document.querySelector("[data-snake-flash]");
  const snakeCountdown = document.querySelector("[data-snake-countdown]");
  const snakeConsole = document.querySelector(".snake-console");
  const directionButtons = Array.from(document.querySelectorAll("[data-snake-direction]"));
  const gridSize = 18;
  const cellSize = canvas.width / gridSize;
  let snake = [];
  let food = { x: 13, y: 9 };
  let direction = { x: 1, y: 0 };
  let pendingDirection = direction;
  let snakeTimer;
  let snakeRunning = false;
  let snakeStarting = false;
  let snakeScore = 0;
  let foodPulse = 0;
  let countdownRun = 0;
  let lastDirectionSoundAt = 0;
  let highScore = Number(window.localStorage.getItem("wiltobuild-snake-high") || 0);

  function setSnakeState(state) {
    const states = {
      ready: ["Ready", "Start game", "Space bar"],
      countdown: ["Starting", "Stand by", "3 / 2 / 1"],
      running: ["Running", "Pause game", "Space bar"],
      paused: ["Paused", "Resume game", "Continue"],
      halted: ["Game over", "Restart game", "New round"]
    };
    const [status, command, hint] = states[state];
    snakeStatus.textContent = status;
    snakeCommand.textContent = command;
    snakeCommandHint.textContent = hint;
    snakeToggle.dataset.state = state;
    snakeConsole.dataset.state = state;
  }

  function playSnakeSound(soundName) {
    const sounds = {
      start: [[440, 0, 0.055], [610, 0.07, 0.07]],
      direction: [[320, 0, 0.022]],
      collect: [[720, 0, 0.045], [940, 0.045, 0.075]],
      pause: [[540, 0, 0.05], [390, 0.06, 0.07]],
      resume: [[420, 0, 0.05], [590, 0.055, 0.07]],
      fault: [[210, 0, 0.11], [150, 0.08, 0.15]],
      high: [[620, 0, 0.055], [780, 0.06, 0.055], [980, 0.12, 0.11]],
      count: [[500, 0, 0.035]],
      go: [[760, 0, 0.075]]
    };
    playToneSequence(sounds[soundName], {
      type: soundName === "direction" ? "square" : "sine",
      volume: soundName === "direction" ? 0.005 : 0.016,
      service: true
    });
  }

  function cancelSnakeCountdown() {
    countdownRun += 1;
    snakeStarting = false;
    snakeCountdown.hidden = true;
    snakeToggle.disabled = false;
    if (snakeConsole.dataset.state === "countdown") setSnakeState("ready");
  }

  function placeFood() {
    do {
      food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
  }

  function resetSnake() {
    stopSnake();
    cancelSnakeCountdown();
    snake = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }];
    direction = { x: 1, y: 0 };
    pendingDirection = direction;
    snakeScore = 0;
    scoreOutput.textContent = "00";
    highOutput.textContent = String(highScore).padStart(2, "0");
    highInlineOutput.textContent = String(highScore).padStart(2, "0");
    snakeConsole.classList.remove("is-scoring", "is-faulted", "is-high-score");
    setSnakeState("ready");
    placeFood();
    drawSnake();
  }

  function drawSnake() {
    const sceneStyles = getComputedStyle(document.documentElement);
    const sceneColor = (property, fallback) => sceneStyles.getPropertyValue(property).trim() || fallback;
    const gameBackground = sceneColor("--game-bg", "#07100d");
    const gameCell = sceneColor("--game-cell", "#0b1512");
    const gameGrid = sceneColor("--game-grid", "#1b2a25");
    const gameBorder = sceneColor("--game-border", "#315046");
    const gameTarget = sceneColor("--game-target", "#d7a45c");
    const gameHead = sceneColor("--game-head", "#f1f4ed");
    const gameSnake = sceneColor("--game-snake", "#b7ef5b");
    const gameSnakeAlt = sceneColor("--game-snake-alt", "#91c94b");
    foodPulse = (foodPulse + 1) % 8;
    context.fillStyle = gameBackground;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = gameCell;
    for (let row = 0; row < gridSize; row += 1) {
      for (let column = 0; column < gridSize; column += 1) {
        if ((row + column) % 2 === 0) {
          context.fillRect(column * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    context.strokeStyle = gameGrid;
    context.lineWidth = 1;
    for (let index = 0; index <= gridSize; index += 1) {
      context.beginPath();
      context.moveTo(index * cellSize, 0);
      context.lineTo(index * cellSize, canvas.height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, index * cellSize);
      context.lineTo(canvas.width, index * cellSize);
      context.stroke();
    }

    context.strokeStyle = gameBorder;
    context.lineWidth = 2;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    const foodCenterX = (food.x * cellSize) + (cellSize / 2);
    const foodCenterY = (food.y * cellSize) + (cellSize / 2);
    const foodRadius = 5 + (foodPulse * 0.35);
    context.save();
    context.translate(foodCenterX, foodCenterY);
    context.rotate(Math.PI / 4);
    context.shadowColor = gameTarget;
    context.shadowBlur = 14;
    context.fillStyle = gameTarget;
    context.fillRect(-foodRadius, -foodRadius, foodRadius * 2, foodRadius * 2);
    context.restore();

    snake.forEach((segment, index) => {
      const inset = index === 0 ? 2 : 3;
      const x = (segment.x * cellSize) + inset;
      const y = (segment.y * cellSize) + inset;
      const size = cellSize - (inset * 2);
      context.save();
      context.shadowColor = index === 0 ? gameHead : gameSnake;
      context.shadowBlur = index < 4 ? 9 - index : 2;
      context.fillStyle = index === 0 ? gameHead : index % 2 === 0 ? gameSnake : gameSnakeAlt;
      context.beginPath();
      context.roundRect(x, y, size, size, index === 0 ? 5 : 3);
      context.fill();
      context.restore();

      if (index === 0) {
        const eyeOffsetX = direction.x === 0 ? 4 : direction.x * 4;
        const eyeOffsetY = direction.y === 0 ? 4 : direction.y * 4;
        context.fillStyle = gameBackground;
        if (direction.x !== 0) {
          context.fillRect(x + (size / 2) + eyeOffsetX - 1, y + 3, 2, 2);
          context.fillRect(x + (size / 2) + eyeOffsetX - 1, y + size - 5, 2, 2);
        } else {
          context.fillRect(x + 3, y + (size / 2) + eyeOffsetY - 1, 2, 2);
          context.fillRect(x + size - 5, y + (size / 2) + eyeOffsetY - 1, 2, 2);
        }
      }
    });
  }

  window.addEventListener("wiltobuild:scenechange", drawSnake);

  function stopSnake() {
    window.clearInterval(snakeTimer);
    snakeRunning = false;
  }

  function endSnake() {
    stopSnake();
    setSnakeState("halted");
    snakeConsole.classList.add("is-faulted");
    const isNewHighScore = snakeScore > highScore;
    if (isNewHighScore) {
      snakeConsole.classList.add("is-high-score");
      highScore = snakeScore;
      window.localStorage.setItem("wiltobuild-snake-high", String(highScore));
      highOutput.textContent = String(highScore).padStart(2, "0");
      highInlineOutput.textContent = String(highScore).padStart(2, "0");
    }
    playSnakeSound(isNewHighScore ? "high" : "fault");
  }

  function tickSnake() {
    direction = pendingDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
    const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);
    if (hitWall || hitSelf) {
      endSnake();
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      snakeScore += 1;
      scoreOutput.textContent = String(snakeScore).padStart(2, "0");
      placeFood();
      snakeConsole.classList.remove("is-scoring");
      snakeFlash.classList.remove("is-active");
      void snakeConsole.offsetWidth;
      snakeConsole.classList.add("is-scoring");
      snakeFlash.classList.add("is-active");
      window.setTimeout(() => snakeFlash.classList.remove("is-active"), 260);
      showControlToast("Snake target collected");
      playSnakeSound("collect");
    } else {
      snake.pop();
    }
    drawSnake();
  }

  function runSnake() {
    snakeRunning = true;
    snakeStarting = false;
    snakeConsole.classList.remove("is-faulted");
    setSnakeState("running");
    snakeTimer = window.setInterval(tickSnake, 125);
  }

  async function beginSnakeCountdown() {
    const run = ++countdownRun;
    snakeStarting = true;
    snakeToggle.disabled = true;
    setSnakeState("countdown");
    playSnakeSound("start");
    snakeCountdown.hidden = false;

    for (const value of ["3", "2", "1"]) {
      if (run !== countdownRun || serviceMode.hidden || activeApp !== "snake") return;
      snakeCountdown.textContent = value;
      snakeCountdown.classList.remove("is-counting");
      void snakeCountdown.offsetWidth;
      snakeCountdown.classList.add("is-counting");
      playSnakeSound("count");
      await wait(reduceMotion.matches ? 90 : 520);
    }

    if (run !== countdownRun || serviceMode.hidden || activeApp !== "snake") return;
    snakeCountdown.textContent = "GO";
    playSnakeSound("go");
    await wait(reduceMotion.matches ? 80 : 260);
    if (run !== countdownRun) return;
    snakeCountdown.hidden = true;
    snakeToggle.disabled = false;
    runSnake();
  }

  function startSnake() {
    if (snakeStarting) return;
    if (snakeRunning) {
      stopSnake();
      setSnakeState("paused");
      playSnakeSound("pause");
      return;
    }
    if (snakeToggle.dataset.state === "paused") {
      runSnake();
      playSnakeSound("resume");
      return;
    }
    if (snakeToggle.dataset.state === "halted") resetSnake();
    beginSnakeCountdown();
  }

  function setSnakeDirection(name) {
    const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const next = directions[name];
    if (!next || (next.x === -direction.x && next.y === -direction.y)) return;
    if (next.x === pendingDirection.x && next.y === pendingDirection.y) return;
    pendingDirection = next;
    const now = performance.now();
    if (snakeRunning && now - lastDirectionSoundAt > 80) {
      playSnakeSound("direction");
      lastDirectionSoundAt = now;
    }
  }

  snakeToggle.addEventListener("click", startSnake);
  directionButtons.forEach((button) => button.addEventListener("click", () => setSnakeDirection(button.dataset.snakeDirection)));
  document.addEventListener("keydown", (event) => {
    if (serviceMode.hidden || activeApp !== "snake") return;
    const keys = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
    if (keys[event.key]) {
      event.preventDefault();
      setSnakeDirection(keys[event.key]);
    }
    if (event.code === "Space") {
      event.preventDefault();
      startSnake();
    }
  });
  resetSnake();
}

function createSkillFilter() {
  const buttons = Array.from(document.querySelectorAll("[data-skill-focus]"));
  const routes = Array.from(document.querySelectorAll("[data-supports]"));
  const summary = document.querySelector("[data-skill-summary]");
  const status = document.querySelector("[data-skill-status]");
  const reviewedFocuses = new Set();

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
    reviewedFocuses.add(focusName);
    if (reviewedFocuses.size === buttons.length) markModuleReviewed("skills", "Skills routes reviewed");
  }

  buttons.forEach((button) => button.addEventListener("click", () => select(button.dataset.skillFocus)));
  select("develop");
}

function createProjectCarousel() {
  const queue = document.querySelector("[data-project-track]");
  const workspace = document.querySelector("[data-project-workspace]");
  const status = document.querySelector("[data-project-status]");
  let currentIndex = 0;
  const reviewedProjects = new Set();

  queue.innerHTML = PROJECTS.map((project, index) => `
    <button type="button" class="project-queue-item" data-project-id="${project.id}" data-project-index="${index}" aria-label="Show project slot ${index + 1}: ${project.title}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${project.title}</strong>
      <small>${project.status}</small>
    </button>
  `).join("");

  const queueButtons = Array.from(queue.querySelectorAll("[data-project-id]"));

  function renderWorkspace(project, index) {
    const projectLinks = project.links?.map((link) => `
      <a href="${link.url}" target="_blank" rel="noreferrer">${link.label}<b aria-hidden="true">&#8599;</b></a>
    `).join("") || "";
    const projectAccess = project.access ? `<p class="project-access"><span>Repository</span><b>${project.access}</b></p>` : "";
    const detailLabels = project.labels || ["Context", "Decisions", "Evidence"];
    const projectVisual = project.visual ? `
      <figure class="project-visual">
        <iframe src="${project.visual}" title="Animated ${project.title} visual" loading="lazy" tabindex="-1"></iframe>
      </figure>
    ` : "";

    workspace.innerHTML = `
      <div class="project-card-header"><span>${project.status}</span><b>Slot ${String(index + 1).padStart(2, "0")}</b></div>
      <div class="project-workspace-layout${projectVisual ? " has-visual" : ""}">
        ${projectVisual}
        <div class="project-workspace-body">
          <div>
            <p>${project.kind}</p>
            <h3>${project.title}</h3>
            <span>${project.description}</span>
            ${projectLinks ? `<div class="project-actions">${projectLinks}</div>` : projectAccess}
          </div>
          <dl class="project-template" aria-label="${project.title} project details">
            <div><dt>${detailLabels[0]}</dt><dd>${project.evidence[0]}</dd></div>
            <div><dt>${detailLabels[1]}</dt><dd>${project.evidence[1]}</dd></div>
            <div><dt>${detailLabels[2]}</dt><dd>${project.evidence[2]}</dd></div>
          </dl>
        </div>
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
    reviewedProjects.add(currentIndex);
    if (reviewedProjects.size >= Math.min(3, PROJECTS.length)) markModuleReviewed("projects", "Project queue reviewed");
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
    if (event.target.closest("a, button")) return;
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
document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("is-page-hidden", document.hidden);
});

document.querySelector("#year").textContent = new Date().getFullYear();
configureSocialLinks();
createUtilityControls();
createHomePanels();
createTransferConsole();
createExperienceWorkbench();
createAgentConsole();
createSkillFilter();
createProjectCarousel();
createCredentialTerminal();
createServiceMode();
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
