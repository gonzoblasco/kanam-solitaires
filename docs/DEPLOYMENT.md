# Deployment — Kanam's Solitaires

The app is deployed to GitHub Pages from the `dist/` folder on every push to `main`.

## How it works

- `npm run build` produces `dist/`.
- GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys `dist/` to Pages.
- The live URL is `https://gonzoblasco.github.io/kanam-solitaires/`.

## PWA considerations

- `public/manifest.json` describes the app.
- `public/sw.js` caches `index.html`, `manifest.json`, and icons.
- Service worker is registered from `src/main.js` with a relative path `./sw.js`.
- Icons live in `public/icons/` as PNG 192×192 and 512×512 plus SVG fallback.

## Releasing

This project does not use npm publishing; releases are GitHub Pages deployments.

To release a new version:

1. Update `.knowledge/CHANGELOG.md` and `.knowledge/STATUS.md`.
2. Update `package.json` version if needed.
3. Run the full quality gate:
   ```bash
   npx biome check .
   npx vitest run
   npm run build
   ```
4. Commit and push:
   ```bash
   git add -A
   git commit -m "docs/release: vX.Y.Z"
   git pull --rebase origin main
   git push origin main
   ```
5. Verify the deploy in the Actions tab and open the live URL.

## Custom domain (optional)

1. Buy a domain.
2. Add `CNAME` file to `public/` with the domain.
3. Configure DNS to point to GitHub Pages.
4. Enable HTTPS in repository Settings → Pages.
