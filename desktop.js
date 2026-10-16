import { PROJECTS, AGENTS } from "./portfolio-data.js";
const $ = (selector) => document.querySelector(selector);
const dialog = $("#portfolio-dialog"),
  content = $("#window-content");
let workspace = null,
  active = "",
  projectIndex = 0,
  previousFocus = null,
  cleanup = () => {},
  sound = false,
  audio = null,
  toastTimer;
const files = {
  about: "Hello, world.txt",
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
  about: () =>
    `<div class="about-grid"><div><p class="doc-kicker">01 / A LITTLE ABOUT ME</p><h3 class="doc-title">Hi, I’m Wil.<br>I connect the pieces.</h3><p class="doc-lede">I build software the way I approach a complex system: understand the people using it, trace the connections, and make it work.</p><p class="doc-lede">My background is in Crestron programming, AV automation, and systems integration. Today, I’m bringing that practical experience into AI and software development with Claude Code and Codex.</p><div class="doc-actions"><a class="doc-button" href="#projects">Explore my work ↗</a><a class="doc-button secondary" href="#contact">Say hello →</a></div></div><figure class="about-photo"><img src="./assets/wil-sheppard-headshot.png" alt="Wil Sheppard" width="380" height="440"><figcaption>WIL SHEPPARD<br>BUILT ON EXPERIENCE. DRIVEN BY CURIOSITY.</figcaption></figure></div><div class="fact-strip"><div><b>Since 2012</b><span>Independent AV integration<br>& project leadership</span></div><div><b>AI + software</b><span>Current direction<br>Pursuit Native AI Fellow</span></div><div><b>Human outcomes</b><span>Complex systems,<br>made useful for people</span></div></div>`,
  experience: () =>
    page(
      "BACKGROUND / SYSTEMS PRACTICE",
      "Complex systems.<br>Real-world experience.",
      `<p class="doc-lede">Independent AV systems integrator and project lead since 2012. I design, program, commission, and support systems across residential, commercial, enterprise, healthcare, and hospitality environments.</p><div class="fact-strip"><div><b>2,400+</b><span>Endpoints in the largest deployment</span></div><div><b>5 sectors</b><span>Residential to healthcare</span></div><div><b>Crestron</b><span>SIMPL Windows programming</span></div></div>${rows(
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
            "Claude Code, Codex, Git, HTML, CSS, and JavaScript. Break work into bounded tasks, review changes, and connect the pieces.",
          ],
          [
            "Verify the result",
            "Regression checks, browser verification, and fault isolation. Treat generated code as a proposal and test what the user actually experiences.",
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
      `<p class="doc-lede">I’m interested in entry-level AI development and software engineering opportunities where careful problem definition, testing, and clear communication matter.</p><span class="tag">● OPEN TO OPPORTUNITIES</span><div class="contact-links"><a href="mailto:wil.sheppard@gmail.com"><span><strong>Email me</strong><small>wil.sheppard@gmail.com</small></span><span>↗</span></a><a href="https://www.linkedin.com/in/william-sheppard-230a82132/" target="_blank" rel="noopener noreferrer"><span><strong>Connect on LinkedIn</strong><small>William Sheppard</small></span><span>↗</span></a><a href="https://github.com/wiltobuild" target="_blank" rel="noopener noreferrer"><span><strong>See what I’m building</strong><small>github.com/wiltobuild</small></span><span>↗</span></a><a href="https://x.com/WillBeBuilding" target="_blank" rel="noopener noreferrer"><span><strong>Follow along</strong><small>@WillBeBuilding</small></span><span>↗</span></a></div><button class="copy-email" id="copy-email">Copy email address</button>`,
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
function renderProject() {
  const p = projects[projectIndex];
  $("#project-detail").innerHTML =
    `<iframe class="project-visual" src="./${p.visual}" title="${p.title} animated project preview" loading="lazy" sandbox="allow-scripts"></iframe><div class="project-grid"><div><span class="tag">${p.status.toUpperCase()}</span><h3>${p.title}</h3><p>${p.description}</p><div class="doc-actions">${(p.links || []).map((link, i) => `<a class="doc-button ${i ? "secondary" : ""}" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label} ↗</a>`).join("")}</div>${p.access ? `<p class="small-note">${p.access}</p>` : ""}</div><ul class="evidence-list">${p.evidence.map((e, i) => `<li><b>${p.labels[i]}</b>${e}</li>`).join("")}</ul></div>`;
  document
    .querySelectorAll("[data-project]")
    .forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        String(Number(b.dataset.project) === projectIndex),
      ),
    );
  $("#window-status").textContent =
    `${projectIndex + 1} of ${projects.length} projects / ${p.title}`;
}
function setStart(open) {
  $("#start-menu").hidden = !open;
  $("#start").setAttribute("aria-expanded", String(open));
}
function open(route) {
  location.hash = route;
}
function close() {
  if (!dialog.open) return;
  location.hash = "home";
}
function route() {
  let name = location.hash.slice(1).split("/")[0];
  if (name === "home" || !name || !files[name]) {
    if (dialog.open) {
      cleanup();
      cleanup = () => {};
      dialog.close();
      content.innerHTML = "";
      active = "";
      document.body.style.overflow = "";
      workspace?.pause(false);
      previousFocus?.focus({ preventScroll: true });
    }
    document.title = "WilToBuild — Wil Sheppard’s workspace";
    return;
  }
  if (active === name) return;
  cleanup();
  cleanup = () => {};
  if (!dialog.open) {
    previousFocus = document.activeElement;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    workspace?.pause(true);
  }
  active = name;
  setStart(false);
  tone();
  $("#window-title").textContent = files[name];
  $("#taskbar-app").textContent = files[name];
  $("#window-location").textContent = `C:\\WIL\\${name.toUpperCase()}`;
  $("#window-status").textContent = "Ready";
  document.title = `${files[name]} | WilToBuild`;
  content.innerHTML = pages[name]();
  content.scrollTop = 0;
  document.querySelectorAll(".desktop-icons a").forEach((a) => {
    if (a.hash === `#${name}`) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (name === "projects") {
    renderProject();
    document.querySelectorAll("[data-project]").forEach((b) =>
      b.addEventListener("click", () => {
        projectIndex = Number(b.dataset.project);
        renderProject();
        tone(560);
      }),
    );
  }
  if (name === "contact")
    $("#copy-email").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("wil.sheppard@gmail.com");
        $("#copy-email").textContent = "Copied ✓";
        tone(660);
      } catch {
        $("#copy-email").textContent = "wil.sheppard@gmail.com";
      }
    });
  if (name === "snake") cleanup = initSnake();
  content.focus({ preventScroll: true });
}
window.addEventListener("hashchange", route);
dialog.addEventListener("cancel", (e) => {
  e.preventDefault();
  close();
});
["exit-desktop", "close-window", "shutdown"].forEach((id) =>
  $("#" + id).addEventListener("click", close),
);
$("#start").addEventListener("click", () => {
  setStart($("#start-menu").hidden);
  tone(320);
});
dialog.addEventListener("click", (e) => {
  if (!e.target.closest("#start-menu,#start")) setStart(false);
});
$("#maximize").addEventListener("click", () => {
  const max = dialog.classList.toggle("maximized");
  $("#maximize").setAttribute("aria-pressed", String(max));
  $("#maximize").setAttribute(
    "aria-label",
    max ? "Restore portfolio window size" : "Maximize portfolio window",
  );
});
$("#print-profile").addEventListener("click", () => window.print());
$("#sound").addEventListener("click", () => {
  sound = !sound;
  $("#sound").setAttribute("aria-pressed", String(sound));
  $("#sound").setAttribute(
    "aria-label",
    sound ? "Disable interface sound" : "Enable interface sound",
  );
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
  $("#clock").textContent = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  $("#clock").dateTime = now.toISOString();
  $("#year").textContent = now.getFullYear();
}
updateClock();
setInterval(updateClock, 30000);
function initSnake() {
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
  document.addEventListener("keydown", key);
  document.addEventListener("visibilitychange", visibility);
  $("#snake-start").addEventListener("click", start);
  document
    .querySelectorAll("[data-direction]")
    .forEach((b) =>
      b.addEventListener("click", () => turn(b.dataset.direction)),
    );
  draw();
  return () => {
    clearInterval(timer);
    document.removeEventListener("keydown", key);
    document.removeEventListener("visibilitychange", visibility);
  };
}
route();
// The content remains usable even when WebGL is blocked or the 3D module fails.
import("./scene.js")
  .then(({ createWorkspace }) => {
    workspace = createWorkspace($("#scene"), open);
    workspace.setNight(document.body.classList.contains("night"));
    $("#load-status").hidden = true;
    $("#scene").setAttribute("aria-busy", "false");
    if (dialog.open) workspace.pause(true);
  })
  .catch((error) => {
    console.warn("3D workspace unavailable:", error.message);
    document.body.classList.add("no-webgl");
    $("#scene").setAttribute("aria-busy", "false");
    $("#load-status").textContent =
      "The 3D workspace isn’t available here. Explore the portfolio with the three buttons below.";
    $("#reset-view").hidden = true;
  });
