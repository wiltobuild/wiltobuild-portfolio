# WilToBuild — the personal workstation

Wil Sheppard’s portfolio, presented as an original interactive 1990s desk with three CRT monitors. Published on the existing GitHub Pages site.

## Experience

- A custom WTBIOS startup opens with a Start prompt, animated virtual-memory check, real resource-loading results, three display checks, a typed boot command, optional synthesized sounds, and a CRT transition into the desk. Escape or Skip intro bypasses startup; Delete opens the working Setup panel. Replay is available beside the desk and in Start → Restart computer. Reduced-motion preferences remove the animation delays.
- Click a CRT to move the camera up to its glass: the left monitor opens About, the center opens Projects, and the right opens Contact. The working desktop is projected onto the physical screen with CSS3DRenderer and the same camera as the WebGL scene.
- Drag the desk to orbit the camera. Reset, daylight/evening lighting, and optional synthesized sound are available beside the scene.
- The desktop includes About, Projects, Experience, Toolkit, Pantheon, Credentials, Contact, and a playable Snake game.
- Project content, headshot, credentials, and contact destinations come from the existing portfolio. iRYS remains marked as a private active build.
- Multiple apps run in overlapping windows inside each CRT. Drag title bars to move, drag any edge or corner to resize, double-click a title bar to maximize/restore, or minimize to the taskbar. Each monitor retains its app instances, window geometry, scrolling, and minimized state during the visit. Windows stay inside their screen even after a viewport resize.
- Keyboard users can focus a title bar and use arrow keys to move or Shift + arrows to resize. The corner resize grip also supports arrow keys. Snake pauses when its window loses focus, is minimized, or its monitor is left. Escape or Back to desk pulls the camera out.
- Hash routes support direct links and browser history. Keyboard focus moves into the screen after the camera lands and returns when leaving; background navigation is inert while focused. Reduced-motion preferences skip the camera animation.
- Mobile layouts retain the whole workstation and expose the same content through accessible navigation. Portfolio content still works if WebGL fails.
- The previous full portfolio, including its auxiliary programs, remains available at `classic.html`.

## Files

- `index.html`: entry point, metadata, accessible navigation, and desktop shell.
- `desktop.css`: responsive workspace and retro operating-system UI.
- `monitor.css`: projected screen layout, compact screens, and camera-stage transitions.
- `desktop.js`: routing, portfolio windows, project selection, sound, and Snake.
- `window-manager.js`, `window-geometry.js`, `windows.css`: per-monitor app instances, pointer and keyboard gestures, containment, focus, and taskbar behavior.
- `boot.js`, `boot.css`: startup sequence, actual asset checks, Setup, Skip, and Replay.
- `scene.js`: custom procedural Three.js geometry, screen textures, lighting, camera, and picking.
- `portfolio-data.js`: project and agent data retained from the previous site.
- `assets/vendor/three.module.js` and `CSS3DRenderer.js`: pinned Three.js 0.170.0 and its official DOM renderer, self-hosted with the MIT license.
- `classic.html`, `script.js`, `styles.css`, `visual-refresh.css`, `studio.css`: preserved previous experience.

## Development and hosting

This is a static site with no build step, backend, API keys, or package installation required. Serve the repository root with any local static HTTP server; ES modules require HTTP rather than opening the HTML file directly.

GitHub Pages publishes the root of `main`. `.nojekyll` keeps this a static deployment. All module and asset paths work under the `/wiltobuild-portfolio/` project path.

The workstation is modeled entirely in code. The concept was inspired by [Henry Heffernan’s portfolio](https://henryheffernan.com/); the geometry, screen art, arrangement, and interface here are original, and no reference-site assets are bundled.

## Verification

Verified in the browser at desktop and 390 × 844 mobile sizes: camera entry and exit, alignment of the interactive desktop with all three screens, monitor switching, project selection, scrolling, Start-menu navigation, app close/maximize, Snake start/pause, and keyboard return to the desk. JavaScript syntax and local asset references were checked. Rendering is skipped while the document is hidden; pixel density is capped and the scene only redraws when the camera, lighting, or layout changes.

The window-manager update was verified with pointer drag/resize, keyboard move/resize, overlapping apps, taskbar minimize/restore, double-click maximize/restore, independent monitor state, mobile bounds, and game pause on minimize. Geometry checks cover all eight resize directions, opposite-edge anchoring, extreme pointer movement, and small screens. Startup checks cover Start, animated progress, Setup pause/continue, Escape/Skip, Replay, and direct routes after boot.

Run the window-boundary regression checks with `node --test tests/window-geometry.test.mjs`.
