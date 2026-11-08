# Arquitectura de streaming

## Tres conceptos independientes

1. `selectedMunicipalityId`: contexto editorial.
2. `selectedStationId/activeStreamId`: audio elegido.
3. `playbackIntent`: el usuario quiere escuchar o pausar.

Cambiar municipio nunca modifica los otros dos. Si hay otra estación vinculada y verificada, mostrar «Escuchar señal de…». El respaldo automático solo puede pertenecer a la misma señal lógica y tener equivalencia de contenido autorizada. Un backup de otra estación no cumple esa condición.

## Motor persistente

Un único HTMLAudioElement en componente cliente estable dentro del layout público. UI desktop y móvil son controles del mismo motor. Reducer tipado con efectos encapsulados y listeners registrados/limpiados una sola vez. Cada intento lleva generationId: eventos de una solicitud vieja no pueden sobrescribir una nueva selección. Cancelar timers y destruir adaptador HLS al cambiar realmente de fuente. No asignar src de nuevo cuando stationId y endpoint efectivo no cambian.

Separar `mode=radio|podcast`, `sourceId`, `playbackIntent`, `status`, `muted`, `volume`, `attempt`, `lastError` y timestamps. Guardar volumen/selección como preferencias sin secretos; no restaurar autoplay al recargar. Podcast tiene progreso, seek y duración; radio no inventa una duración finita ni permite seek sin soporte explícito. Inicio de podcast es elección de audio, pausa radio y ofrece regresar a vivo.

## Máquina de estados

El listado inicial era insuficiente: PAUSED, IDLE, BUFFERING y UNCONFIGURED evitan llamar LIVE a una reproducción detenida.

| Estado | Entrada | Salida / interfaz |
|---|---|---|
| UNCONFIGURED | Sin endpoint confirmado | CTA informativo, no simular conexión |
| IDLE | Fuente disponible, sin intento | Play disponible |
| CONNECTING | Gesto + play solicitado | `playing` → LIVE; rechazo → PAUSED/ERROR según causa |
| LIVE | `playing` y progreso reciente | pause → PAUSED; waiting → BUFFERING; error → recuperación |
| BUFFERING | `waiting` o progreso detenido validado | `playing` → LIVE; timeout → RECONNECTING |
| PAUSED | Gesto o interrupción | Detener reintentos; reanudar solo según intención válida |
| RECONNECTING | Fallo recuperable | Reintentar con límites; éxito → LIVE; agota → ERROR |
| OFFLINE | Evidencia local de desconexión | Pausar intentos; al recuperar red evaluar intención y play |
| ERROR | Codec, configuración o intentos agotados | Mensaje entendible + reintento manual |

`navigator.onLine` es una pista, no prueba de acceso a Internet. `stalled` aislado no equivale a señal caída; combinar eventos y progreso. LIVE significa reproducción reportada por el motor, no garantía de volumen audible ni ausencia de silencio en la fuente. Estado de mute se muestra aparte. Para podcasts el mismo motor usa etiqueta «Reproduciendo», no «En vivo».

## Protocolos y CORS

- MP3/AAC continuo: audio nativo si navegador y MIME/codec soportan la fuente; validar contra URL real.
- HLS: detectar soporte nativo; si falta, cargar hls.js dinámicamente donde exista soporte adecuado. Probar audio-only, manifest, segmentos, claves y variantes. HTTPS en toda la cadena.
- No asumir que extensión de URL determina codec. Registrar protocolo, MIME y capacidades verificadas por endpoint.
- Reproducir audio cross-origin y analizarlo no tienen los mismos requisitos. No crear MediaElementAudioSourceNode hasta confirmar CORS. Una conexión incorrecta al grafo puede silenciar audio; el fallback debe ser elegido antes de conectar.
- Visualizador decorativo identificado como tal en información accesible; nunca presentarlo como medición. Dibujar dentro del monitor con CSS/canvas ligero. El análisis real es opt-in técnico tras verificar proveedor, no condición para escuchar.
- Metadata de canciones mediante adaptador al proveedor en backend; el navegador no recibe claves administrativas. Ausencia o caducidad → ocultar canción, no inventarla.

## Recuperación propuesta, ajustable mediante pruebas

Timeout inicial 12 s; espera de buffering sostenida 8 s; reintentos con 1, 2 y 4 s más jitter. Un único bucle de recuperación. Tras agotar principal, probar backup permitido hasta 2 veces; después ERROR con acción manual. Son valores iniciales de diseño, no SLA. Cancelar de inmediato al pausar/cambiar fuente. No volver al principal automáticamente durante escucha estable: verificar en background y esperar nueva sesión o acción explícita, evitando oscilaciones.

Si `play()` rechaza por política de navegador, pedir toque para reanudar: no tratarlo como caída del servidor. Las transiciones de conectividad no deben disparar reproducción si el usuario había pausado. Al volver de background, reconciliar estado real, timers y errores. Una pestaña visible no implica permiso de reproducción. No prometer continuidad tras suspensión del sistema, cierre de pestaña, recarga completa, pérdida de red o muerte del proceso.

Media Session opcional con feature detection; actualizar metadata verificable y acciones soportadas. No declarar seek para radio sin DVR. Volumen móvil puede depender de controles del sistema; ofrecer mute y no fingir control programático cuando no funciona.

## Monitoreo backend

Worker cada 60 s por endpoint con jitter y concurrencia acotada (propuesta). Probar GET acotado/lectura parcial; HEAD puede ser rechazado o dar falsa confianza. Cortar por tiempo y bytes: un stream no termina. Para HLS revisar manifest y muestra de segmento con la misma política SSRF. Un 200 HTML no acredita audio; guardar nivel de evidencia. Medir disponibilidad de transporte, no calidad perceptual ni identidad del programa.

`StreamHealthCheck`: stationId, streamId, status (ONLINE/DEGRADED/OFFLINE/UNKNOWN), checkedAt, latencyMs, failureReason, probeType y bytesRead. Falta de configuración es propiedad de Station, no un endpoint ficticio. Dos fallos consecutivos antes de alerta operativa; historial y recuperación registrados. Datos viejos se muestran STALE/UNKNOWN, no verde eterno. Retención inicial propuesta 30 días agregables, pendiente de operación.

Dashboard distingue «Proveedor accesible desde servidor» y «Errores de clientes». Telemetría con correlationId, streamId, transición, errorCode y tiempo, sin tokens ni URL firmada completa. Métricas simultáneas solo desde API autorizada del proveedor. Sin acceso: NO_DISPONIBLE.

## Pruebas requeridas, no ejecutadas

Fixture HTTP/HLS local y servidores controlados para latencia, truncado, HTML 200, codec inválido, CORS, backup y pérdida de red. E2E comprueba identidad del audio y ausencia de nuevas solicitudes de fuente al navegar, no solo que el icono siga verde. Validar cambios rápidos, pausa durante reintento, eventos obsoletos y podcast/radio. Simular errores más pruebas reales en Safari iOS y Chrome Android; Playwright WebKit no sustituye un iPhone físico. La URL real es requisito de Fase 7.
