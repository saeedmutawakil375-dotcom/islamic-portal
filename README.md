# Islamic Portal — Demo Site

This project is a static HTML/CSS/JS template. It now includes a selectable cultural theme — Ghanaian (kente) and an Islamic architecture theme — toggled via the globe button in the header. The theme preference is saved to `localStorage`.

The **Resources** page now generates clickable cards with locally-generated kente-style SVG images (no external image dependencies), includes a live search/filter box with result counts, and provides an admin panel to suggest new resources. Custom resources are stored in `localStorage` and persist across sessions. The prayer times are geolocation-aware (requests user permission) and provide a live countdown to the next prayer. The About page has been expanded with mission, features, privacy, and contribution guidance. The UI supports two themes (Ghanaian kente and Islamic architecture).

This is a small, static demo site scaffold using glassmorphism styling.

Quick start

1. Open the `site` folder in your browser, or run a simple static server.

Run with Python (works on Windows if Python is installed):

```bash
cd site
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

Files

- `index.html` — Landing
- `about.html` — About page
- `portfolio.html` — Portfolio grid
- `assets/css/style.css` — Styles
- `assets/js/main.js` — Small interactions

Deployment

- Quick: enable GitHub Pages for this repository and point it to the `gh-pages` branch or the workflow below.
- CI: A workflow is included at `.github/workflows/pages.yml` which deploys the `site/` folder to GitHub Pages when you push to the `main` branch.

To preview locally using Python:

```bash
cd site
python -m http.server 8000
```

Then open http://localhost:8000.

Next steps

- Replace copy and images with your content
- Add project cards in `portfolio.html`
- Deploy to GitHub Pages or Netlify
