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
4. Open Frutinovela Studio, paste the Turnstile **site key** into the new “Clave pública de Cloudflare Turnstile” field, and paste the Worker URL into “Dirección del servidor seguro”.
5. The app obtains a one-time Turnstile token for each generation/merge request and sends it as `turnstileToken`. The Worker verifies it against `TURNSTILE_SECRET` and the expected app hostname.
6. Add Cloudflare rate limiting for `/api/generate` and `/api/merge` before sharing the Worker URL publicly. Turnstile is an anti-abuse gate, not a substitute for usage limits.

## Local checks

```sh
npx wrangler dev
```

The Worker only accepts the configured GitHub Pages origin. Update `APP_ORIGIN` if the app moves to a different domain.

## Important

The current static app calls the endpoints above, but it does not yet render a Turnstile challenge or send `turnstileToken`. The backend is intentionally fail-closed until that client-side step is added. Deploying this Worker alone will not activate paid generation yet.
