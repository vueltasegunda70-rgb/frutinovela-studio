# Servidor seguro de video para Frutinovela Studio

La aplicación publicada en GitHub Pages es estática. Este Worker hace de intermediario entre el navegador y fal para que **FAL_KEY nunca aparezca en index.html, en el navegador ni en GitHub**.

## 1. Crear el Worker

1. Crea una cuenta en Cloudflare si todavía no tienes una.
2. En Workers & Pages, crea un Worker llamado, por ejemplo, `frutinovela-video-api`.
3. Copia el contenido de `worker/index.js` en el editor del Worker y publícalo.
4. En Settings → Variables and Secrets, añade el secreto `FAL_KEY` con tu API key de fal.
5. No escribas la clave en Frutinovela Studio ni la guardes en GitHub.

## 2. Protección antes de usarlo

- Mantén la comprobación de origen del Worker.
- Configura una regla de Cloudflare Rate Limiting para limitar solicitudes a `/api/generate` y `/api/merge` por IP.
- Establece límites de gasto y alertas en fal.
- No publiques la URL del Worker en foros; el control de origen no sustituye los límites de uso del servidor.

## 3. Conectar la aplicación

1. Copia la URL pública del Worker, por ejemplo `https://frutinovela-video-api.<tu-cuenta>.workers.dev`.
2. Abre Frutinovela Studio.
3. En “Estudio de video con fal”, pega esa URL.
4. Elige 720p y genera primero una sola escena de prueba.
5. Cuando tengas dos o más clips, pulsa “Unir los clips generados en un MP4”.

## 4. Qué hace esta primera versión

- Genera clips individuales con `google/gemini-omni-flash/v1.2/text-to-video`, duración de 3 a 15 segundos, relación 9:16 y audio nativo.
- Consulta el estado en la cola de fal sin bloquear la petición inicial.
- Une dos o más clips MP4 en orden con `fal-ai/ffmpeg-api/merge-videos`.
- Presenta vista previa y enlace para abrir/descargar el MP4.

## 5. Límites importantes

- El modelo seleccionado admite hasta 15 segundos por clip. Las escenas más largas deben dividirse en varias tomas.
- Esta versión genera desde texto. Para mantener con mayor fidelidad la misma apariencia de Fresa, Manzana, Uva y Plátano entre clips, el siguiente paso será añadir imágenes de referencia por personaje y cambiar al endpoint image-to-video o reference-to-video compatible.
- El montaje concatena clips; todavía no añade subtítulos, música externa, portada ni mezcla avanzada de audio.
- El resultado se aloja inicialmente en el CDN de fal. Descárgalo y guárdalo; no se considera almacenamiento permanente.
- fal cobra por salida generada. Revisa los precios vigentes antes de crear lotes grandes.

## Despliegue con Wrangler (alternativa)

Desde una carpeta con Wrangler instalado:

```bash
npx wrangler deploy worker/index.js --name frutinovela-video-api
npx wrangler secret put FAL_KEY
```

Pega la API key cuando Wrangler la solicite. Nunca la incluyas en comandos compartidos ni en el repositorio.
