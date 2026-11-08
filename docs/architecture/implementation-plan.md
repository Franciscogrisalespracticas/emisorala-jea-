# Implementación y verificación

Este archivo define trabajo futuro. Ninguna prueba de producto de esta lista se ha ejecutado. Fases 0/1 entregan documentación; Fase 2 requiere revisión del usuario.

## Secuencia y criterios de salida

| Fase | Resultado | Puerta de salida |
|---|---|---|
| 0 — Investigación | Fuentes, compatibilidad documental, límites | Distinguir evidencia de supuestos; completado documentalmente |
| 1 — Arquitectura | Este paquete | Revisión de arquitectura pendiente |
| 2 — Sistema visual | Tokens/componentes y player mock | Teclado, móvil, contraste; inventario de estados; sin simular integración real |
| 3 — Web pública | Rutas completas con DEMO | Links navegables, vacíos, filtros, metadata y noindex de preview |
| 4 — Player | Motor y fixture local controlado | Navegación conserva elemento; errores, backup y races probados |
| 5 — Backend | Contratos, esquema, sesiones, políticas y CMS | Integración PostgreSQL aislada y autorización negativa |
| 6 — Admin | Flujos editoriales y operativos | Crear/revisar/publicar, agenda, streams, roles y campañas probados |
| 7 — Stream real | Proveedor autorizado | HTTPS, codecs, CORS, metadata, backup y móviles reales |
| 8 — Motion | Capas y piezas aprobadas | Reduced motion, pausa, bytes y ausencia de interferencia con audio |
| 9 — Hardening | Matriz y evidencias | Sin fallos críticos de permisos/audio; accesibilidad y rendimiento medidos |
| 10 — Producción | Informe GO/NO-GO | Datos reales, backups, restore, monitoreo y responsables aprobados |

En Fase 2 incluir una prueba técnica mínima de continuidad del shell con fixture si hace falta validar la arquitectura antes de invertir en todas las pantallas. No adelanta la integración real ni convierte el mock en player terminado.

## Arranque técnico tras aprobación

Revisar releases oficiales y advisories; fijar versiones exactas y lockfile. Probar instalación limpia, typecheck, lint y build en Node 24. Validar contratos antes de migraciones; definir pool y adaptador Prisma. No instalar todas las bibliotecas del prompt por anticipado. Commits coherentes: documentación, setup, tokens, shell, un dominio por vez, migración separada. Git remoto y política de ramas pendientes; esta entrega no crea commits ni repo definitivo.

## Estrategia de pruebas

- Unit: estado del player, cancelación de intentos, backoff, selección de fuente, ventanas de calendario, permisos, validación de campañas y sanitización. No duplicar implementación en mocks.
- Integration: PostgreSQL real aislado para membresías, FK de tenant, conflictos de agenda, publicación concurrente, jobs duplicados, rollback y revocación. Almacenamiento externo simulado con contratos, no tocar producción.
- E2E: home → play fixture → noticia → municipio → programación sin reiniciar audio; cambio explícito de señal; podcast/radio; login, borrador, revisión, publicar y lectura pública; cada rol y acceso cruzado.
- Stream: timeout, caída, recuperación, backup inválido, pausa durante retry, offline temporal, CORS y codec no soportado. Verificar solicitudes de audio además del DOM.
- Accesibilidad: automatización más teclado y lector de pantalla; focus trap, contraste, zoom, mapa/lista equivalente y barras fijas.
- Responsive: anchos del encargo, landscape, pantalla pequeña, contenido largo y conexión lenta. Safari iOS y Chrome Android físicos para audio/background.
- Seguridad: pruebas negativas de alcance, CSRF, XSS, upload, SSRF y exposición de secretos; pruebas en entorno autorizado y aislado.
- Performance: build report, waterfall y laboratorio con condiciones registradas; RUM p75 después del lanzamiento. No sustituir medición de campo por una nota Lighthouse.

## Configuración futura `.env.example`

En esta fase se documentan nombres, no se crea configuración ejecutable ni secretos.

| Categoría | Variables propuestas | Exposición |
|---|---|---|
| DATABASE | DATABASE_URL, DATABASE_POOL_MAX | Solo servidor |
| AUTH | SESSION_SECRET, AUTH_ORIGIN, SESSION_IDLE_MINUTES | Servidor; generar secretos reales fuera de repo |
| STREAM | STREAM_PROVIDER_API_BASE, STREAM_PROVIDER_API_KEY, STREAM_PROBE_INTERVAL_SECONDS | Servidor; URLs públicas desde registros aprobados |
| STORAGE | STORAGE_ENDPOINT, STORAGE_BUCKET, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, MEDIA_CDN_ORIGIN | Secretos servidor; CDN pública sin credenciales |
| ANALYTICS | ANALYTICS_ENABLED, ANALYTICS_SITE_ID | Exponer únicamente ID público si aplica |
| EMAIL | EMAIL_PROVIDER_API_KEY, EMAIL_FROM | Servidor; remitente confirmado |
| MEDIA | MEDIA_MAX_IMAGE_BYTES, MEDIA_MAX_VOICE_SECONDS, MEDIA_QUARANTINE_BUCKET | Servidor |
| OPERACIÓN | APP_ENV, LOG_LEVEL, ERROR_TRACKING_DSN, PUBLIC_SITE_ORIGIN | Revisar cada campo; nunca secretos NEXT_PUBLIC |

Esquema de entorno falla al arrancar si faltan claves obligatorias para el modo activo. DEMO no requiere credenciales productivas. URL de stream no configurada sigue siendo ausencia de configuración, no un placeholder que el motor intente reproducir.

## CI/CD y documentación exigida con código

CI: instalación congelada, typecheck, lint, unit/integration, migración en DB efímera, build, E2E y escaneo de secretos/dependencias. Cualquier vulnerabilidad relevante se evalúa, no se ignora porque el build pasa. Generar Prisma client en build y comprobar que corresponde al schema; no confiar en artefacto viejo.

README del proyecto implementado deberá incluir comandos comprobados para instalar, levantar servicios, seed DEMO, pruebas, build y deploy; puertos, versiones, requisitos y solución de problemas. No documentar comandos hasta crearlos y probarlos.

Migraciones: revisión SQL, backup previo, ensayo con volumen representativo, expand/contract cuando corresponda, compatibilidad durante rolling deploy. Rollback de aplicación no implica rollback de DB; preparar restauración o roll-forward. No ejecutar migraciones destructivas automáticamente.

Despliegue: staging aislado → smoke de audio y permisos → revisión GO/NO-GO → producción con control de versión. Health `/health/live` comprueba proceso; `/health/ready` dependencias necesarias, sin revelar detalles. Fallo de un stream externo no debe reiniciar en bucle una API sana. Alertas de señal separadas de alertas de infraestructura.

Runbooks: señal caída, metadata obsoleta, backlog de publicación, caída DB, abuso de uploads, bloqueo de cuenta, cambio de credenciales y restauración. Asignar responsables y canales antes de producción. No se enviaron notificaciones ni se configuraron tareas recurrentes en esta fase.
