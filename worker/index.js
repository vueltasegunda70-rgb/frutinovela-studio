const FAL_MODEL_SCENE = "google/gemini-omni-flash/v1.2/text-to-video";
const FAL_MODEL_MERGE = "fal-ai/ffmpeg-api/merge-videos";
const APP_ORIGIN = "https://vueltasegunda70-rgb.github.io";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === APP_ORIGIN ? APP_ORIGIN : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) }
  });
}
function validFalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "fal.media" || url.hostname.endsWith(".fal.media"));
  } catch { return false; }
}
async function falFetch(url, env, init = {}) {
  return fetch(url, {
    ...init,
    headers: {
      "Authorization": "Key " + env.FAL_KEY,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {})
    }
  });
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      if (origin !== APP_ORIGIN) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (origin !== APP_ORIGIN) return json({ error: "Origen no autorizado." }, 403, origin);
    if (!env.FAL_KEY) return json({ error: "Falta configurar el secreto FAL_KEY en Cloudflare." }, 503, origin);

    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/generate") {
      let body;
      try { body = await request.json(); } catch { return json({ error: "JSON inválido." }, 400, origin); }
      const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
      const duration = Number(body.duration);
      const resolution = body.resolution === "1080p" ? "1080p" : "720p";
      if (!prompt || prompt.length > 7000) return json({ error: "El prompt debe tener entre 1 y 7000 caracteres." }, 400, origin);
      if (!Number.isInteger(duration) || duration < 3 || duration > 15) return json({ error: "La duración debe estar entre 3 y 15 segundos." }, 400, origin);
      const response = await falFetch("https://queue.fal.run/" + FAL_MODEL_SCENE + "?fal_max_queue_length=3", env, {
        method: "POST",
        body: JSON.stringify({ prompt, aspect_ratio: "9:16", resolution, duration })
      });
      const data = await response.json().catch(() => ({}));
      return json(data, response.ok ? 200 : response.status, origin);
    }

    if (request.method === "POST" && url.pathname === "/api/merge") {
      let body;
      try { body = await request.json(); } catch { return json({ error: "JSON inválido." }, 400, origin); }
      const urls = Array.isArray(body.video_urls) ? body.video_urls : [];
      if (urls.length < 2 || urls.length > 40 || !urls.every(validFalUrl)) {
        return json({ error: "Se requieren entre 2 y 40 clips alojados en fal CDN." }, 400, origin);
      }
      const response = await falFetch("https://queue.fal.run/" + FAL_MODEL_MERGE + "?fal_max_queue_length=3", env, {
        method: "POST",
        body: JSON.stringify({ video_urls: urls, target_fps: 24, resolution_aspect_ratio_video_index: 0 })
      });
      const data = await response.json().catch(() => ({}));
      return json(data, response.ok ? 200 : response.status, origin);
    }

    if (request.method === "GET" && url.pathname === "/api/status") {
      const id = url.searchParams.get("id") || "";
      const jobType = url.searchParams.get("jobType") || "";
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "Identificador de trabajo inválido." }, 400, origin);
      const model = jobType === "scene" ? FAL_MODEL_SCENE : jobType === "merge" ? FAL_MODEL_MERGE : null;
      if (!model) return json({ error: "Tipo de trabajo inválido." }, 400, origin);
      const root = "https://queue.fal.run/" + model + "/requests/" + id;
      const statusResponse = await falFetch(root + "/status", env);
      const status = await statusResponse.json().catch(() => ({}));
      if (!statusResponse.ok) return json({ error: status.detail || "No se pudo consultar el estado." }, statusResponse.status, origin);
      if (status.status !== "COMPLETED") return json({ status: status.status, queue_position: status.queue_position || null }, 200, origin);
      if (status.error) return json({ status: "COMPLETED", error: status.error }, 200, origin);
      const resultResponse = await falFetch(root, env);
      const result = await resultResponse.json().catch(() => ({}));
      if (!resultResponse.ok) return json({ status: "COMPLETED", error: result.detail || "No se pudo recuperar el video." }, 502, origin);
      const videoUrl = result.video?.url || result.video_url || result.output?.video?.url;
      if (!videoUrl || !validFalUrl(videoUrl)) return json({ status: "COMPLETED", error: "fal no devolvió un MP4 válido." }, 502, origin);
      return json({ status: "COMPLETED", video_url: videoUrl }, 200, origin);
    }
    return json({ error: "Ruta no encontrada." }, 404, origin);
  }
};
