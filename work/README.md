# ULTRA SCAN · MANTA · FLEX 03 — Portfolio case studies

Static site, no build step, no framework: plain HTML + CSS + vanilla JS + WebP images.
Every path is **relative**, so this whole folder can be dropped into any sub-directory of a
larger portfolio (e.g. `/work/`) and pushed to GitHub / GitHub Pages as-is.

## Structure

```
Ultra mana flex master/
├─ index.html              Overview of the three projects (optional in the main site)
├─ projects.json           Machine-readable list: title, accent, cover, path, chapters
├─ shared/
│  ├─ css/indesign-base.css   Generic InDesign-export rules, scoped to .scaler (won't leak)
│  ├─ css/portfolio.css       Page shell + all motion/interaction styles
│  └─ js/portfolio.js         Reveal, page scaling, nav, and the interactive page layers
├─ ultra-scan/
│  ├─ index.html          Case study page
│  ├─ pages.css           Layout of this project's InDesign pages only
│  ├─ assets/             Images used by this project (WebP / SVG, full resolution)
│  └─ research/           Chapter 02 interactive boards (css, js, IBM Plex Sans fonts)
├─ manta/                 index.html · pages.css · assets/
└─ flex-03/               index.html · pages.css · assets/
```

Each project folder is self-contained except for `../shared/`. To move one project on its own,
copy its folder **and** `shared/`, keeping them siblings.

## Preview locally

Double-click `index.html` (works from disk), or serve the folder:

```
python -m http.server 8000
# open http://localhost:8000/
```

## Merging into the main portfolio

1. Copy this folder into the portfolio repo, e.g. as `work/` → pages live at
   `/work/ultra-scan/index.html`, `/work/manta/index.html`, `/work/flex-03/index.html`.
2. Links that point outside this package — update them to the main site if needed:
   - footer "All projects" in each `*/index.html` → `../index.html` (this package's overview)
   - the overview `index.html` can be replaced by the main site's work listing (use `projects.json`).
3. GitHub Pages: keep a `.nojekyll` file at the **repository root** (one is included here for the
   case where this folder is the root). No folder names start with `_`, so Jekyll is safe either way.
4. File names are lower-case and case-sensitive on GitHub Pages — keep them exactly as they are.

## Adding more projects later

Copy one project folder (e.g. `manta/`) as a template, replace `index.html` content, `pages.css`
and `assets/`, then add an entry to `projects.json` and a card in `index.html`.
Theme colours are set per page in the `<style>` block in the head: `--bg` and `--accent`
(ULTRA SCAN `#f5b21a`, MANTA `#f4552a`, FLEX `#f5261a`).

## Notes

- Layout follows the original InDesign "Publish Online" pages 1:1; each 1920×1080 page is scaled to fit.
- Motion: scroll reveals, chapter bands, hero zoom, ScrollExpand (ULTRA SCAN p.9), AccordionGallery,
  BOM scan sweep, expanding grid, icon animations, posture outlines with zoom-to-person, research boards.
  All respect `prefers-reduced-motion`.
- No external requests: fonts, scripts and images are all local.
