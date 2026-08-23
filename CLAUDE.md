# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The ldnddev Framework (`@ldnddev/dd-framework`) is a modular, atomic design-based CSS/SCSS framework for building responsive, accessible web components. It is distributed as an npm package and includes a PHP-based documentation/demo site.

## Development Environment

Requires Docker and Lando. All commands run through Lando (not bare npm/grunt):

```bash
lando rebuild -y          # Initial setup / rebuild environment
lando grunt build         # Full production build (SCSS, JS, assets)
lando grunt dev           # Build + watch + BrowserSync live reload
lando grunt sync          # BrowserSync + watch only (no rebuild)
lando grunt favicon       # Generate favicons from source/favicon/favicon.png
lando npm publish --access public  # Publish to npm (from npm-package branch)
```

Lando provides a LAMP stack (PHP 8.2, Apache, Node 20). Local URL: `https://frameworkldnddev.lndo.site:8888`

## Build Pipeline

- **SCSS**: `source/scss/style.scss` compiles via `grunt-dart-sass` to `web/assets/css/style.css` (expanded) and `style.min.css` (compressed) with sourcemaps
- **JS**: Files concatenated in order: `source/js/vendors/**/*.js` -> `source/js/components/*.js` -> `source/js/main.js` -> output to `web/assets/js/main.js` and `main.min.js`
- **Linting**: Biome (v2.2.6) is available for code quality checks

## Architecture

Source files live in `/source/`, compiled output goes to `/web/assets/`. The `/web/` directory is the document root.

### Atomic Design Layers (SCSS)

- `source/scss/partials/` - Core: variables, mixins, normalize, grid, fonts, modifiers, animations
- `source/scss/components/` - Component styles (`_dd_*.scss`)
- `source/scss/elements/` - Base element styles (forms, text)
- `source/scss/regions/` - Template regions (header, footer, sidebar)
- `source/scss/layouts/` - Page layout styles
- `source/scss/vendors/` - Third-party styles (SAL)
- `source/scss/style.scss` - Main entry point importing all partials

### JavaScript

- `source/js/main.js` - Entry point (initializes SAL on DOMContentLoaded)
- `source/js/components/` - Component JS (`_dd_*.js`), vanilla JS only
- Components must initialize on `DOMContentLoaded` and re-initialize on `htmx:afterSettle` for HTMX compatibility

### Templates & Demo Site

- `web/templates/components/` - Reusable component HTML (`dd-*.html`)
- `web/pages/` - Demo pages for each component
- `web/includes/` - PHP includes (head, header, footer, navigation)

## Component Conventions

- **BEM naming with `dd-` prefix**: `.dd-component`, `.dd-component__element`, `.-modifier`
- **All components must be wrapped in `dd-section`** except `dd-hero`
- **SCSS uses `@use` syntax** (not `@import`)
- **Indentation**: 2 spaces in all files (SCSS, JS, HTML, PHP)
- **Accessibility required**: ARIA attributes, keyboard navigation, semantic HTML, WCAG 2.1 AA

### Creating a New Component

1. HTML template: `web/templates/components/dd-newcomponent.html`
2. SCSS: `source/scss/components/_dd_newcomponent.scss` (import in `style.scss`)
3. JS (if needed): `source/js/components/_dd_newcomponent.js`
4. Demo page: `web/pages/dd-newcomponent.html`
5. Build test: `lando grunt build`

When publishing to npm, new components must also be added to `source/scss/dd-framework.scss`.

## Grid System

Responsive utility classes: `dd-g` (grid container), `dd-u-1-1` (full width), `dd-u-lg-12-24` (half width on large screens).

## Vendor Libraries

FontAwesome Pro (icons), SAL.js (scroll animations), Slick (carousel), Colorbox (lightbox), axe-core (accessibility testing).

## NPM Publishing Workflow

Updates go through `npm-package` branch (has minor edits for package distribution). Increment version in `package.json`, add new components to `source/scss/dd-framework.scss`, then `lando npm publish --access public`.
