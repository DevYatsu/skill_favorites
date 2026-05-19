# skills-favorites

A browser extension to star and organize your favorite skills from the [skills.sh](https://skills.sh) registry.

## Overview

If you use skills.sh often, you might want a quick way to keep track of the skills you actually use. This extension adds a star button directly to the registry's skill pages, lets you tag them locally, and copies the install command to your clipboard in one click.

It is built with WXT and SolidJS, so it is lightweight and does not inject unnecessary garbage onto the page.

## Features

- **Quick star/unstar:** Adds a star button next to the skill name on any skills.sh detail page.
- **Local tags:** Group your skills with custom tags and filter them from the popup.
- **Copy install command:** Quickly copy the installation command configured for your package manager (npx, bunx, or pnpm dlx).
- **Device sync:** Favorites, tags, and settings are saved to your browser profile's sync storage, so they are available across devices.
- **List organization:** Pin up to 5 key skills to the top of your list. You can also sort the rest by date added, name, or install count.
- **Real-time installs:** Scrapes the live install count from the page data so you can see it right in the card.
- **Icon badge:** Shows the number of starred skills directly on the extension icon badge.
- **JSON import/export:** Back up your list or move it to another browser by exporting a local JSON file.

## Tech stack

- SolidJS (UI rendering)
- WXT (Browser extension framework)
- Biome (Formatting and linting)

## Installation

You can download the latest pre-built zip from the releases page.

1. Go to the [Releases](https://github.com/DevYatsu/skill_favorites/releases) page.
2. Download `chrome.zip` or `firefox.zip` depending on your browser.
3. Unzip the downloaded file.
4. **For Chrome:** Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the unzipped directory.
5. **For Firefox:** Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select the `manifest.json` file inside the unzipped directory.

## Development

### Running locally

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run in development mode:
   ```bash
   # For Chrome
   bun run dev

   # For Firefox
   bun run dev:firefox
   ```

### Building and packaging

```bash
# Compile the extension
bun run build

# Generate distribution zip files
bun run zip          # Chrome (MV3)
bun run zip:firefox  # Firefox (MV2)
```

The output files will be in the `.output/` folder.

## License

MIT
