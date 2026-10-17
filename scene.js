import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "./assets/vendor/CSS3DRenderer.js";

// Original, procedural workstation. All geometry and screen artwork is local.
export function createWorkspace(container, onOpen, screenElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.append(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const cssRenderer = new CSS3DRenderer();
  cssRenderer.domElement.className = "screen-renderer";
  container.append(cssRenderer.domElement);
  const cssScene = new THREE.Scene();
  const screenObject = new CSS3DObject(screenElement);
  screenObject.visible = false;
  cssScene.add(screenObject);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const hemi = new THREE.HemisphereLight(0xfffaf0, 0x7b8270, 2.8);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4d8, 4.4);
  sun.position.set(-6, 11, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -10,
    right: 10,
    top: 10,
    bottom: -10,
    near: 0.1,
    far: 30,
  });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.035;
  sun.shadow.radius = 4;
  sun.shadow.blurSamples = 8;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xe0edff, 1.2);
  fill.position.set(6, 5, -6);
  scene.add(fill);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShadowMaterial({ color: 0x303c32, opacity: 0.23 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);
  const desk = new THREE.Group();
  scene.add(desk);
  const mat = (color, roughness = 0.75, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const cream = mat("#c6c0a9"),
    lightCream = mat("#d7d0b8"),
    darkCream = mat("#aaa68f"),
    black = mat("#252c29"),
    metal = mat("#696e64", 0.4, 0.55),
    green = mat("#4d6950"),
    paper = mat("#e3dec4");
  const shapes = new Map();
  function rounded(w, h, d, r = 0.07) {
    const key = [w, h, d, r].join(",");
    if (shapes.has(key)) return shapes.get(key);
    const s = new THREE.Shape(),
      x = -w / 2,
      y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: Math.max(0.01, d - 0.04),
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      curveSegments: 5,
    });
    geo.translate(0, 0, -(d - 0.04) / 2);
    shapes.set(key, geo);
    return geo;
  }
  function box(parent, w, h, d, material, x = 0, y = 0, z = 0, r = 0) {
    const m = new THREE.Mesh(
      r ? rounded(w, h, d, r) : new THREE.BoxGeometry(w, h, d),
      material,
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function cylinder(parent, top, bottom, h, material, x, y, z, segments = 32) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(top, bottom, h, segments),
      material,
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function cable(points, material = black, r = 0.025, parent = desk) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    );
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 40, r, 6, false),
      material,
    );
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  function canvasTexture(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    draw(ctx, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }
  function label(
    parent,
    text,
    w,
    h,
    x,
    y,
    z,
    bg = "#c8c2ac",
    fg = "#5d6558",
    size = 26,
  ) {
    const t = canvasTexture(512, 128, (c) => {
      c.fillStyle = bg;
      c.fillRect(0, 0, 512, 128);
      c.fillStyle = fg;
      c.font = `${size}px monospace`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(text, 256, 64);
    });
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: t }),
    );
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }
  const wood = canvasTexture(1024, 512, (c) => {
    c.fillStyle = "#665343";
    c.fillRect(0, 0, 1024, 512);
    let s = 47;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    for (let i = 0; i < 2100; i++) {
      const y = rand() * 512;
      c.strokeStyle = `rgba(${rand() > 0.5 ? "32,24,16" : "187,155,113"},${rand() * 0.12})`;
      c.lineWidth = rand() * 2 + 0.2;
      c.beginPath();
      c.moveTo(0, y);
      c.bezierCurveTo(
        270,
        y + rand() * 12,
        750,
        y - rand() * 9,
        1024,
        y + rand() * 7,
      );
      c.stroke();
    }
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: wood,
    roughness: 0.8,
    color: "#c2b6a6",
  });
  box(desk, 10.2, 0.22, 4.5, woodMat, 0, 2.2, 0, 0.11);
  box(desk, 10.1, 0.12, 4.4, mat("#383a30"), 0, 2.05, 0, 0.06);
  for (const x of [-4.6, 4.6])
    for (const z of [-1.75, 1.75]) {
      box(desk, 0.15, 2.05, 0.15, metal, x, 1.02, z, 0.025);
      box(desk, 0.22, 0.06, 0.24, black, x, 0.04, z, 0.02);
    }
  box(desk, 9.2, 0.15, 0.12, metal, 0, 0.45, -1.78);
  box(desk, 9.2, 0.32, 0.1, black, 0, 1.73, -1.78);
  box(desk, 1.8, 1.32, 2.8, mat("#a4a493"), -3.8, 1.32, -0.15, 0.07);
  for (const y of [1.13, 1.77]) {
    box(desk, 1.72, 0.58, 0.08, darkCream, -3.8, y, 1.3, 0.025);
    box(desk, 0.55, 0.055, 0.07, metal, -3.8, y + 0.13, 1.37, 0.015);
  }
  const tower = new THREE.Group();
  tower.position.set(3.6, 0.95, 0.15);
  desk.add(tower);
  box(tower, 0.9, 1.85, 1.7, cream, 0, 0, 0, 0.06);
  box(tower, 0.82, 1.74, 0.12, lightCream, 0, 0, 0.9, 0.03);
  box(tower, 0.67, 0.2, 0.03, darkCream, 0, 0.52, 0.98);
  box(tower, 0.53, 0.045, 0.035, black, -0.04, 0.53, 1.0);
  box(tower, 0.67, 0.25, 0.04, darkCream, 0, 0.19, 0.98);
  box(tower, 0.36, 0.035, 0.04, black, -0.05, 0.2, 1.01);
  for (let i = 0; i < 10; i++)
    box(tower, 0.56, 0.018, 0.025, black, 0, -0.26 - i * 0.045, 0.98);
  cylinder(tower, 0.07, 0.07, 0.03, green, 0.23, -0.02, 1.02).rotation.x =
    Math.PI / 2;
  const led = new THREE.MeshBasicMaterial({ color: "#a4dd74" });
  box(tower, 0.04, 0.025, 0.02, led, -0.25, -0.04, 1.03);
  const hits = [],
    monitors = [];
  function drawScreen(type) {
    return canvasTexture(1024, 768, (c, w, h) => {
      const palette = {
        about: "#7b8d75",
        projects: "#285e59",
        contact: "#142e2b",
      };
      c.fillStyle = palette[type];
      c.fillRect(0, 0, w, h);
      if (type === "projects") {
        c.strokeStyle = "#4b8174";
        c.lineWidth = 1;
        for (let i = 0; i < 32; i++) {
          c.beginPath();
          c.moveTo(0, 300 + i * 24);
          c.lineTo(1024, 300 + i * 24);
          c.stroke();
        }
        for (let i = -6; i < 12; i++) {
          c.beginPath();
          c.moveTo(512, 260);
          c.lineTo(i * 180, 768);
          c.stroke();
        }
        c.fillStyle = "#d8dfcb";
        c.fillRect(62, 70, 900, 530);
        c.fillStyle = "#233f4a";
        c.fillRect(68, 76, 888, 40);
        c.fillStyle = "#fff";
        c.font = "20px monospace";
        c.fillText("My Projects — WilToBuild", 88, 103);
        c.fillStyle = "#aebca0";
        c.fillRect(916, 84, 28, 25);
        c.fillStyle = "#293b31";
        c.font = "bold 72px Arial";
        c.fillText("Things I’ve built.", 110, 235);
        c.font = "25px monospace";
        c.fillStyle = "#5d6f59";
        c.fillText("A few ideas, brought to life.", 113, 281);
        ["iRYS", "CEPHALON", "GitFit"].forEach((name, i) => {
          const x = 130 + i * 285;
          c.fillStyle = "#b29243";
          c.fillRect(x, 365, 80, 65);
          c.fillStyle = "#e8c46d";
          c.fillRect(x, 355, 45, 20);
          c.fillRect(x - 4, 373, 96, 62);
          c.fillStyle = "#344b3e";
          c.font = "22px monospace";
          c.fillText(name, x - 10, 480);
        });
        c.font = "20px monospace";
        c.fillStyle = "#61735a";
        c.fillText("Click to open the project folder →", 113, 556);
      } else if (type === "about") {
        c.fillStyle = "#e3e5d3";
        c.fillRect(75, 65, 875, 575);
        c.fillStyle = "#314b43";
        c.fillRect(81, 71, 863, 38);
        c.fillStyle = "#fff";
        c.font = "20px monospace";
        c.fillText("Hello, world.txt", 100, 98);
        c.fillStyle = "#bbc9af";
        c.fillRect(120, 158, 180, 205);
        c.fillStyle = "#536d54";
        c.beginPath();
        c.arc(210, 218, 43, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.ellipse(210, 332, 75, 65, 0, Math.PI, Math.PI * 2);
        c.fill();
        c.fillStyle = "#2c4538";
        c.font = "bold 65px Arial";
        c.fillText("Hi, I’m", 340, 221);
        c.fillText("Wil Sheppard.", 340, 298);
        c.font = "24px monospace";
        c.fillStyle = "#5b6f51";
        c.fillText("Systems thinker.", 123, 423);
        c.fillText("Software builder.", 123, 466);
        c.font = "19px monospace";
        c.fillText("AV roots. AI future. Always building.", 123, 546);
      } else {
        c.fillStyle = "#b8d58d";
        c.font = "20px monospace";
        c.fillText("WILTOBUILD / CONNECTION TERMINAL", 55, 80);
        c.fillStyle = "#6b966c";
        c.fillText("────────────────────────────────────", 55, 114);
        c.fillStyle = "#d2e3b6";
        c.font = "bold 70px monospace";
        c.fillText("Let’s build", 55, 247);
        c.fillText("something.", 55, 333);
        c.font = "27px monospace";
        c.fillStyle = "#89b581";
        c.fillText("> Open to opportunities", 55, 437);
        c.fillText("> GitHub / LinkedIn / Email", 55, 493);
        c.fillStyle = "#c8dfa8";
        c.fillText("CONNECT_", 55, 610);
      }
      c.fillStyle = "#bfcbb6";
      c.fillRect(0, 712, 1024, 56);
      c.fillStyle = "#edf0d9";
      c.fillRect(6, 718, 130, 43);
      c.fillStyle = "#334e3c";
      c.font = "bold 24px Arial";
      c.fillText("▦ Start", 20, 749);
      c.font = "20px monospace";
      c.fillText("WilToBuild OS 95", 165, 747);
      c.fillText("ONLINE", 910, 747);
      for (let y = 0; y < h; y += 4) {
        c.fillStyle = "rgba(0,0,0,.055)";
        c.fillRect(0, y, w, 1);
      }
      const glow = c.createLinearGradient(0, 0, 1024, 768);
      glow.addColorStop(0, "rgba(255,255,228,.1)");
      glow.addColorStop(0.4, "rgba(255,255,255,0)");
      glow.addColorStop(1, "rgba(0,10,4,.08)");
      c.fillStyle = glow;
      c.fillRect(0, 0, w, h);
    });
  }
  function monitor(type, x, z, angle, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, 2.32, z);
    g.rotation.y = angle;
    g.scale.setScalar(scale);
    desk.add(g);
    box(g, 1.38, 0.15, 1.05, darkCream, 0, 0.08, -0.22, 0.1);
    box(g, 0.57, 0.46, 0.55, cream, 0, 0.34, -0.3, 0.06);
    box(g, 2.57, 1.99, 1.22, cream, 0, 1.55, -0.4, 0.16);
    box(g, 2.14, 1.65, 0.35, darkCream, 0, 1.55, -1.13, 0.1);
    box(g, 2.75, 2.14, 0.24, lightCream, 0, 1.55, 0.28, 0.15);
    box(g, 2.35, 1.73, 0.09, mat("#666b58"), 0, 1.64, 0.42, 0.15);
    box(g, 2.24, 1.63, 0.045, black, 0, 1.65, 0.477, 0.14);
    const screenGeo = new THREE.PlaneGeometry(2.14, 1.53, 24, 20),
      pos = screenGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i) / 1.07,
        y = pos.getY(i) / 0.765;
      pos.setZ(i, 0.055 * (1 - x * x) * (1 - y * y));
    }
    screenGeo.computeVertexNormals();
    const display = new THREE.Mesh(
      screenGeo,
      new THREE.MeshBasicMaterial({ map: drawScreen(type) }),
    );
    display.position.set(0, 1.65, 0.505);
    g.add(display);
    label(
      g,
      "WILTOBUILD",
      0.68,
      0.16,
      -0.75,
      0.65,
      0.415,
      "#d7d0b8",
      "#636955",
      29,
    );
    box(g, 0.045, 0.035, 0.015, led, 0.88, 0.67, 0.417, 0.006);
    box(g, 0.15, 0.1, 0.025, darkCream, 1.08, 0.66, 0.42, 0.02);
    for (let i = 0; i < 12; i++) {
      box(
        g,
        0.018,
        0.008,
        0.42,
        mat("#7f806b"),
        -0.75 + i * 0.13,
        2.565,
        -0.32,
      );
    }
    label(
      g,
      {
        about: "01 / THE PERSON",
        projects: "02 / THE WORK",
        contact: "03 / CONNECT",
      }[type],
      0.94,
      0.14,
      0,
      0.1,
      0.33,
      "#aaa68f",
      "#414d38",
      28,
    );
    g.traverse((o) => {
      if (o.isMesh) {
        o.userData.route = type;
        hits.push(o);
      }
    });
    g.userData.route = type;
    monitors.push(g);
    cable(
      [
        [x, 2.44, z - 1.1],
        [x + 0.15, 2.4, z - 1.65],
        [x + 1, 2.35, -1.8],
        [2.7, 2.3, -1.7],
        [3.4, 0.5, -0.8],
      ],
      black,
      0.025,
    );
    return g;
  }
  monitor("about", -2.9, -0.55, 0.25, 0.88);
  monitor("projects", 0, -0.82, 0, 1);
  monitor("contact", 2.86, -0.52, -0.25, 0.88);
  // Keyboard: individual keycaps and legends, space bar, navigation cluster.
  const keyboard = new THREE.Group();
  keyboard.position.set(-0.15, 2.38, 1.38);
  keyboard.rotation.x = 0.08;
  desk.add(keyboard);
  box(keyboard, 2.65, 0.13, 0.94, cream, 0, 0, 0, 0.06);
  const legends = [
    "ESC  F1 F2 F3 F4 F5 F6 F7 F8 F9",
    "1 2 3 4 5 6 7 8 9 0 - =",
    "Q W E R T Y U I O P [ ]",
    "A S D F G H J K L ;",
    "Z X C V B N M , .",
  ];
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 13; col++) {
      box(
        keyboard,
        0.145,
        0.055,
        0.115,
        col === 0 || col > 10 ? darkCream : lightCream,
        -1.17 + col * 0.18,
        0.1,
        -0.36 + row * 0.14,
        0.012,
      );
    }
  box(keyboard, 1.18, 0.058, 0.13, lightCream, -0.05, 0.102, 0.36, 0.016);
  box(keyboard, 0.2, 0.058, 0.13, darkCream, -1.05, 0.102, 0.36, 0.012);
  box(keyboard, 0.2, 0.058, 0.13, darkCream, -0.78, 0.102, 0.36, 0.012);
  for (let col = 0; col < 3; col++)
    box(
      keyboard,
      0.15,
      0.058,
      0.13,
      darkCream,
      0.83 + col * 0.18,
      0.102,
      0.36,
      0.01,
    );
  const kt = canvasTexture(1024, 360, (c) => {
    c.clearRect(0, 0, 1024, 360);
    c.fillStyle = "#6d7264";
    c.font = "19px monospace";
    for (let row = 0; row < 5; row++) {
      const chars = legends[row].split(" ");
      chars.forEach((v, i) => c.fillText(v, 35 + i * 74, 40 + row * 57));
    }
  });
  const kp = new THREE.Mesh(
    new THREE.PlaneGeometry(2.35, 0.7),
    new THREE.MeshBasicMaterial({ map: kt, transparent: true }),
  );
  kp.rotation.x = -Math.PI / 2;
  kp.position.set(-0.04, 0.133, -0.07);
  keyboard.add(kp);
  cable(
    [
      [-0.2, 2.4, 0.9],
      [-0.4, 2.34, 0.5],
      [-0.7, 2.34, 0.4],
      [-1.4, 2.34, -0.65],
    ],
    black,
    0.018,
  );
  const pad = box(
    desk,
    1.02,
    0.025,
    1.07,
    mat("#3d514a"),
    1.95,
    2.335,
    1.29,
    0.08,
  );
  const mouse = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 20),
    lightCream,
  );
  mouse.scale.set(0.85, 0.46, 1.4);
  mouse.position.set(1.98, 2.43, 1.22);
  mouse.castShadow = true;
  desk.add(mouse);
  box(desk, 0.009, 0.018, 0.22, darkCream, 1.98, 2.52, 1.12);
  cable(
    [
      [1.97, 2.44, 0.96],
      [2.05, 2.36, 0.57],
      [1.75, 2.34, 0.25],
      [1.9, 2.34, -0.3],
    ],
    black,
    0.014,
  );
  // A pair of compact speakers.
  for (const x of [-4.22, 4.2]) {
    box(desk, 0.42, 0.75, 0.42, cream, x, 2.72, 0.2, 0.05);
    const cone = cylinder(desk, 0.14, 0.14, 0.035, black, x, 2.74, 0.43, 32);
    cone.rotation.x = Math.PI / 2;
    const center = cylinder(desk, 0.058, 0.058, 0.04, metal, x, 2.74, 0.455);
    center.rotation.x = Math.PI / 2;
    box(desk, 0.016, 0.025, 0.015, led, x + 0.12, 2.46, 0.43);
  }
  // Desk lamp, including a visible warm bulb and practical pool of light.
  cylinder(desk, 0.31, 0.36, 0.08, green, -4.48, 2.36, -1.45);
  cable(
    [
      [-4.48, 2.4, -1.45],
      [-4.48, 4.36, -1.55],
      [-4.3, 5.15, -1.5],
      [-3.85, 5.2, -1.4],
    ],
    green,
    0.035,
  );
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.43, 0.48, 40, 1, true),
    new THREE.MeshStandardMaterial({
      color: "#4a654d",
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
  );
  shade.position.set(-3.78, 4.98, -1.35);
  shade.rotation.z = -0.35;
  shade.castShadow = true;
  desk.add(shade);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 12),
    new THREE.MeshBasicMaterial({ color: "#fff0b9" }),
  );
  bulb.position.set(-3.74, 4.84, -1.35);
  desk.add(bulb);
  const lampLight = new THREE.PointLight(0xffcf7f, 4, 5, 2);
  lampLight.position.copy(bulb.position);
  scene.add(lampLight);
  // Coffee mug, floppy disk, notebook, pencil and sticky note.
  cylinder(desk, 0.16, 0.14, 0.36, mat("#dfd6bd"), -3.47, 2.51, 1.5);
  cylinder(desk, 0.137, 0.137, 0.008, mat("#34271d"), -3.47, 2.69, 1.5);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.035, 8, 20),
    cream,
  );
  handle.position.set(-3.68, 2.53, 1.5);
  desk.add(handle);
  label(
    desk,
    "BUILD.",
    0.21,
    0.09,
    -3.47,
    2.52,
    1.658,
    "#dfd6bd",
    "#42533e",
    70,
  );
  const notebook = new THREE.Group();
  notebook.position.set(-2.6, 2.37, 1.45);
  notebook.rotation.y = -0.13;
  desk.add(notebook);
  box(notebook, 0.72, 0.06, 0.98, mat("#5f7051"), 0, 0, 0, 0.015);
  box(notebook, 0.66, 0.035, 0.9, paper, 0.015, 0, 0);
  const nl = label(
    notebook,
    "IDEAS / 01",
    0.5,
    0.16,
    0,
    0.043,
    0.1,
    "#5f7051",
    "#d6daba",
    40,
  );
  nl.rotation.x = -Math.PI / 2;
  box(notebook, 0.025, 0.035, 0.8, mat("#ad783b"), 0.24, 0.075, 0.03);
  const disk = box(
    desk,
    0.42,
    0.04,
    0.44,
    mat("#373f42"),
    3.2,
    2.35,
    1.45,
    0.02,
  );
  disk.rotation.y = 0.21;
  box(desk, 0.26, 0.015, 0.18, metal, 3.2, 2.382, 1.57);
  const dl = label(
    desk,
    "SNAKE.EXE",
    0.3,
    0.13,
    3.2,
    2.387,
    1.33,
    "#e4dbad",
    "#394a36",
    35,
  );
  dl.rotation.x = -Math.PI / 2;
  disk.userData.route = "snake";
  hits.push(disk);
  const note = label(
    desk,
    "keep building :)",
    0.44,
    0.28,
    0.72,
    2.92,
    -0.21,
    "#d7c278",
    "#646132",
    43,
  );
  note.rotation.z = -0.08;
  // Floor plant: hand-shaped leaves and stems, no downloaded models.
  const plant = new THREE.Group();
  plant.position.set(5.8, 0, -0.7);
  desk.add(plant);
  const pot = mat("#a47e5e");
  cylinder(plant, 0.48, 0.34, 0.78, pot, 0, 0.39, 0);
  cylinder(plant, 0.44, 0.44, 0.035, mat("#443d2c"), 0, 0.785, 0);
  cylinder(plant, 0.5, 0.5, 0.1, pot, 0, 0.75, 0);
  for (let i = 0; i < 11; i++) {
    const a = i * 2.399,
      h = 1.65 + (i % 4) * 0.38,
      end = new THREE.Vector3(
        Math.cos(a) * (0.45 + (i % 3) * 0.17),
        h,
        Math.sin(a) * 0.6,
      );
    cable(
      [
        [0, 0.78, 0],
        [end.x * 0.3, h * 0.7, end.z * 0.3],
        [end.x, end.y, end.z],
      ],
      green,
      0.017,
      plant,
    );
    const leaf = new THREE.Shape();
    leaf.moveTo(0, 0);
    leaf.bezierCurveTo(-0.25, 0.25, -0.26, 0.65, 0, 0.92);
    leaf.bezierCurveTo(0.29, 0.65, 0.25, 0.25, 0, 0);
    const lg = new THREE.ShapeGeometry(leaf, 12);
    const lm = new THREE.Mesh(
      lg,
      new THREE.MeshStandardMaterial({
        color: i % 2 ? "#536a42" : "#667d4c",
        side: THREE.DoubleSide,
        roughness: 0.9,
      }),
    );
    lm.position.copy(end);
    lm.rotation.set(0.8, a, -0.4);
    lm.castShadow = true;
    plant.add(lm);
  }
  // An open paper printout at the far edge of the desk.
  const sheet = box(desk, 0.65, 0.008, 0.85, paper, 3.64, 2.33, 1.46);
  sheet.rotation.y = -0.18;
  let yaw = 0.2,
    targetYaw = 0.2,
    pitch = 0.38,
    targetPitch = 0.38;
  let drag = null,
    frame = 0,
    last = 0,
    dirty = true,
    transition = null;
  let focusedMonitor = null;
  const poseCamera = new THREE.PerspectiveCamera();
  const screenRatio = 2.14 / 1.53;
  const hover = document.querySelector("#hover-label");

  function screenPixels() {
    // One CSS pixel is approximately one rendered pixel when the camera lands.
    return Math.max(
      280,
      Math.min(innerWidth * 0.86, innerHeight * 0.76 * screenRatio),
    );
  }
  function attachScreen(id) {
    const monitor = monitors.find((m) => m.userData.route === id);
    const width = Math.round(screenPixels());
    screenElement.style.width = `${width}px`;
    screenElement.style.height = `${width / screenRatio}px`;
    screenElement.classList.toggle("compact-screen", width < 550);
    monitor.updateWorldMatrix(true, false);
    screenObject.position.copy(
      monitor.localToWorld(new THREE.Vector3(0, 1.65, 0.57)),
    );
    monitor.getWorldQuaternion(screenObject.quaternion);
    screenObject.scale.setScalar((2.14 * monitor.scale.x) / width);
    screenObject.updateMatrixWorld(true);
  }
  function overviewPose() {
    const mobile = container.clientWidth < 650;
    const distance = mobile ? 42 : camera.aspect < 1.45 ? 23 : 20;
    const target = new THREE.Vector3(
      mobile ? 0.6 : -0.25,
      mobile ? 3.05 : 2.4,
      0,
    );
    const position = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch) * distance + target.x,
      Math.sin(pitch) * distance + target.y,
      Math.cos(yaw) * Math.cos(pitch) * distance,
    );
    poseCamera.position.copy(position);
    poseCamera.lookAt(target);
    return { position, quaternion: poseCamera.quaternion.clone() };
  }
  function monitorPose(id) {
    const monitor = monitors.find((m) => m.userData.route === id);
    const center = monitor.localToWorld(new THREE.Vector3(0, 1.65, 0.57));
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(
      monitor.quaternion,
    );
    const focalPixels =
      container.clientHeight /
      (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const distance = (2.14 * monitor.scale.x * focalPixels) / screenPixels();
    const position = center.clone().addScaledVector(normal, distance);
    poseCamera.position.copy(position);
    poseCamera.lookAt(center);
    return { position, quaternion: poseCamera.quaternion.clone() };
  }
  function resize() {
    const w = container.clientWidth,
      h = container.clientHeight;
    renderer.setSize(w, h);
    cssRenderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (focusedMonitor) attachScreen(focusedMonitor);
    dirty = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  const initialPose = overviewPose();
  camera.position.copy(initialPose.position);
  camera.quaternion.copy(initialPose.quaternion);

  function flyTo(id) {
    transition?.resolve(false);
    focusedMonitor = id;
    drag = null;
    hover.classList.remove("visible");
    screenElement.style.pointerEvents = "none";
    if (id) {
      attachScreen(id);
      screenObject.visible = true;
      screenElement.hidden = false;
    }
    return new Promise((resolve) => {
      transition = {
        fromPosition: camera.position.clone(),
        fromQuaternion: camera.quaternion.clone(),
        started: performance.now(),
        duration: reduced.matches ? 0 : 1100,
        resolve,
      };
      dirty = true;
    });
  }
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  function hit(e) {
    const r = container.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(hits, false)[0]?.object.userData.route;
  }
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || focusedMonitor || transition) return;
    drag = {
      x: e.clientX,
      y: e.clientY,
      yaw: targetYaw,
      pitch: targetPitch,
      moved: false,
    };
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (focusedMonitor || transition) return;
    if (drag) {
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
      targetYaw = THREE.MathUtils.clamp(drag.yaw - dx * 0.004, -0.65, 0.65);
      targetPitch = THREE.MathUtils.clamp(drag.pitch + dy * 0.003, 0.21, 0.65);
      dirty = true;
      hover.classList.remove("visible");
      return;
    }
    const route = hit(e);
    renderer.domElement.style.cursor = route ? "pointer" : "grab";
    hover.textContent =
      {
        about: "01 / Enter this monitor ↗",
        projects: "02 / Enter this monitor ↗",
        contact: "03 / Enter this monitor ↗",
        snake: "Insert disk: Snake.exe ↗",
      }[route] || "";
    hover.style.left = `${Math.min(e.clientX + 16, innerWidth - 210)}px`;
    hover.style.top = `${e.clientY + 16}px`;
    hover.classList.toggle("visible", !!route);
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (drag && !drag.moved && !focusedMonitor && !transition) {
      const route = hit(e);
      if (route) onOpen(route);
    }
    drag = null;
    hover.classList.remove("visible");
  });
  renderer.domElement.addEventListener("pointercancel", () => {
    drag = null;
  });
  renderer.domElement.addEventListener("pointerleave", () =>
    hover.classList.remove("visible"),
  );
  function draw(time) {
    frame = requestAnimationFrame(draw);
    if (document.hidden || time - last < 16) return;
    last = time;
    const orbitMoving =
      !focusedMonitor &&
      !transition &&
      Math.abs(yaw - targetYaw) + Math.abs(pitch - targetPitch) > 0.0001;
    if (!dirty && !transition && !orbitMoving) return;
    if (orbitMoving) {
      const factor = reduced.matches ? 1 : 0.09;
      yaw += (targetYaw - yaw) * factor;
      pitch += (targetPitch - pitch) * factor;
    }
    const destination = focusedMonitor
      ? monitorPose(focusedMonitor)
      : overviewPose();
    if (transition) {
      const t = transition.duration
        ? Math.min(1, (time - transition.started) / transition.duration)
        : 1;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.position.lerpVectors(
        transition.fromPosition,
        destination.position,
        ease,
      );
      camera.quaternion.slerpQuaternions(
        transition.fromQuaternion,
        destination.quaternion,
        ease,
      );
      if (t === 1) {
        const done = transition.resolve;
        transition = null;
        if (!focusedMonitor) {
          screenObject.visible = false;
          screenElement.hidden = true;
        }
        done(true);
      }
    } else {
      camera.position.copy(destination.position);
      camera.quaternion.copy(destination.quaternion);
    }
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);
    dirty = false;
  }
  draw(0);
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    document.querySelector("#load-status").hidden = false;
    document.querySelector("#load-status").textContent =
      "The 3D view paused. Use Classic portfolio below to keep exploring.";
  });
  renderer.domElement.addEventListener("webglcontextrestored", () => {
    dirty = true;
    document.querySelector("#load-status").hidden = true;
  });
  return {
    focus: flyTo,
    leave: () => flyTo(null),
    reset() {
      targetYaw = 0.2;
      targetPitch = 0.38;
      dirty = true;
    },
    setNight(value) {
      hemi.intensity = value ? 1 : 2.8;
      sun.intensity = value ? 1.3 : 4.4;
      fill.intensity = value ? 0.7 : 1.2;
      lampLight.intensity = value ? 10 : 4;
      renderer.toneMappingExposure = value ? 1.05 : 1.35;
      ground.material.opacity = value ? 0.45 : 0.23;
      dirty = true;
    },
    dispose() {
      transition?.resolve(false);
      cancelAnimationFrame(frame);
      ro.disconnect();
      renderer.dispose();
      cssRenderer.domElement.remove();
    },
  };
}
