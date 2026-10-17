// Only these known app destinations are embedded in the personal desktop.
export const DESKTOP_APPS = {
  cephalon: {
    title: "Cephalon",
    name: "Cephalon",
    url: "https://cephalon.vercel.app/",
  },
  "rush-hour": {
    title: "Rush Hour",
    name: "Rush Hour",
    url: "https://rush-hour-bay.vercel.app/",
  },
  gitfit: {
    title: "GitFit",
    name: "GitFit",
    url: "https://gitfit-pursuit6.vercel.app/",
  },
  salesscope: {
    title: "SalesScope — Reporting demo",
    name: "SalesScope",
    url: "https://wiltobuild.github.io/SalesScope/legacy/",
  },
  runelord: {
    title: "Runelord.exe",
    name: "Runelord",
    url: "https://wiltobuild.github.io/runelord/",
    viewport: [1280, 720],
    game: true,
  },
  runespeak: {
    title: "RuneSpeak.exe",
    name: "RuneSpeak",
    url: "https://wiltobuild.github.io/RuneSpeak/",
    viewport: [1280, 800],
    game: true,
  },
  vexa: {
    title: "Vexa",
    name: "Vexa",
    url: "https://vexa-livid.vercel.app/",
  },
  triagepilot: {
    title: "TriagePilot",
    name: "TriagePilot",
    url: "https://triagepilot-ruddy.vercel.app/",
    protected: true,
  },
};

export function appMarkup(name) {
  const app = DESKTOP_APPS[name];
  const frame = `<iframe class="desktop-app-frame${app.viewport ? " fitted-app-frame" : ""}" ${app.protected ? "hidden" : `src="${app.url}"`} title="${app.name}${app.game ? " playable game" : " desktop app"}" allow="autoplay; gamepad${name === "vexa" ? "; microphone" : ""}" sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-pointer-lock"></iframe>`;
  if (!app.protected) return frame;
  return `<div class="protected-app-toolbar"><span>TriagePilot · protected preview</span><button data-access-notice>Access notice</button></div>
    <div class="protected-app-stage">${frame}
      <div class="app-access-notice" role="status">
        <span class="access-icon" aria-hidden="true">▣</span>
        <p class="doc-kicker">PRIVATE WORKSPACE</p>
        <h3>TriagePilot requires sign-in.</h3>
        <p>This preview uses TriagePilot’s existing username and password protection. If you’re already signed in in this browser, connect below to use it inside this window.</p>
        <button class="doc-button" data-connect-app>Connect to TriagePilot →</button>
        <p class="small-note" data-access-status>If your browser requests sign-in, complete or dismiss that prompt. You can return here with “Access notice.” Your portfolio never stores your sign-in details.</p>
      </div>
    </div>`;
}

export function mountDesktopApp(entry) {
  const app = DESKTOP_APPS[entry.name];
  entry.el.classList.add("embedded-app-window");
  const frame = entry.content.querySelector("iframe");
  let observer;
  let connectionTimer;
  if (app.viewport) {
    const [width, height] = app.viewport;
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    observer = new ResizeObserver(() => {
      entry.content.style.setProperty(
        "--app-scale",
        Math.min(
          entry.content.clientWidth / width,
          entry.content.clientHeight / height,
        ),
      );
    });
    observer.observe(entry.content);
  }
  if (app.protected) {
    const notice = entry.content.querySelector(".app-access-notice");
    const status = entry.content.querySelector("[data-access-status]");
    const showNotice = () => {
      clearTimeout(connectionTimer);
      frame.hidden = true;
      frame.removeAttribute("src");
      notice.hidden = false;
    };
    frame.addEventListener("load", () => {
      if (!frame.hidden) clearTimeout(connectionTimer);
    });
    entry.content.querySelector("[data-connect-app]").onclick = () => {
      clearTimeout(connectionTimer);
      frame.hidden = false;
      notice.hidden = true;
      frame.src = app.url;
      // A browser-level authentication challenge can leave the frame pending.
      // Stop that attempt and restore a useful notice instead of a blank window.
      connectionTimer = setTimeout(() => {
        showNotice();
        status.textContent =
          "The protected app did not finish loading. Complete sign-in in your browser before reconnecting. TriagePilot’s access protection remains enabled.";
      }, 10000);
    };
    entry.content.querySelector("[data-access-notice]").onclick = () => {
      showNotice();
      entry.content
        .querySelector("[data-connect-app]")
        .focus({ preventScroll: true });
    };
  }
  entry.cleanup = () => {
    observer?.disconnect();
    clearTimeout(connectionTimer);
  };
}
