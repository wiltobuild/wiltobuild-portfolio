const canvas = document.querySelector("#node-canvas");
const context = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const pointer = { x: null, y: null };

let width = 0;
let height = 0;
let nodes = [];
let animationFrame = null;

const palette = [
  "rgba(72, 214, 197, 0.72)",
  "rgba(242, 184, 75, 0.58)",
  "rgba(241, 116, 100, 0.42)",
  "rgba(158, 213, 111, 0.46)"
];

function fitCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  createNodes();
}

function createNodes() {
  const count = Math.round(Math.min(96, Math.max(42, (width * height) / 18000)));
  nodes = Array.from({ length: count }, (_, index) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = reduceMotion.matches ? 0 : 0.12 + Math.random() * 0.28;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 1.2 + Math.random() * 2.1,
      color: palette[index % palette.length]
    };
  });
}

function moveNode(node) {
  node.x += node.vx;
  node.y += node.vy;

  if (node.x < -20) node.x = width + 20;
  if (node.x > width + 20) node.x = -20;
  if (node.y < -20) node.y = height + 20;
  if (node.y > height + 20) node.y = -20;

  if (pointer.x === null || reduceMotion.matches) return;

  const dx = node.x - pointer.x;
  const dy = node.y - pointer.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 160 && distance > 0) {
    const force = (160 - distance) / 160;
    node.x += (dx / distance) * force * 0.8;
    node.y += (dy / distance) * force * 0.8;
  }
}

function drawConnections() {
  const maxDistance = width < 720 ? 110 : 145;

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (distance > maxDistance) continue;

      const opacity = (1 - distance / maxDistance) * 0.22;
      context.strokeStyle = `rgba(213, 222, 232, ${opacity})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }
  }
}

function drawNodes() {
  nodes.forEach((node) => {
    moveNode(node);
    context.beginPath();
    context.fillStyle = node.color;
    context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    context.fill();
  });
}

function render() {
  context.clearRect(0, 0, width, height);
  drawConnections();
  drawNodes();
  animationFrame = window.requestAnimationFrame(render);
}

function startBackground() {
  if (animationFrame !== null) {
    window.cancelAnimationFrame(animationFrame);
  }

  fitCanvas();
  render();
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

document.querySelector("#year").textContent = new Date().getFullYear();

window.addEventListener("resize", fitCanvas);
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});
window.addEventListener("pointerleave", () => {
  pointer.x = null;
  pointer.y = null;
});
reduceMotion.addEventListener("change", startBackground);

startBackground();
