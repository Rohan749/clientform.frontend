# ClientForm frontend

Vite + React + TypeScript + Tailwind v4. Talks to the ClientForm API (see the backend repo) and to
Supabase for authentication.

## Local development

```bash
cp .env.example .env   # fill in your Supabase values
npm install
npm run dev            # http://localhost:5173 (proxies /api to http://localhost:4000)
```

## Environment variables

These are baked into the build at build time and are **public**, so never put secrets here.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | ✓ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✓ | Supabase anon / publishable key (not the service-role key) |
| `VITE_API_URL` | ✓ in prod | Backend URL, no trailing slash, e.g. `https://p01--clientform-api--xxxx.code.run` |
| `VITE_PUBLIC_APP_URL` | | Origin shown in share links (defaults to the current site origin) |

## Deploy on Netlify

`netlify.toml` already sets the build command, the publish directory, the Node version, and the
single-page-app rewrite (so `/dashboard` and shared `/f/<slug>` links work on refresh).

1. Push this folder to GitHub.
2. Netlify → **Add new site → Import an existing project** → pick the repo.
   If the repo contains both apps, set **Base directory** to `frontend`. Netlify reads the rest from
   `netlify.toml`.
3. **Site configuration → Environment variables:** add the four variables above.
4. Deploy. After changing any `VITE_*` variable, trigger a new deploy, because the values are baked in at build time.

### Connect the pieces

| Where | Setting |
| --- | --- |
| **Backend (Northflank)** | `CORS_ORIGIN` = your Netlify URL, e.g. `https://clientform.netlify.app` (add your custom domain too, comma-separated) |
| **Supabase → Authentication → URL Configuration** | Site URL = your Netlify URL. Redirect URLs: add `https://<your-site>.netlify.app/**` |
| **Google Cloud → OAuth client** (if using Google sign-in) | Authorized JavaScript origins: add your Netlify URL. The redirect URI stays the Supabase callback |

### Check after deploying

- Refreshing `/dashboard` or opening `/f/<slug>` shows the app, not a Netlify 404.
- Logging in works and redirects back to your Netlify site, not to `localhost`.
- If you see "The app can't reach its API. Set VITE_API_URL…", add `VITE_API_URL` and redeploy.
- CORS errors in the browser console mean the backend's `CORS_ORIGIN` doesn't include your Netlify URL.
