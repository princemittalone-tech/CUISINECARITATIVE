# Deployment Guide — Cuisine Caritative

## Quick Start: GitHub Pages Deployment

This project is now configured for automatic deployment to GitHub Pages. Follow these steps to enable it.

### Step 1: Enable GitHub Pages in Repository Settings

1. Go to your repository: **https://github.com/princemittalone-tech/CUISINECARITATIVE**
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - **Branch**: Should show "main" or "master" (depending on your default branch)
4. Click **Save**

### Step 2: Automatic Deployment

The workflow file (`.github/workflows/deploy.yml`) is already configured. Every time you push to `main` or `master`:

✅ The site builds automatically
✅ It deploys to `https://princemittalone-tech.github.io/CUISINECARITATIVE/`

### Step 3: Update Links (Important!)

Since the site will be deployed to a subdirectory (`/CUISINECARITATIVE/`), you need to add a base path to all your HTML files.

Add this line in the `<head>` of **every HTML file** (after `<meta>` tags):

```html
<base href="/CUISINECARITATIVE/">
```

Example for `index.html`:
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- ... other meta tags ... -->
  <base href="/CUISINECARITATIVE/">
  <link rel="icon" href="assets/img/logo-icone.png">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
```

**Files to update:**
- `index.html`
- `accueil.html`
- `comment-ca-marche.html`
- `packages.html`
- `don-horaire.html`
- `commande.html`
- `galerie.html`
- `organisations.html`
- `a-propos.html`
- `blog.html`
- `contact.html`
- `avis.html`
- `mentions-legales.html`
- `suivi.html`
- `compte/index.html`
- `compte/tableau-de-bord.html`
- All other HTML files

### Step 4: Monitor Deployment

1. Push your changes: `git push origin main`
2. Go to **Actions** tab in your repository
3. Watch the workflow run
4. Once it completes (✅ green checkmark), your site is live!

---

## Alternative Deployments

### Option A: Custom Domain (GitHub Pages)

To use your own domain (e.g., `www.cuisinecaritative.bj`):

1. In **Settings** → **Pages**
2. Under "Custom domain", enter your domain
3. Update your domain's DNS settings to point to GitHub Pages
4. GitHub will auto-generate an HTTPS certificate

### Option B: Netlify (Simpler, No Base Path Needed!)

Netlify is easier because it doesn't require a subdirectory:

1. Go to **https://netlify.com**
2. Click "New site from Git"
3. Connect your GitHub repository
4. Build command: (leave empty for static site)
5. Publish directory: `.` (root folder)
6. Click "Deploy site"

**Advantage**: Your site will be at a clean URL without needing the `<base>` tag.

### Option C: Vercel

1. Go to **https://vercel.com**
2. Import your GitHub repository
3. Build settings: (leave defaults)
4. Click "Deploy"

---

## Troubleshooting

### Issue: Links are broken after deployment
**Solution**: Did you add the `<base href>` tag? Check all HTML files.

### Issue: Assets (CSS/JS/images) are not loading
**Solution**: 
- Make sure relative paths use `assets/` (not `/assets/`)
- Verify the `<base href="/CUISINECARITATIVE/">` tag is in every HTML file

### Issue: Workflow shows red ❌ error
**Solution**: 
1. Click on the failed workflow run
2. Check the error logs
3. Common causes:
   - Branch name mismatch (check if it's `main` or `master`)
   - Invalid HTML syntax

### Issue: Site not appearing after 5 minutes
**Solution**: 
1. Hard refresh your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check your repository **Settings** → **Pages** to see the deployment URL
3. Wait up to 10 minutes for first deployment

---

## File Structure

Your deployment keeps this structure:
```
/CUISINECARITATIVE/
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   ├── img/
├── compte/
│   ├── index.html
│   └── tableau-de-bord.html
├── admin/
│   └── index.html
└── ... (other HTML files)
```

---

## Security Notes

✅ Static files only (no backend exposure)
✅ HTTPS enabled by default on GitHub Pages
✅ No database credentials in repo
✅ Admin password in demo only (replace before production)

---

## Next Steps

1. **Test locally first**: Open `index.html` in your browser
2. **Commit your changes**: `git add . && git commit -m "Add GitHub Pages deployment"`
3. **Push to GitHub**: `git push origin main`
4. **Wait for deployment**: Check **Actions** tab
5. **Visit your live site**: `https://princemittalone-tech.github.io/CUISINECARITATIVE/`

---

## Questions?

- Check **Actions** → Latest workflow run for logs
- Review `.github/workflows/deploy.yml` for configuration
- Ensure all HTML files have the `<base href>` tag

**Deployment Status**: ✅ Ready to go!
