# HIFA Holiday Cup

One-page scroll site for the HIFA Holiday Cup (The tourney page). Plain HTML, CSS and JS, no build step.

```
index.html
style.css
script.js
assets/logo.webp
assets/highlighters.webp
```

## Run locally
Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Publish with GitHub Pages
1. Create a repo and push these files to the `main` branch.
2. Repo Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site goes live at `https://<your-username>.github.io/<repo-name>/`.

## Notes
- Fonts (Abril Fatface, Instrument Serif, Pinyon Script) load from Google Fonts.
- Festive Fixtures and Players show a "coming soon" message until those pages exist. Update the `data-soon` links in `index.html` when they are ready.
- The Instagram link is `https://www.instagram.com/hifa.official/`.
