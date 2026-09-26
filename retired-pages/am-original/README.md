# Retired AM Landing Page

This folder preserves the original `/a-m` landing page before the AM2 design was promoted.

- Source commit: `878f5797e72d8e040573a0eb4c5d44a0447399c1`
- Archived: 2026-09-26
- Original route: `/a-m`
- Local preview entry: [preview.html](preview.html)
- Source snapshot: `source/`
- Local public asset snapshot: `public/assets/`
- Asset hashes and original remote media URLs: [asset-manifest.json](asset-manifest.json)
- Original app entry and font imports: `source/main.jsx`

All repository-local assets are archived with SHA-256 hashes. Remote Cloudinary assets are preserved as their original URLs in the manifest; archival downloads of those remote images and videos are not included, so the preview still depends on those URLs remaining available.

Start the project’s local Vite server and open `http://127.0.0.1:5173/retired-pages/am-original/preview.html`. It imports only the frozen original landing page source and disables analytics. Cloudinary-hosted images and videos still load from their original URLs. The archive and its preview are excluded from production deployment.

`preview-original.snapshot` is a retained pre-promotion bundled snapshot; it is not the preview entry point because its captured development bootstrap is not standalone-safe. The source-based preview above is the reliable visual reference.

To restore the original page, copy `source/pages/LandingPage.jsx` back to `src/pages/LandingPage.jsx`, restore the archived `source/pages/landing/` modules, `source/lib/` modules, `source/routes.js`, `source/main.jsx`, and `source/styles/landing.css` plus the matching `source/styles/landing/` CSS files. Then restore the pre-archive route dispatch from commit `878f5797e72d8e040573a0eb4c5d44a0447399c1` and run the project's checks before deploying.

The existing `artifacts/AttractiveMen-original.html` archive has not been changed.
