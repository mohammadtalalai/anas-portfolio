# Anas Sarhan — Portfolio (Next.js)

Next.js 15 (App Router) static portfolio. Purple palette, dark/light theme, no backend.

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Deploy to Vercel
Push to GitHub, then Import on vercel.com/new (Framework: Next.js, defaults). Or: `npx vercel --prod`.
Optional env var: `NEXT_PUBLIC_SITE_URL=https://your-domain.com` (used for Open Graph URLs).

## Editing content
- `content/body.html` — all page text and sections (experience dates, bio, contact...).
- `app/layout.js` — page title, description, social preview.
- `app/styles/*.css` — styles. Main colors are the CSS variables at the top of `styles.css` (`:root` = dark, `html.light` = light).
- `public/assets/` — photo (`anas-cutout.png`), favicon, social image. `public/Anas_Sarhan_CV.pdf` is the Resume download.
