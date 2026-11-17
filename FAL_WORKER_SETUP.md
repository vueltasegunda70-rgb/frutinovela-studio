# Frutinovela Studio — fal video API

This Worker is the server-side bridge between the GitHub Pages app and fal. It keeps `FAL_KEY` out of the browser and supports:

- `POST /api/generate`: Gemini Omni Flash 1.2 text-to-video, 9:16, 720p/1080p, 3–15 seconds.
- `GET /api/status?jobType=scene&id=...`: queue status and MP4 URL.
- `POST /api/merge`: joins generated clips in order with fal FFmpeg Merge.
- `GET /api/status?jobType=merge&id=...`: merged MP4 URL.

## Required security setup

The Worker deliberately refuses generation unless Cloudflare Turnstile is configured. CORS alone is not authentication and does not prevent scripts from calling a public endpoint.

1. In Cloudflare, create a Turnstile widget for `vueltasegunda70-rgb.github.io` and copy its **site key**.
2. Deploy this Worker from this directory with Wrangler.
3. Set secrets (never commit them):
   ```sh
   npx wrangler secret put FAL_KEY
   npx wrangler secret put TURNSTILE_SECRET
   ```
4. Add the Turnstile site key to the app's client-side challenge flow and include the one-time token as `turnstileToken` in both POST bodies. Do not put the Turnstile secret or fal key in the app.
5. Add Cloudflare rate limiting for `/api/generate` and `/api/merge` before sharing the Worker URL publicly.
6. Configure the Worker URL in Frutinovela Studio.

## Local checks

```sh
npx wrangler dev
```

The Worker only accepts the configured GitHub Pages origin. Update `APP_ORIGIN` if the app moves to a different domain.

## Important

The current static app calls the endpoints above, but it does not yet render a Turnstile challenge or send `turnstileToken`. The backend is intentionally fail-closed until that client-side step is added. Deploying this Worker alone will not activate paid generation yet.
