# Project data

`projects.json` is the one list behind both project grids:

- the homepage (`/`) shows only entries with `"featured": true`
- the projects page (`/projects/`) shows every entry

Each project:

| Field      | What it is |
|------------|------------|
| `name`     | Project name shown on the card |
| `type`     | Used for the filter buttons on the projects page, so keep the same wording for the same kind of site |
| `role`     | Short description of the site and your work |
| `url`      | Live address |
| `image`    | Screenshot in `public/assets/images/projects/`, like `/assets/images/projects/name.webp` (leave `""` to show a placeholder) |
| `tech`     | List of tools, like `["WordPress", "PHP", "JavaScript"]` |
| `year`     | Year as a number, or `""` if unknown |
| `featured` | `true` to show it on the homepage |
| `offline`  | Optional. `true` hides the project everywhere |

The build turns this file into `/assets/js/data/projects.js` (offline projects removed).
