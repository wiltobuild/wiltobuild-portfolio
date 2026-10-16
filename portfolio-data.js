export const PROJECTS = [
  {
    id: "irys",
    status: "Private / Active build",
    kind: "Windows desktop companion",
    title: "iRYS",
    description:
      "A lightweight Windows companion with an eye-shaped overlay that communicates local application and coding-agent activity through distinct visual states.",
    visual: "assets/irys-animated-visual/index.html",
    labels: ["Platform", "System boundary", "Current evidence"],
    evidence: [
      "C# and .NET 8 desktop application",
      "Local tray controls and secured loopback events",
      "Interactive overlay states, local settings, and test project",
    ],
    access: "Repository private during active development",
  },
  {
    id: "cephalon",
    status: "Public / Active build",
    kind: "Warframe companion web application",
    title: "CEPHALON",
    description:
      "An all-in-one Warframe companion: a deterministic build and damage engine, an arsenal workspace, and farming, relic, and mastery planning, wrapped around a searchable library of vetted builds.",
    visual: "assets/cephalon-animated-visual/index.html",
    labels: ["Calculation engine", "Arsenal workspace", "Build library"],
    evidence: [
      "Next.js app over a standalone TypeScript calculation engine with a formula-regression gate",
      "Server-side weapon and Warframe builder with live stat deltas and confidence",
      "394-build guide library across Warframe, weapon, Archwing, and companion categories",
    ],
    links: [
      { label: "Open live project", url: "https://cephalon.vercel.app/" },
      {
        label: "View repository",
        url: "https://github.com/wiltobuild/cephalon",
      },
    ],
  },
  {
    id: "gitfit",
    status: "Public / Active build",
    kind: "Fitness studio management suite",
    title: "GitFit",
    description:
      "A unified fitness-management platform for one studio: members book classes and track momentum, staff run a live operations console, and Fitbot — a deterministic-first assistant — ties it together as the suite's native interface.",
    visual: "assets/gitfit-animated-visual/index.html",
    labels: [
      "Suite architecture",
      "Role and data model",
      "Deterministic assistant",
    ],
    evidence: [
      "One Next.js app, four role-aware modules on a shared design system and auth model",
      "Supabase Postgres with row-level security and a trigger-protected client/staff role boundary",
      "Fitbot answers everyday requests with intent-routed logic against real data, not an LLM call per message",
    ],
    links: [
      {
        label: "Open live project",
        url: "https://gitfit-pursuit6.vercel.app/",
      },
      {
        label: "View repository",
        url: "https://github.com/wiltobuild/gitfit-fitbot",
      },
    ],
  },
  {
    id: "slot-4",
    status: "Reserved",
    kind: "Future case study",
    title: "Systems utility",
    description:
      "Space for a small software tool informed by automation, diagnostics, or support work.",
    labels: ["Context", "Decisions", "Evidence"],
    evidence: ["Operational problem", "Diagnostic logic", "Observed result"],
  },
];
export const AGENTS = {
  athena: {
    role: "Planner",
    title: "Planner / Architecture and Delegation",
    model: "Claude Opus 4.8",
    scope: "Architecture and delegation",
    description:
      "Handles architecture, complex planning, delegation, and unresolved ambiguity before work moves to a specialist.",
  },
  zeus: {
    role: "Escalation",
    title: "Escalation // Independent Top-Down Reasoning",
    model: "Sol 5.6",
    scope: "High-ambiguity problem framing",
    description:
      "Independently reasons through escalated, high-ambiguity problems from the top down; its proposal is handed to Athena for synthesis.",
  },
  hades: {
    role: "Escalation",
    title: "Escalation // Underworld Reasoning",
    model: "Claude Fable",
    scope: "Independent counter-proposal",
    description:
      "Reasons independently from the depths; any tokens that don't make Athena's final cut are banished straight to the underworld.",
  },
  hephaestus: {
    role: "Builder",
    title: "Builder // Implementation Workhorse",
    model: "Terra 5.6",
    scope: "Coding and execution",
    description:
      "Edits files, works in the terminal, debugs implementation, and runs tests against the plan.",
  },
  argus: {
    role: "Watcher",
    title: "Watcher // All-Seeing Eye",
    model: "Claude Haiku 4.5",
    scope: "Monitoring and status",
    description:
      "Classifies logs, summarizes activity, detects failures, and posts concise updates while work is in progress.",
  },
  themis: {
    role: "Reviewer",
    title: "Reviewer // Quality Gatekeeper",
    model: "Claude Sonnet 5",
    scope: "Plans, code, and tests",
    description:
      "Reviews plans, diffs, tests, and completed work with enough reasoning depth for practical code judgment.",
  },
  mnemosyne: {
    role: "Memory",
    title: "Memory // Decision Archive",
    model: "Claude Haiku 4.5",
    scope: "Structured project memory",
    description:
      "Extracts decisions, preferences, and useful facts into structured memory, paired with an embedding model for retrieval.",
  },
  hermes: {
    role: "Relay",
    title: "Relay // Message and Tool Courier",
    model: "Claude Haiku 4.5",
    scope: "Routing and communication",
    description:
      "Handles tool selection, message formatting, structured JSON, and communication between agents.",
  },
  aegis: {
    role: "Security",
    title: "Security // Risk and Policy Sentinel",
    model: "Claude Sonnet 5",
    scope: "Risk and policy review",
    description:
      "Flags risky actions, permission requests, suspicious commands, exposed secrets, and possible policy violations.",
  },
};
