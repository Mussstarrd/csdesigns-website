# CSDesigns

Portfolio site — UX/UI, branding, event flyers, photography. Vite + React 19 + Tailwind CSS 4.

Project root: `C:\Users\dev\AppData\Roaming\npm\csdesigns`

## Quick start

```
npm install
npm run dev
```

Then open `http://localhost:5176`.

## Scripts

| Command           | What it does                            |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Vite dev server on port 5176            |
| `npm run build`   | Production build into `dist/`           |
| `npm run preview` | Preview production build locally        |

## Structure

```
src/
  components/   Navbar, Footer, PortfolioGrid
  pages/        Home, Portfolio, Contact
  data/         portfolio.js (all portfolio items)
  index.css     Tailwind theme + global styles
public/
index.html
vite.config.js
```

Edit portfolio items in `src/data/portfolio.js`. Replace cover images by dropping files in `public/` and pointing `cover:` to `/filename.jpg`.
