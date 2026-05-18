<div align="center">
  <h1>skills-favorites</h1>
  <p>Sleek and minimalist local favorites list and starring capability for the <a href="https://skills.sh">skills.sh</a> registry.</p>
</div>

---

## Overview

**skills-favorites** is a powerful browser extension that seamlessly integrates with the `skills.sh` registry. It allows you to build a curated local collection of your favorite skills, categorize them with custom tags, and instantly retrieve their installation commands without ever having to lose track of useful modules again.

Built with **[WXT](https://wxt.dev)** and **[SolidJS](https://www.solidjs.com/)**, the extension guarantees ultra-fast performance, minimal footprint, and an incredibly smooth developer experience.

## Features

- **Integrated Starring System**: Injects a sleek "star" button directly into `skills.sh` pages, enabling you to save skills in a single click.
- **Custom Tagging & Filtering**: Organize your saved skills with dynamic, inline custom tags. Quickly filter your entire favorites list based on the tags you've created.
- **Quick Copy**: Click a single button to instantly copy the `npx skills add <owner>/<repo> --skill <skill>` command to your clipboard.
- **Import / Export Backups**: Your data is 100% locally stored for privacy. Need to switch computers? Simply export your favorites configuration to a `.json` file and import it anywhere else.
- **Accessibility-First**: Designed with strict WCAG compliance. Fully keyboard navigable, screen-reader friendly, and carefully structured to ensure interactive elements are semantic and intuitive.

## Tech Stack

- **Framework:** [SolidJS](https://www.solidjs.com/) for lightning-fast, reactive UI rendering.
- **Build Tool:** [WXT](https://wxt.dev) (Next-gen framework for browser extensions).
- **Code Quality:** [Biome](https://biomejs.dev/) for blazing fast formatting and linting.
- **Styling:** Custom, zero-dependency minimalist CSS.

## Getting Started

### Prerequisites
Make sure you have Node.js and your preferred package manager (`npm`, `pnpm`, or `bun`) installed.

### Development

1. Clone the repository and install dependencies:
   ```bash
   bun install
   ```

2. Start the development server for your preferred browser:
   ```bash
   # For Chrome / Chromium browsers
   bun run dev
   
   # For Firefox
   bun run dev:firefox
   ```
   *WXT will automatically launch a fresh browser instance with the extension loaded and hot-module replacement (HMR) enabled.*

### Building for Production

To create an optimized, minified production build:

```bash
# Build for Chrome
bun run build

# Build for Firefox
bun run build:firefox
```

The compiled extension will be placed in the `.output` directory. 

To package the extension into a `.zip` file for Chrome Web Store or Firefox Add-ons submission:

```bash
bun run zip
bun run zip:firefox
```

## Linting & Formatting

This project uses **Biome** to enforce code quality and accessibility rules.

```bash
# Run Biome linter and formatter
biome check .

# Automatically fix lint issues and format
biome check --write .
```

## License

This project is open-source and available under the MIT License.
