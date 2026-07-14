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

function initializeThoughtNetwork() {
  const network = document.querySelector("[data-thought-network]");

  if (!network) return;

  const map = network.querySelector(".thought-map");
  const canvas = network.querySelector(".thought-canvas");
  const context = canvas.getContext("2d");
  const nodes = Array.from(network.querySelectorAll(".thought-node"));
  const detail = network.querySelector(".thought-detail");
  const detailStep = network.querySelector(".thought-detail-step");
  const detailTitle = network.querySelector(".thought-detail h3");
  const detailDescription = network.querySelector(".thought-detail-description");
  const detailLink = network.querySelector(".thought-detail-link");
  const pointerPosition = { x: null, y: null };
  const core = { x: 0.51, y: 0.48, radius: 42 };
  const nodeRadii = [48, 39, 59, 42, 46];

  let canvasWidth = 0;
  let canvasHeight = 0;
  let activeNodeIndex = 0;
  let activationTime = 0;
  let animationFrame = null;
  let isVisible = false;
  let particles = [];

  const networkNodes = nodes.map((node, index) => {
    node.style.setProperty("--node-x", node.dataset.x);
    node.style.setProperty("--node-y", node.dataset.y);

    return {
      element: node,
      x: Number(node.dataset.x) / 100,
      y: Number(node.dataset.y) / 100,
      radius: nodeRadii[index]
    };
  });

  function getPosition(node) {
    return { x: node.x * canvasWidth, y: node.y * canvasHeight };
  }

  function fitCanvas() {
    const bounds = map.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvasWidth = bounds.width;
    canvasHeight = bounds.height;
    canvas.width = Math.max(1, Math.floor(canvasWidth * pixelRatio));
    canvas.height = Math.max(1, Math.floor(canvasHeight * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function drawLine(from, to, color, width, alpha, dashed = false) {
    context.save();
    if (dashed) {
      context.setLineDash([5, 8]);
      context.lineDashOffset = reduceMotion.matches ? 0 : -performance.now() / 24;
    }

    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.lineWidth = width;
    context.strokeStyle = "rgba(" + color + ", " + alpha + ")";
    context.stroke();
    context.restore();
  }

  function drawCore(time) {
    const center = { x: core.x * canvasWidth, y: core.y * canvasHeight };
    const radius = core.radius + (reduceMotion.matches ? 0 : Math.sin(time / 1100) * 2);

    context.save();
    context.shadowBlur = 32;
    context.shadowColor = "rgba(72, 214, 197, 0.52)";
    context.fillStyle = "rgba(16, 42, 48, 0.9)";
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();

    context.strokeStyle = "rgba(72, 214, 197, 0.78)";
    context.lineWidth = 1.25;
    context.beginPath();
    context.arc(center.x, center.y, radius + 11, 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = "rgba(242, 184, 75, 0.5)";
    context.beginPath();
    context.arc(center.x, center.y, radius + 19, time / 1250, time / 1250 + Math.PI * 1.35);
    context.stroke();
  }

  function drawNetwork(time) {
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    const center = { x: core.x * canvasWidth, y: core.y * canvasHeight };
    const activationAge = activationTime ? time - activationTime : Number.POSITIVE_INFINITY;
    const activationStrength = Math.max(0, 1 - activationAge / 1200);

    networkNodes.forEach((node, index) => {
      const position = getPosition(node);
      const dx = pointerPosition.x === null ? 0 : position.x - pointerPosition.x;
      const dy = pointerPosition.y === null ? 0 : position.y - pointerPosition.y;
      const proximity = pointerPosition.x === null ? 0 : Math.max(0, 1 - Math.hypot(dx, dy) / 145);

      drawLine(center, position, "137, 155, 176", 1, 0.16 + proximity * 0.18);
      if (index <= activeNodeIndex) {
        drawLine(center, position, "72, 214, 197", 1.6, 0.22 + activationStrength * 0.62);
      }

      if (proximity > 0) {
        context.strokeStyle = "rgba(242, 184, 75, " + proximity * 0.45 + ")";
        context.lineWidth = 1;
        context.beginPath();
        context.arc(position.x, position.y, node.radius + 18 + proximity * 10, 0, Math.PI * 2);
        context.stroke();
      }
    });

    for (let index = 0; index < networkNodes.length - 1; index += 1) {
      const from = getPosition(networkNodes[index]);
      const to = getPosition(networkNodes[index + 1]);

      drawLine(from, to, "137, 155, 176", 1, 0.1);
      if (index < activeNodeIndex) {
        drawLine(from, to, "242, 184, 75", 1.15, 0.42 + activationStrength * 0.38, true);
      }
    }

    if (activationStrength > 0) {
      const activePosition = getPosition(networkNodes[activeNodeIndex]);
      const waveRadius = 42 + (1 - activationStrength) * 130;

      context.strokeStyle = "rgba(242, 184, 75, " + activationStrength * 0.48 + ")";
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(activePosition.x, activePosition.y, waveRadius, 0, Math.PI * 2);
      context.stroke();
    }

    particles = particles.filter((particle) => {
      const progress = (time - particle.start) / particle.duration;
      if (progress >= 1) return false;

      context.fillStyle = "rgba(" + particle.color + ", " + (1 - progress) * 0.8 + ")";
      context.beginPath();
      context.arc(
        particle.x + particle.vx * progress,
        particle.y + particle.vy * progress + progress * progress * 14,
        particle.size * (1 - progress * 0.35),
        0,
        Math.PI * 2
      );
      context.fill();
      return true;
    });

    drawCore(time);
  }

  function renderNetwork(time) {
    drawNetwork(time);
    if (isVisible && !reduceMotion.matches) {
      animationFrame = window.requestAnimationFrame(renderNetwork);
    }
  }

  function startRendering() {
    if (!isVisible) return;
    if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(renderNetwork);
  }

  function createParticles(nodeIndex) {
    if (reduceMotion.matches) return;

    const origin = getPosition(networkNodes[nodeIndex]);
    const count = window.innerWidth < 640 ? 16 : 28;

    particles = Array.from({ length: count }, (_, index) => {
      const angle = (Math.PI * 2 * index) / count + Math.random() * 0.28;
      const speed = 28 + Math.random() * 76;

      return {
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.4 + Math.random() * 2.2,
        color: index % 3 === 0 ? "242, 184, 75" : "72, 214, 197",
        start: performance.now(),
        duration: 550 + Math.random() * 440
      };
    });
  }

  function triggerActivation(nodeIndex) {
    activeNodeIndex = nodeIndex;
    activationTime = performance.now();
    createParticles(nodeIndex);
    map.classList.remove("is-activating");
    window.requestAnimationFrame(() => map.classList.add("is-activating"));
    window.setTimeout(() => map.classList.remove("is-activating"), 560);
    startRendering();
  }

  function activateNode(node, shouldAnimate = true) {
    const activeStep = Number(node.dataset.step);
    const nodeIndex = nodes.indexOf(node);

    map.dataset.activeStep = node.dataset.step;
    detailStep.textContent = node.dataset.step + " / 05";
    detailTitle.textContent = node.dataset.title;
    detailDescription.textContent = node.dataset.description;
    detailLink.href = node.dataset.link;
    detailLink.textContent = node.dataset.linkLabel;
    detail.classList.remove("is-updating");
    void detail.offsetWidth;
    detail.classList.add("is-updating");

    nodes.forEach((currentNode) => {
      const isActive = currentNode === node;
      const isVisited = Number(currentNode.dataset.step) < activeStep;

      currentNode.classList.toggle("is-active", isActive);
      currentNode.classList.toggle("is-visited", isVisited);
      currentNode.setAttribute("aria-selected", String(isActive));
      currentNode.tabIndex = isActive ? 0 : -1;
    });

    if (shouldAnimate) triggerActivation(nodeIndex);
  }

  nodes.forEach((node, index) => {
    node.tabIndex = index === 0 ? 0 : -1;
    node.addEventListener("click", () => activateNode(node));
    node.addEventListener("keydown", (event) => {
      const navigationKeys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];

      if (!navigationKeys.includes(event.key)) return;

      event.preventDefault();
      let nextIndex = index;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % nodes.length;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + nodes.length) % nodes.length;
      }

      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = nodes.length - 1;

      nodes[nextIndex].focus();
      activateNode(nodes[nextIndex]);
    });
  });

  function updatePointer(event) {
    const bounds = map.getBoundingClientRect();
    pointerPosition.x = event.clientX - bounds.left;
    pointerPosition.y = event.clientY - bounds.top;
  }

  map.addEventListener("pointermove", updatePointer);
  map.addEventListener("pointerleave", () => {
    pointerPosition.x = null;
    pointerPosition.y = null;
  });
  map.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || event.target.closest(".thought-node")) return;

    updatePointer(event);
    const closestNode = networkNodes.reduce((closest, node, index) => {
      const position = getPosition(node);
      const distance = Math.hypot(position.x - pointerPosition.x, position.y - pointerPosition.y);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });

    if (closestNode.distance < 74) activateNode(nodes[closestNode.index]);
  });

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) startRendering();
      if (!isVisible && animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    },
    { threshold: 0.1 }
  );

  visibilityObserver.observe(map);
  window.addEventListener("resize", () => {
    fitCanvas();
    startRendering();
  });
  reduceMotion.addEventListener("change", startRendering);

  fitCanvas();
  activateNode(nodes[0], false);
  drawNetwork(performance.now());
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

initializeThoughtNetwork();

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
