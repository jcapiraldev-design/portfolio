# Jasper Capiral – Portfolio

[![CI](https://github.com/jcapiraldev-design/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/jcapiraldev-design/portfolio/actions/workflows/ci.yml)

Personal portfolio of Jasper Capiral, Senior Web Developer: 14 years of building websites
and 100+ live sites for clients in Japan, the Netherlands, and Australia.

**Live site:** https://jaspercapiral-dev.vercel.app

## Stack

- Hand-written HTML, CSS, and JavaScript (ES modules), no frontend framework
- A small Node.js build script with [esbuild](https://esbuild.github.io/) for bundling and minifying
- [Prettier](https://prettier.io/) for consistent formatting
- Hosted on [Vercel](https://vercel.com/), with GitHub Actions checking every push
- Contact form submissions handled by [Formspree](https://formspree.io/)

## Highlights

- **Fast:** one minified stylesheet, bundled JavaScript with content-hashed file names and
  long-term caching, and 640px card thumbnails (about 70% lighter than full screenshots)
- **Accessible:** keyboard support, visible focus, screen reader labels, and reduced-motion support
- **Secure:** Content Security Policy and other security headers (see `vercel.json`)
- **Search and sharing ready:** page titles and descriptions, Open Graph images, sitemap,
  and structured data
- **Light and dark themes** that follow the visitor's system setting

## Getting started

Requires Node.js 20 or newer (see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000, rebuilds on every save
```

## Commands

| Command                | What it does                                                         |
|------------------------|----------------------------------------------------------------------|
| `npm run dev`          | Builds, rebuilds on every save, and serves http://localhost:3000 with the same headers as Vercel |
| `npm run build`        | Builds the site into `dist/`                                         |
| `npm run watch`        | Rebuilds on every save without starting a server                    |
| `npm run check`        | Checks `dist/` for missing files, links, titles, and inline scripts |
| `npm run format`       | Formats JavaScript, CSS, and JSON with Prettier                      |
| `npm run format:check` | Reports files that aren't formatted (used in CI)                     |
| `npm run thumbnails`   | Creates card thumbnails for new screenshots (needs `brew install webp`) |

## Project structure

```
├── src/                         Everything you edit
│   ├── pages/                   One file per page: settings comment + page content
│   ├── partials/                Shared parts: head, header, sidebar, footer
│   ├── styles/
│   │   ├── main.css             Lists the style files in the order they are combined
│   │   ├── base/                Design tokens (colors, fonts) and base element styles
│   │   ├── layout/              Sidebar, top navigation, footer
│   │   ├── components/          Buttons, project cards, skills, modals, photo, small UI
│   │   ├── sections/            Homepage sections: intro, about, experience, services,
│   │   │                        case studies, contact
│   │   └── pages/               Page-specific styles: projects, 404
│   ├── scripts/                 ES modules
│   │   ├── main.js              Runs on every page
│   │   ├── core/                Layout, back to top, effects, modals, 404
│   │   ├── components/          Project cards
│   │   ├── data/                Loads the project list
│   │   ├── home/                One module per homepage feature
│   │   └── pages/               Page entry points: home.js, projects.js
│   └── data/
│       └── projects.json        The project list (see src/data/README.md)
├── public/                      Copied to the site as is
│   ├── assets/images/           Screenshots (+ thumbs/), profile photos, icons, favicons
│   ├── files/                   Résumé PDF
│   └── favicon.ico, robots.txt, sitemap.xml, site.webmanifest
├── scripts/                     build.js, dev.js, check.js, thumbnails.js
├── .github/workflows/ci.yml     Format check, build, and site check on every push
├── dist/                        Generated site (not in Git; built by Vercel)
├── package.json
└── vercel.json                  Build settings, security headers, and caching
```

## Pages

Each file in `src/pages/` starts with its settings:

```html
<!--
  Page settings (used by build.js to write the <head>)
  title: All Projects – Jasper Capiral, PHP Developer
  description: Browse 100+ live websites ...
  path: /projects/
  scripts: pages/projects.js
-->
```

The build adds the shared `<head>` (which loads `main.js` on every page, plus the page's own
module from `scripts:`), writes the header, sidebar, and footer into the page, picks the right
sidebar menu, and highlights the current page in the navigation.

| Source                        | Published at            |
|-------------------------------|-------------------------|
| `src/pages/index.html`        | `/`                     |
| `src/pages/projects.html`     | `/projects/`            |
| `src/pages/case-studies.html` | `/case-studies/`        |
| `src/pages/404.html`          | shown for missing pages |

## Adding a project

1. Save the screenshot as `public/assets/images/projects/name.webp` (1440px wide).
2. Run `npm run thumbnails` to create its card thumbnail.
3. Add an entry to `src/data/projects.json` (fields are explained in `src/data/README.md`).
4. Run `npm run build && npm run check`.

## Deploying

Push to `main`. Vercel runs `npm ci` and `npm run build`, then publishes `dist/` with the
headers from `vercel.json`. GitHub Actions runs the same build plus the checks on every push.

## License

Code and content © Jasper Capiral. All rights reserved.
