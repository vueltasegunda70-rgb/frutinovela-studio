const VIDEO_MODEL = "google/gemini-omni-flash/v1.2/text-to-video";
const MERGE_MODEL = "fal-ai/ffmpeg-api/merge-videos";
const FAL_QUEUE = "https://queue.fal.run";

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

function corsHeaders(origin, allowedOrigin) {
  return {
    "access-control-allow-origin": origin === allowedOrigin ? origin : "null",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
}

async function verifyTurnstile(token, request, secret) {
  if (!token || !secret) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.append("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  if (!response.ok) return false;
  const result = await response.json();
  const hostname = new URL(request.url).hostname;
  return result.success === true && (!result.hostname || result.hostname === hostname);
}

async function falFetch(path, env, init = {}) {
  const response = await fetch(FAL_QUEUE + path, {
    ...init,
    headers: {
      authorization: `Key ${env.FAL_KEY}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.detail || data.error || data.message || `fal respondió HTTP ${response.status}`;
    throw new Error(String(message).slice(0, 500));
  }
  return data;
}

function endpointFor(jobType) {
  if (jobType === "scene") return VIDEO_MODEL;
  if (jobType === "merge") return MERGE_MODEL;
  return null;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.APP_ORIGIN || "https://vueltasegunda70-rgb.github.io";
    const headers = corsHeaders(origin, allowedOrigin);

    if (request.method === "OPTIONS") {
      if (origin !== allowedOrigin) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers });
    }
    if (origin !== allowedOrigin) return json({ error: "Origen no autorizado." }, 403, headers);
    if (!env.FAL_KEY) return json({ error: "Falta configurar el secreto FAL_KEY en Cloudflare." }, 503, headers);

    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/generate" && request.method === "POST") {
        const body = await request.json();
        const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
        const duration = Number(body.duration);
        const resolution = body.resolution;
        if (!prompt || prompt.length > 12000) return json({ error: "El prompt debe tener entre 1 y 12,000 caracteres." }, 400, headers);
        if (!Number.isInteger(duration) || duration < 3 || duration > 15) return json({ error: "La duración debe ser de 3 a 15 segundos." }, 400, headers);
        if (!["720p", "1080p"].includes(resolution)) return json({ error: "Calidad no permitida. Usa 720p o 1080p." }, 400, headers);
        const passed = await verifyTurnstile(body.turnstileToken, request, env.TURNSTILE_SECRET);
        if (!passed) return json({ error: "Verificación de seguridad pendiente o inválida. Configura Turnstile antes de generar." }, 403, headers);

        const result = await falFetch(`/${VIDEO_MODEL}`, env, {
          method: "POST",
          body: JSON.stringify({
            prompt,
            aspect_ratio: "9:16",
            resolution,
            duration,
          }),
        });
        if (!result.request_id) return json({ error: "fal no devolvió request_id." }, 502, headers);
        return json({ request_id: result.request_id, model: VIDEO_MODEL }, 202, headers);
      }

      if (url.pathname === "/api/merge" && request.method === "POST") {
        const body = await request.json();
        const videoUrls = Array.isArray(body.video_urls) ? body.video_urls : [];
        if (videoUrls.length < 2 || videoUrls.length > 40 || videoUrls.some((item) => typeof item !== "string" || !/^https:\/\/(v3b?\.fal\.media|fal\.media)\//.test(item))) {
          return json({ error: "Envía entre 2 y 40 clips MP4 generados en fal." }, 400, headers);
        }
        const passed = await verifyTurnstile(body.turnstileToken, request, env.TURNSTILE_SECRET);
        if (!passed) return json({ error: "Verificación de seguridad pendiente o inválida. Configura Turnstile antes de unir." }, 403, headers);

        const result = await falFetch(`/${MERGE_MODEL}`, env, {
          method: "POST",
          body: JSON.stringify({ video_urls: videoUrls, target_fps: 24, resolution: "portrait_16_9" }),
        });
        if (!result.request_id) return json({ error: "fal no devolvió request_id para el montaje." }, 502, headers);
        return json({ request_id: result.request_id, model: MERGE_MODEL }, 202, headers);
      }

      if (url.pathname === "/api/status" && request.method === "GET") {
        const jobType = url.searchParams.get("jobType");
        const requestId = url.searchParams.get("id") || "";
        const model = endpointFor(jobType);
        if (!model || !/^[a-zA-Z0-9_-]{8,128}$/.test(requestId)) {
          return json({ error: "Tipo de trabajo o identificador inválido." }, 400, headers);
        }
        const status = await falFetch(`/${model}/requests/${requestId}/status`, env, { method: "GET" });
        if (status.status !== "COMPLETED" && status.status !== "FAILED") {
          return json({ status: status.status || "IN_QUEUE" }, 200, headers);
        }
        if (status.status === "FAILED") {
          return json({ status: "COMPLETED", error: status.error || "fal no pudo completar esta generación." }, 200, headers);
        }
        const result = await falFetch(`/${model}/requests/${requestId}`, env, { method: "GET" });
        const videoUrl = jobType === "merge" ? result.video?.url : (result.video?.url || result.video_url);
        if (!videoUrl) return json({ status: "COMPLETED", error: "fal terminó sin devolver un MP4." }, 200, headers);
        return json({ status: "COMPLETED", video_url: videoUrl }, 200, headers);
      }

      return json({ error: "Ruta no encontrada." }, 404, headers);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Error interno del servidor." }, 502, headers);
    }
  },
};
