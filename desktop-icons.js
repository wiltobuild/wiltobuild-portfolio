// Original 32-pixel artwork in the limited palette and stepped shapes of a 1995 desktop.
const rect = (x, y, w, h, fill) =>
  `<path fill="${fill}" d="M${x} ${y}h${w}v${h}h-${w}z"/>`;
const shape = (d, fill, stroke = "#000") =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
const paper =
  shape("M7 2h14l6 6v22H7z", "#fff") +
  shape("M21 2v6h6", "#c0c0c0") +
  rect(9, 4, 2, 24, "#dfdfdf");
const monitor =
  shape("M2 3h25v19H2z", "#c0c0c0") +
  rect(3, 4, 23, 1, "#fff") +
  rect(4, 6, 21, 13, "#000") +
  rect(5, 7, 19, 11, "#008080") +
  rect(6, 8, 17, 1, "#00ffff") +
  shape("M11 22h8v4h5v3H6v-3h5z", "#c0c0c0") +
  rect(7, 27, 16, 1, "#fff") +
  rect(22, 20, 2, 1, "#00ff00");
const icons = {
  runelord:
    shape("M3 12h14v11l-7 7-7-7z", "#000080") +
    shape("M5 14h10v8l-5 5-5-5z", "#0000ff") +
    shape("M25 1h5v5L16 20l-4-4z", "#fff") +
    shape("M27 3v3L15 18l-1-1z", "#808080") +
    shape("M8 17l3-3 9 9-3 3z", "#ffff00") +
    shape("M13 22l3 3-6 6-3-3z", "#800000") +
    rect(8, 28, 2, 2, "#ffff00"),
  runespeak:
    shape("M3 5l12-3 13 3v23l-13-3-12 3z", "#800080") +
    shape("M5 6l10-2v19L5 26z", "#fff") +
    shape("M16 4l10 3v19l-10-3z", "#ffffc0") +
    rect(14, 4, 2, 21, "#808080") +
    shape("M20 9v11m0-11 4 4-4 3", "none", "#000080") +
    rect(7, 10, 5, 1, "#808080") +
    rect(7, 13, 5, 1, "#808080") +
    rect(7, 16, 4, 1, "#808080") +
    rect(7, 19, 5, 1, "#808080"),
  vexa:
    shape("M2 3h22v16H12l-7 5v-5H2z", "#c0c0c0") +
    rect(3, 4, 20, 1, "#fff") +
    rect(4, 6, 18, 10, "#000080") +
    rect(6, 9, 13, 1, "#fff") +
    rect(6, 12, 9, 1, "#00ffff") +
    shape("M13 16h17v12h-4v3l-5-3h-8z", "#800080") +
    rect(15, 18, 13, 1, "#ff00ff") +
    rect(16, 21, 10, 1, "#fff") +
    rect(16, 24, 7, 1, "#fff"),
  triagepilot:
    shape("M5 4h22v26H5z", "#808000") +
    rect(7, 6, 18, 22, "#fff") +
    shape("M11 2h10v5H11z", "#c0c0c0") +
    rect(12, 3, 8, 1, "#fff") +
    rect(14, 10, 5, 12, "#ff0000") +
    rect(10, 14, 13, 4, "#ff0000") +
    rect(10, 25, 12, 1, "#808080"),
  about:
    monitor +
    shape("M21 13h6v2h2v6h-2v2h-6v-2h-2v-6h2z", "#ffdfbf") +
    shape("M17 29v-5h4l3 2 3-2h4v7H17z", "#000080") +
    rect(21, 13, 6, 2, "#800000"),
  projects:
    shape("M2 6h11l3 3h13v19H2z", "#808000") +
    shape("M3 7h9l3 3h13v3H3z", "#ffff80") +
    shape("M2 13h28l-3 15H1z", "#ffff00") +
    rect(3, 14, 26, 1, "#fff") +
    shape("M2 27h25v2H1v-2z", "#808000"),
  experience:
    shape("M11 4h10v7h-3V7h-4v4h-3z", "#800000") +
    shape("M2 10h28v19H2z", "#800000") +
    rect(3, 11, 26, 2, "#dfaf6f") +
    rect(3, 14, 26, 7, "#a06020") +
    rect(2, 21, 28, 2, "#000") +
    rect(14, 19, 5, 6, "#000") +
    rect(15, 20, 3, 4, "#ffff00") +
    rect(4, 24, 1, 3, "#dfaf6f"),
  skills:
    shape("M4 3h6v7l3 3-3 4v12H5V17l-3-4 2-3z", "#c0c0c0") +
    rect(6, 4, 2, 8, "#fff") +
    rect(6, 18, 2, 9, "#808080") +
    shape("M21 2h4v14l4 3v10h-10V19l2-3z", "#000") +
    rect(22, 3, 2, 14, "#c0c0c0") +
    rect(20, 20, 8, 9, "#ff0000") +
    rect(21, 21, 2, 6, "#ff8080"),
  agents:
    rect(15, 9, 2, 16, "#808080") +
    rect(6, 23, 21, 2, "#808080") +
    rect(6, 21, 2, 6, "#808080") +
    rect(25, 21, 2, 6, "#808080") +
    shape("M9 2h15v12H9z", "#c0c0c0") +
    rect(11, 4, 11, 7, "#000080") +
    rect(12, 5, 9, 1, "#00ffff") +
    shape("M1 18h12v10H1z", "#c0c0c0") +
    rect(3, 20, 8, 5, "#008080") +
    shape("M20 18h11v10H20z", "#c0c0c0") +
    rect(22, 20, 7, 5, "#008080") +
    rect(4, 29, 6, 2, "#808080") +
    rect(23, 29, 6, 2, "#808080"),
  credentials:
    paper +
    rect(12, 7, 7, 2, "#000080") +
    rect(12, 12, 11, 1, "#808080") +
    rect(12, 15, 11, 1, "#808080") +
    shape("M16 23l-2 8 5-3 4 3-2-8z", "#ff0000") +
    shape("M15 20h7v2h2v4h-2v2h-7v-2h-2v-4h2z", "#ffff00") +
    rect(16, 22, 5, 3, "#808000"),
  contact:
    shape("M2 8h28v20H2z", "#fff") +
    shape("M3 26l10-10h6l10 10z", "#c0c0c0") +
    shape("M2 8l14 13L30 8z", "#ffffc0") +
    rect(4, 9, 24, 1, "#fff") +
    rect(3, 27, 26, 1, "#808080") +
    rect(24, 10, 4, 4, "#000080"),
  snake:
    shape("M2 3h28v25H2z", "#c0c0c0") +
    rect(4, 5, 24, 18, "#000") +
    rect(6, 7, 11, 4, "#00ff00") +
    rect(6, 9, 4, 10, "#00ff00") +
    rect(8, 16, 15, 4, "#00ff00") +
    rect(20, 11, 5, 7, "#00ff00") +
    rect(22, 11, 1, 2, "#fff") +
    rect(24, 11, 1, 2, "#fff") +
    rect(13, 12, 3, 3, "#ff0000") +
    rect(10, 29, 13, 2, "#808080"),
};
icons.cephalon = icons.agents;
icons["rush-hour"] = icons.projects;
icons.gitfit = icons.about;
icons.salesscope = icons.experience;
icons.terminal =
  rect(2, 3, 28, 25, "#c0c0c0") +
  rect(4, 5, 24, 20, "#000") +
  shape("M7 10l4 4-4 4", "none", "#fff") +
  rect(14, 18, 9, 2, "#fff");
icons.floppy =
  rect(4, 2, 24, 28, "#263a72") +
  rect(9, 2, 15, 10, "#c0c0c0") +
  rect(18, 4, 3, 6, "#000") +
  rect(8, 17, 16, 11, "#ffffdc") +
  rect(11, 20, 10, 1, "#808080");
icons.incident =
  rect(2, 5, 28, 22, "#333") +
  rect(5, 8, 22, 11, "#a9b98b") +
  rect(7, 11, 15, 2, "#25331b") +
  rect(7, 15, 9, 1, "#25331b") +
  rect(21, 22, 4, 2, "#f00");
icons.stickers =
  rect(3, 3, 26, 26, "#ffffc0") +
  rect(6, 6, 20, 20, "#000080") +
  shape("M16 8l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z", "#ffff00");
export function desktopIcon(name) {
  if (!icons[name]) return null;
  const img = document.createElement("img");
  img.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">${icons[name]}</svg>`)}`;
  img.className = "win95-icon";
  img.alt = "";
  img.width = img.height = 32;
  img.draggable = false;
  return img;
}
export function decorateDesktop(template) {
  template
    .querySelectorAll('.desktop-icons a, #start-menu a[href^="#"]')
    .forEach((link) => {
      const icon = desktopIcon(link.hash.slice(1));
      if (!icon) return;
      const old = link.querySelector(".pixel-icon");
      if (old) old.replaceWith(icon);
      else {
        link.textContent = link.textContent.replace(/^\S+\s+/, "").trim();
        link.prepend(icon);
      }
    });
}
