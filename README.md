# Jasper Capiral – Portfolio

Personal portfolio of Jasper Capiral, Senior Web Developer.
Live site: https://jaspercapiral-dev.vercel.app

Plain HTML, CSS, and JavaScript, built with a small Node.js script (no dependencies)
and deployed on Vercel.

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
│   │   ├── home/                One module per homepage feature
│   │   └── pages/               Page entry points: home.js, projects.js
│   └── data/
│       └── projects.json        The project list (see src/data/README.md)
├── public/                      Copied to the site as is
│   ├── assets/images/           Screenshots, profile photos, icons, favicons
│   ├── files/                   Résumé PDF
│   └── favicon.ico, robots.txt, sitemap.xml, site.webmanifest
├── scripts/
│   ├── build.js                 Builds src/ + public/ into dist/
│   └── dev.js                   Local preview with automatic rebuilds
├── dist/                        Generated site (not in Git; built by Vercel)
├── package.json
└── vercel.json                  Tells Vercel to run the build and publish dist/
```

The build combines the style files into `/assets/css/style.css`, turns
`projects.json` into the module `/assets/js/data/projects.js`, and copies the
scripts to `/assets/js/`.

## Commands

Requires Node.js 18 or newer.

| Command          | What it does                                                    |
|------------------|-----------------------------------------------------------------|
| `npm run dev`    | Builds, rebuilds on every save, and serves http://localhost:3000 |
| `npm run build`  | Builds the site once into `dist/`                               |
| `npm run watch`  | Rebuilds on every save without starting a server               |

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

| Source                       | Published at        |
|------------------------------|---------------------|
| `src/pages/index.html`       | `/`                 |
| `src/pages/projects.html`    | `/projects/`        |
| `src/pages/case-studies.html`| `/case-studies/`    |
| `src/pages/404.html`         | shown for missing pages |

## Deploying

Push to `main`. Vercel runs `npm run build` and publishes `dist/` (see `vercel.json`).
