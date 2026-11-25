# Crystal density fingerprints

Web applet for my INFO-F420 Computational Geometry project (ULB), Jules De Rop.

Live at https://sotsukke.github.io/crystal-fingerprints/

The project is based on Herbert Edelsbrunner, Teresa Heiss, Vitaliy Kurlin, Philip Smith and Mathijs Wintraecken. The Density Fingerprint of a Periodic Point Set. In *37th International Symposium on Computational Geometry (SoCG 2021)*, LIPIcs 189, pages 32:1–32:16, 2021. [doi:10.4230/LIPIcs.SoCG.2021.32](https://doi.org/10.4230/LIPIcs.SoCG.2021.32). The full bibliography is on the References page.

The site has five pages in its sidebar: the Playground (`#/`), the Density fingerprints course (`#/course`), the AI journal (`#/journal`), the Expected fingerprints course (`#/expected`) and the References (`#/references`, read from `refs.bib`).

## Open it without installing anything

`site/` is the built page. Open `site/index.html` in a browser. This copy is bundled into one plain script, so it works straight from the folder, with no server.

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
