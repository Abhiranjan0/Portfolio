# Abhishek Ranjan - Portfolio

A dark-first, responsive Cloud & AI engineering portfolio. Built with HTML, CSS, and JavaScript, with Vite as the only development dependency.

## Experience

- Charcoal, electric lime, and warm editorial typography, with an optional light theme.
- Interactive Intelligence Lab: select Azure AI, Copilot Studio, or Power Automate to explore the toolkit.
- Ambient orbital animation, a scrolling ribbon, pointer-reactive card lighting, and reading progress.
- A motion pause/resume control and automatic respect for system reduced-motion preferences.
- Mobile navigation, project filters, keyboard-accessible project dialogs, and copy-email feedback.
- The supplied [Google Drive resume](https://drive.google.com/file/d/1dpnUHfmaN6hP2zCp7i9EiQE7_NdLQF8q/view?usp=sharing), linked from the hero and contact section.

Dark is the default for first-time visitors, including browsers that block local storage. A visitor's explicit light/dark choice is preserved. Education includes qualifications, institutions, dates, and locations, but no marks, percentages, or CGPA. Professional training achievements remain.

There is no backend, analytics, account, or runtime API dependency. All fonts and graphics are local. External links open only when selected. Contact actions open the visitor's email or phone application; the site does not pretend to send messages itself. Clipboard access needs HTTPS or localhost and browser permission.

## Run and validate locally

Use Node.js 22.12+ or a newer supported release. Node.js 22.x or 24.x is suitable for hosting.

```powershell
npm ci
npm run dev
```

Open the local URL printed by Vite. To validate and preview the production build:

```powershell
npm test
npm run build
npm run preview
```

Vite writes the deployable website to `dist`. Do not serve the unbuilt source as a GitHub Pages site. The current relative `base: "./"` supports both a root domain and a project subdirectory.

## Content and editing

- [index.html](./index.html): portfolio content, metadata, external resume links, Intelligence Lab descriptions, and project detail templates.
- [src/styles.css](./src/styles.css): responsive layouts, both themes, illustration, motion, and print styling.
- [src/main.js](./src/main.js): theme persistence, toolkit interaction, motion control, card lighting, filtering, navigation, and dialogs.
- [tests/portfolio.test.js](./tests/portfolio.test.js): source-content preservation, exact resume URLs, removal of education marks, default-theme behavior, links, and assets.

Content combines the resume and LinkedIn PDF export. The detailed LinkedIn timeline is used: Graduate Engineer Trainee, September-December 2025; Cloud & AI Engineer, December 2025-present. The company is displayed as LTM (formerly LTIMindtree). Both education entries, all skills, two projects, four certifications, and four achievements are retained, except the explicitly removed education marks.

Both resume buttons open the exact supplied Google Drive viewer URL in a new tab. They intentionally do not use the HTML `download` attribute, which cannot force downloads from a cross-origin Drive viewer. Confirm that the Drive file's **General access** is **Anyone with the link - Viewer** before sharing the website. The obsolete public PDF copy has been removed. The original source PDF stays on your computer and is excluded by [.gitignore](./.gitignore); it is not needed to build or deploy.

The Claude credential titles use "Foundations", as confirmed by their Credly pages. Microsoft credential names and links remain as supplied. Project visuals are original illustrative concepts, labeled as such, not screenshots or claims of live deployed applications.

Manrope is locally hosted under the [SIL Open Font License](./public/fonts/OFL.txt). Core content, navigation, profile links, and the resume remain accessible without JavaScript.

---

## 1. Push to GitHub yourself

These are instructions only. No Git repository, commit, remote, workflow, or deployment has been created by the assistant.

1. Sign in at [GitHub](https://github.com/new) and create an **empty** repository named `portfolio`.
2. Choose **Public** if you intend to use GitHub Pages with a free account. Do not initialize the repository with a README, license, or gitignore; these files already exist locally.
3. Open PowerShell in the project folder. Replace `YOUR_USERNAME` below with your actual GitHub username.

```powershell
Set-Location 'C:\Users\v-ranjanab\OneDrive - Microsoft\Desktop\portfolio'

npm test
npm run build

git init
git branch -M main
git add .
git --no-pager diff --cached --stat
git --no-pager diff --cached
```

4. Review the staged files before publishing. Your name, phone number, email, employment, and public profile links are intentionally part of this portfolio. Do not commit secrets or private files.
5. Commit and push:

```powershell
git commit -m "Build my Cloud and AI portfolio"
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

If Git asks for your author identity, configure it for this repository and rerun the commit:

```powershell
git config user.name "Abhishek Ranjan"
git config user.email "YOUR_GITHUB_EMAIL"
```

Use Git Credential Manager's browser sign-in if prompted; do not put a password or token into a remote URL. `node_modules`, `dist`, local environment files, and the source resume are excluded from Git.

## 2A. Deploy on Vercel (simplest option)

1. After pushing the code, sign in at [Vercel](https://vercel.com/new) with GitHub.
2. Choose **Add New / Project**, import your `portfolio` repository, and authorize access if requested.
3. Confirm these settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | Vite |
   | Root directory | `./` |
   | Install command | `npm ci` |
   | Build command | `npm run build` |
   | Output directory | `dist` |
   | Node.js version | 22.x or 24.x |
   | Environment variables | None required |

4. Click **Deploy** yourself. When successful, Vercel provides an HTTPS `vercel.app` address.
5. Test the resume in an incognito window, mobile navigation, project dialogs, and both themes at that public address.
6. Subsequent pushes to `main` deploy automatically. Add a custom domain in the project's **Settings / Domains** if desired.

The site uses in-page hash navigation, so it does not need an SPA rewrite or a `vercel.json` file.

## 2B. Alternatively, deploy on GitHub Pages

Choose this instead of Vercel if you prefer GitHub-hosted deployment.

1. Open your repository's **Settings / Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Create `.github/workflows/deploy.yml` yourself with the workflow below. This is only a sample inside this guide; no active workflow has been added.

```yaml
name: Deploy portfolio to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Check out source
        uses: actions/checkout@v7
      - name: Set up Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build website
        run: npm run build
      - name: Configure Pages
        uses: actions/configure-pages@v6
      - name: Upload built website
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v5
```

4. Commit and push that new workflow:

```powershell
git add .github
git commit -m "Add GitHub Pages deployment"
git push
```

5. Open **Actions**, wait for the deployment to succeed, and use the website URL shown in **Settings / Pages**. For a repository named `portfolio`, it is normally `https://YOUR_USERNAME.github.io/portfolio/`.
6. Keep the trailing slash on the project URL. The current relative asset base works at this subdirectory; no source configuration change is required.

Do not select **Deploy from a branch / root** for the source repository: that would publish unbuilt Vite files instead of `dist`.

## Future updates

Edit your portfolio, then run:

```powershell
npm test
npm run build
git add .
git --no-pager diff --cached --stat
git commit -m "Update portfolio"
git push
```

Your chosen host will rebuild and publish the changes. Updating the contents of the same Google Drive file does not require a site update; if the Drive file ID changes, update both `data-resume` links in [index.html](./index.html) and the expected URL in [tests/portfolio.test.js](./tests/portfolio.test.js).

References: [Vite static deployment](https://vite.dev/guide/static-deploy.html), [Vercel's Vite documentation](https://vercel.com/docs/frameworks/frontend/vite).
