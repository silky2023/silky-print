# silky-print (refactor/split-2014)

This branch splits the large 2014.html single-file app into a small component-based structure under `public/`:

- `public/index.html` – main shell (includes components and assets)
- `public/components/` – header and per-step HTML fragments
- `public/assets/css/styles.css` – extracted styles
- `public/assets/js/layout.js` – visualization & layout helpers (extracted)
- `public/assets/js/app.js` – UI wiring and a small pricing prototype

How to run (simple preview):
- Serve the `public/` directory using any static server, for example:
  - `npx serve public` or `python -m http.server` from the project root (adjust as needed)

Notes:
- This is a straight mechanical split of the original 2014.html content to make the UI easier to maintain.
- Pricing logic in `app.js` is intentionally simple and should be replaced with accurate formulas from business rules.

If you want, I can also:
- wire a CI pipeline to preview the branch on each push
- convert the components to server-side includes or a small bundler setup