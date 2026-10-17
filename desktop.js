import { aboutPage } from "./about-page.js?v=embedded-fde-20261017";
import {
  DESKTOP_APPS,
  appMarkup,
  mountDesktopApp,
} from "./desktop-apps.js?v=embedded-fde-20261017";
import { PROJECTS, AGENTS } from "./portfolio-data.js?v=embedded-fde-20261017";
import { createWindowManager } from "./window-manager.js?v=embedded-fde-20261017";
import { createBoot } from "./boot.js";
import { arrangeDesktopIcons } from "./icon-layout.js?v=embedded-fde-20261017";
import {
  decorateDesktop,
  desktopIcon,
} from "./desktop-icons.js?v=embedded-fde-20261017";
const template = document.querySelector("#monitor-screen");
decorateDesktop(template);
const screens = new Map();
for (const id of ["about", "projects", "contact"]) {
  const el = template.cloneNode(true);
  el.id = "monitor-screen-" + id;
  el.classList.add("monitor-screen");
  el.dataset.screen = id;
  el.setAttribute(
    "aria-label",
    id === "about"
      ? "Left monitor"
      : id === "projects"
        ? "Middle monitor"
        : "Right monitor",
  );
  el.querySelectorAll("[id]").forEach((child) => {
    const role = child.id;
    child.classList.add("role-" + role);
    child.dataset.role = role;
    child.id = id + "-" + role;
  });
  el.querySelector(".role-start").setAttribute(
    "aria-controls",
    id + "-start-menu",
  );
  el.querySelector(".role-window-help").id = id + "-window-help";
  document.body.append(el);
  screens.set(id, el);
}
template.remove();
let screen = screens.get("projects");
const $ = (selector) =>
  /^#(start|start-menu|shutdown|restart-computer|show-desktop|clock)$/.test(
    selector,
  )
    ? screen.querySelector('[data-role="' + selector.slice(1) + '"]')
    : document.querySelector(selector);
let workspace = null,
  projectIndex = 0,
  previousFocus = null,
  sound = false,
  audio = null,
  toastTimer;
arrangeDesktopIcons(
  screens,
  (id, x, y) => workspace?.pointOnScreen(id, x, y),
  () => toast("Your browser could not save icon positions."),
);
let sceneSettled = false,
  currentMonitor = null,
  inspectingCoffee = false,
  requestedMonitor = null,
  requestedDesktop = false,
  navigationVersion = 0;
const monitorNames = {
  about: "01 / Runelord",
  projects: "02 / Start here",
  contact: "03 / The connection",
};
const monitorFor = (name) =>
  name === "contact"
    ? "contact"
    : ["about", "projects", "snake"].includes(name)
      ? "projects"
      : "about";
function setOverviewInert(value) {
  document
    .querySelectorAll(
      ".skip-link,.site-header,.site-footer,.intro,.workspace-stamp,.workspace-bottom,.scene-tools",
    )
    .forEach((el) => {
      el.inert = value;
    });
}
const files = {
  ...Object.fromEntries(
    Object.entries(DESKTOP_APPS).map(([id, app]) => [id, app.title]),
  ),
  about: "About Wil — Start here",
  projects: "My Projects",
  experience: "Experience.txt",
  skills: "Builder’s toolkit",
  agents: "The Pantheon",
  credentials: "Credentials",
  contact: "Let’s connect",
  snake: "Snake.exe",
};
const projects = PROJECTS.filter((p) => p.status !== "Reserved");
function tone(freq = 440) {
  if (!sound) return;
  try {
    audio ||= new AudioContext();
    audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.035, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.12);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.12);
  } catch {
    sound = false;
    $("#sound").setAttribute("aria-pressed", "false");
  }
}
function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2500);
}
function page(kicker, title, body) {
  return `<p class="doc-kicker">${kicker}</p><h3 class="doc-title">${title}</h3>${body}`;
}
function rows(items) {
  return `<div class="file-list">${items.map(([title, desc], i) => `<article class="file-row"><span class="file-number">0${i + 1}</span><div><h3>${title}</h3><p>${desc}</p></div></article>`).join("")}</div>`;
}
const pages = {
  ...Object.fromEntries(
    Object.keys(DESKTOP_APPS).map((id) => [id, () => appMarkup(id)]),
  ),
  about: aboutPage,
  experience: () =>
    page(
      "BACKGROUND / SYSTEMS PRACTICE",
      "Complex systems.<br>Real-world experience.",
      `<p class="doc-lede">For 10+ years, I worked on-site with clients as an AV systems integrator and IT technician. I programmed Crestron control systems and supported deployments of 2,400+ connected endpoints in healthcare environments. I bring that experience with ambiguous requirements, real-world constraints, and customer handoff into full-stack software delivery.</p><div class="fact-strip"><div><b>2,400+</b><span>Connected endpoints in healthcare deployments supported</span></div><div><b>5 sectors</b><span>Residential to healthcare</span></div><div><b>Crestron</b><span>SIMPL Windows programming</span></div></div>${rows(
        [
          [
            "Understand the room",
            "Work with clients, facility teams, and end users to define what the system needs to do, its constraints, and how success will be verified.",
          ],
          [
            "Connect the system",
            "Program control logic, coordinate hardware and network dependencies, and make interfaces understandable for the people using them.",
          ],
          [
            "Trace the problem",
            "Reproduce faults, isolate variables, coordinate technicians and vendors, and verify fixes in the real environment.",
          ],
          [
            "Hand it over clearly",
            "Commission, document, and explain the working system. Those same habits now shape how I build and deliver software.",
          ],
        ],
      )}<p class="small-note">Client experience includes Leto’s Pizza, La Quinta Inns & Suites, University of Maryland Medical Center, and telehealth.</p>`,
    ),
  skills: () =>
    page(
      "TOOLS / PROCESS",
      "AI accelerates the work.<br>Judgment makes it useful.",
      `<p class="doc-lede">My toolkit combines the habits of a systems integrator with the speed of AI-assisted development.</p>${rows(
        [
          [
            "Frame the problem",
            "Requirements, context design, and system boundaries. Start with the person, the task, the constraints, and clear acceptance criteria.",
          ],
          [
            "Build with agents",
            "TypeScript, JavaScript, React, Next.js, Node.js, PostgreSQL, and Supabase. Claude Code and Codex support bounded tasks, review, and integration.",
          ],
          [
            "Verify the result",
            "Zod, Vitest, Playwright, regression checks, and fault isolation. Label what is verified, estimated, or unknown; test what the user actually experiences.",
          ],
          [
            "Make it usable",
            "Accessible interfaces, clear states, documentation, and thoughtful handoff. Working software should also be useful software.",
          ],
        ],
      )}<div class="doc-actions"><a class="doc-button" href="#agents">Explore my agent workflow ↗</a></div>`,
    ),
  agents: () =>
    page(
      "WORKFLOW / THE PANTHEON",
      "Nine agents.<br>One chain of command.",
      `<p class="doc-lede">The Pantheon is the multi-agent system I designed for my development workflow. Athena plans and coordinates, specialist agents handle bounded tasks, and independent escalation reasoning helps resolve ambiguity.</p><div class="agent-tree"><div class="agent-lead"><b>Athena</b><span>Planning · architecture · delegation</span></div><div class="agent-grid">${Object.entries(
        AGENTS,
      )
        .filter(([id]) => id !== "athena")
        .map(
          ([id, agent]) =>
            `<div><b>${id[0].toUpperCase() + id.slice(1)}</b><p>${agent.scope}</p></div>`,
        )
        .join(
          "",
        )}</div></div><p class="small-note">Deterministic code enforces actual restrictions. Security review advises; it does not act alone.</p><div class="doc-actions"><a href="./classic.html#agents" class="doc-button secondary">Full agent directory ↗</a></div>`,
    ),
  credentials: () =>
    page(
      "TRAINING / CONTINUING TO BUILD",
      "A practical foundation.<br>A new direction.",
      `<article class="credential"><img src="./assets/pursuit-native-ai.gif" alt="Pursuit Native AI Program"><div><span class="tag">CURRENT / JULY 2026 COHORT</span><h3>Pursuit Native AI Program — Fellow</h3><p>Building real software with AI tools and modern engineering practices. In progress.</p></div></article><article class="credential"><img src="./assets/credential-crestron.png" alt="Crestron programmer credential"><div><h3>Crestron Silver Programmer</h3><p>Control logic, device behavior, interfaces, and deployable automation. Applied to real systems and carried forward into software.</p></div></article><article class="credential"><img src="./assets/credential-cts.png" alt="AVIXA CTS credential"><div><h3>AVIXA Certified Technology Specialist</h3><p>AV systems principles, requirements, installation context, and client communication.</p></div></article>`,
    ),
  contact: () =>
    page(
      "03 / OPEN A CONNECTION",
      "Good things start<br>with a conversation.",
      `<p class="doc-lede">I’m looking for Forward Deployed Engineer, Product Engineer, or Software Engineer roles where I can work close to customers and ship dependable software. Based in NYC, open to on-site, hybrid, or remote work, and happy to travel to client sites.</p><span class="tag">● OPEN TO OPPORTUNITIES</span><div class="contact-links"><a href="mailto:wil.sheppard@gmail.com"><span><strong>Email me</strong><small>wil.sheppard@gmail.com</small></span><span>↗</span></a><a href="https://www.linkedin.com/in/wilsheppard/" target="_blank" rel="noopener noreferrer"><span><strong>Connect on LinkedIn</strong><small>William Sheppard</small></span><span>↗</span></a><a href="https://github.com/wiltobuild" target="_blank" rel="noopener noreferrer"><span><strong>See what I’m building</strong><small>github.com/wiltobuild</small></span><span>↗</span></a><a href="https://x.com/WillBeBuilding" target="_blank" rel="noopener noreferrer"><span><strong>Follow along</strong><small>@WillBeBuilding</small></span><span>↗</span></a></div><button class="copy-email" id="copy-email">Copy email address</button>`,
    ),
  projects: () =>
    page(
      "02 / MY PROJECTS",
      "Ideas, made tangible.",
      `<p class="doc-lede">Useful tools, connected systems, and a little curiosity. Select a folder to explore the build.</p><div class="project-tabs" role="group" aria-label="Choose a project">${projects.map((p, i) => `<button data-project="${i}" aria-pressed="${i === projectIndex}">▰ ${p.title}</button>`).join("")}</div><div id="project-detail"></div>`,
    ),
  snake: () =>
    page(
      "A:\\SNAKE.EXE / A LITTLE DOWNTIME",
      "Just one more round.",
      `<div class="snake-wrap"><canvas id="snake" width="360" height="360" role="img" aria-label="Snake game board"></canvas><div class="snake-info"><p>Score: <strong id="snake-score">0</strong><br>Best: <strong id="snake-best">0</strong></p><p id="snake-status" role="status">Ready when you are.</p><button id="snake-start" class="doc-button">Start game</button><p class="small-note">Arrow keys or WASD to move.<br>Space to pause. Escape to leave.</p><div class="snake-pad" aria-label="Snake direction controls"><button data-direction="up" aria-label="Move up">↑</button><button data-direction="left" aria-label="Move left">←</button><button data-direction="down" aria-label="Move down">↓</button><button data-direction="right" aria-label="Move right">→</button></div></div></div>`,
    ),
};
function renderProject(entry) {
  const p = projects[entry.projectIndex],
    app = DESKTOP_APPS[p.id];
  const appAction = app
    ? `<a class="doc-button" href="#${p.id}">${app.game ? "Play" : "Open"} in desktop →</a>`
    : "";
  const links = (p.links || []).filter((link) => !app || link.url !== app.url);
  entry.content.querySelector('[data-ui="project-detail"]').innerHTML =
    `${p.visual ? `<iframe class="project-visual" src="./${p.visual}" title="${p.title} animated project preview" loading="lazy" sandbox="allow-scripts"></iframe>` : `<div class="project-summary-banner">${p.kind}</div>`}<div class="project-grid"><div><span class="tag">${p.status.toUpperCase()}</span><h3>${p.title}</h3><p>${p.description}</p><div class="doc-actions">${appAction}${links.map((link, i) => `<a class="doc-button ${i ? "secondary" : ""}" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label} ↗</a>`).join("")}</div>${p.access ? `<p class="small-note">${p.access}</p>` : ""}</div><ul class="evidence-list">${p.evidence.map((e, i) => `<li><b>${p.labels[i]}</b>${e}</li>`).join("")}</ul></div>`;
  entry.content
    .querySelectorAll("[data-project]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.project) === entry.projectIndex),
      ),
    );
  entry.el.querySelector(".window-status-text").textContent =
    `${entry.projectIndex + 1} of ${projects.length} projects / ${p.title}`;
}
function renderApp(entry) {
  const icon = desktopIcon(entry.name);
  if (icon) {
    entry.el.querySelector(".window-titlebar h2").prepend(icon);
    entry.task.prepend(icon.cloneNode());
  }
  entry.content.innerHTML = pages[entry.name]().replace(
    /id="([^"]+)"/g,
    (_, id) => `id="${entry.key}-${id}" data-ui="${id}"`,
  );
  if (entry.name !== "about" && !DESKTOP_APPS[entry.name]) {
    entry.content.insertAdjacentHTML(
      "afterbegin",
      '<nav class="document-home" aria-label="Portfolio home"><a href="#about">← About Wil / Start here</a></nav>',
    );
  }
  if (DESKTOP_APPS[entry.name]) mountDesktopApp(entry);
  if (entry.name === "projects") {
    renderProject(entry);
    entry.content.querySelectorAll("[data-project]").forEach((button) =>
      button.addEventListener("click", () => {
        entry.projectIndex = Number(button.dataset.project);
        renderProject(entry);
        tone(560);
      }),
    );
  }
  if (entry.name === "contact") {
    const copy = entry.content.querySelector('[data-ui="copy-email"]');
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("wil.sheppard@gmail.com");
        copy.textContent = "Copied ✓";
        tone(660);
      } catch {
        copy.textContent = "wil.sheppard@gmail.com";
      }
    });
  }
  if (entry.name === "snake")
    entry.cleanup = initSnake(entry.content, () => windows.isActive(entry));
}
function setStart(value) {
  $("#start-menu").hidden = !value;
  $("#start").setAttribute("aria-expanded", String(value));
}
const windows = createWindowManager({
  screens,
  pointOnScreen: (id, x, y) => workspace?.pointOnScreen(id, x, y),
  hitScreen: (x, y) => workspace?.hitScreen(x, y),
  onFollow: followWindow,
  onTransfer: (entry, following) => {
    if (following) return;
    toast("Moved to " + monitorNames[entry.monitor] + " · position saved");
    if (!document.body.classList.contains("arrange-mode"))
      enterMonitor(entry.monitor, entry.name);
  },
  titles: files,
  render: renderApp,
  onActive: (entry) => {
    if (!sceneSettled) return;
    if (entry && currentMonitor) {
      currentMonitor = entry.monitor;
      screen = screens.get(entry.monitor);
      updateMonitorControls();
    }
    document.title = entry
      ? `${files[entry.name]} | WilToBuild`
      : "Desktop | WilToBuild";
    if (entry && currentMonitor)
      history.replaceState(null, "", `#${entry.name}`);
    document.querySelectorAll(".desktop-icons a").forEach((link) => {
      if (entry && link.hash === `#${entry.name}`)
        link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  },
});
function setSound(value) {
  sound = value;
  $("#sound").setAttribute("aria-pressed", String(sound));
  $("#sound").setAttribute(
    "aria-label",
    sound ? "Disable interface sound" : "Enable interface sound",
  );
  boot.setSound(value);
}
const boot = createBoot({
  onFinish: () => {
    if (!location.hash) history.replaceState(null, "", "#about");
    if (location.hash === "#home") workspace?.startTour();
    routePage();
    if (!currentMonitor) $("#workspace-nav a").focus({ preventScroll: true });
  },
  onSound: setSound,
  tone,
});
function navigate(name) {
  if (location.hash === `#${name}`) routePage();
  else location.hash = name;
}
function updateMonitorControls() {
  document
    .querySelectorAll("[data-monitor]")
    .forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        String(b.dataset.monitor === currentMonitor),
      ),
    );
  $("#monitor-caption").textContent = document.body.classList.contains(
    "arrange-mode",
  )
    ? "Drag a title bar between screens"
    : monitorNames[currentMonitor] || "Shared desktop";
}
function setScreensInteractive(id, all = false) {
  screens.forEach((el, key) => {
    el.hidden = false;
    el.inert = !(all || key === id);
    el.style.pointerEvents = el.inert ? "none" : "auto";
  });
}
function enterMonitor(id, name) {
  requestedMonitor = id;
  requestedDesktop = !name;
  navigate(
    name ||
      windows.lastRoute(id) ||
      { about: "runelord", projects: "projects", contact: "contact" }[id],
  );
}
function open(route) {
  if (route === "coffee") {
    navigate("coffee");
    return;
  }
  if (["about", "projects", "contact"].includes(route)) enterMonitor(route);
  else {
    requestedMonitor = windows.monitorOf(route) || monitorFor(route);
    navigate(route);
  }
}
function close() {
  if (currentMonitor || inspectingCoffee) location.hash = "home";
}
async function arrangeWindows(force = false) {
  if (!workspace) return;
  if (document.body.classList.contains("arrange-mode") && !force) {
    enterMonitor(currentMonitor || "projects");
    return;
  }
  const version = ++navigationVersion;
  currentMonitor ||= "projects";
  document.body.classList.add("monitor-mode", "arrange-mode", "moving-camera");
  setOverviewInert(true);
  $("#monitor-controls").hidden = false;
  $("#desktop-dock").hidden = false;
  $("#arrange-windows").setAttribute("aria-pressed", "true");
  $("#desktop-hint").textContent =
    "Drag windows between screens · or drop on a monitor button";
  updateMonitorControls();
  setScreensInteractive(null, true);
  await workspace.arrange();
  if (version !== navigationVersion) return;
  document.body.classList.remove("moving-camera");
  setScreensInteractive(null, true);
}
async function followWindow(entry) {
  const version = ++navigationVersion;
  currentMonitor = entry.monitor;
  screen = screens.get(currentMonitor);
  requestedMonitor = null;
  requestedDesktop = false;
  document.body.classList.add("monitor-mode", "moving-camera");
  document.body.classList.remove("arrange-mode");
  setScreensInteractive(currentMonitor);
  updateMonitorControls();
  $("#desktop-hint").textContent =
    "Following your window · release anywhere to keep its position";
  await workspace?.follow(currentMonitor);
  if (version !== navigationVersion) return;
  document.body.classList.remove("moving-camera");
  $("#desktop-hint").textContent =
    "Drag a title bar to either screen edge to move between monitors";
}
async function inspectCoffee() {
  const version = ++navigationVersion;
  previousFocus = document.activeElement;
  windows.suspend();
  inspectingCoffee = true;
  document.body.style.overflow = "hidden";
  currentMonitor = null;
  requestedMonitor = null;
  setScreensInteractive(null);
  setOverviewInert(true);
  document.body.classList.remove("monitor-mode", "arrange-mode");
  document.body.classList.add("coffee-mode", "moving-camera");
  $("#monitor-controls").hidden = $("#desktop-dock").hidden = true;
  $("#coffee-controls").hidden = $("#coffee-card").hidden = false;
  document.title = "Coffee break | WilToBuild";
  await workspace?.inspectCoffee();
  if (version !== navigationVersion) return;
  document.body.classList.remove("moving-camera");
  $("#leave-coffee").focus({ preventScroll: true });
}
async function routePage() {
  if (!sceneSettled || boot.isActive()) return;
  const version = ++navigationVersion,
    name = location.hash.slice(1).split("/")[0],
    projectId = location.hash.slice(1).split("/")[1];
  if (name === "coffee") {
    await inspectCoffee();
    return;
  }
  const wasCoffee = inspectingCoffee;
  inspectingCoffee = false;
  document.body.classList.remove("coffee-mode");
  $("#coffee-controls").hidden = $("#coffee-card").hidden = true;
  if (!files[name]) {
    if (currentMonitor || wasCoffee) {
      windows.suspend();
      setStart(false);
      setScreensInteractive(null);
      document.body.classList.add("moving-camera");
      document.body.classList.remove("monitor-mode", "arrange-mode");
      $("#monitor-controls").hidden = true;
      $("#desktop-dock").hidden = true;
      if (workspace) await workspace.leave();
      if (version !== navigationVersion) return;
      currentMonitor = null;
      requestedMonitor = null;
      document.body.classList.remove("moving-camera");
      document.body.style.overflow = "";
      setOverviewInert(false);
      previousFocus?.focus({ preventScroll: true });
    } else setScreensInteractive(null);
    document.title = "WilToBuild — Wil Sheppard’s workspace";
    return;
  }
  const id =
      requestedMonitor ||
      windows.monitorOf(name) ||
      currentMonitor ||
      monitorFor(name),
    resume = requestedDesktop;
  requestedMonitor = null;
  requestedDesktop = false;
  const needsFlight =
    currentMonitor !== id ||
    screen.inert ||
    !document.body.classList.contains("monitor-mode") ||
    document.body.classList.contains("arrange-mode");
  if (!currentMonitor) {
    previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
  }
  if (needsFlight) windows.suspend();
  currentMonitor = id;
  screen = screens.get(id);
  document.body.classList.add("monitor-mode");
  document.body.classList.remove("arrange-mode");
  setOverviewInert(true);
  $("#monitor-controls").hidden = false;
  $("#desktop-dock").hidden = false;
  $("#arrange-windows").setAttribute("aria-pressed", "false");
  $("#desktop-hint").textContent =
    "Drag a title bar to a screen edge · Alt + ← / → to pan · scroll to zoom";
  updateMonitorControls();
  setStart(false);
  tone();
  let flight;
  if (needsFlight) {
    setScreensInteractive(null);
    document.body.classList.add("moving-camera");
    if (workspace) flight = workspace.focus(id);
  }
  windows.setMonitor(id);
  const entry = resume ? windows.resume() : windows.open(name);
  if (name === "projects" && projectId && entry) {
    const selected = projects.findIndex((p) => p.id === projectId);
    if (selected >= 0) {
      entry.projectIndex = selected;
      renderProject(entry);
      history.replaceState(null, "", `#projects/${projectId}`);
    }
  }
  if (flight) await flight;
  if (version !== navigationVersion) return;
  document.body.classList.remove("moving-camera");
  setScreensInteractive(id);
  (entry?.content || $("#start")).focus({ preventScroll: true });
}
function panMonitor(direction) {
  const ids = ["about", "projects", "contact"],
    index = ids.indexOf(currentMonitor);
  enterMonitor(
    ids[Math.max(0, Math.min(2, (index < 0 ? 1 : index) + direction))],
  );
}
window.addEventListener("hashchange", routePage);
document.addEventListener("keydown", (event) => {
  if (boot.isActive()) return;
  if (event.key === "Escape" && (currentMonitor || inspectingCoffee)) {
    event.preventDefault();
    close();
  }
  if (event.altKey && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    panMonitor(event.key === "ArrowLeft" ? -1 : 1);
  }
});
$("#leave-monitor").addEventListener("click", close);
$("#inspect-coffee").addEventListener("click", () => navigate("coffee"));
$("#leave-coffee").addEventListener("click", close);
$("#arrange-windows").addEventListener("click", () => arrangeWindows());
document
  .querySelectorAll("[data-monitor],[data-drop-monitor]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      enterMonitor(button.dataset.monitor || button.dataset.dropMonitor),
    ),
  );
document
  .querySelectorAll("[data-pan]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      panMonitor(Number(button.dataset.pan)),
    ),
  );
screens.forEach((el, id) => {
  el.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link) {
      event.preventDefault();
      currentMonitor = id;
      screen = el;
      setStart(false);
      requestedMonitor =
        windows.monitorOf(link.hash.slice(1).split("/")[0]) || id;
      navigate(link.hash.slice(1));
    }
    if (!event.target.closest(".role-start-menu,.role-start"))
      el.querySelector(".role-start-menu").hidden = true;
  });
  el.querySelector(".role-start").onclick = () => {
    currentMonitor = id;
    screen = el;
    setStart($("#start-menu").hidden);
    tone(320);
  };
  el.querySelector(".role-show-desktop").onclick = () => {
    windows.setMonitor(id);
    windows.showDesktop();
  };
  el.querySelector(".role-shutdown").onclick = close;
  el.querySelector(".role-restart-computer").onclick = restartBoot;
});
function restartBoot() {
  windows.suspend();
  setStart(false);
  location.hash = "home";
  boot.restart();
}
$("#replay-boot").addEventListener("click", restartBoot);
$("#sound").addEventListener("click", () => {
  setSound(!sound);
  tone(660);
  toast(sound ? "Interface sound on" : "Interface sound off");
});
$("#lights").addEventListener("click", () => {
  const night = document.body.classList.toggle("night");
  $("#lights").setAttribute("aria-pressed", String(night));
  $("#lights").setAttribute(
    "aria-label",
    night ? "Turn on daylight lighting" : "Turn on evening lighting",
  );
  workspace?.setNight(night);
});
$("#reset-view").addEventListener("click", () => {
  workspace?.reset();
  tone(330);
});
function updateClock() {
  const now = new Date();
  screens.forEach((el) => {
    const clock = el.querySelector(".role-clock");
    clock.textContent = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    clock.dateTime = now.toISOString();
  });
  $("#year").textContent = now.getFullYear();
}
updateClock();
setInterval(updateClock, 30000);

function initSnake(root, isActive) {
  const $ = (selector) =>
    root.querySelector(`[data-ui="${selector.slice(1)}"]`);
  const canvas = $("#snake"),
    ctx = canvas.getContext("2d");
  let snake = [
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 4, y: 10 },
    ],
    direction = { x: 1, y: 0 },
    next = { x: 1, y: 0 },
    food = { x: 13, y: 10 },
    score = 0,
    running = false,
    ended = false,
    timer = 0,
    best = 0;
  try {
    best = Number(localStorage.getItem("wtb-snake-best")) || 0;
  } catch {}
  $("#snake-best").textContent = best;
  const draw = () => {
    ctx.fillStyle = "#18332a";
    ctx.fillRect(0, 0, 360, 360);
    ctx.strokeStyle = "#254439";
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 18, 0);
      ctx.lineTo(i * 18, 360);
      ctx.moveTo(0, i * 18);
      ctx.lineTo(360, i * 18);
      ctx.stroke();
    }
    ctx.fillStyle = "#deac63";
    ctx.fillRect(food.x * 18 + 3, food.y * 18 + 3, 12, 12);
    snake.forEach((p, i) => {
      ctx.fillStyle = i ? "#88aa67" : "#d4e6ac";
      ctx.fillRect(p.x * 18 + 1, p.y * 18 + 1, 16, 16);
    });
  };
  const pause = () => {
    running = false;
    clearInterval(timer);
    $("#snake-status").textContent = "Paused";
    $("#snake-start").textContent = "Resume game";
  };
  function tick() {
    direction = next;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const eating = head.x === food.x && head.y === food.y;
    const body = eating ? snake : snake.slice(0, -1);
    if (
      head.x < 0 ||
      head.x >= 20 ||
      head.y < 0 ||
      head.y >= 20 ||
      body.some((p) => p.x === head.x && p.y === head.y)
    ) {
      pause();
      ended = true;
      $("#snake-status").textContent = "Game over. One more?";
      $("#snake-start").textContent = "Play again";
      tone(130);
      return;
    }
    snake.unshift(head);
    if (eating) {
      score += 10;
      $("#snake-score").textContent = score;
      if (score > best) {
        best = score;
        $("#snake-best").textContent = best;
        try {
          localStorage.setItem("wtb-snake-best", String(best));
        } catch {}
      }
      if (snake.length === 400) {
        pause();
        ended = true;
        $("#snake-status").textContent = "You filled the board. You win!";
        $("#snake-start").textContent = "Play again";
        return;
      }
      do {
        food = {
          x: Math.floor(Math.random() * 20),
          y: Math.floor(Math.random() * 20),
        };
      } while (snake.some((p) => p.x === food.x && p.y === food.y));
      tone(740);
    } else snake.pop();
    draw();
  }
  const start = () => {
    if (running) {
      pause();
      return;
    }
    if (ended) {
      snake = [
        { x: 6, y: 10 },
        { x: 5, y: 10 },
        { x: 4, y: 10 },
      ];
      next = direction = { x: 1, y: 0 };
      food = { x: 13, y: 10 };
      score = 0;
      $("#snake-score").textContent = "0";
      ended = false;
    }
    running = true;
    $("#snake-status").textContent = "Collect the amber pixels.";
    $("#snake-start").textContent = "Pause game";
    timer = setInterval(tick, 140);
    draw();
  };
  const dirs = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const turn = (d) => {
    const proposed = dirs[d];
    if (proposed.x !== -direction.x || proposed.y !== -direction.y)
      next = proposed;
  };
  const key = (e) => {
    if (!isActive()) return;
    const d = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    }[e.key];
    if (d) {
      e.preventDefault();
      turn(d);
    }
    if (e.code === "Space" && !e.target.closest("button")) {
      e.preventDefault();
      start();
    }
  };
  const visibility = () => {
    if (document.hidden && running) pause();
  };
  const deactivate = () => {
    if (running) pause();
  };
  root.parentElement.addEventListener("desktop:deactivate", deactivate);
  document.addEventListener("keydown", key);
  document.addEventListener("visibilitychange", visibility);
  $("#snake-start").addEventListener("click", start);
  root
    .querySelectorAll("[data-direction]")
    .forEach((b) =>
      b.addEventListener("click", () => turn(b.dataset.direction)),
    );
  draw();
  return () => {
    clearInterval(timer);
    root.parentElement.removeEventListener("desktop:deactivate", deactivate);
    document.removeEventListener("keydown", key);
    document.removeEventListener("visibilitychange", visibility);
  };
}
// Begin real resource checks behind the Start prompt; the BIOS animates their results.
boot.track("portfolio.dat", Promise.resolve(PROJECTS));
boot.track("desktop.sys", Promise.resolve(windows));
const sceneModule = import("./scene.js?v=embedded-fde-20261017");
boot.track("three.dll", sceneModule);
boot.track("crt-driver.sys", sceneModule);
const sceneReady = sceneModule
  .then(({ createWorkspace }) => {
    workspace = createWorkspace($("#scene"), open, screens);
    workspace.setNight(document.body.classList.contains("night"));
    $("#load-status").hidden = true;
    $("#scene").setAttribute("aria-busy", "false");
    windows.initialize();
    sceneSettled = true;
  })
  .catch((error) => {
    console.warn("3D workspace unavailable:", error.message);
    document.body.classList.add("no-webgl");
    $("#scene").setAttribute("aria-busy", "false");
    $("#load-status").textContent =
      "The 3D workspace isn’t available here. Explore the portfolio with the three buttons below.";
    $("#reset-view").hidden = true;
    screens.forEach((el) => {
      document.body.append(el);
      el.removeAttribute("style");
      el.hidden = false;
    });
    windows.initialize();
    $("#arrange-windows").hidden = true;
    $("#inspect-coffee").hidden = true;
    sceneSettled = true;
  });
boot.track("workstation.3d", sceneReady);
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image(),
      timer = setTimeout(() => reject(new Error("Image timeout")), 8000);
    img.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Image unavailable"));
    };
    img.src = url;
  });
}
boot.track(
  "wil-sheppard.bmp",
  preloadImage("./assets/wil-sheppard-headshot.png"),
);
boot.track("crestron.bmp", preloadImage("./assets/credential-crestron.png"));
boot.track("cts.bmp", preloadImage("./assets/credential-cts.png"));
for (const project of projects.filter((p) => p.visual))
  boot.track(
    `${project.title.toLowerCase()}.app`,
    fetch(`./${project.visual}`, { signal: AbortSignal.timeout(8000) }).then(
      (response) => {
        if (!response.ok) throw new Error("Preview unavailable");
        return response.text();
      },
    ),
  );
boot.track("snake.exe", Promise.resolve());
boot.setReady(sceneReady);
