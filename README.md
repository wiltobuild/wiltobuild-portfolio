# WilToBuild Portfolio

Personal portfolio website for Wil Sheppard, an AI developer with a professional background in Crestron programming, AV automation, systems integration, troubleshooting, and client support.

The site uses a responsive portfolio map to connect Experience, Skills, Projects, Credentials, and Contact. Selecting a section activates its path and reveals the content in place. The interface keeps direct URL states, keyboard navigation, reduced-motion support, and a touch-friendly mobile layout.

## Files

- `index.html` - accessible page structure, portfolio content, social links, and metadata
- `styles.css` - responsive layout, visual states, section components, and animation
- `visual-refresh.css` - editorial hero, portrait treatment, warm palette, responsive visual refinements; loaded after the base component styles and compatible with all three lighting scenes
- `studio.css` - graphite surfaces, dimensional framing, Barlow Condensed display typography, and responsive studio presentation
- `script.js` - URL history, route interaction, Experience and Skills controls, and the project carousel
- `assets/` - Wil Sheppard's headshot

The project uses static HTML, CSS, and JavaScript and can be hosted directly with GitHub Pages.

The social preview in `assets/hero-preview.png` is a browser capture of the styled `.identity-feed` on the default Work / Full Portfolio homepage, with its real filters, background, and framing. `assets/hero-icon.png` is a proportional 64px export of that capture for browser tabs.

## Reading experiences

Exploration presets persist locally. Full portfolio presents the complete visual experience. Hiring manager adds role-fit guidance and an editorial layout, with a project-first guided sequence. Technical adds implementation guidance, a denser technical presentation, highlighted project evidence, and a verification-first Skills view. All seven modules remain directly accessible in every preset. Lighting and reading presets operate independently.

Skills presents four interactive stages: framing, agent-assisted building, verification, and delivery. Each stage describes practices, a deliverable, and a link that selects the matching project in the portfolio.

## Social profile configuration

Social destinations are defined in `SOCIAL_URLS` near the top of `script.js`. GitHub is configured for `wiltobuild`; replace the LinkedIn and X homepage values with Wil's exact profile URLs before publishing.
