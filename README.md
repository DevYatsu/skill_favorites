<div align="center">
  <h1>skills-favorites v2.0.0</h1>
  <p>Sleek, feature-rich browser extension to search, sort, pin, and sync your favorite skills from the <a href="https://skills.sh">skills.sh</a> registry.</p>
  <p>
    <a href="#overview">Overview</a> •
    <a href="#new-in-v200">New in v2.0.0</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#installation">Installation</a> •
    <a href="#development-setup">Development</a> •
    <a href="#license">License</a>
  </p>
</div>

---

## Overview

**skills-favorites** is a powerful developer utility extension that integrates directly with the `skills.sh` registry. It allows you to build a curated local collection of your favorite skills, categorize them with custom tags, and instantly retrieve their installation commands.

Built with **[WXT](https://wxt.dev)** and **[SolidJS](https://www.solidjs.com/)**, it runs with zero runtime overhead, absolute privacy, and cross-browser synchronization.

---

## New in v2.0.0

Version 2.0.0 elevates the extension from a simple database utility into an elite, production-grade developer workflow tool with premium UX, keyboard-driven navigation, and enhanced organization:

### 1. Robust Synchronization Architecture
*   **Universal `sync` Storage:** All favorites and preferences are fully synchronized across devices via Chrome Sync / Firefox Sync.
*   **Firefox Dynamic Reactivity:** Fully redesigned layout-mounting updates resolve Firefox-specific background hydration race conditions, ensuring clean, on-demand layout rendering.

### 2. Premium Navigation & Sorting Engine
*   **Persistent Sort Orders:** Sort your list dynamically by **Recent** (newest added), **A-Z** (alphabetical name), or **Installs** (install count).
*   **Skill Pinning:** Anchor up to 5 prioritized skills to the top of your popup list, complete with visual pin badges and responsive Amber highlighting.
*   **Scraped Real-Time Installs:** Automatically extracts raw install metrics from the page Next.js RSC payload and renders beautiful, readable count badges (e.g. `13K installs`) inline in the bottom-right of the card.

### 3. Keyboard-Driven Accessibility
*   `Cmd+F` or `Ctrl+F` focuses the search box instantly, preventing default browser search overrides.
*   `Esc` clears the active search query or safely blurs focused input boxes.
*   `ArrowDown` and `ArrowUp` keys navigate cards smoothly by focusing active elements.

### 4. Background Metrics & Clean Design
*   **Star Counter Badge:** An amber extension action badge displays the exact count of saved skills in real-time, matching modern browser utility patterns.
*   **Modular Component Architecture:** Extracted core logic into highly readable, single-responsibility SolidJS rendering modules under `components/` (`BackupSection`, `EmptyState`, `PopupHeader`, `SearchBar`, `SkillList`, `TagFilterRow`).

---

## Features

- **Integrated Starring System:** Injects a sleek star button directly next to H1 elements on `skills.sh` detail views.
- **Custom Tagging:** Create, delete, and browse dynamic inline tags to catalog similar skill groups.
- **Interactive Quick-Copy:** Single-button action generates and copies target CLI commands (`npx`, `bunx`, or `pnpm dlx`) ready to run.
- **Data backups:** Seamless one-click local JSON imports and exports.

---

## Tech Stack

- **UI Framework:** [SolidJS](https://www.solidjs.com/) for reactive, lightning-fast DOM updates.
- **Extension Framework:** [WXT](https://wxt.dev) for MV3 (Chrome) & MV2 (Firefox) cross-compilation.
- **Code Quality:** [Biome](https://biomejs.dev/) & TypeScript for strict static analysis and accessibility validation.
- **CSS Engine:** Custom HSL dark-mode system with beautiful micro-animations and zero package bloat.

---

## Installation

Download the latest pre-built packages:

1. Go to the [Releases](https://github.com/DevYatsu/skill_favorites/releases) page.
2. Download the `.zip` target package (`chrome.zip` or `firefox.zip`).
3. Extract the contents.
4. **Chrome/Chromium:** Navigate to `chrome://extensions/`, enable **Developer mode**, and select **Load unpacked** pointing to the extracted build folder.
5. **Firefox:** Navigate to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and choose the generated `manifest.json`.

---

## Development Setup

### Installation & Run

```bash
# Clone and install dependencies
bun install

# Run hot-reloading development client
bun run dev          # Chrome
bun run dev:firefox  # Firefox
```

### Production Bundling

```bash
# Compile and output extension targets
bun run build

# Generate production-ready distribution ZIP files
bun run zip          # Chrome (MV3)
bun run zip:firefox  # Firefox (MV2)
```

Generated distributions are produced inside the local `.output/` folder.

---

## License

MIT License. Open-source and built for developers.
