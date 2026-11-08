# Jasper Capiral – Portfolio

## Editing pages

Pages are built from one shared `<head>`:

| Edit this                     | To change                                   |
|-------------------------------|---------------------------------------------|
| `src/pages/*.html`            | a page's content and its settings (title, description, scripts) |
| `template/head.html`          | the `<head>` of every page                  |
| `template/header.html`, `sidebar.html`, `footer.html` | shared parts loaded on every page |

After editing, run:

    node build.js            # build once
    node build.js --watch    # rebuild automatically on every save

This writes `index.html`, `projects/index.html`, `case-studies/index.html`, and `404.html`.
Don't edit those directly; they are overwritten on every build.

## Publishing

    git add .
    git commit -m "Describe your change"
    git push
