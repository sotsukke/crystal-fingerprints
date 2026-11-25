# Crystal density fingerprints

Web applet for my INFO-F420 Computational Geometry project (ULB), Jules De Rop.

Live at https://sotsukke.github.io/crystal-fingerprints/

The site has five pages in its sidebar: the Playground (`#/`), the Density fingerprints course (`#/course`), the AI journal (`#/journal`), the Expected fingerprints course (`#/expected`) and the References (`#/references`, read from `refs.bib`).

## Run it

The applet is in `web/`, a Vite + React page. It uses pnpm, pinned in `web/package.json`. From `web/`:

```
pnpm install --frozen-lockfile
pnpm dev          # local server at http://localhost:3000/
pnpm typecheck
pnpm test         # geometry unit tests
pnpm build        # static site in web/dist, openable from any path
```

Without a global pnpm, prefix each command with `corepack`, for example `corepack pnpm install --frozen-lockfile`.

Every push to `master` builds the site and deploys it to GitHub Pages (`.github/workflows/pages.yml`).
