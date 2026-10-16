# WilToBuild — the personal workstation

Wil Sheppard’s portfolio, presented as an original interactive 1990s desk with three CRT monitors. Published on the existing GitHub Pages site.

## Experience

- The left monitor opens About; the center opens Projects; the right opens Contact.
- Drag the desk to orbit the camera. Reset, daylight/evening lighting, and optional synthesized sound are available beside the scene.
- The desktop includes About, Projects, Experience, Toolkit, Pantheon, Credentials, Contact, and a playable Snake game.
- Project content, headshot, credentials, and contact destinations come from the existing portfolio. iRYS remains marked as a private active build.
- Hash routes support direct links and browser history. A native modal dialog supports keyboard navigation, Escape, and focus restoration.
- Mobile layouts retain the whole workstation and expose the same content through accessible navigation. Portfolio content still works if WebGL fails.
- The previous full portfolio, including its auxiliary programs, remains available at `classic.html`.

## Files

- `index.html`: entry point, metadata, accessible navigation, and desktop shell.
- `desktop.css`: responsive workspace and retro operating-system UI.
- `desktop.js`: routing, portfolio windows, project selection, sound, and Snake.
- `scene.js`: custom procedural Three.js geometry, screen textures, lighting, camera, and picking.
- `portfolio-data.js`: project and agent data retained from the previous site.
- `assets/vendor/three.module.js`: pinned Three.js 0.170.0, self-hosted with its MIT license.
- `classic.html`, `script.js`, `styles.css`, `visual-refresh.css`, `studio.css`: preserved previous experience.

## Development and hosting

This is a static site with no build step, backend, API keys, or package installation required. Serve the repository root with any local static HTTP server; ES modules require HTTP rather than opening the HTML file directly.

GitHub Pages publishes the root of `main`. `.nojekyll` keeps this a static deployment. All module and asset paths work under the `/wiltobuild-portfolio/` project path.

The workstation is modeled entirely in code. The concept was inspired by [Henry Heffernan’s portfolio](https://henryheffernan.com/); the geometry, screen art, arrangement, and interface here are original, and no reference-site assets are bundled.

## Verification

Verified in the browser at desktop and 390 × 844 mobile sizes: 3D rendering, monitor selection, project switching, About and Contact content, Start-menu navigation, Snake start/score/pause, and return to the desk. JavaScript syntax and local asset references were checked. The renderer pauses while portfolio windows are open or the document is hidden, caps pixel density, and only redraws the static scene when needed.
