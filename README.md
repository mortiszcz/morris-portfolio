# Morris Chuang Portfolio

Production source for [morrischuang.site](https://morrischuang.site/).

The homepage (`index.html`) is the September 23 `Morris siteb master` landing page. It links to six case studies: ROG Zephyrus Duo G16, ProArt P16, ASUS Jelly75 KD201, CipherLab UltraScan, SAR Manta, and FLEX E-Scooter. The earlier `/work/` pages remain available at their existing URLs.

The site is static and requires no build step. Cloudflare Workers serves the repository root through `wrangler.jsonc`; `.assetsignore` prevents Git metadata and deployment files from being uploaded as public assets. The homepage motion reel is a deployment copy encoded at 1080p with transparency; the 1440p source remains in the local master archive.

Source package: `Morris siteb master - website.zip` (2026-09-23, SHA-256 `7087B21B98864E1382B4EA586E8C6DFECF7C1184922458C8D5A264EE174CA83B`). The package's `index-structure-study.html` is published as `index.html`; local preview scripts and an incomplete scroll prototype were omitted.
