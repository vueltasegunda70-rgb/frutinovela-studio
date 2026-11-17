# Frutinovela Studio — Nano Banana + Kling AI Standard

This Cloudflare Worker is the secure server-side bridge between the GitHub Pages app and fal.ai. It keeps `FAL_KEY` out of the browser and GitHub.

## Models and routes
- `POST /api/image`: `fal-ai/nano-banana`, one PNG image, vertical 9:16.
- `GET /api/status?jobType=image&id=...`: image queue status and URL.
- `POST /api/generate`: `fal-ai/kling-video/v3/standard/image-to-video`, image-to-video, Standard, 3–15 seconds.
- `GET /api/status?jobType=scene&id=...`: video queue status and MP4 URL.
- `POST /api/merge`: joins generated clips in order.
- `GET /api/status?jobType=merge&id=...`: merged MP4 URL.

## Secure setup
1. Create a fal.ai account and an API key at https://fal.ai/dashboard/keys. Add credits as needed.
2. Create a Cloudflare account at https://dash.cloudflare.com/ if you do not already have one.
3. Create a Turnstile widget for hostname `vueltasegunda70-rgb.github.io`; copy its **site key** and keep the **secret key** private.
4. From this project folder, deploy the Worker:
   ```sh
   npx wrangler login
   npx wrangler deploy
   ```
5. Add secrets without committing them:
   ```sh
   npx wrangler secret put FAL_KEY
   npx wrangler secret put TURNSTILE_SECRET
   ```
   Paste each secret only into the terminal prompt. Never put either secret in `index.html`, GitHub, chat, or the app.
6. In Frutinovela Studio, paste the Worker URL and the Turnstile **site key** into the matching fields.
7. Add Cloudflare rate limits for `/api/image`, `/api/generate`, and `/api/merge` before sharing the app publicly. Turnstile is an anti-abuse gate, not a usage quota.

## Important
- Nano Banana creates the still image first. Kling animates that image; each scene requires both steps.
- Standard export is vertical 9:16 at the Standard model tier. Duration is 3–15 seconds.
- Native Kling audio is disabled because its documented speech support is Chinese and English; Spanish dialogue remains in the prompt, but the generated clip should be treated as silent until a Spanish voice/TTS track is added.
- The Worker accepts only HTTPS media URLs hosted by fal storage.
- CORS only allows the published GitHub Pages origin; it is not a replacement for Turnstile or rate limiting.
